package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;

import java.util.List;

public record EntityInstanceAttributes(long id, long entityId, Long targetInstanceId, List<AttributeValue> attributes) {

}
