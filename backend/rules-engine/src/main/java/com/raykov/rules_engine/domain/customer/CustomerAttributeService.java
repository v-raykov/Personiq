package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.attribute.AttributeDao;
import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public List<AttributeResponseDto> getAllAttributeValues(long customerId) {
        return attributeDao.getAllAttributeValues(customerId, AttributeOwnerType.CUSTOMER);
    }

    public List<AttributeResponseDto> getAttributeValue(long customerId, String attributeName) {
        return attributeDao.getAttributeValue(customerId, AttributeOwnerType.CUSTOMER, attributeName)
                           .stream()
                           .map(value -> new AttributeResponseDto(attributeName, value.value()))
                           .toList();
    }

    public void deleteAttributeValue(long customerId, String attributeName, Optional<Integer> listIndex) {
        attributeDao.deleteAttributeValue(customerId, AttributeOwnerType.CUSTOMER, attributeName, listIndex);
    }
}
