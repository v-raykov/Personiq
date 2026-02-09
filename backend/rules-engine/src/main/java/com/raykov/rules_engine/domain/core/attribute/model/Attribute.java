package com.raykov.rules_engine.domain.core.attribute.model;

import java.util.List;

public record Attribute(Long id, Long entityId, String name, AttributeValueType valueType,
                        boolean isList) {

    public Attribute(String name, AttributeValueType valueType, boolean isList) {
        this(null, null, name, valueType, isList);
    }

    public List<String> getDefaultValue() {
        return isList
               ? List.of()
               : List.of(valueType.getDefaultValue());
    }
}
