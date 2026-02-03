package com.raykov.rules_engine.domain.rule.node;

import com.raykov.rules_engine.domain.core.attribute.operation.LogicalRuleOperation;

public record LogicalRuleNode(LogicalRuleOperation operation, RuleNode left, RuleNode right) implements RuleNode {

}
