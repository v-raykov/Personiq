package com.raykov.gateway.config.filter;

import com.raykov.gateway.tenant.TenantService;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class TenantValidationFilter implements WebFilter, Ordered {

    private final TenantService tenantService;

    public TenantValidationFilter(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        if (path.startsWith("/tenant")) return chain.filter(exchange);

        String[] parts = path.split("/", 3);
        if (parts.length < 2) return chain.filter(exchange);

        String tenantUri = parts[1];
        String newPath = parts.length > 2 ? "/" + parts[2] : "/";

        return Mono.fromSupplier(() -> tenantService.getTenantIdByUri(tenantUri))
                   .flatMap(idOptional -> {
                       if (idOptional.isEmpty()) {
                           exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
                           return exchange.getResponse().setComplete();
                       }

                       ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                                                  .header("X-Tenant-Id", String.valueOf(idOptional.get()))
                                                                  .path(newPath)
                                                                  .build();

                       return chain.filter(exchange.mutate().request(mutatedRequest).build());
                   });
    }

    @Override
    public int getOrder() {
        return -100;
    }
}