package com.raykov.gateway.user;

import com.raykov.gateway.user.authentication.model.CustomerAccount;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class CustomerDao {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public CustomerDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createCustomer(long userId, Long customerId) {
        String sql = """
                     INSERT INTO customer (account_id, customer_id)
                     VALUES (:account_id, :customer_id)
                     """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("account_id", userId)
                .addValue("customer_id", customerId);

        jdbcTemplate.update(sql, params);
    }

    public Map<Long, Long> getCustomerIdsByUserIds(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }

        String sql = """
                     SELECT *
                     FROM customer
                     WHERE account_id IN (:userIds)
                     """;

        SqlParameterSource params = new MapSqlParameterSource("userIds", userIds);

        return jdbcTemplate.query(sql, params, (rs, ignored) -> new CustomerAccount(rs.getLong("account_id"), rs.getLong("customer_id")))
                           .stream()
                           .collect(Collectors.toMap(CustomerAccount::accountId, CustomerAccount::customerId));
    }

    public Long getCustomerIdByUserId(Long userId) {
        String sql = """
                     SELECT customer_id
                     FROM customer
                     WHERE account_id = :userId
                     """;

        SqlParameterSource params = new MapSqlParameterSource("userId", userId);
        return jdbcTemplate.queryForObject(sql, params, Long.class);
    }
}
