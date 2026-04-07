package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
        return entityAttributeManager.getAttributesByEntityId(customerEntityId);
    }

    public void deleteAttribute(long attributeId) {
        entityAttributeManager.deleteAttribute(attributeId);
    }

    public List<AttributeValue> getAttributeValues(long customerId) {
        return entityAttributeManager.getAttributeValuesByEntityInstanceId(customerId, EntityType.CUSTOMER);
    }

    public AttributeValue getAttributeValue(long attributeId, long customerId) {
        return entityAttributeManager.getAttributeValue(attributeId, customerId)
                                     .orElseThrow();
    }

    public void updateCustomerAttributes(long customerId, Map<Long, String> attributes, boolean overwriteList) {
        entityAttributeManager.updateAttributeValues(List.of(customerId), attributes, overwriteList);
    }

    public void deleteAttributeValue(long attributeId, long customerId, String attributeValue) {
        entityAttributeManager.deleteAttributeValue(attributeId, customerId, attributeValue);
    }

    public Map<Long, List<AttributeValue>> getAllAttributeValuesByCustomerIds(List<Long> customerIds) {
        Set<Long> attributeIds = entityAttributeManager.getAttributeIdsByEntityId(customerEntityId);
        return entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, customerIds)
                                     .stream()
                                     .collect(Collectors.groupingBy(AttributeValue::entityInstanceId));
    }
}
