CREATE TABLE IF NOT EXISTS tenant_registry (
    id BIGINT PRIMARY KEY,
    schema_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE PROCEDURE create_tenant_schema(schema_name text)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = schema_name) THEN
        EXECUTE format('CREATE SCHEMA %I', schema_name);
END IF;
END;
$$;
