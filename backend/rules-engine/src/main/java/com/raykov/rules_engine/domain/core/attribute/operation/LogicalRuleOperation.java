package com.raykov.rules_engine.domain.core.attribute.operation;

public enum LogicalRuleOperation {
    AND,
    OR;

    public String getSign() {
        return this == AND ? "&" : "|";
    }
}