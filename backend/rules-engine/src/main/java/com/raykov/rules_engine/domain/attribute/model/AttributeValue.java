package com.raykov.rules_engine.domain.attribute.model;

import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

import java.util.List;

public record AttributeValue(long attributeId, String name, AttributeValueType valueType, List<String> values, boolean isList) {

    public static AttributeValue fromAttributeValueRow(AttributeValueRow row) {
        return new AttributeValue(row.attributeId(), row.name(), row.valueType(), row.values(), row.isList());
    }

}
