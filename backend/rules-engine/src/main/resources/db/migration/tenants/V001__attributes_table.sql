CREATE TYPE attribute_owner_types AS ENUM ('CUSTOMER', 'EVENT', 'PRODUCT');

CREATE TYPE attribute_value_types AS ENUM ('STRING', 'BOOLEAN', 'DATE', 'NUMBER', 'LIST_STRING', 'LIST_BOOLEAN', 'LIST_DATE', 'LIST_NUMBER');

CREATE TABLE IF NOT EXISTS attribute
(
    name       VARCHAR(255)          NOT NULL,
    value_type attribute_value_types NOT NULL,
    owner_type attribute_owner_types NOT NULL,
    PRIMARY KEY (owner_type, name)
);