package com.raykov.rules_engine.domain.attribute;

import com.raykov.rules_engine.domain.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.attribute.dao.AttributeRow;
import com.raykov.rules_engine.domain.attribute.rest.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttributeService {

    private final AttributeDao attributeDao;

    public AttributeService(AttributeDao attributeDao) {
        this.attributeDao = attributeDao;
    }

    public void createAttribute(String ownerType, String name, String type) {
        AttributeValueType attributeValueType = AttributeValueType.fromString(type);

        AttributeRow attributeRow = new AttributeRow(AttributeOwnerType.fromString(ownerType),
                                                     name,
                                                     attributeValueType);

        attributeDao.insertAttribute(attributeRow);

    }

    public List<String> getAttributes(String ownerType) {
        return attributeDao.getAttributes(AttributeOwnerType.fromString(ownerType));
    }

    public void deleteAttribute(String ownerType, String attributeName) {
        attributeDao.deleteAttribute(AttributeOwnerType.fromString(ownerType), attributeName);
    }

    public void updateAttribute(long ownerId, String ownerType, String attributeName, String value) {
        attributeDao.updateAttributeValue(ownerId, AttributeOwnerType.fromString(ownerType), attributeName, value);
    }

    public List<AttributeResponseDto> getAllAttributeValues(long ownerId, String ownerType) {
        return attributeDao.getAllAttributeValues(ownerId, AttributeOwnerType.fromString(ownerType))
                           .stream()
                           .collect(Collectors.groupingBy(AttributeValue::name))
                           .entrySet()
                           .stream()
                           .map(entry -> new AttributeResponseDto(
                                   entry.getKey(),
                                   entry.getValue().getFirst().valueType(),
                                   entry.getValue().stream()
                                        .map(AttributeValue::value)
                                        .toList()
                           ))
                           .toList();
    }

    public AttributeResponseDto getAttributeValue(long ownerId, String ownerType, String attributeName) {
        List<AttributeValue> attributeValues = attributeDao.getAttributeValue(
                ownerId, AttributeOwnerType.fromString(ownerType), attributeName);

        if (attributeValues.isEmpty()) {
            return new AttributeResponseDto(attributeName, null, List.of());
        }

        return new AttributeResponseDto(attributeName, attributeValues.getFirst().valueType(), attributeValues.stream()
                                                                                                              .map(AttributeValue::value)
                                                                                                              .toList());
    }

    public void deleteAttributeValue(long ownerId, String ownerType, String attributeName, Optional<Integer> listIndex) {
        attributeDao.deleteAttributeValue(ownerId, AttributeOwnerType.fromString(ownerType), attributeName, listIndex);
    }
}
