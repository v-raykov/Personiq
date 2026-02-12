package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;

import java.util.Set;

public enum UpdateOperation implements AttributeOperation {
    ADDITION,
    SUBTRACTION,
    MULTIPLICATION,
    DIVISION,
    INCREMENT,
    DECREMENT,
    CONCATENATION,
    SET_FALSE,
    SET_TRUE,
    FLIP,
    SET,
    SET_NOW,
    APPEND,
    PREPEND,
    REMOVE,
    CLEAR;

    @Override
    public boolean isSupportedFor(AttributeValueType type) {
        return switch (this) {
            case ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, INCREMENT, DECREMENT ->
                    type == AttributeValueType.NUMBER;
            case CONCATENATION -> type == AttributeValueType.STRING;
            case SET_FALSE, SET_TRUE, FLIP -> type == AttributeValueType.BOOLEAN;
            case SET_NOW -> type == AttributeValueType.DATE;
            case SET -> true;
            case APPEND, PREPEND, REMOVE, CLEAR -> false;
        };
    }

    public static Set<AttributeOperation> getListOperations() {
        return Set.of(APPEND, PREPEND, REMOVE, CLEAR);
    }
}
