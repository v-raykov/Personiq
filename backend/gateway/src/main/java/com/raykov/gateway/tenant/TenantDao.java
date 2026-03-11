package com.raykov.gateway.tenant;

import com.raykov.gateway.config.exception.model.TenantNameAlreadyExistsException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class TenantDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TenantDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createTenant(String tenantUriName) {
        try {
            String sql = "INSERT INTO tenant (uri_name) VALUES (:tenantUriName) RETURNING id";

            SqlParameterSource params = new MapSqlParameterSource("tenantUriName", tenantUriName);

            return jdbcTemplate.queryForObject(sql, params, Long.class);
        } catch (DuplicateKeyException e) {
            throw new TenantNameAlreadyExistsException(tenantUriName);
        }
    }

    public List<String> getTenantUriNames() {
        String sql = "SELECT uri_name FROM tenant";

        return jdbcTemplate.queryForList(sql, Map.of(), String.class);
    }

    public Optional<Long> getTenantIdByUri(String tenantUri) {
        String sql = "SELECT id FROM tenant WHERE uri_name = :tenantUri";

        SqlParameterSource params = new MapSqlParameterSource("tenantUri", tenantUri);

        return jdbcTemplate.queryForList(sql, params, Long.class)
                           .stream()
                           .findFirst();

    }
}
