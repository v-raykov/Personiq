CREATE TYPE attribute_value_type AS ENUM ('STRING', 'BOOLEAN', 'DATE', 'NUMBER');
CREATE TYPE entity_type AS ENUM ('CUSTOMER', 'ACTION', 'ITEM');

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

INSERT INTO entity(entity_type, name)
VALUES ('CUSTOMER', 'CUSTOMER');