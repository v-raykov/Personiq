package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.Attribute;

import java.util.List;

public record EntityAttributes(long id, String name, List<Attribute> attributes) {

}
