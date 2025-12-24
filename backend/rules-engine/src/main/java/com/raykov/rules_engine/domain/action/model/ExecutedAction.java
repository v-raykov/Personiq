package com.raykov.rules_engine.domain.action.model;

import com.raykov.rules_engine.domain.attribute.model.AttributeValue;

import java.util.List;

public record ExecutedAction(long id, long actionId, long customerId, List<AttributeValue> attributes) {

    public ExecutedAction(long id, long actionId, long customerId) {
        this(id, actionId, customerId, List.of());
    }

    public ExecutedAction withAttributes(List<AttributeValue> attributes) {
        return new ExecutedAction(id, actionId, customerId, attributes);
    }
}
