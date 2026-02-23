package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;

import java.util.Collection;
import java.util.Set;

public interface AttributeOperation {

    String name();

    boolean isSupportedFor(AttributeValueType type);

    Set<AttributeOperation> getListOperations();
}
