package com.raykov.rules_engine.domain.rule.node;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ConditionalRuleNode.class, name = "operator"),
        @JsonSubTypes.Type(value = LogicalRuleNode.class, name = "condition")
})
public interface RuleNode {

}