package com.raykov.rules_engine.domain.attribute.dao;

import com.raykov.rules_engine.domain.attribute.model.Attribute;
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
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class AttributeDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributeDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long insertAttribute(Attribute row) {
        String sql = """
                         INSERT INTO attribute (owner_type, name, value_type, is_list)
                         VALUES (CAST(:ownerType AS attribute_owner_type),
                                 :name,
                                 CAST(:valueType AS attribute_value_type),
                                 :isList)
                         RETURNING id;
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", row.ownerType().name())
                .addValue("name", row.name())
                .addValue("valueType", row.valueType().name())
                .addValue("isList", row.isList());

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public List<Attribute> getAttributes(AttributeOwnerType ownerType) {
        String sql = """
                         SELECT id, name, value_type, is_list
                         FROM attribute
                         WHERE owner_type = CAST(:ownerType AS attribute_owner_type)
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerType", ownerType.name());

        return jdbcTemplate.query(sql, params,
                                  (rs, _) -> createAttributeFromResultSet(rs));
    }


    public void deleteAttribute(long attributeId) {
        String sql = """
                         DELETE FROM attribute
                         WHERE id = :id
                     """;

        SqlParameterSource params = new MapSqlParameterSource("id", attributeId);

        jdbcTemplate.update(sql, params);
    }

    public Map<Long, Attribute> getAttributesByIds(Collection<Long> attributeIds) {
        String sql = """
                     SELECT id, name, value_type, is_list, owner_type
                     FROM attribute
                     WHERE id IN (:attributeIds)
                     """;
        return jdbcTemplate.query(sql,
                                  new MapSqlParameterSource("attributeIds", attributeIds),
                                  (rs, _) -> createAttributeFromResultSet(rs))
                           .stream()
                           .collect(Collectors.toMap(Attribute::id, Function.identity()));
    }

    private static Attribute createAttributeFromResultSet(ResultSet rs) throws SQLException {
        return new Attribute(
                rs.getLong("id"),
                AttributeOwnerType.valueOf(rs.getString("owner_type")),
                rs.getString("name"),
                AttributeValueType.valueOf(rs.getString("value_type")),
                rs.getBoolean("is_list")
        );
    }
}
