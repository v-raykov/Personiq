package com.raykov.rules_engine.tenant;

import com.raykov.rules_engine.tenant.dao.TenantDao;
import com.raykov.rules_engine.tenant.dao.TenantMigrationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantService {

    private final TenantDao tenantDao;

    private final TenantMigrationService tenantMigrationService;

    private final String schemaPrefix;

    public TenantService(@Value("${spring.tenantSchemaPrefix}") String schemaPrefix, TenantDao tenantDao, TenantMigrationService tenantMigrationService) {
        this.tenantDao = tenantDao;
        this.schemaPrefix = schemaPrefix;
        this.tenantMigrationService = tenantMigrationService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void migrateAllTenantSchemas() {
        tenantMigrationService.migrateAllTenantSchemas(getTenants());
    }

    @Transactional
    public void createTenantSchema(long tenantId) {
        String schemaName = generateSchemaName(tenantId);

        tenantDao.createTenantSchema(schemaName);
        tenantDao.createTenantRegistryEntry(tenantId, schemaName);
        tenantMigrationService.migrateTenantSchema(schemaName);
    }

    private String generateSchemaName(long tenantId) {
        return schemaPrefix + tenantId;
    }

    public List<String> getTenants() {
        return tenantDao.getAllTenants();
    }
}
