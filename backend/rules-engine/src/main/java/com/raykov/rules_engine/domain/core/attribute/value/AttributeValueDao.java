package com.raykov.rules_engine.domain.core.attribute.value;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class AttributeValueDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeValueDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AttributeValue> getAllByEntityInstanceIds(List<Long> entityInstanceIds, EntityType entityType) {
        if (entityInstanceIds.isEmpty()) {
            return List.of();
        }

        String sql = """
                     SELECT DISTINCT ON (av.attribute_id, av.entity_instance_id)
                         av.entity_instance_id,
                         av.attribute_id,
                         a.name,
                         a.value_type,
                         a.is_list,
                         COALESCE(av.value, '{}') AS value
                     FROM attribute_value av
                     JOIN attribute a ON av.attribute_id = a.id
                     JOIN entity e ON a.entity_id = e.id
                     WHERE av.entity_instance_id IN (:entityInstanceIds)
                         AND e.entity_type = CAST(:entityType AS entity_type)
                     ORDER BY
                         av.entity_instance_id,
                         av.attribute_id,
                         av.id DESC,
                         a.name
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("entityInstanceIds", entityInstanceIds)
                .addValue("entityType", entityType.name());

        return jdbcTemplate.query(sql, params, AttributeValueDao::createAttributeValueRow);
    }

    public AttributeValue getByEntityInstanceId(long attributeId, long entityInstanceId, EntityType entityType) {
        String sql = """
                     SELECT
                         av.entity_instance_id,
                         av.attribute_id,
                         a.name,
                         a.value_type,
                         a.is_list,
                         av.value
                     FROM attribute_value av
                     JOIN attribute a ON av.attribute_id = a.id
                     JOIN entity e ON a.entity_id = e.id
                     WHERE av.attribute_id = :attributeId
                       AND av.entity_instance_id = :entityInstanceId
                       AND e.entity_type = CAST(:entityType AS entity_type)
                       AND a.removed = FALSE
                       AND e.removed = FALSE
                     ORDER BY av.id DESC
                     LIMIT 1
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("attributeId", attributeId)
                .addValue("entityInstanceId", entityInstanceId)
                .addValue("entityType", entityType.name());

        return jdbcTemplate.query(sql, params, AttributeValueDao::createAttributeValueRow)
                           .stream()
                           .findFirst()
                           .orElse(null);
    }

    public void updateAttributeValue(long attributeId, long entityInstanceId, String value) {
        String sql = """
                         INSERT INTO attribute_value (entity_instance_id, attribute_id, value)
                         SELECT
                             :entityInstanceId,
                             :attributeId,
                             CASE
                                 WHEN (SELECT is_list FROM attribute WHERE id = :attributeId)
                                 THEN COALESCE((
                                     SELECT value
                                     FROM attribute_value
                                     WHERE attribute_id = :attributeId
                                         AND entity_instance_id = :entityInstanceId
                                     ORDER BY id DESC
                                     LIMIT 1
                                 ), '{}'::text[]) || ARRAY[:value]
                                 ELSE ARRAY[:value]
                             END;
                     """;

        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("entityInstanceId", entityInstanceId)
                .addValue("attributeId", attributeId)
                .addValue("value", value)
        );
    }

    public void deleteValue(long attributeId, long entityInstanceId, String attributeValue) {
        String sql = """
                         UPDATE attribute_value av
                         SET value = CASE
                                         WHEN (SELECT is_list FROM attribute WHERE id = :attributeId)
                                         THEN array_remove(av.value, :value)
                                         ELSE '{}'::text[]
                                     END
                         WHERE av.attribute_id = :attributeId
                           AND av.entity_instance_id = :entityInstanceId
                     """;

        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("entityInstanceId", entityInstanceId)
                .addValue("attributeId", attributeId)
                .addValue("value", attributeValue)
        );
    }


    public Map<Long, AttributeValue> getAttributesByIdsAndEntityInstanceIds(Collection<Long> attributeIds, List<Long> entityInstanceIds) {
        String sql = """
                     SELECT
                         av.entity_instance_id,
                         av.attribute_id,
                         a.name,
                         a.value_type,
                         a.is_list,
                         av.value
                     FROM attribute_value av
                     JOIN attribute a ON av.attribute_id = a.id
                     JOIN entity e ON a.entity_id = e.id
                     WHERE av.attribute_id IN (:attributeIds)
                       AND av.entity_instance_id IN (:entityInstanceIds)
                       AND a.removed = FALSE
                       AND e.removed = FALSE
                     ORDER BY av.id DESC
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("attributeIds", attributeIds)
                .addValue("entityInstanceIds", entityInstanceIds);

        return jdbcTemplate.query(sql, params, AttributeValueDao::createAttributeValueRow)
                           .stream()
                           .collect(Collectors.toUnmodifiableMap(AttributeValue::attributeId, value -> value));
    }

    private static AttributeValue createAttributeValueRow(ResultSet rs, int ignored) throws SQLException {
        return new AttributeValue(
                rs.getLong("entity_instance_id"),
                rs.getLong("attribute_id"),
                rs.getString("name"),
                AttributeValueType.valueOf(rs.getString("value_type")),
                List.of((String[]) rs.getArray("value").getArray()),
                rs.getBoolean("is_list")
        );
    }
}
