package com.raykov.rules_engine;

import com.raykov.rules_engine.tenant.TenantController;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;

import java.sql.SQLException;

import static com.raykov.rules_engine.config.tenant.TenantContext.setTenantId;


@Testcontainers
@SpringBootTest
public abstract class SpringBaseTest {

    @Autowired
    private TenantController tenantController;

    @Container
    static PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("rules_engine")
            .withUrlParam("currentSchema", "master")
            .withUsername("rules_engine")
            .withPassword("rules_engine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(postgresContainer.getJdbcUrl());
        ds.setUsername(postgresContainer.getUsername());
        ds.setPassword(postgresContainer.getPassword());
        return ds;
    }

    @BeforeEach
    public void init() {
        tenantController.createTenantSchema(1);
        setTenantId("1");
    }

    @AfterEach
    public void cleanup() throws SQLException {
        dataSource().getConnection().prepareStatement("""
                                                      DROP SCHEMA tenant_1 CASCADE;
                                                      DELETE FROM tenant_registry WHERE id = 1;""")
                    .execute();
        setTenantId(null);
    }

}
