package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class ReactionDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ReactionDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createReaction(Long actionId, Long attributeId, UpdateOperation operation, String value, boolean isValueAttributeId) {
        String sql = """
                     INSERT INTO reaction(rule_id, target_attribute_id, operation, value, is_value_attribute_id)
                     VALUES (:triggerEntityId, :targetAttributeId, CAST(:operation AS update_operation), :value, :isValueAttributeId)
                     RETURNING id
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("triggerEntityId", actionId)
                .addValue("targetAttributeId", attributeId)
                .addValue("operation", operation.name())
                .addValue("value", value)
                .addValue("isValueAttributeId", isValueAttributeId);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public List<Reaction> getAllReactions() {
        String sql = """
                     SELECT id, rule_id, target_attribute_id, operation, value, is_value_attribute_id
                     FROM reaction
                     WHERE removed = FALSE
                     """;

        return jdbcTemplate.query(sql, Map.of(), ReactionDao::mapReaction);
    }

    private static Reaction mapReaction(ResultSet rs, int ignored) throws SQLException {
        return new Reaction(rs.getLong("id"), rs.getLong("rule_id"), rs.getLong("target_attribute_id"), UpdateOperation.valueOf(rs.getString("operation")), rs.getString("value"), rs.getBoolean("is_value_attribute_id"));
    }
}
