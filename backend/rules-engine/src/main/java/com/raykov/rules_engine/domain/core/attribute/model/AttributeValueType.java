package com.raykov.rules_engine.domain.core.attribute.model;

public enum AttributeValueType {
    STRING(""),
    BOOLEAN("false"),
    DATE("1900-01-01T00:00:00Z"),
    NUMBER("0");

    private final String defaultValue;

    AttributeValueType(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getDefaultValue() {
        return defaultValue;
    }
}