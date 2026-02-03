package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;

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
    SET_NOW;

    @Override
    public boolean isSupportedFor(AttributeValueType type) {
        return switch (this) {
            case ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, INCREMENT, DECREMENT ->
                    type == AttributeValueType.NUMBER;
            case CONCATENATION -> type == AttributeValueType.STRING;
            case SET_FALSE, SET_TRUE, FLIP -> type == AttributeValueType.BOOLEAN;
            case SET_NOW -> type == AttributeValueType.DATE;
            case SET -> true;
        };
    }
}
