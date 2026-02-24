package com.raykov.rules_engine.domain.reaction.model;

import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;

public record Reaction(Long id, Long ruleId, Long attributeId, UpdateOperation operation, String value, boolean isValueAttributeId) {

}
