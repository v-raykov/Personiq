package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.reaction.model.AttributeReaction;
import com.raykov.rules_engine.domain.reaction.model.ItemReaction;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
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

    public Long createAttributeReaction(Long ruleId, Long attributeId, UpdateOperation operation, String value, boolean isValueAttributeId) {
        String sql = """
                     WITH inserted_reaction AS (
                         INSERT INTO reaction (rule_id, reaction_type)
                         VALUES (:ruleId, 'ATTRIBUTE')
                         RETURNING id
                     )
                     INSERT INTO reaction_attribute (reaction_id, target_attribute_id, operation, value, is_value_attribute_id)
                     SELECT id, :attrId, CAST(:op AS update_operation), :val, :isRef
                     FROM inserted_reaction
                     RETURNING reaction_id
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ruleId", ruleId)
                .addValue("attrId", attributeId)
                .addValue("op", operation.name())
                .addValue("val", value)
                .addValue("isRef", isValueAttributeId);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public Long createItemReaction(Long ruleId, Long templateInstanceId) {
        String sql = """
                     WITH inserted_reaction AS (
                         INSERT INTO reaction (rule_id, reaction_type)
                         VALUES (:ruleId, 'ITEM')
                         RETURNING id
                     )
                     INSERT INTO reaction_item (reaction_id, template_instance_id)
                     SELECT id, :templateId
                     FROM inserted_reaction
                     RETURNING reaction_id
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("ruleId", ruleId)
                .addValue("templateId", templateInstanceId);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public List<Reaction> getAllReactions() {
        String sql = """
                     SELECT r.id, r.rule_id, r.reaction_type,
                            ra.target_attribute_id, ra.operation, ra.value, ra.is_value_attribute_id,
                            ri.template_instance_id
                     FROM reaction r
                     LEFT JOIN reaction_attribute ra ON r.id = ra.reaction_id
                     LEFT JOIN reaction_item ri ON r.id = ri.reaction_id
                     WHERE r.removed = FALSE
                     """;

        return jdbcTemplate.query(sql, Map.of(), ReactionDao::mapReaction);
    }

    public List<Reaction> getReactionsByRuleIds(List<Long> ruleIds) {
        if (ruleIds.isEmpty()) return List.of();

        String sql = """
                     SELECT r.id, r.rule_id, r.reaction_type,
                            ra.target_attribute_id, ra.operation, ra.value, ra.is_value_attribute_id,
                            ri.template_instance_id
                     FROM reaction r
                     LEFT JOIN reaction_attribute ra ON r.id = ra.reaction_id
                     LEFT JOIN reaction_item ri ON r.id = ri.reaction_id
                     WHERE r.rule_id IN (:ruleIds)
                         AND r.removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("ruleIds", ruleIds);

        return jdbcTemplate.query(sql, params, ReactionDao::mapReaction);
    }

    private static Reaction mapReaction(ResultSet rs, int ignored) throws SQLException {
        return switch (rs.getString("reaction_type")) {
            case "ATTRIBUTE" -> new AttributeReaction(rs.getLong("id"), rs.getLong("rule_id"), rs.getLong("target_attribute_id"), UpdateOperation.valueOf(rs.getString("operation")), rs.getString("value"), rs.getBoolean("is_value_attribute_id"));
            case "ITEM" -> new ItemReaction(rs.getLong("id"), rs.getLong("rule_id"), rs.getLong("template_instance_id"));
            default -> throw new IllegalStateException("Unknown reaction type: " + rs.getString("reaction_type"));
        };
    }
}
