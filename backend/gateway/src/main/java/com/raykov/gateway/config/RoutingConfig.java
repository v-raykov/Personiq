package com.raykov.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, String rulesEngineUri) {
        return builder.routes()
                      .route("rules_engine", r -> r.path("/**")
                                                   .uri(rulesEngineUri))
                      .build();
    }
}