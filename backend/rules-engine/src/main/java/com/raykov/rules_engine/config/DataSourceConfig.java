package com.raykov.rules_engine.config;

import com.raykov.rules_engine.tenant.dao.MultiTenantDataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public Flyway flywayMaster(@Value("${spring.masterSchema}") String masterSchema,
                               @Value("${spring.flyway.locations}") String masterLocations,
                               DataSource dataSource) {
        var fl = Flyway.configure()
                       .dataSource(dataSource)
                       .schemas(masterSchema)
                       .locations(masterLocations)
                       .baselineOnMigrate(true)
                       .load();
        fl.migrate();
        return fl;
    }

    @Bean(name = "masterJdbcTemplate")
    public NamedParameterJdbcTemplate masterJdbcTemplate(DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }

    @Primary
    @Bean(name = "tenantJdbcTemplate")
    public NamedParameterJdbcTemplate jdbcTemplate(@Value("${spring.tenantSchemaPrefix}") String schemaPrefix,
                                                   DataSource dataSource) {
        return new NamedParameterJdbcTemplate(new MultiTenantDataSource(dataSource, schemaPrefix));
    }
}
