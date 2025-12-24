package com.raykov.rules_engine.domain.action.model;

import com.raykov.rules_engine.domain.attribute.model.Attribute;

import java.util.List;
import java.util.Map;

public record Action(long id, String name, List<Attribute> attributes) {

    public Action(long id, String name) {
        this(id, name, null);
    }

    public static Action fromRow(ActionRow row, Map<Long, Attribute> attributesById) {
        return new Action(row.id(), row.name(), row.attributeIds()
                                                   .stream()
                                                   .map(attributesById::get)
                                                   .toList());
    }

    public Action withAttributes(List<Attribute> attributes) {
        return new Action(id, name, attributes);
    }
}
