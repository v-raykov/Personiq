package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AttributeTypeCompatibilityService {

    public void validateAttributeCompatibility(Attribute target, Attribute source) {
        if (target.valueType() != source.valueType()) {
            throw new IllegalArgumentException("Target and Parameter attribute types must match.");
        }
    }

    public void validateScalarType(AttributeValueType type, String value) {
        try {
            switch (type) {
                case NUMBER -> new BigDecimal(value);
                case BOOLEAN -> {
                    if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false"))
                        throw new IllegalArgumentException();
                }
                case DATE -> java.time.ZonedDateTime.parse(value);
                case STRING -> {
                    if (value == null) throw new IllegalArgumentException();
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException(String.format("Invalid value parameter: '%s' for type: %s", value, type));
        }
    }
}
