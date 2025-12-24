CREATE TYPE attribute_owner_type AS ENUM ('CUSTOMER', 'ACTION', 'PRODUCT');

CREATE TYPE attribute_value_type AS ENUM ('STRING', 'BOOLEAN', 'DATE', 'NUMBER');

CREATE TABLE IF NOT EXISTS attribute
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255)         NOT NULL,
    value_type attribute_value_type NOT NULL,
    owner_type attribute_owner_type NOT NULL,
    is_list    BOOLEAN DEFAULT FALSE,
    UNIQUE (name, owner_type)
);

CREATE TABLE attribute_value
(
    owner_id     BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    value        TEXT[] NOT NULL,
    PRIMARY KEY (owner_id, attribute_id),
    FOREIGN KEY (attribute_id)
        REFERENCES attribute (id)
        ON DELETE CASCADE
);

CREATE TABLE action
(
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE executed_action
(
    id        BIGSERIAL PRIMARY KEY,
    action_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    FOREIGN KEY (action_id)
        REFERENCES action (id)
        ON DELETE CASCADE
);

CREATE TABLE attribute_action
(
    action_id    BIGINT REFERENCES action,
    attribute_id BIGINT REFERENCES attribute ON DELETE CASCADE,
    PRIMARY KEY (attribute_id)
);