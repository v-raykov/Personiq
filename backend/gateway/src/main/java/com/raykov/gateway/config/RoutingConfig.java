package com.raykov.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                      .route("local_auth", r -> r.path("/login", "/register")
                                                 .uri("forward:///"))
                      .route("rules_engine", r -> r.path("/**")
                                                   .uri("http://localhost:8081"))
                      .build();
    }
}