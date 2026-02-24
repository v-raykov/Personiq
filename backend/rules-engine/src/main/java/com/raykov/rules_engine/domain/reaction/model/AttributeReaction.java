package com.raykov.rules_engine.domain.reaction.model;

import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;

public record AttributeReaction(Long id, Long ruleId, Long attributeId, UpdateOperation operation, String value, boolean isValueAttributeId)
        implements Reaction {

}
