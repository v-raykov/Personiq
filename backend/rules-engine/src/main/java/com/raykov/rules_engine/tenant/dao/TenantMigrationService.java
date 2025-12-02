package com.raykov.rules_engine.tenant.dao;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;

@Service
public class TenantMigrationService {

    private final DataSource dataSource;

    private final String locations;

    public TenantMigrationService(@Value("spring.flyway-tenants.locations") String locations,
                                  DataSource dataSource) {
        this.dataSource = dataSource;
        this.locations = locations;
    }

    public void migrateAllTenantSchemas(List<String> tenantSchemas) {
        tenantSchemas.forEach(this::migrateTenantSchema);
    }

    public void migrateTenantSchema(String schemaName) {
        Flyway flyway = Flyway.configure()
                              .dataSource(dataSource)
                              .schemas(schemaName)
                              .locations(locations)
                              .baselineOnMigrate(true)
                              .load();
        flyway.migrate();
    }
}
