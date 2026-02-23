package com.raykov.rules_engine.domain.core.attribute.operation;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;

public enum ConditionalRuleOperation implements AttributeOperation {
    EQUAL_TO("="),
    GREATER_THAN(">"),
    LESS_THAN("<"),
    GREATER_THAN_OR_EQUAL_TO(">="),
    LESS_THAN_OR_EQUAL_TO("<="),
    NOT_EQUAL_TO("!="),
    CONTAINS("~"),
    NOT_CONTAINS("!~");

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
            case GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL_TO, LESS_THAN_OR_EQUAL_TO -> type == AttributeValueType.NUMBER || type == AttributeValueType.DATE;
            case CONTAINS, NOT_CONTAINS -> type == AttributeValueType.STRING;
        };
    }

    @Override
    public Set<AttributeOperation> getListOperations() {
        return Set.of(CONTAINS, NOT_CONTAINS);
    }
}