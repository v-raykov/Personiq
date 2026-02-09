package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.operation.AttributeOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import org.springframework.stereotype.Service;

@Service
public class AttributeService {

    private final AttributeTypeCompatibilityService typeCompatibilityService;

    AttributeService(AttributeTypeCompatibilityService typeCompatibilityService) {
        this.typeCompatibilityService = typeCompatibilityService;
    }

    public void validateTypeCompatibility(Long id, AttributeOperation operation, String value, boolean valueAttributeId) {
        typeCompatibilityService.validate(id, operation, value, valueAttributeId);
    }

    public AttributeValue updateAttributeValueWithScalar(AttributeValue attributeValue, String value, UpdateOperation operation) {
        return null;
    }

    public AttributeValue updateAttributeValueWithAttribute(AttributeValue attributeValue, AttributeValue attributeValue1, UpdateOperation operation) {
        return null;
    }
}
