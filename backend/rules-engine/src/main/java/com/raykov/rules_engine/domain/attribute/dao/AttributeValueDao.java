package com.raykov.rules_engine.domain.attribute.dao;

import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
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

    public void updateAttributeValue(long ownerId, long attributeId, String value) {
        String sql = """
                         INSERT INTO attribute_value (owner_id, attribute_id, value)
                         SELECT
                             :ownerId,
                             :attributeId,
                             CASE
                                 WHEN (SELECT is_list FROM attribute WHERE id = :attributeId)
                                 THEN COALESCE((
                                     SELECT value
                                     FROM attribute_value
                                     WHERE owner_id = :ownerId
                                       AND attribute_id = :attributeId
                                     ORDER BY id DESC
                                     LIMIT 1
                                 ), '{}'::text[]) || ARRAY[:value]
                                 ELSE ARRAY[:value]
                             END;
                     """;

        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("attributeId", attributeId)
                .addValue("value", value)
        );
    }

    public void deleteAttributeValue(long customerId, long attributeId, String value) {
        String sql = """
                         UPDATE attribute_value av
                         SET value = CASE
                                         WHEN (SELECT is_list FROM attribute WHERE id = :attributeId)
                                         THEN array_remove(av.value, :value)
                                         ELSE '{}'::text[]
                                     END
                         WHERE av.owner_id = :ownerId
                           AND av.attribute_id = :attributeId
                     """;

        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("ownerId", customerId)
                .addValue("attributeId", attributeId)
                .addValue("value", value)
        );
    }

    public List<AttributeValueRow> getAllAttributeValues(Collection<Long> ownerIds) {
        if (ownerIds.isEmpty()) {
            return List.of();
        }

        String sql = """
                     SELECT DISTINCT ON (av.owner_id, av.attribute_id)
                         av.owner_id,
                         av.attribute_id,
                         a.name,
                         a.value_type,
                         a.is_list,
                         COALESCE(av.value, '{}') AS value
                     FROM attribute_value av
                     JOIN attribute a ON av.attribute_id = a.id
                     WHERE av.owner_id IN (:ownerIds)
                     ORDER BY
                         av.owner_id,
                         av.attribute_id,
                         av.id DESC,
                         a.name
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerIds", ownerIds);

        return jdbcTemplate.query(sql, params, AttributeValueDao::createAttributeValueRow);
    }

    public AttributeValueRow getAttributeValue(long ownerId, long attributeId) {
        String sql = """
                     SELECT
                         av.owner_id,
                         av.attribute_id,
                         a.name,
                         a.value_type,
                         a.is_list,
                         av.value
                     FROM attribute_value av
                     JOIN attribute a ON av.attribute_id = a.id
                     WHERE av.owner_id = :ownerId
                       AND av.attribute_id = :attributeId
                     ORDER BY av.id DESC
                     LIMIT 1
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("attributeId", attributeId);

        return jdbcTemplate.queryForObject(sql, params, AttributeValueDao::createAttributeValueRow);
    }

    private static AttributeValueRow createAttributeValueRow(ResultSet rs, int ignored) throws SQLException {
        return new AttributeValueRow(
                rs.getLong("owner_id"),
                rs.getLong("attribute_id"),
                rs.getString("name"),
                AttributeValueType.valueOf(rs.getString("value_type")),
                List.of((String[]) rs.getArray("value").getArray()),
                rs.getBoolean("is_list")
        );
    }
}
