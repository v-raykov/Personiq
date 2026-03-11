package com.raykov.gateway.tenant;

import com.raykov.gateway.user.authentication.model.RegisterRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

@RestController
public class TenantController {

    private final TenantService tenantService;

    private final PasswordEncoder passwordEncoder;

    public TenantController(TenantService tenantService, PasswordEncoder passwordEncoder) {
        this.tenantService = tenantService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/tenant")
    public Mono<Long> createTenant(@RequestParam String tenantUriName, @RequestBody RegisterRequest details) {
        return Mono.fromCallable(() -> tenantService.createTenant(tenantUriName, details.withPassword(passwordEncoder.encode(details.password()))))
                   .subscribeOn(Schedulers.boundedElastic());
    }

    @GetMapping("/tenant")
    public List<String> getTenants() {
        return tenantService.getTenants();
    }
}
