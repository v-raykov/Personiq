package com.raykov.rules_engine.domain.core.attribute.model;

public record Attribute(Long id, Long entityId, String name, AttributeValueType valueType,
                        boolean isList) {

    public Attribute(String name, AttributeValueType valueType, boolean isList) {
        this(null, null, name, valueType, isList);
    }

}
