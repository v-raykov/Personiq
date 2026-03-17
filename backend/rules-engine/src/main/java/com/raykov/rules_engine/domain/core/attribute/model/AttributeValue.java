package com.raykov.rules_engine.domain.core.attribute.model;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

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

    public AttributeValue withUpdatedValue(List<String> newValues) {
        if (!isList && newValues.size() > 1) {
            throw new IllegalArgumentException("Only one value should be provided for non-list attribute");
        }
        return new AttributeValue(entityInstanceId, attributeId, name, valueType, newValues, isList);
    }

    public AttributeValue withAppendedValue(String newValue) {
        if (newValue == null) return this;

        List<String> valuesToAppend = isList
                                 ? Arrays.asList(newValue.replace("[", "")
                                                         .replace("]", "")
                                                         .split(", "))
                                 : List.of(newValue);
        List<String> newValues = Stream.concat(values.stream(), valuesToAppend.stream()).toList();

        return new AttributeValue(entityInstanceId, attributeId, name, valueType, List.copyOf(newValues), isList);
    }

    public String valueAsString() {
        return isList
               ? values.toString()
               : values.getFirst();

    }
}
