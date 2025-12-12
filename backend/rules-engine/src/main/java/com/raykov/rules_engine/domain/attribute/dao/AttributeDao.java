package com.raykov.rules_engine.domain.attribute.dao;

import com.raykov.rules_engine.domain.attribute.AttributeValue;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AttributeDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insertAttribute(AttributeRow row) {
        String sql = """
                         INSERT INTO attribute (owner_type, name, value_type)
                         VALUES (CAST(:ownerType AS attribute_owner_types),
                                 :name,
                                 CAST(:valueType AS attribute_value_types))
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", row.ownerType().name())
                .addValue("name", row.name())
                .addValue("valueType", row.valueType().name());

        jdbcTemplate.update(sql, params);
    }

    public List<String> getAttributes(AttributeOwnerType ownerType) {
        String sql = """
                         SELECT name FROM attribute
                         WHERE owner_type = CAST(:ownerType AS attribute_owner_types)
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", ownerType.name());

        return jdbcTemplate.queryForList(sql, params, String.class);
    }

    public void deleteAttribute(AttributeOwnerType ownerType, String name) {
        String sql = """
                         DELETE FROM attribute
                         WHERE owner_type = CAST(:ownerType AS attribute_owner_types)
                           AND name = :name
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", ownerType.name())
                .addValue("name", name);

        jdbcTemplate.update(sql, params);
    }

    public void updateAttributeValue(long ownerId, AttributeOwnerType ownerType, String name, String value) {
        AttributeValueType valueType = getAttributeValueType(ownerType, name);

        String sql = !valueType.isList()
                ? """
                      INSERT INTO attribute_value(owner_id, owner_type, name, value, value_type, list_index)
                      VALUES (:ownerId, CAST(:ownerType AS attribute_owner_types), :name, :value, CAST(:valueType AS attribute_value_types), 0)
                      ON CONFLICT (owner_id, owner_type, name, list_index)
                      DO UPDATE SET value = EXCLUDED.value
                  """
                : """
                      WITH next_index AS (
                          SELECT COALESCE(MAX(list_index) + 1, 0) AS idx
                          FROM attribute_value
                          WHERE owner_id = :ownerId
                            AND owner_type = CAST(:ownerType AS attribute_owner_types)
                            AND name = :name
                      )
                      INSERT INTO attribute_value(owner_id, owner_type, name, list_index, value, value_type)
                      SELECT :ownerId, CAST(:ownerType AS attribute_owner_types), :name, idx, :value, CAST(:valueType AS attribute_value_types)
                      FROM next_index
                  """;

        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType.name())
                .addValue("name", name)
                .addValue("value", value)
                .addValue("valueType", valueType.name())
        );
    }

    public List<AttributeValue> getAttributeValue(long ownerId, AttributeOwnerType ownerType, String name) {
        String sql = """
                     SELECT owner_id, owner_type, name, value, value_type, list_index
                     FROM attribute_value
                     WHERE owner_id = :ownerId
                       AND owner_type = CAST(:ownerType AS attribute_owner_types)
                       AND name = :name
                     ORDER BY list_index
                     """;
        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType.name())
                .addValue("name", name);

        return jdbcTemplate.query(sql, params, (rs, _) ->
                new AttributeValue(rs.getLong("owner_id"),
                                   AttributeOwnerType.valueOf(rs.getString("owner_type")),
                                   rs.getString("name"),
                                   AttributeValueType.valueOf(rs.getString("value_type")),
                                   rs.getString("value")));
    }

    public void deleteAttributeValue(long ownerId, AttributeOwnerType ownerType, String name, Optional<Integer> listIndex) {
        AttributeValueType valueType = getAttributeValueType(ownerType, name);

        if (valueType.isList() && listIndex.isEmpty()) {
            throw new IllegalArgumentException("List index not provided for list attribute");
        }

        String sql = """
                         WITH deleted AS (
                             DELETE FROM attribute_value
                             WHERE owner_id = :ownerId
                               AND owner_type = CAST(:ownerType AS attribute_owner_types)
                               AND name = :name
                               AND list_index = :listIndex
                             RETURNING list_index
                         )
                         UPDATE attribute_value
                         SET list_index = list_index - 1
                         WHERE owner_id = :ownerId
                           AND owner_type = CAST(:ownerType AS attribute_owner_types)
                           AND name = :name
                           AND list_index > (SELECT list_index FROM deleted)
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType.name())
                .addValue("name", name)
                .addValue("listIndex", listIndex.orElse(0));

        jdbcTemplate.update(sql, params);
    }

    public List<AttributeValue> getAllAttributeValues(long ownerId, AttributeOwnerType ownerType) {
        String sql = """
                     SELECT owner_id, owner_type, name, value, value_type, list_index
                     FROM attribute_value
                     WHERE owner_id = :ownerId
                       AND owner_type = CAST(:ownerType AS attribute_owner_types)
                     ORDER BY list_index
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType.name());

        return jdbcTemplate.query(sql, params, (rs, _) ->
                new AttributeValue(rs.getLong("owner_id"),
                                   AttributeOwnerType.valueOf(rs.getString("owner_type")),
                                   rs.getString("name"),
                                   AttributeValueType.valueOf(rs.getString("value_type")),
                                   rs.getString("value")));
    }

    private AttributeValueType getAttributeValueType(AttributeOwnerType ownerType, String name) {
        String sql = """
                         SELECT value_type::text
                         FROM attribute a
                         WHERE a.owner_type = CAST(:ownerType AS attribute_owner_types)
                           AND a.name = :name
                     """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name)
                .addValue("ownerType", ownerType.name());

        return jdbcTemplate.queryForObject(sql, params,
                                           (rs, _) -> AttributeValueType.valueOf(rs.getString("value_type")));
    }
}
