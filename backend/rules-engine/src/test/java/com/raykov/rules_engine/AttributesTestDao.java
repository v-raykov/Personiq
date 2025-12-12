package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AttributesTestDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AttributesTestDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AttributeRow> getAll() {
        String sql = "SELECT * FROM attribute";
        return jdbcTemplate.query(sql, Map.of(), (rs, _) ->
                new AttributeRow(AttributeOwnerType.valueOf(rs.getString("owner_type")),
                                 rs.getString("name"),
                                 AttributeValueType.valueOf(rs.getString("value_type"))));
    }

    public List<Integer> getAttributeValueListIndexes(long ownerId, AttributeOwnerType ownerType, String name) {
        String sql = """
                     SELECT list_index
                     FROM attribute_value
                     WHERE owner_id = :ownerId
                       AND owner_type = CAST(:ownerType AS attribute_owner_types)
                       AND name = :name
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ownerId", ownerId)
                .addValue("ownerType", ownerType.name())
                .addValue("name", name);

        return jdbcTemplate.queryForList(sql, params, Integer.class);
    }
}
