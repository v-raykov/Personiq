package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.attribute.AttributeDao;
import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerAttributeService {

    private final AttributeDao attributeDao;

    public CustomerAttributeService(AttributeDao attributeDao) {
        this.attributeDao = attributeDao;
    }

    public void createAttribute(String name, String type) {
        AttributeValueType attributeValueType = AttributeValueType.fromString(type);

        AttributeRow attributeRow = new AttributeRow(AttributeOwnerType.CUSTOMER,
                                                     name,
                                                     attributeValueType);

        attributeDao.insertAttribute(attributeRow);

    }

    public List<String> getAttributes() {
        return attributeDao.getAttributes(AttributeOwnerType.CUSTOMER);
    }

    public void deleteAttribute(String attributeName) {
        attributeDao.deleteAttribute(AttributeOwnerType.CUSTOMER, attributeName);
    }

    public void updateAttribute(long customerId, String attributeName, String value) {
        attributeDao.updateAttributeValue(customerId, AttributeOwnerType.CUSTOMER, attributeName, value);
    }

    public List<AttributeResponseDto> getAttributeValues(long customerId) {
        return attributeDao.getAttributeValues(customerId, AttributeOwnerType.CUSTOMER);
    }
}
