package com.raykov.rules_engine.domain.core.attribute.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public record AttributeValue(long entityInstanceId, long attributeId, String name, AttributeValueType valueType,
                             List<String> values, boolean isList) {

    public AttributeValue withUpdatedValue(String newValue) {
        List<String> newValues = isList
                                 ? Arrays.asList(newValue.replace("[", "")
                                                         .replace("]", "")
                                                         .split(", "))
                                 : List.of(newValue);

        return new AttributeValue(entityInstanceId, attributeId, name, valueType, newValues, isList);
    }

    public AttributeValue withAppendedValue(String newValue) {
        if (newValue == null) return this;

        List<String> newValues = new ArrayList<>(values);
        newValues.add(newValue);

        return new AttributeValue(entityInstanceId, attributeId, name, valueType, List.copyOf(newValues), isList);
    }

}
