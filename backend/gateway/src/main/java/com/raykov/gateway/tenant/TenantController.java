package com.raykov.gateway.tenant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/tenant")
    public void createTenant(@RequestParam String tenantUriName) {
        tenantService.createTenant(tenantUriName);
    }

    @GetMapping("/tenant")
    public List<String> getTenants() {
        return tenantService.getTenants();
    }
}
