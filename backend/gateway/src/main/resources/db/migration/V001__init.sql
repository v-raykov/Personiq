CREATE TYPE authority_role AS ENUM ('ROLE_CUSTOMER', 'ROLE_MANAGER', 'ROLE_ADMIN');

CREATE TABLE IF NOT EXISTS tenant
(
    id       BIGSERIAL PRIMARY KEY,
    uri_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS account
(
    id        BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenant,
    username      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL,
    password  VARCHAR(60)  NOT NULL,
    authority authority_role,
    UNIQUE (tenant_id, username),
    UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS customer
(
    account_id  BIGINT REFERENCES account,
    customer_id BIGINT NOT NULL
)