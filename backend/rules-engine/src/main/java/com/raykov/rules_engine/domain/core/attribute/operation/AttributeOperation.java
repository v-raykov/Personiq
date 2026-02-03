package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;

public interface AttributeOperation {

    String name();

    boolean isSupportedFor(AttributeValueType type);
}
