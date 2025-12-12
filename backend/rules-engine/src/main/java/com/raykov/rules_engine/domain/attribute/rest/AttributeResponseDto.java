package com.raykov.rules_engine.domain.attribute.rest;

import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;

import java.util.List;

public record AttributeResponseDto(String name, AttributeValueType valueType, List<String> values) {

}
