package com.raykov.rules_engine.domain.rule.node;

import java.util.Arrays;
import java.util.Optional;

public record ConditionalRuleNode(RuleOperation operation, long attributeId, String value,
                                  boolean isValueAttributeId) implements RuleNode {

    public enum RuleOperation {
        EQUAL_TO("="),
        GREATER_THAN(">"),
        LESS_THAN("<"),
        GREATER_THAN_OR_EQUAL_TO(">="),
        LESS_THAT_OR_EQUAL_TO("<="),
        NOT_EQUAL_TO("!="),
        CONTAINS("~");

        private final String sign;

        RuleOperation(String sign) {
            this.sign = sign;
        }

        public String getSign() {
            return sign;
        }

        public static Optional<RuleOperation> getBySign(String sign) {
            return Arrays.stream(values())
                         .filter(op -> op.sign.equals(sign))
                         .findFirst();
        }
    }
}
