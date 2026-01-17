package com.raykov.rules_engine.domain.reaction.model;

public record CreateReactionRequest(long actionId, long attributeId, String operation, String value, boolean isValueAttributeId) {

}
