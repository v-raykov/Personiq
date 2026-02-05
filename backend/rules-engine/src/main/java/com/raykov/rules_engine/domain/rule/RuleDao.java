package com.raykov.rules_engine.domain.rule;

import com.raykov.rules_engine.domain.rule.model.RuleDbo;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class RuleDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public RuleDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createRule(long actionId, String expression) {
        String sql = """
                     INSERT INTO rule (trigger_entity_id, expression)
                     VALUES (:actionId, :expression::jsonb)
                     RETURNING id;
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("actionId", actionId)
                .addValue("expression", expression);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public List<RuleDbo> getAllRules() {
        String sql = """
                     SELECT id, trigger_entity_id, expression
                     FROM rule
                     WHERE removed = FALSE
                     """;

        return jdbcTemplate.query(sql, Map.of(), RuleDao::createRuleDbo);
    }

    public Optional<RuleDbo> getRuleById(long id) {
        String sql = """
                     SELECT id, trigger_entity_id, expression
                     FROM rule
                     WHERE id = :id
                        AND removed = FALSE
                     LIMIT 1
                     """;

        SqlParameterSource params = new MapSqlParameterSource("id", id);

        return jdbcTemplate.query(sql, params, RuleDao::createRuleDbo)
                           .stream()
                           .findFirst();
    }

    public List<RuleDbo> getRulesByTriggerActionId(long actionId) {
        String sql = """
                     SELECT id, trigger_entity_id, expression
                     FROM rule
                     WHERE trigger_entity_id = :actionId
                        AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("actionId", actionId);

        return jdbcTemplate.query(sql, params, RuleDao::createRuleDbo);
    }

    private static RuleDbo createRuleDbo(ResultSet rs, int ignored) throws SQLException {
        return new RuleDbo(rs.getLong("id"), rs.getLong("trigger_entity_id"), rs.getString("expression"));
    }
}
