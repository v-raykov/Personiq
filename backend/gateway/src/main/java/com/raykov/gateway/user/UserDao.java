package com.raykov.gateway.user;

import com.raykov.gateway.config.exception.model.UsernameAlreadyExistsException;
import com.raykov.gateway.config.security.role.Authority;
import com.raykov.gateway.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class UserDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private final Logger logger = LoggerFactory.getLogger(UserDao.class);

    public UserDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createUser(User user) {
        try {
            String sql = """
                         INSERT INTO account (username, password, email, authority, tenant_id)
                         VALUES (:username, :password, :email, CAST(:authority as authority_role), :tenantId)
                         RETURNING id
                         """;
            SqlParameterSource params = new MapSqlParameterSource()
                    .addValue("username", user.username())
                    .addValue("password", user.password())
                    .addValue("email", user.email())
                    .addValue("authority", user.authority().getAuthority())
                    .addValue("tenantId", user.tenantId());

            return jdbcTemplate.queryForObject(sql, params, Long.class);
        } catch (DuplicateKeyException e) {
            throw new UsernameAlreadyExistsException(user.username());
        }
    }

    public Mono<User> findUserByUsernameAndTenantId(String username, long tenantId) {
        return Mono.fromCallable(() -> {
                       String sql = """
                                    SELECT id, username, password, email, authority, tenant_id
                                    FROM account
                                    WHERE username = :username AND tenant_id = :tenantId
                                    """;

                       Map<String, Object> params = Map.of(
                               "username", username,
                               "tenantId", tenantId
                       );

                       return jdbcTemplate.queryForObject(sql, params, UserDao::mapUser);
                   })
                   .subscribeOn(Schedulers.boundedElastic())
                   .doOnError(e -> logger.error(e.getMessage()))
                   .onErrorResume(e -> Mono.empty());
    }

    public List<User> getAllUsers(Long tenantId) {
        String sql = """
                     SELECT *
                     FROM account
                     WHERE tenant_id = :tenantId
                     """;

        SqlParameterSource params = new MapSqlParameterSource("tenantId", tenantId);

        return jdbcTemplate.query(sql, params, UserDao::mapUser);
    }

    private static User mapUser(ResultSet rs, int ignored) throws SQLException {
        return new User(
                rs.getLong("id"),
                rs.getString("username"),
                rs.getString("password"),
                rs.getString("email"),
                Authority.valueOf(rs.getString("authority")),
                rs.getLong("tenant_id")
        );
    }
}
