package com.raykov.rules_engine.domain.attribute.type;

public enum AttributeValueType {
    STRING,
    BOOLEAN,
    DATE,
    NUMBER;

    public static AttributeValueType fromString(String name) {
        return AttributeValueType.valueOf(name.toUpperCase());
    }

}