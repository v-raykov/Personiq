package com.raykov.gateway.config.exception.model;

public class TenantNameAlreadyExistsException extends ConflictException {

    public TenantNameAlreadyExistsException(String tenantName) {
        super("Tenant name '%s' already exists".formatted(tenantName));
    }

}
