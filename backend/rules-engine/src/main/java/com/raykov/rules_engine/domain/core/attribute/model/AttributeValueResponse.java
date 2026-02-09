package com.raykov.rules_engine.domain.core.attribute.model;

import java.util.List;

public record AttributeValueResponse(long attributeId, String name, AttributeValueType valueType, List<String> values,
                                     boolean isList) {

    public static AttributeValueResponse fromAttributeValueRow(AttributeValue row) {
        return new AttributeValueResponse(row.attributeId(), row.name(), row.valueType(), row.values(), row.isList());
    }
}
