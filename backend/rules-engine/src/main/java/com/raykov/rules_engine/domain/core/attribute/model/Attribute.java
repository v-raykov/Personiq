package com.raykov.rules_engine.domain.core.attribute.model;

import com.raykov.rules_engine.domain.core.attribute.operation.AttributeOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;

import java.util.List;

public record Attribute(Long id, Long entityId, String name, AttributeValueType valueType,
                        boolean isList) {

    public Attribute(String name, AttributeValueType valueType, boolean isList) {
        this(null, null, name, valueType, isList);
    }

    public List<String> getDefaultValue() {
        return isList
               ? List.of()
               : List.of(valueType.getDefaultValue());
    }

    public boolean isOperationSupported(AttributeOperation operation) {
        return isList
               ? UpdateOperation.getListOperations().contains(operation)
               : operation.isSupportedFor(valueType);
    }
}
