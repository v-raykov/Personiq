package com.raykov.gateway.config.security.auth;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class TenantAuthenticationToken extends UsernamePasswordAuthenticationToken {

    private final Long tenantId;

    public TenantAuthenticationToken(String principal, String credentials, Long tenantId) {
        super(principal, credentials);
        this.tenantId = tenantId;
    }

    public TenantAuthenticationToken(Object principal, Object credentials,
                                     Long tenantId, Collection<? extends GrantedAuthority> authorities) {
        super(principal, credentials, authorities);
        this.tenantId = tenantId;
    }

    public Long getTenantId() {
        return tenantId;
    }
}