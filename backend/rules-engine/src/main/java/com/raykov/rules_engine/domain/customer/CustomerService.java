package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValue;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CustomerService {

    private static final long customerEntityId = 1L;

    private final EntityAttributeManager entityAttributeManager;

    public CustomerService(EntityAttributeManager entityAttributeManager) {
        this.entityAttributeManager = entityAttributeManager;
    }

    public long registerCustomer() {
        return entityAttributeManager.createEntityInstance(customerEntityId);
    }

    public long createAttribute(String name, String type, boolean isList) {
        return entityAttributeManager.createAttribute(customerEntityId, name, type, isList);
    }

    public List<Attribute> getAttributes() {
        return entityAttributeManager.getAllAttributesByEntityId(customerEntityId);
    }

    public void deleteAttribute(long attributeId) {
        entityAttributeManager.deleteAttribute(attributeId);
    }

    public List<AttributeValue> getAllAttributeValues(long customerId) {
        return entityAttributeManager.getAllAttributeValuesByEntityInstanceId(customerId, EntityType.CUSTOMER);
    }

    public AttributeValue getAttributeValue(long attributeId, long customerId) {
        return entityAttributeManager.getAttributeValue(attributeId, customerId, EntityType.CUSTOMER);
    }

    public void updateCustomerAttributes(long customerId, Map<Long, String> attributes) {
        attributes.forEach((attributeId, value) -> entityAttributeManager.updateAttributeValue(attributeId, customerId, value));
    }

    public void deleteAttributeValue(long attributeId, long customerId, String attributeValue) {
        entityAttributeManager.deleteAttributeValue(attributeId, customerId, attributeValue);
    }
}
