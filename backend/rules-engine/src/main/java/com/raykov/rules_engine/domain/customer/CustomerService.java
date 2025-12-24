package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.AttributeService;
import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final AttributeService attributeService;

    public CustomerService(AttributeService attributeService) {
        this.attributeService = attributeService;
    }

    public void updateAttributeValue(long customerId, long attributeId, String value) {
        attributeService.updateAttributeValue(customerId, attributeId, value);
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

    public void createAttribute(String name, String type, boolean isList) {
        attributeService.createAttribute(AttributeOwnerType.CUSTOMER, name, type, isList);
    }

    public List<Attribute> getAttributes() {
        return attributeService.getAttributes(AttributeOwnerType.CUSTOMER);
    }

    public void deleteAttribute(long attributeId) {
        attributeService.deleteAttribute(attributeId);
    }
}
