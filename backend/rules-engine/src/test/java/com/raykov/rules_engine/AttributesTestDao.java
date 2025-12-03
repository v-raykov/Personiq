package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
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
        String sql = "SELECT * FROM attributes";
        return jdbcTemplate.query(sql, Map.of(), (rs, _) ->
                new AttributeRow(AttributeOwnerType.valueOf(rs.getString("owner_type")),
                                 rs.getString("name"),
                                 AttributeValueType.valueOf(rs.getString("value_type"))));
    }
}
