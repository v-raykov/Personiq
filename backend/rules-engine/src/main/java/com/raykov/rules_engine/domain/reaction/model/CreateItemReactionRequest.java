package com.raykov.rules_engine.domain.reaction.model;

import java.util.Map;

public record CreateItemReactionRequest(long ruleId, long itemId, Map<Long, String> itemAttributes) {

}
