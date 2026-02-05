package com.raykov.rules_engine.domain.core.attribute.value;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;

import java.util.List;

public record AttributeValue(long entityInstanceId, long attributeId, String name, AttributeValueType valueType,
                             List<String> values, boolean isList) {

}
