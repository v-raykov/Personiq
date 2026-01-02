package com.raykov.rules_engine.domain.attribute.model;

import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

public record Attribute(Long id, String name, AttributeValueType valueType,
                        boolean isList) {

    public Attribute(String name, AttributeValueType valueType, boolean isList) {
        this(null, name, valueType, isList);
    }

}
