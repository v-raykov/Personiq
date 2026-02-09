package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueResponse;

import java.util.List;

public record EntityInstanceAttributes(long id, long entityId, long targetInstanceId, List<AttributeValueResponse> attributes) {

}
