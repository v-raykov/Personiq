package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.attribute.operation.AttributeOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
class AttributeTypeCompatibilityService {

    private final EntityAttributeManager entityAttributeManager;

    public AttributeTypeCompatibilityService(EntityAttributeManager entityAttributeManager) {
        this.entityAttributeManager = entityAttributeManager;
    }

    void validate(long attributeId, AttributeOperation operation, String value, boolean isValueAttributeId) {
        Attribute attribute = entityAttributeManager.getAttributeById(attributeId);

        if (!attribute.isOperationSupported(operation)) {
            throw new IllegalArgumentException(String.format(
                    "Invalid operation: '%s' for type: %s", operation.name(), attribute.valueType()));
        }

        boolean hasValue = value != null && !value.isBlank();
        boolean valueForbidden = operation == UpdateOperation.SET_NOW || operation == UpdateOperation.FLIP;

        if (hasValue && valueForbidden) {
            throw new IllegalArgumentException("Operation %s must not have a value.".formatted(operation.name()));
        } else if (!hasValue && !valueForbidden) {
            throw new IllegalArgumentException("Operation %s must have a value.".formatted(operation.name()));
        } else if (!hasValue) {
            return;
        }

        if (isValueAttributeId) {
            long valueAttributeId = Long.parseLong(value);
            if (attributeId == valueAttributeId) {
                throw new IllegalArgumentException("Attribute cannot reference itself.");
            }
            validateAttributeCompatibility(attributeId, valueAttributeId);
        } else {
            validateScalarType(attribute.valueType(), value);
        }
    }

    private void validateAttributeCompatibility(long targetId, long sourceId) {
        Attribute target = entityAttributeManager.getAttributeById(targetId);
        Attribute source = entityAttributeManager.getAttributeById(sourceId);
        if (target.valueType() != source.valueType()) {
            throw new IllegalArgumentException("Target and Parameter attribute types must match.");
        }
    }

    private void validateScalarType(AttributeValueType type, String value) {
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
