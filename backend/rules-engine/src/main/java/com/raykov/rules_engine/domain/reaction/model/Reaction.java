package com.raykov.rules_engine.domain.reaction.model;

import com.raykov.rules_engine.domain.reaction.operation.UpdateOperation;

public record Reaction(Long id, Long actionId, Long attributeId, UpdateOperation operation, String value, boolean isValueAttributeId) {

}
