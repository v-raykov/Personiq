package com.raykov.rules_engine.domain.attribute.model;

import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

import java.util.List;

public record AttributeValueRow(long ownerId, long attributeId, AttributeOwnerType ownerType, String name, AttributeValueType valueType, List<String> values, boolean isList) {

}
