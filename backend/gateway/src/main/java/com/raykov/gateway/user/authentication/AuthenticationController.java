package com.raykov.gateway.user.authentication;

import com.raykov.gateway.user.authentication.model.JwtTokenResponse;
import com.raykov.gateway.user.authentication.model.LoginRequest;
import com.raykov.gateway.user.authentication.model.RegisterCustomerRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
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
    public Mono<Long> register(@RequestBody RegisterCustomerRequest details,
                                               @RequestHeader("X-Tenant-Id") String tenantId) {
        return Mono.fromCallable(() -> {
            RegisterCustomerRequest withHashedPassword = details.withPassword(passwordEncoder.encode(details.password()));
            return authenticationService.registerCustomer(withHashedPassword, Long.parseLong(tenantId));
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
