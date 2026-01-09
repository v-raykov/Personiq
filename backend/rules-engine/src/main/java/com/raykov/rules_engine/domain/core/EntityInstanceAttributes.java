package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.value.AttributeValue;

import java.util.List;

public record EntityInstanceAttributes(long id, long entityId, long targetInstanceId, List<AttributeValue> attributes) {

}
