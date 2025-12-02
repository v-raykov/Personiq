package com.raykov.gateway.config.filter;

import com.raykov.gateway.tenant.TenantService;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TenantValidationFilter implements GatewayFilter, Ordered {

    private final TenantService tenantService;

    public TenantValidationFilter(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String tenantUri = exchange.getRequest().getPath().elements().get(1).value();

        return Mono.defer(() -> tenantService.getTenantIdByUri(tenantUri)
                                             .map(id -> forwardWithHeader(exchange, chain, id))
                                             .orElseGet(() -> notFound(exchange)));
    }

    private Mono<Void> forwardWithHeader(ServerWebExchange exchange, GatewayFilterChain chain, Long id) {
        ServerHttpRequest mutated = exchange.getRequest()
                                            .mutate()
                                            .header("X-Tenant-Id", String.valueOf(id))
                                            .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
                                                    .request(mutated)
                                                    .build();

        return chain.filter(mutatedExchange);
    }

    private Mono<Void> notFound(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}