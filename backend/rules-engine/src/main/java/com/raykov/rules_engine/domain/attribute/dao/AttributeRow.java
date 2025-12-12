package com.raykov.rules_engine.domain.attribute.dao;

import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

public record AttributeRow(AttributeOwnerType ownerType, String name, AttributeValueType valueType) {

}
