package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.dao.AttributeValueDao;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeKey;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

// TODO: move default value logic to CustomerService
/**
 * The whole purpose of this service is to provide default values for attributes that have a missing value entry.
 * However all entity instances are required to have a value for each attribute upon creation EXCEPT customers.
 * In essence only customer attributes require default fallback logic.
 * This logic should somehow be moved to {@link com.raykov.rules_engine.domain.customer.CustomerService}
 */
@Service
public class AttributeValueService {

    private final AttributeValueDao attributeValueDao;

    private final AttributeDao attributeDao;

    public AttributeValueService(AttributeValueDao attributeValueDao, AttributeDao attributeDao) {
        this.attributeValueDao = attributeValueDao;
        this.attributeDao = attributeDao;
    }

    public void updateAttributeValues(Collection<AttributeValue> attributeValues) {
        attributeValueDao.updateAttributeValues(attributeValues);
    }

    public List<AttributeValue> getAttributeByEntityInstanceIds(Map<Long, Long> instanceToEntityMap) {
        List<Long> attributeIds = attributeDao.getAttributesByEntityIds(instanceToEntityMap.values())
                                            .stream()
                                            .map(Attribute::id)
                                            .toList();

        return getAttributeByEntityInstanceIds(instanceToEntityMap, attributeIds);
    }

    public List<AttributeValue> getAttributeByEntityInstanceIds(Map<Long, Long> instanceToEntityMap, Collection<Long> attributeIds) {
        return mapMissingToDefaultValues(instanceToEntityMap, attributeIds).values()
                                                                           .stream()
                                                                           .toList();
    }

    private Map<AttributeKey, AttributeValue> mapMissingToDefaultValues(Map<Long, Long> instanceToEntityIds, Collection<Long> requestedAttributeIds) {
        if (instanceToEntityIds.isEmpty()) {
            return Map.of();
        }

        List<Attribute> allAttributes = attributeDao.getAttributesByEntityIds(instanceToEntityIds.values());
        Map<AttributeKey, AttributeValue> valueLookup = attributeValueDao.getAttributesByIdsAndEntityInstanceIds(requestedAttributeIds, instanceToEntityIds.keySet())
                                                                         .stream()
                                                                         .collect(Collectors.toMap(av -> new AttributeKey(av.entityInstanceId(), av.attributeId()),
                                                                                                   val -> val)
                                                                         );

        return instanceToEntityIds.entrySet()
                                  .stream()
                                  .flatMap(entry -> allAttributes.stream()
                                                                 .filter(a -> isAttributeOwnedByEntity(entry, a))
                                                                 .filter(a -> isAttributeRequested(requestedAttributeIds, a))
                                                                 .map(attr -> valueLookup.getOrDefault(
                                                                         new AttributeKey(entry.getKey(), attr.id()),
                                                                         createDefaultAttributeValueEntry(entry.getKey(), attr))
                                                                 ))
                                  .collect(Collectors.toMap(av -> new AttributeKey(av.entityInstanceId(), av.attributeId()), av -> av));
    }

    private static boolean isAttributeOwnedByEntity(Map.Entry<Long, Long> entry, Attribute a) {
        return Objects.equals(a.entityId(), entry.getValue());
    }

    private static boolean isAttributeRequested(Collection<Long> requestedAttributeIds, Attribute a) {
        return requestedAttributeIds == null || requestedAttributeIds.isEmpty() || requestedAttributeIds.contains(a.id());
    }

    private AttributeValue createDefaultAttributeValueEntry(long entityInstanceId, Attribute attribute) {
        return new AttributeValue(
                entityInstanceId,
                attribute.id(),
                attribute.name(),
                attribute.valueType(),
                attribute.getDefaultValue(),
                attribute.isList()
        );
    }

    public void deleteValue(long attributeId, long entityInstanceId, String attributeValue) {
        attributeValueDao.deleteValue(attributeId, entityInstanceId, attributeValue);
    }
}
