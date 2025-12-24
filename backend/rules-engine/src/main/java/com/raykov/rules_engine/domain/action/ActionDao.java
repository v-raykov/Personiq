package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.action.model.ActionRow;
import com.raykov.rules_engine.domain.action.model.ExecutedAction;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Repository
public class ActionDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ActionDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createAction(String name) {
        String sql = """
                     INSERT INTO action (name)
                     VALUES(:name)
                     RETURNING id
                     """;

        return jdbcTemplate.queryForObject(sql,
                                           new MapSqlParameterSource("name", name),
                                           Long.class);
    }

    public void deleteAction(long actionId) {
        String sql = """
                     DELETE FROM action
                     WHERE id = :id
                     """;
        jdbcTemplate.update(sql, new MapSqlParameterSource("id", actionId));
    }

    public void addAttributeToAction(long actionId, long attributeId) {
        String sql = """
                     INSERT INTO attribute_action (attribute_id, action_id)
                     VALUES (:actionId, :attributeId)
                     """;
        jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("actionId", actionId)
                .addValue("attributeId", attributeId));
    }

    public Set<Long> getAllAttributeIds(long actionId) {
        String sql = """
                     SELECT attribute_id
                     FROM attribute_action
                     WHERE action_id = :id
                     """;
        return new HashSet<>(jdbcTemplate.queryForList(sql, new MapSqlParameterSource("id", actionId), Long.class));
    }

    public Long insertExecutedAction(long actionId, long customerId) {
        String sql = """
                     INSERT INTO executed_action (action_id, customer_id)
                     VALUES (:actionId, :customerId)
                     RETURNING id
                     """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("actionId", actionId)
                .addValue("customerId", customerId);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public List<ActionRow> getActions() {
        String sql = """
                     SELECT a.id AS action_id,
                            a.name AS action_name,
                            ARRAY_REMOVE(ARRAY_AGG(aa.attribute_id), NULL) AS attribute_ids
                     FROM action a
                     LEFT JOIN attribute_action aa
                            ON aa.action_id = a.id
                     GROUP BY a.id
                     ORDER BY a.id
                     """;

        return jdbcTemplate.query(
                sql,
                (rs, _) -> new ActionRow(
                        rs.getLong("action_id"),
                        rs.getString("action_name"),
                        rs.getArray("attribute_ids") == null
                                ? List.of()
                                : List.of((Long[]) rs.getArray("attribute_ids").getArray())
                )
        );
    }

    public List<ExecutedAction> getExecutedActions() {
        String sql = """
                     SELECT id, action_id, customer_id
                     FROM executed_action
                     """;
        return jdbcTemplate.query(sql, (rs, _) -> new ExecutedAction(
                rs.getLong("id"),
                rs.getLong("action_id"),
                rs.getLong("customer_id")
        ));
    }

}
