package com.raykov.gateway.user;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

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
}
