package com.raykov.gateway.config.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.List;

import static org.springframework.web.util.UriComponentsBuilder.fromUri;

@Component
public class AccountFilter implements GatewayFilter {

    private static final List<String> EXCLUDED_PATHS = List.of("/private/**");

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        boolean excluded = EXCLUDED_PATHS.stream()
                                         .anyMatch(pattern -> PATH_MATCHER.match(pattern, path));

        if (excluded) {
            return chain.filter(exchange);
        }

        String accountId = getAccountIdSomehow();

        URI uri = fromUri(exchange.getRequest().getURI())
                .replaceQueryParam("accountId", accountId)
                .build(true)
                .toUri();

        var mutatedRequest = exchange.getRequest()
                                     .mutate()
                                     .uri(uri)
                                     .build();

        return chain.filter(exchange.mutate()
                                    .request(mutatedRequest)
                                    .build());
    }

    private String getAccountIdSomehow() {
        return "12345";
    }
}
