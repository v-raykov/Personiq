package com.raykov.rules_engine.tenant.dao;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class TenantDao {

    private final NamedParameterJdbcTemplate masterJdbcTemplate;

    public TenantDao(NamedParameterJdbcTemplate masterJdbcTemplate) {
        this.masterJdbcTemplate = masterJdbcTemplate;
    }

    public void createTenantRegistryEntry(long tenantId, String schemaName) {
        String sql = "INSERT INTO tenant_registry (id, schema_name) VALUES (:id, :schemaName)";

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", tenantId)
                .addValue("schemaName", schemaName);

        masterJdbcTemplate.update(sql, params);
    }

    public void createTenantSchema(String schemaName) {
        String sql = "CALL create_tenant_schema(:schemaName)";

        SqlParameterSource params = new MapSqlParameterSource("schemaName", schemaName);

        masterJdbcTemplate.update(sql, params);
    }

    public List<String> getAllTenants() {
        String sql = "SELECT schema_name FROM tenant_registry";

        return masterJdbcTemplate.queryForList(sql, Map.of(), String.class);
    }
}
