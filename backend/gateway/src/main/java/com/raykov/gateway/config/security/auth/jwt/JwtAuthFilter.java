package com.raykov.gateway.config.security.auth.jwt;

import com.raykov.gateway.user.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthFilter implements WebFilter {

    private final JwtUtils jwtUtils;

    private final UserService userService;

    public JwtAuthFilter(JwtUtils jwtUtils, UserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        String jwt = authHeader.substring(7);
        var usernameOpt = jwtUtils.extractUsername(jwt);
        var tenantOpt = jwtUtils.extractTenantId(jwt);

        if (usernameOpt.isPresent() && tenantOpt.isPresent()) {
            return userService.findByUsernameAndTenantId(usernameOpt.get(), tenantOpt.get())
                              .flatMap(user -> chain.filter(exchange)
                                                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(
                                                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
                                                    )));
        }

        return chain.filter(exchange);
    }
}