package com.raykov.gateway.config.filter;

import com.raykov.gateway.tenant.TenantService;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
@Order(-200)
public class TenantValidationFilter implements WebFilter {

    private final TenantService tenantService;

    public TenantValidationFilter(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getRawPath();

        if (path.startsWith("/tenant") || path.equals("/")) {
            return chain.filter(exchange);
        }

        String[] parts = path.split("/", 3);
        if (parts.length < 2) {
            return chain.filter(exchange);
        }

        String tenantUri = parts[1];
        String newPath = parts.length > 2 ? "/" + parts[2] : "/";

        return Mono.fromCallable(() -> tenantService.getTenantIdByUri(tenantUri))
                   .subscribeOn(Schedulers.boundedElastic())
                   .flatMap(idOptional -> idOptional
                           .map(id -> chain.filter(exchange.mutate()
                                                       .request(r -> r.path(newPath)
                                                                      .header("X-Tenant-Id", String.valueOf(idOptional.get())))
                                                       .build()))
                           .orElseGet(() -> {
                               exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
                               return exchange.getResponse().setComplete();
                           }));
    }
}