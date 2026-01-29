package com.raykov.rules_engine.domain.core.entity;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class EntityDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public EntityDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createEntityInstance(long entityId, Long targetInstanceId) {
        String sql = """
                     INSERT INTO entity_instance(entity_id, target_instance_id)
                     VALUES (:entityId, :targetInstanceId)
                     RETURNING id
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("entityId", entityId)
                .addValue("targetInstanceId", targetInstanceId);

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public Long createEntity(String name, EntityType entityType) {
        String sql = """
                     INSERT INTO entity (name, entity_type)
                     VALUES (:name, CAST(:entityType AS entity_type))
                     RETURNING id
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("name", name)
                .addValue("entityType", entityType.name());

        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }

    public void deleteEntity(long entityId) {
        String sql = """
                     UPDATE entity
                     SET removed = TRUE
                     WHERE id = :entityId
                     """;

        SqlParameterSource params = new MapSqlParameterSource("entityId", entityId);

        jdbcTemplate.update(sql, params);
    }

    public List<Entity> getAllByType(EntityType entityType) {
        String sql = """
                     SELECT id, name
                     FROM entity
                     WHERE entity_type = CAST(:entityType AS entity_type)
                        AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("entityType", entityType.name());

        return jdbcTemplate.query(sql, params, (rs, _) -> new Entity(rs.getLong("id"), rs.getString("name")));
    }

    public List<EntityInstance> getAllInstancesByType(EntityType entityType) {
        String sql = """
                     SELECT ei.id, ei.entity_id, ei.target_instance_id
                     FROM entity_instance ei
                     JOIN entity e ON e.id = ei.entity_id
                     WHERE e.entity_type = CAST(:entityType AS entity_type)
                       AND e.removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("entityType", entityType.name());

        return jdbcTemplate.query(sql, params, (rs, _) -> new EntityInstance(rs.getLong("id"), rs.getLong("entity_id"), rs.getLong("target_instance_id")));
    }

    public Optional<Entity> getEntityById(long entityId, EntityType entityType) {
        String sql = """
                     SELECT name, entity_type
                     FROM entity
                     WHERE id = :id
                       AND entity_type = CAST(:entityType AS entity_type)
                       AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", entityId)
                .addValue("entityType", entityType.name());

        return jdbcTemplate.query(sql, params, (rs, _) -> new Entity(entityId, rs.getString("name")))
                           .stream()
                           .findFirst();
    }

    public Optional<Entity> getEntitiesById(long id) {
        String sql = """
                     SELECT name, entity_type
                     FROM entity
                     WHERE id = :id
                        AND removed = FALSE
                     """;

        SqlParameterSource params = new MapSqlParameterSource("id", id);

        return jdbcTemplate.query(sql, params, (rs, _) -> new Entity(id, rs.getString("name")))
                           .stream()
                           .findFirst();
    }
}
