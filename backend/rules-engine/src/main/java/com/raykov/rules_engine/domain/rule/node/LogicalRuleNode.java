package com.raykov.rules_engine.domain.rule.node;

public record LogicalRuleNode(RuleOperation operation, RuleNode left, RuleNode right) implements RuleNode {

    public enum RuleOperation {
        AND,
        OR,
    }

}
