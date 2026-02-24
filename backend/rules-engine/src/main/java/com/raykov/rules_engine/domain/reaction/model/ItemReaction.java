package com.raykov.rules_engine.domain.reaction.model;

public record ItemReaction(Long id, Long ruleId, Long templateItemId) implements Reaction {

}
