package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.AttributeTypeCompatibilityService;
import com.raykov.rules_engine.domain.core.attribute.AttributeValueService;
import com.raykov.rules_engine.domain.core.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
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

    private final AttributeValueService attributeValueService;

    private final AttributeTypeCompatibilityService attributeTypeCompatibilityService;

    public EntityAttributeManager(AttributeDao attributeDao, EntityDao entityDao, AttributeValueService attributeValueService, AttributeTypeCompatibilityService attributeTypeCompatibilityService) {
        this.attributeDao = attributeDao;
        this.entityDao = entityDao;
        this.attributeValueService = attributeValueService;
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
                getAttributeValuesByEntityInstanceIds(attributes.keySet(), entityInstanceIds)
                        .stream()
                        .peek(av -> attributeTypeCompatibilityService.validateScalarType(av.valueType(), attributes.get(av.attributeId())))
                        .map(av -> !av.isList() || overwriteList
                                   ? av.withUpdatedValue(attributes.get(av.attributeId()))
                                   : av.withAppendedValue(attributes.get(av.attributeId())))
                        .toList();

        attributeValueService.updateAttributeValues(attributeValues);
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
        return entityDao.getEntityInstanceById(entityInstanceId, entityType)
                .map(ei -> getAttributeValuesByEntityInstanceIds(getAttributeIdsByEntityId(ei.entityId()), List.of(entityInstanceId)))
                .orElseThrow(() -> new IllegalArgumentException("Entity instance with id: " + entityInstanceId + " not found"));
    }

    public Optional<AttributeValue> getAttributeValue(long attributeId, long entityInstanceId) {
        Map<Long, Long> instanceToEntityMap = entityDao.getInstanceToEntityMap(List.of(entityInstanceId));

        return attributeValueService.getAttributeByEntityInstanceIds(instanceToEntityMap, List.of(attributeId))
                                    .stream()
                                    .findFirst();
    }

    public void deleteAttributeValue(long attributeId, long entityInstanceId, String attributeValue) {
        attributeValueService.deleteValue(attributeId, entityInstanceId, attributeValue);
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
        Map<Long, EntityInstance> entityInstanceMap = entityDao.getEntityInstancesByType(entityType)
                                               .stream()
                                               .collect(Collectors.toMap(EntityInstance::id, ei -> ei));

        return mapAttributeValuesToEntityInstance(entityInstanceMap);
    }

    public List<EntityInstanceAttributes> getEntityInstanceAttributesByIds(Set<Long> entityInstanceIds, EntityType entityType) {
        Map<Long, EntityInstance> entityInstanceMap = entityDao.getEntityInstancesByIds(entityInstanceIds, entityType)
                                                               .stream()
                                                               .collect(Collectors.toMap(EntityInstance::id, ei -> ei));

        return mapAttributeValuesToEntityInstance(entityInstanceMap);
    }

    public List<AttributeValue> getAttributeValuesByEntityInstanceIds(Collection<Long> attributeIds, List<Long> entityInstanceIds) {
        if (entityInstanceIds == null || entityInstanceIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> instanceToEntityMap = entityDao.getInstanceToEntityMap(entityInstanceIds);

        return attributeValueService.getAttributeByEntityInstanceIds(instanceToEntityMap, attributeIds);
    }

    public void updateAttributeValues(Collection<AttributeValue> attributeValues) {
        for (AttributeValue av : attributeValues) {
            if (av.isList()) {
                av.values().forEach(value -> attributeTypeCompatibilityService.validateScalarType(av.valueType(), value));
            } else {
                attributeTypeCompatibilityService.validateScalarType(av.valueType(), av.valueAsString());
            }
        }

        attributeValueService.updateAttributeValues(attributeValues);
    }

    public List<EntityInstance> getEntityInstancesByTargetInstanceId(long targetInstanceId, EntityType entityType) {
        return entityDao.getEntityInstancesByType(entityType).stream()
                        .filter(row -> row.targetInstanceId() != null)
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

    private List<EntityInstanceAttributes> mapAttributeValuesToEntityInstance(Map<Long, EntityInstance> entityInstances) {
        Map<Long, List<AttributeValue>> values = attributeValueService.getAttributeByEntityInstanceIds(entityDao.getInstanceToEntityMap(entityInstances.keySet()))
                                                                      .stream()
                                                                      .collect(Collectors.groupingBy(AttributeValue::entityInstanceId));

        return entityInstances.values()
                              .stream()
                              .map(row -> new EntityInstanceAttributes(row.id(), row.entityId(), row.targetInstanceId(), row.name(), values.get(row.id())))
                              .toList();
    }
}
