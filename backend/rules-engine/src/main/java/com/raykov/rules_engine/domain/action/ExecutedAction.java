package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;

import java.util.List;

public record ExecutedAction(long id, long actionId, long customerId, String name, List<AttributeValue> attributes) {

    public static ExecutedAction fromEntityInstanceAttributes(EntityInstanceAttributes entity) {
        return new ExecutedAction(entity.id(),
                                  entity.entityId(),
                                  entity.targetInstanceId(),
                                  entity.name(),
                                  entity.attributes());
    }
}
