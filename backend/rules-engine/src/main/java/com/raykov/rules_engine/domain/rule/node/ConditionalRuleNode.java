package com.raykov.rules_engine.domain.rule.node;

import com.raykov.rules_engine.domain.core.attribute.operation.ConditionalRuleOperation;

public record ConditionalRuleNode(ConditionalRuleOperation operation, long attributeId, String value,
                                  boolean isValueAttributeId) implements RuleNode {

}
