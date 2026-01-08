CREATE TYPE attribute_value_type AS ENUM ('STRING', 'BOOLEAN', 'DATE', 'NUMBER');

CREATE TABLE attribute
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255)         NOT NULL,
    value_type attribute_value_type NOT NULL,
    is_list    BOOLEAN DEFAULT FALSE
);

CREATE TABLE attribute_customer
(
    attribute_id BIGINT REFERENCES attribute ON DELETE CASCADE,
    PRIMARY KEY (attribute_id)
);

CREATE TABLE action
(
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE executed_action
(
    id          BIGSERIAL PRIMARY KEY,
    action_id   BIGINT NOT NULL,
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


CREATE TABLE attribute_value
(
    id           BIGSERIAL PRIMARY KEY,
    owner_id     BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    value        TEXT[] NOT NULL,
    UNIQUE (id, owner_id, attribute_id),
    FOREIGN KEY (attribute_id)
        REFERENCES attribute (id)
        ON DELETE CASCADE
);