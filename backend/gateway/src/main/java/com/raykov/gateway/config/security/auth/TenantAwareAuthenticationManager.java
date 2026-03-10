package com.raykov.gateway.config.security.auth;

import com.raykov.gateway.user.UserService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class TenantAwareAuthenticationManager implements ReactiveAuthenticationManager {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    public TenantAwareAuthenticationManager(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        TenantAuthenticationToken token = (TenantAuthenticationToken) authentication;

        return userService.findByUsernameAndTenantId(token.getName(), token.getTenantId())
                          .filter(user -> passwordEncoder.matches((String) token.getCredentials(), user.getPassword()))
                          .switchIfEmpty(Mono.error(new BadCredentialsException("Invalid credentials")))
                          .map(user -> new TenantAuthenticationToken(user, null, token.getTenantId(), user.getAuthorities()));
    }
}