package com.raykov.rules_engine.tenant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/private/tenant/{tenantId}")
    public void createTenantSchema(@PathVariable long tenantId) {
        tenantService.createTenantSchema(tenantId);
    }

    @GetMapping("/private/tenant")
    public List<String> getTenants() {
        return tenantService.getTenants();
    }
}
