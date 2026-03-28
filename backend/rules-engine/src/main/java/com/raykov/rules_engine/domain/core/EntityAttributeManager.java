package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.AttributeTypeCompatibilityService;
import com.raykov.rules_engine.domain.core.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.dao.AttributeValueDao;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeKey;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.entity.Entity;
import com.raykov.rules_engine.domain.core.entity.EntityDao;
import com.raykov.rules_engine.domain.core.entity.EntityInstance;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EntityAttributeManager {

    private final AttributeDao attributeDao;

    private final EntityDao entityDao;

    private final AttributeValueDao attributeValueDao;

    private final AttributeTypeCompatibilityService attributeTypeCompatibilityService;

    public EntityAttributeManager(AttributeDao attributeDao, EntityDao entityDao, AttributeValueDao attributeValueDao, AttributeTypeCompatibilityService attributeTypeCompatibilityService) {
        this.attributeDao = attributeDao;
        this.entityDao = entityDao;
        this.attributeValueDao = attributeValueDao;
        this.attributeTypeCompatibilityService = attributeTypeCompatibilityService;
    }

    public long createEntityInstance(long entityId) {
        return createEntityInstance(entityId, null);
    }

    public long createEntityInstance(long entityId, Long targetInstanceId) {
        List<Long> customerIds = entityDao.getEntityInstancesByType(EntityType.CUSTOMER)
                                          .stream()
                                          .map(EntityInstance::id)
                                          .toList();

        if (targetInstanceId != null && !customerIds.contains(targetInstanceId)) {
            throw new IllegalArgumentException("Target instance id is not a customer");
        }

        return entityDao.createEntityInstance(entityId, targetInstanceId);
    }

    @Transactional
    public long createEntityInstanceAndSetAttributeValue(long entityId, Map<Long, String> attributes) {
        return createEntityInstanceAndSetAttributeValue(entityId, null, attributes);
    }

    @Transactional
    public long createEntityInstanceAndSetAttributeValue(long entityId, Long customerId, Map<Long, String> attributes) {
        if (!getAttributeIdsByEntityId(entityId).equals(attributes.keySet())) {
            throw new IllegalArgumentException("Not all attributes are provided for entity with id: " + entityId);
        }

        long entityInstanceId = createEntityInstance(entityId, customerId);

        updateAttributeValues(List.of(entityInstanceId), attributes, false);

        return entityInstanceId;
    }

    public void updateAttributeValues(List<Long> entityInstanceIds, Map<Long, String> attributes, boolean overwriteList) {
        Collection<AttributeValue> attributeValues =
                getAttributeValuesByIdsAndEntityInstanceIds(attributes.keySet(), entityInstanceIds)
                        .stream()
                        .peek(av -> attributeTypeCompatibilityService.validateScalarType(av.valueType(), attributes.get(av.attributeId())))
                        .map(av -> !av.isList() || overwriteList
                                   ? av.withUpdatedValue(attributes.get(av.attributeId()))
                                   : av.withAppendedValue(attributes.get(av.attributeId())))
                        .toList();

        attributeValueDao.updateAttributeValues(attributeValues);
    }

    public long createAttribute(long entityId, String name, String type, boolean isList) {
        AttributeValueType valueType = AttributeValueType.valueOf(type.toUpperCase());

        Attribute attribute = new Attribute(name, valueType, isList);

        return attributeDao.insertAttribute(entityId, attribute);
    }

    public List<Attribute> getAttributesByEntityId(long entityId) {
        return attributeDao.getAttributesByEntityId(entityId);
    }

    public void deleteAttribute(long attributeId) {
        attributeDao.deleteAttribute(attributeId);
    }

    public List<AttributeValue> getAttributeValuesByEntityInstanceId(long entityInstanceId, EntityType entityType) {
        return attributeValueDao.getByEntityInstanceIds(List.of(entityInstanceId), entityType);
    }

    public Optional<AttributeValue> getAttributeValue(long attributeId, long entityInstanceId) {
        Map<Long, Long> instanceToEntityMap = entityDao.getInstanceToEntityMap(List.of(entityInstanceId));

        return mapMissingToDefaultValues(instanceToEntityMap, List.of(attributeId)).values()
                                                                                   .stream()
                                                                                   .findFirst();
    }

    public void deleteAttributeValue(long attributeId, long entityInstanceId, String attributeValue) {
        attributeValueDao.deleteValue(attributeId, entityInstanceId, attributeValue);
    }

    public long createEntity(String name, EntityType entityType) {
        return entityDao.createEntity(name, entityType);
    }

    public void deleteEntity(long entityId) {
        entityDao.deleteEntity(entityId);
    }

    public List<EntityAttributes> getEntityAttributesByType(EntityType entityType) {
        List<Entity> entities = entityDao.getEntitiesByType(entityType);

        List<Long> entityIds = entities.stream()
                                       .map(Entity::id)
                                       .toList();

        Map<Long, List<Attribute>> attributesByEntityId = attributeDao.getAttributesByEntityIds(entityIds)
                                                                      .stream()
                                                                      .collect(Collectors.groupingBy(Attribute::entityId));

        return entities.stream()
                       .map(row -> new EntityAttributes(row.id(), row.name(), attributesByEntityId.getOrDefault(row.id(), List.of())))
                       .toList();
    }

    public List<EntityInstanceAttributes> getEntityInstancesByType(EntityType entityType) {
        Set<Long> entityInstanceIds = entityDao.getEntityInstancesByType(entityType)
                                               .stream()
                                               .map(EntityInstance::id)
                                               .collect(Collectors.toSet());

        return getEntityInstancesByIds(entityInstanceIds, entityType);
    }

    public List<EntityInstanceAttributes> getEntityInstancesByIds(Set<Long> entityInstanceIds, EntityType entityType) {
        List<EntityInstance> entityInstances = entityDao.getEntityInstancesByType(entityType)
                                                        .stream()
                                                        .filter(ei -> entityInstanceIds.contains(ei.id()))
                                                        .toList();

        Map<Long, List<AttributeValue>> values = attributeValueDao.getByEntityInstanceIds(entityInstanceIds, entityType)
                                                                  .stream()
                                                                  .collect(Collectors.groupingBy(AttributeValue::entityInstanceId));

        return entityInstances.stream()
                              .map(row -> new EntityInstanceAttributes(row.id(), row.entityId(), row.targetInstanceId(), values.get(row.id())))
                              .toList();
    }

    public List<AttributeValue> getAttributeValuesByIdsAndEntityInstanceIds(Collection<Long> attributeIds, List<Long> entityInstanceIds) {
        if (entityInstanceIds == null || entityInstanceIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> instanceToEntityMap = entityDao.getInstanceToEntityMap(entityInstanceIds);

        return mapMissingToDefaultValues(instanceToEntityMap, attributeIds).values()
                                                                           .stream()
                                                                           .toList();
    }

    public void updateAttributeValues(Collection<AttributeValue> attributeValues) {
        for (AttributeValue av : attributeValues) {
            if (av.isList()) {
                av.values().forEach(value -> attributeTypeCompatibilityService.validateScalarType(av.valueType(), value));
            } else {
                attributeTypeCompatibilityService.validateScalarType(av.valueType(), av.valueAsString());
            }
        }

        attributeValueDao.updateAttributeValues(attributeValues);
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

    public List<EntityInstance> getEntityInstancesByTargetInstanceId(long targetInstanceId, EntityType entityType) {
        return entityDao.getEntityInstancesByType(entityType).stream()
                        .filter(row -> row.targetInstanceId() == targetInstanceId)
                        .toList();
    }

    public Set<Long> getAttributeIdsByEntityId(long entityId) {
        return attributeDao.getAttributesByEntityIds(List.of(entityId))
                           .stream()
                           .map(Attribute::id)
                           .collect(Collectors.toSet());
    }

    public EntityAttributes getEntityAttributesById(Long actionId, EntityType entityType) {
        Entity entity = getEntityById(actionId, entityType);
        List<Attribute> attributes = getAttributesByEntityId(entity.id());
        return new EntityAttributes(entity.id(), entity.name(), attributes);
    }

    public Attribute getAttributeById(long attributeId) {
        return attributeDao.getAttributeById(attributeId)
                           .orElseThrow(() -> new IllegalArgumentException("Attribute with this id does not exist"));
    }

    public Entity getEntityById(long entityId, EntityType entityType) {
        return entityDao.getEntityById(entityId, entityType)
                        .orElseThrow(() -> new IllegalArgumentException("Entity with this id does not exist"));
    }

    public Entity getEntityById(long id) {
        return entityDao.getEntitiesById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Entity with this id does not exist"));
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
}
