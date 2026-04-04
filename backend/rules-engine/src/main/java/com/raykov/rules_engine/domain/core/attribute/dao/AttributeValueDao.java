package com.raykov.rules_engine.domain.core.attribute.dao;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
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

@Repository
public class AttributeValueDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeValueDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AttributeValue> getByEntityInstanceIds(Collection<Long> entityInstanceIds, EntityType entityType) {
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

    public List<AttributeValue> getAttributesByIdsAndEntityInstanceIds(Collection<Long> attributeIds, Collection<Long> entityInstanceIds) {
        if (entityInstanceIds.isEmpty() || attributeIds.isEmpty()) return List.of();

        String sql = """
                          SELECT DISTINCT ON (av.entity_instance_id, av.attribute_id)
                              av.entity_instance_id,
                              av.attribute_id,
                              a.name,
                              a.value_type,
                              a.is_list,
                              av.value
                          FROM attribute_value av
                          JOIN attribute a ON av.attribute_id = a.id
                          WHERE av.entity_instance_id IN (:entityInstanceIds)
                           AND av.attribute_id IN (:attributeIds)
                     ORDER BY av.entity_instance_id, av.attribute_id, av.id DESC
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("attributeIds", attributeIds)
                .addValue("entityInstanceIds", entityInstanceIds);

        return jdbcTemplate.query(sql, params, AttributeValueDao::createAttributeValueRow);
    }

    public void updateAttributeValues(Collection<AttributeValue> attributeValues) {
        if (attributeValues.isEmpty()) {
            return;
        }

        String sql = """
                     INSERT INTO attribute_value (entity_instance_id, attribute_id, value)
                     VALUES (:entityInstanceId, :attributeId, :value)
                     """;

        SqlParameterSource[] batchParams = attributeValues.stream()
                                                          .map(av -> new MapSqlParameterSource()
                                                                  .addValue("entityInstanceId", av.entityInstanceId())
                                                                  .addValue("attributeId", av.attributeId())
                                                                  .addValue("value", av.values().toArray(new String[0])))
                                                          .toArray(SqlParameterSource[]::new);

        jdbcTemplate.batchUpdate(sql, batchParams);
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
