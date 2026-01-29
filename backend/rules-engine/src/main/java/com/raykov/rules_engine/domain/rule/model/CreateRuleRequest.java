package com.raykov.rules_engine.domain.rule.model;

public record CreateRuleRequest(long triggerdByActionId, String ruleExpression) {

}
