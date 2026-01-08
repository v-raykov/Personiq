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
                         INSERT INTO attribute (name, value_type, is_list)
                         VALUES (:name,
                                 CAST(:valueType AS attribute_value_type),
                                 :isList)
                         RETURNING id;
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", row.name())
                .addValue("valueType", row.valueType().name())
                .addValue("isList", row.isList());

        return jdbcTemplate.queryForObject(sql, params, Long.class);
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
                     SELECT id, name, value_type, is_list
                     FROM attribute
                     WHERE id IN (:attributeIds)
                     """;

        MapSqlParameterSource params = new MapSqlParameterSource("attributeIds", attributeIds);

        return jdbcTemplate.query(sql, params, AttributeDao::createAttributeFromResultSet)
                           .stream()
                           .collect(Collectors.toMap(Attribute::id, Function.identity()));
    }

    public List<Attribute> getCustomerAttributes() {
        String sql = """
                     SELECT a.id, a.name, a.value_type, a.is_list
                     FROM attribute a
                     JOIN attribute_customer ac ON a.id = ac.attribute_id
                     """;

        return jdbcTemplate.query(sql, AttributeDao::createAttributeFromResultSet);
    }


    public void addAttributeToCustomers(long attributeId) {
        String sql = """
                     INSERT INTO attribute_customer
                     VALUES (:attributeId)
                     """;

        SqlParameterSource params = new MapSqlParameterSource("attributeId", attributeId);

        jdbcTemplate.update(sql, params);
    }

    private static Attribute createAttributeFromResultSet(ResultSet rs, int ignored) throws SQLException {
        return new Attribute(
                rs.getLong("id"),
                rs.getString("name"),
                AttributeValueType.valueOf(rs.getString("value_type")),
                rs.getBoolean("is_list")
        );
    }
}
