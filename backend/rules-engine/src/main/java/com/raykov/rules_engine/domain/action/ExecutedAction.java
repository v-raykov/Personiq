package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValueResponse;

import java.util.List;

public record ExecutedAction(long id, long actionId, long customerId, List<AttributeValueResponse> attributes) {

    public static ExecutedAction fromEntityInstanceAttributes(EntityInstanceAttributes entity) {
        return new ExecutedAction(entity.id(),
                                  entity.entityId(),
                                  entity.targetInstanceId(),
                                  entity.attributes());
    }
}
