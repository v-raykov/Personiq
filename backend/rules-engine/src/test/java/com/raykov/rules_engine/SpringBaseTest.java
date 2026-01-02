package com.raykov.rules_engine;

import com.raykov.rules_engine.tenant.TenantController;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.ThreadLocalRandom;

import static com.raykov.rules_engine.config.tenant.TenantContext.clearTenantId;
import static com.raykov.rules_engine.config.tenant.TenantContext.setTenantId;
import static java.lang.Math.abs;
import static java.lang.String.valueOf;


@SpringBootTest
public abstract class SpringBaseTest {

    @Autowired
    private TenantController tenantController;

    @Autowired
    private DataSource dataSource;

    private long tenantId;

    static final PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("rules_engine")
            .withUrlParam("currentSchema", "master")
            .withUsername("rules_engine")
            .withPassword("rules_engine");

    static {
        postgresContainer.start();
    }

    @DynamicPropertySource
    static void registerPostgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
    }

    @BeforeEach
    void init() {
        tenantId = abs(ThreadLocalRandom.current().nextLong());
        tenantController.createTenantSchema(tenantId);
        setTenantId(valueOf(tenantId));
    }

    @AfterEach
    public void cleanup() throws SQLException {
        clearTenantId();
        try (Connection conn = dataSource.getConnection()) {
            conn.setSchema("master");
            conn.prepareStatement("DROP SCHEMA IF EXISTS tenant_" + tenantId + " CASCADE;").execute();
            conn.prepareStatement("DELETE FROM tenant_registry WHERE id = " + tenantId + ";").execute();
        }
    }
}