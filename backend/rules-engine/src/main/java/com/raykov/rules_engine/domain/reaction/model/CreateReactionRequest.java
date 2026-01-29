package com.raykov.rules_engine.domain.reaction.model;

public record CreateReactionRequest(long ruleId, long attributeId, String operation, String value, boolean isValueAttributeId) {

}
