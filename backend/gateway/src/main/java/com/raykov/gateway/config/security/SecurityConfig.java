package com.raykov.gateway.config.security;

import com.raykov.gateway.config.security.auth.TenantAwareAuthenticationManager;
import com.raykov.gateway.config.security.auth.jwt.JwtAuthFilter;
import com.raykov.gateway.config.security.role.Authority;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final TenantAwareAuthenticationManager tenantAwareAuthenticationManager;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          TenantAwareAuthenticationManager tenantAwareAuthenticationManager) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.tenantAwareAuthenticationManager = tenantAwareAuthenticationManager;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authenticationManager(tenantAwareAuthenticationManager)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/register", "/login", "/tenant/**").permitAll()
                        .pathMatchers("/admin/**").hasAnyAuthority(Authority.ROLE_MANAGER.getAuthority(), Authority.ROLE_ADMIN.getAuthority())
                        .pathMatchers("/customer-portal/**").hasAnyAuthority(Authority.ROLE_CUSTOMER.getAuthority())
                        .pathMatchers("/private/**").denyAll()
                        .anyExchange().permitAll()
                )
                .addFilterAt(jwtAuthFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}