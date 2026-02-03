package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;

import java.util.Arrays;
import java.util.Optional;

public enum ConditionalRuleOperation implements AttributeOperation {
    EQUAL_TO("="),
    GREATER_THAN(">"),
    LESS_THAN("<"),
    GREATER_THAN_OR_EQUAL_TO(">="),
    LESS_THAT_OR_EQUAL_TO("<="),
    NOT_EQUAL_TO("!="),
    CONTAINS("~");

    private final String sign;
    
    ConditionalRuleOperation(String sign) {
        this.sign = sign;
    }

    public String getSign() {
        return sign;
    }

    public static Optional<ConditionalRuleOperation> getBySign(String sign) {
        return Arrays.stream(values())
                     .filter(op -> op.sign.equals(sign))
                     .findFirst();
    }

    @Override
    public boolean isSupportedFor(AttributeValueType type) {
        return switch (this) {
            case EQUAL_TO, NOT_EQUAL_TO -> true;
            case GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL_TO, LESS_THAT_OR_EQUAL_TO -> type == AttributeValueType.NUMBER || type == AttributeValueType.DATE;
            case CONTAINS -> type == AttributeValueType.STRING;
        };
    }
}