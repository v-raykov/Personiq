package com.raykov.rules_engine.tenant.dao;

import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static com.raykov.rules_engine.config.tenant.TenantContext.getTenantId;

public class MultiTenantDataSource extends AbstractDataSource {

    private final DataSource delegate;

    private final String schemaPrefix;

    public MultiTenantDataSource(DataSource delegate, String schemaPrefix) {
        this.delegate = delegate;
        this.schemaPrefix = schemaPrefix;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = delegate.getConnection();
        applySchema(conn);
        return conn;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection conn = delegate.getConnection(username, password);
        applySchema(conn);
        return conn;
    }

    private void applySchema(Connection conn) throws SQLException {
        if (getTenantId() != null) {
            conn.setSchema(schemaPrefix + getTenantId());
        }
    }
}
