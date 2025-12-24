package com.raykov.rules_engine.domain.attribute.model;

import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

public record Attribute(Long id, AttributeOwnerType ownerType, String name, AttributeValueType valueType,
                        boolean isList) {

    public Attribute(AttributeOwnerType ownerType, String name, AttributeValueType valueType, boolean isList) {
        this(null, ownerType, name, valueType, isList);
    }

}
