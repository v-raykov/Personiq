package com.raykov.rules_engine.domain.attribute;

import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;

@Repository
public class AttributeDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insertAttribute(AttributeRow row) {
        String sql = """
                     INSERT INTO attributes (owner_type, name, value_type)
                     VALUES (:ownerType, :name, :valueType)
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", row.ownerType().name(), Types.OTHER)
                .addValue("name", row.name())
                .addValue("valueType", row.valueType().name(), Types.OTHER);

        jdbcTemplate.update(sql, params);
    }

    public List<String> getAttributes(AttributeOwnerType ownerType) {
        String sql = """
                     SELECT name FROM attributes
                     WHERE owner_type = :ownerType
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", ownerType, Types.OTHER);

        return jdbcTemplate.queryForList(sql, params, String.class);
    }

    public void deleteAttribute(AttributeOwnerType ownerType, String name) {
        String sql =
                """
                DELETE FROM attributes
                WHERE owner_type = :owner_type
                  AND name = :name
                """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("owner_type", ownerType, Types.OTHER)
                .addValue("name", name);

        jdbcTemplate.update(sql, params);
    }

    public void updateAttributeValue(long ownerId, AttributeOwnerType ownerType, String name, String value) {
        String sql = """
                     INSERT INTO attributes_values (owner_id, owner_type, name, value, value_type)
                     SELECT :ownerId, :ownerType, :name, :value, a.value_type
                     FROM attributes a
                     WHERE a.owner_type = :ownerType
                       AND a.name = :name
                     ON CONFLICT (owner_id, owner_type, name)
                     DO UPDATE SET value = EXCLUDED.value;
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType, Types.OTHER)
                .addValue("name", name)
                .addValue("value", value);

        jdbcTemplate.update(sql, params);
    }

    public List<AttributeResponseDto> getAttributeValues(long ownerId, AttributeOwnerType ownerType) {
        String sql = """
                     SELECT name, value FROM attributes_values
                     WHERE owner_id = :ownerId
                       AND owner_type = :ownerType
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType, Types.OTHER);

        return jdbcTemplate.query(sql, params, (rs, _) ->
                new AttributeResponseDto(rs.getString("name"), rs.getString("value")));
    }
}
