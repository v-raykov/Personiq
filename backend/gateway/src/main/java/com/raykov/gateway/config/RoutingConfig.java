package com.raykov.gateway.config;

import com.raykov.gateway.config.filter.CustomerPortalHeaderFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, String rulesEngineUri, CustomerPortalHeaderFilter customerPortalHeaderFilter) {
        return builder.routes()
                      .route("customer_portal", r -> r.path("/customer-portal/**")
                                                      .filters(f -> f.filter(customerPortalHeaderFilter.apply(new CustomerPortalHeaderFilter.Config())))
                                                      .uri(rulesEngineUri))
                      .route("rules_engine", r -> r.path("/**")
                                                   .uri(rulesEngineUri))
                      .build();
    }
}