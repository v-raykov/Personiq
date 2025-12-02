package com.raykov.rules_engine.config;


import com.raykov.rules_engine.config.tenant.TenantContextFilter;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<@NonNull TenantContextFilter> tenantFilter(TenantContextFilter tenantContextFilter) {
        FilterRegistrationBean<@NonNull TenantContextFilter> fr = new FilterRegistrationBean<>();
        fr.setFilter(tenantContextFilter);
        fr.addUrlPatterns("/*");
        fr.setOrder(1);
        return fr;
    }
}