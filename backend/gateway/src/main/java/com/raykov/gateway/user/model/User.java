package com.raykov.gateway.user.model;

import com.raykov.gateway.config.security.role.Authority;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record User(Long id, String username, String password, String email, Authority authority, Long tenantId) implements UserDetails {

    public User(String username, String password, String email, Authority authority, Long tenantId) {
        this(null, username, password, email, authority, tenantId);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(authority);
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
