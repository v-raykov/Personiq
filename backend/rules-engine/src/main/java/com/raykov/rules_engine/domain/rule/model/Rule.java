package com.raykov.rules_engine.domain.rule.model;

import com.raykov.rules_engine.domain.rule.node.RuleNode;

public record Rule(long id, long triggerActionId, RuleNode ruleRoot) {

}
