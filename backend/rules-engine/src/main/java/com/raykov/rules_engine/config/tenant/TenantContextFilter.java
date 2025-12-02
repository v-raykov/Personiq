package com.raykov.rules_engine.config.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static com.raykov.rules_engine.config.tenant.TenantContext.clearTenantId;
import static com.raykov.rules_engine.config.tenant.TenantContext.setTenantId;

@Component
public class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String tenantId = request.getHeader("X-Tenant-Id");
        try {
            if (tenantId != null && !tenantId.isBlank()) {
                setTenantId(tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            clearTenantId();
        }
    }
}
