package com.raykov.gateway.user.authentication;

import com.raykov.gateway.user.authentication.model.*;
import com.raykov.gateway.user.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    private final PasswordEncoder passwordEncoder;

    public AuthenticationController(AuthenticationService authenticationService, PasswordEncoder passwordEncoder) {
        this.authenticationService = authenticationService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Mono<JwtTokenResponse> login(@RequestBody LoginRequest details,
                                        @RequestHeader("X-Tenant-Id") Long tenantId) {
        return authenticationService.loginUser(details, tenantId);
    }

    @PostMapping("/register")
    public Mono<CustomerAccount> register(@RequestBody RegisterRequest details,
                                          @RequestHeader("X-Tenant-Id") String tenantId) {
        return Mono.fromCallable(() -> {
            RegisterRequest withHashedPassword = details.withPassword(passwordEncoder.encode(details.password()));
            return authenticationService.registerCustomer(withHashedPassword, Long.parseLong(tenantId));
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/me")
    public AuthenticationContext getAuthenticationContext(@AuthenticationPrincipal User user) {
        return new AuthenticationContext(user.username(), user.email(), user.authority());
    }
}
