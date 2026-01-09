package com.raykov.rules_engine.domain.core.value;

import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;

import java.util.List;

public record AttributeValueRow(long entityInstanceId, long attributeId, String name, AttributeValueType valueType,
                                List<String> values, boolean isList) {

}
