CREATE TABLE attributes_values
(
    owner_id   BIGINT                NOT NULL,
    owner_type attribute_owner_types NOT NULL,
    name       VARCHAR(255)          NOT NULL,
    value      TEXT                  NOT NULL,
    value_type attribute_value_types NOT NULL,
    PRIMARY KEY (owner_id, owner_type, name),
    FOREIGN KEY (owner_type, name)
        REFERENCES attributes (owner_type, name)
        ON DELETE CASCADE
);