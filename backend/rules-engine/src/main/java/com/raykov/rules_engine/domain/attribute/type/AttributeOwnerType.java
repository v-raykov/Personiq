package com.raykov.rules_engine.domain.attribute.type;

public enum AttributeOwnerType {
    ACTION,
    CUSTOMER,
    PRODUCT;

    public static AttributeOwnerType fromString(String name) {
        return AttributeOwnerType.valueOf(name.toUpperCase());
    }
}
