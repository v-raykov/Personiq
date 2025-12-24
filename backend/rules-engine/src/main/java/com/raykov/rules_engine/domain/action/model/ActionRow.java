package com.raykov.rules_engine.domain.action.model;

import java.util.List;

public record ActionRow(long id, String name, List<Long> attributeIds) {
}
