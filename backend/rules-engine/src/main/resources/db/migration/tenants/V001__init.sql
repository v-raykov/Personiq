CREATE TYPE attribute_value_type AS ENUM ('STRING', 'BOOLEAN', 'DATE', 'NUMBER');
CREATE TYPE entity_type AS ENUM ('CUSTOMER', 'ACTION', 'ITEM');
CREATE TYPE update_operation AS ENUM (
    'ADDITION', 'SUBTRACTION', 'MULTIPLICATION','DIVISION','INCREMENT','DECREMENT',
    'CONCATENATION',
    'SET_FALSE', 'SET_TRUE', 'FLIP',
    'SET',
    'SET_NOW',
    'APPEND', 'PREPEND', 'REMOVE', 'CLEAR');

CREATE TABLE entity
(
    id          BIGSERIAL PRIMARY KEY,
    entity_type entity_type  NOT NULL,
    removed     BOOLEAN DEFAULT FALSE,
    name        VARCHAR(255) NOT NULL
);

CREATE TABLE entity_instance
(
    id                 BIGSERIAL PRIMARY KEY,
    entity_id          BIGINT NOT NULL REFERENCES entity,
    target_instance_id BIGINT NULL REFERENCES entity_instance
);

CREATE TABLE attribute
(
    id         BIGSERIAL PRIMARY KEY,
    entity_id  BIGINT REFERENCES entity,
    name       VARCHAR(255)         NOT NULL,
    value_type attribute_value_type NOT NULL,
    is_list    BOOLEAN DEFAULT FALSE,
    removed    BOOLEAN DEFAULT FALSE,
    UNIQUE (entity_id, name)
);

CREATE TABLE attribute_value
(
    id                 BIGSERIAL PRIMARY KEY,
    attribute_id       BIGINT NOT NULL REFERENCES attribute,
    entity_instance_id BIGINT NOT NULL REFERENCES entity_instance,
    value              TEXT[] NOT NULL
);

CREATE TABLE rule
(
    id                BIGSERIAL PRIMARY KEY,
    trigger_entity_id BIGINT NOT NULL REFERENCES entity,
    expression        JSONB  NOT NULL,
    removed           BOOLEAN DEFAULT FALSE
);

CREATE TABLE reaction
(
    id                    BIGSERIAL PRIMARY KEY,
    rule_id               BIGINT           NOT NULL REFERENCES rule,
    target_attribute_id   BIGINT           NOT NULL REFERENCES attribute,
    operation             update_operation NOT NULL,
    value                 TEXT,
    is_value_attribute_id BOOLEAN          NOT NULL,
    removed               BOOLEAN DEFAULT FALSE
);

INSERT INTO entity(entity_type, name)
VALUES ('CUSTOMER', 'CUSTOMER');