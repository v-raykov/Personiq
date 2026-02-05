package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.value.AttributeValueResponse;

import java.util.List;

public record EntityInstanceAttributes(long id, long entityId, long targetInstanceId, List<AttributeValueResponse> attributes) {

}
