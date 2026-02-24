package com.raykov.rules_engine.domain.reaction.model;

public record CreateAttributeReactionRequest(long ruleId, long attributeId, String operation, String value, boolean isValueAttributeId) {

}
