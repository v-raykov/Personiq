package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.operation.AttributeOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValue;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class AttributeService {

    private final EntityAttributeManager entityAttributeManager;

    private final AttributeTypeCompatibilityService typeCompatibilityService;

    AttributeService(EntityAttributeManager entityAttributeManager, AttributeTypeCompatibilityService typeCompatibilityService) {
        this.entityAttributeManager = entityAttributeManager;
        this.typeCompatibilityService = typeCompatibilityService;
    }

    public Attribute getAttributeById(long id) {
        return entityAttributeManager.getAttributeById(id);
    }

    public void validateTypeCompatibility(Long id, AttributeOperation operation, String value, boolean valueAttributeId) {
        typeCompatibilityService.validate(id, operation, value, valueAttributeId);
    }

    public Map<Long, AttributeValue> getAttributeValuesByIdsAndEntityInstanceIds(Collection<Long> attributeIds, List<Long> entityInstanceIds) {
        return entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, entityInstanceIds);
    }

    public void updateAttributeValueWithScalar(AttributeValue attributeValue, String value, UpdateOperation operation) {

    }

    public void updateAttributeValueWithAttribute(AttributeValue attributeValue, AttributeValue attributeValue1, UpdateOperation operation) {
    }
}
