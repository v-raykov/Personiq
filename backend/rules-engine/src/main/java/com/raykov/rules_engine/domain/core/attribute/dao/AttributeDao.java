package com.raykov.rules_engine.domain.core.attribute.dao;

import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public class AttributeDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long insertAttribute(long entityId, Attribute row) {
        String sql = """
                         INSERT INTO attribute (entity_id, name, value_type, is_list)
                         VALUES (:entityId,
                                 :name,
                                 CAST(:valueType AS attribute_value_type),
                                 :isList)
                         RETURNING id;
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("entityId", entityId)
                .addValue("name", row.name())
                .addValue("valueType", row.valueType().name())
                .addValue("isList", row.isList());

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public void deleteAttribute(long attributeId) {
        String sql = """
                         UPDATE attribute
                         SET removed = TRUE
                         WHERE id = :id
                     """;

        SqlParameterSource params = new MapSqlParameterSource("id", attributeId);

        jdbcTemplate.update(sql, params);
    }

    private static Attribute createAttributeFromResultSet(ResultSet rs, int ignored) throws SQLException {
        return new Attribute(
                rs.getLong("id"),
                rs.getLong("entity_id"),
                rs.getString("name"),
                AttributeValueType.valueOf(rs.getString("value_type")),
                rs.getBoolean("is_list")
        );
    }

    public List<Attribute> getAttributesByEntityId(long entityId) {
        String sql = """
                     SELECT id, name, entity_id, value_type, is_list
                     FROM attribute
                     WHERE entity_id = :entityId
                        AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("entityId", entityId);

        return jdbcTemplate.query(sql, params, AttributeDao::createAttributeFromResultSet);
    }

    public List<Attribute> getAttributesByEntityIds(Collection<Long> entityIds) {
        if (entityIds == null || entityIds.isEmpty()) {
            return List.of();
        }

        String sql = """
                     SELECT id, entity_id, name, value_type, is_list
                     FROM attribute
                     WHERE entity_id IN (:entityIds)
                       AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("entityIds", entityIds);

        return jdbcTemplate.query(sql, params, AttributeDao::createAttributeFromResultSet);
    }

    public Optional<Attribute> getAttributeById(long attributeId) {
        String sql = """
                     SELECT id, name, entity_id, value_type, is_list
                     FROM attribute
                     WHERE id = :id
                        AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("id", attributeId);

        return jdbcTemplate.query(sql, params, AttributeDao::createAttributeFromResultSet)
                           .stream()
                           .findFirst();
    }
}
