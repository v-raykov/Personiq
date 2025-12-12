package com.raykov.rules_engine.domain.attribute.type;

public enum AttributeValueType {
    STRING,
    BOOLEAN,
    DATE,
    NUMBER,
    LIST_STRING,
    LIST_BOOLEAN,
    LIST_DATE,
    LIST_NUMBER;

    public static AttributeValueType fromString(String name) {
        return AttributeValueType.valueOf(name.toUpperCase());
    }

    public boolean isList() {
        return name().startsWith("LIST_");
    }
}