package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.AttributeService;
import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CustomerService {

    private final AttributeService attributeService;

    public CustomerService(AttributeService attributeService) {
        this.attributeService = attributeService;
    }

    public List<AttributeValueRow> getAllAttributeValues(long ownerId) {
        return attributeService.getAllAttributeValuesByOwnerId(ownerId);
    }

    public AttributeValueRow getAttributeValue(long ownerId, long attributeId) {
        return attributeService.getAttributeValue(ownerId, attributeId);
    }

    public void deleteAttributeValue(long ownerId, long attributeId, String attributeValue) {
        attributeService.deleteAttributeValue(ownerId, attributeId, attributeValue);
    }

    public long createAttribute(String name, String type, boolean isList) {
        long attributeId =  attributeService.createAttribute(name, type, isList);
        attributeService.addAttributeToCustomers(attributeId);
        return attributeId;
    }

    public List<Attribute> getAttributes() {
        return attributeService.getCustomerAttributes();
    }

    public void deleteAttribute(long attributeId) {
        attributeService.deleteAttribute(attributeId);
    }

    public void updateCustomerAttributes(long customerId, Map<Long, String> attributes) {
        attributes.forEach((attribute_id, value) -> attributeService.updateAttributeValue(customerId, attribute_id, value));
    }
}
