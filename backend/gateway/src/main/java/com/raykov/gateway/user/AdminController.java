package com.raykov.gateway.user;

import com.raykov.gateway.user.authentication.AuthenticationService;
import com.raykov.gateway.user.authentication.model.RegisterAdminRequest;
import com.raykov.gateway.user.model.CustomerDto;
import com.raykov.gateway.user.model.UserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationService authenticationService;

    private final UserService userService;

    private final CustomerService customerService;

    public AdminController(PasswordEncoder passwordEncoder, AuthenticationService authenticationService, UserService userService, CustomerService customerService) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationService = authenticationService;
        this.userService = userService;
        this.customerService = customerService;
    }

    @PostMapping("/register")
    public Long register(@RequestBody RegisterAdminRequest request,
                         @RequestHeader("X-Tenant-Id") Long tenantId) {
        RegisterAdminRequest withHashedPassword = request.withPassword(passwordEncoder.encode(request.password()));
        return authenticationService.register(withHashedPassword, tenantId);
    }

    @GetMapping("/user")
    public List<UserDto> getUsers(@RequestHeader("X-Tenant-Id") Long tenantId) {
        return userService.getAllUsers(tenantId)
                          .stream()
                          .map(UserDto::fromUser)
                          .toList();
    }

    @GetMapping("/customer")
    public List<CustomerDto> getCustomers(@RequestHeader("X-Tenant-Id") Long tenantId) {
        return customerService.getAllCustomers(tenantId);
    }
}
