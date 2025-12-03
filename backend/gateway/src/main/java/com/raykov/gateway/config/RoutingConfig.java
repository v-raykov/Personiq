package com.raykov.gateway.config;

import com.raykov.gateway.config.filter.TenantValidationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfig {

    @Bean
    public RouteLocator routeLocator(@Value("${rules-engine.uri}") String rulesEngineUri,
                                     RouteLocatorBuilder builder,
                                     TenantValidationFilter tenantValidationFilter) {
        return builder.routes()
                      .route("rules-engine", r -> r
                              .path("/{tenantId}/**")
                              .filters(f -> f
                                      .filter(tenantValidationFilter)
                                      .stripPrefix(1))
                              .uri(rulesEngineUri))
                      .build();
    }
}
