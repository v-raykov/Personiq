package com.raykov.gateway.user;

import com.raykov.gateway.user.authentication.AuthenticationService;
import com.raykov.gateway.user.authentication.model.RegisterAdminRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationService authenticationService;

    public AdminController(PasswordEncoder passwordEncoder, AuthenticationService authenticationService) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public Long register(@RequestBody RegisterAdminRequest request,
                         @RequestHeader("X-Tenant-Id") Long tenantId) {
        RegisterAdminRequest withHashedPassword = request.withPassword(passwordEncoder.encode(request.password()));
        return authenticationService.register(withHashedPassword, tenantId);
    }
}
