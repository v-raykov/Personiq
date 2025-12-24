package com.raykov.rules_engine.domain.attribute;

import com.raykov.rules_engine.domain.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.attribute.dao.AttributeValueDao;
import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttributeService {

    private final AttributeDao attributeDao;

    private final AttributeValueDao attributeValueDao;

    public AttributeService(AttributeDao attributeDao, AttributeValueDao attributeValueDao) {
        this.attributeDao = attributeDao;
        this.attributeValueDao = attributeValueDao;
    }

    public long createAttribute(AttributeOwnerType ownerType, String name, String type, boolean isList) {
        AttributeValueType attributeValueType = AttributeValueType.fromString(type);

        Attribute attributeRow = new Attribute(ownerType,
                                               name,
                                               attributeValueType,
                                               isList);

        return attributeDao.insertAttribute(attributeRow);
    }

    public List<Attribute> getAttributes(AttributeOwnerType ownerType) {
        return attributeDao.getAttributes(ownerType);
    }

    public void deleteAttribute(long attributeId) {
        attributeDao.deleteAttribute(attributeId);
    }

    public Map<Long, Attribute> getAttributesByIds(Collection<Long> attributeIds) {
        if (attributeIds.isEmpty()) {
            return Map.of();
        }
        return attributeDao.getAttributesByIds(attributeIds);
    }

    public void updateAttributeValue(long customerId, long attributeId, String value) {
        attributeValueDao.updateAttributeValue(customerId, attributeId, value);
    }

    public List<AttributeValueRow> getAllAttributeValuesByOwnerId(long ownerId) {
        return attributeValueDao.getAllAttributeValues(List.of(ownerId));
    }

    public AttributeValueRow getAttributeValue(long ownerId, long attributeId) {
        return attributeValueDao.getAttributeValue(ownerId, attributeId);
    }

    public void deleteAttributeValue(long ownerId, long attributeId, String attributeValue) {
        attributeValueDao.deleteAttributeValue(ownerId, attributeId, attributeValue);
    }

    public Map<Long, List<AttributeValue>> getAttributeValuesByOwnerIds(Set<Long> ownerIds) {
        if (ownerIds.isEmpty()) {
            return Map.of();
        }

        return attributeValueDao.getAllAttributeValues(ownerIds).stream()
                                .collect(Collectors.groupingBy(
                                        AttributeValueRow::ownerId,
                                        Collectors.mapping(AttributeValue::fromAttributeValueRow, Collectors.toList()))
                                );
    }

}
