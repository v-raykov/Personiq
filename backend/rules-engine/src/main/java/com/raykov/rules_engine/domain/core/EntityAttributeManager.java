package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.dao.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.dao.AttributeValueDao;
import com.raykov.rules_engine.domain.core.attribute.model.*;
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

    public EntityAttributeManager(AttributeDao attributeDao, EntityDao entityDao, AttributeValueDao attributeValueDao) {
        this.attributeDao = attributeDao;
        this.entityDao = entityDao;
        this.attributeValueDao = attributeValueDao;
    }

    public long createEntityInstance(long entityId) {
        return createEntityInstance(entityId, null);
    }

    public long createEntityInstance(long entityId, Long targetInstanceId) {
        List<Long> customerIds = entityDao.getAllInstancesByType(EntityType.CUSTOMER)
                                          .stream()
                                          .map(EntityInstance::id)
                                          .toList();

        if (targetInstanceId != null && !customerIds.contains(targetInstanceId)) {
            throw new IllegalArgumentException("Target instance id is not a customer");
        }

        return entityDao.createEntityInstance(entityId, targetInstanceId);
    }

    @Transactional
    public long createEntityInstanceAndSetAttributeValue(long entityId, long customerId, Map<Long, String> attributes) {
        if (!getAllAttributeIdsByEntityId(entityId).equals(attributes.keySet())) {
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
                        .map(av -> !av.isList() || overwriteList
                                   ? av.withUpdatedValue(attributes.get(av.attributeId()))
                                   : av.withAppendedValue(attributes.get(av.attributeId())))
                        .toList();

        updateAttributeValues(attributeValues);
    }

    public long createAttribute(long entityId, String name, String type, boolean isList) {
        AttributeValueType valueType = AttributeValueType.valueOf(type.toUpperCase());

        Attribute attribute = new Attribute(name, valueType, isList);

        return attributeDao.insertAttribute(entityId, attribute);
    }

    public List<Attribute> getAllAttributesByEntityId(long entityId) {
        return attributeDao.getAttributesByEntityId(entityId);
    }

    public void deleteAttribute(long attributeId) {
        attributeDao.deleteAttribute(attributeId);
    }

    public List<AttributeValue> getAllAttributeValuesByEntityInstanceId(long entityInstanceId, EntityType entityType) {
        return attributeValueDao.getAllByEntityInstanceIds(List.of(entityInstanceId), entityType);
    }

    public Optional<AttributeValue> getAttributeValue(long attributeId, long entityInstanceId) {
        Map<Long, Long> instanceToEntityMap = entityDao.getInstanceToEntityMap(List.of(entityInstanceId));

        return mapMissingToDefaultValues(instanceToEntityMap, List.of(attributeId)).values()
                                                                                   .stream()
                                                                                   .findFirst();
    }

    public void updateAttributeValue(long attributeId, long entityInstanceId, List<String> value) {
        attributeValueDao.updateAttributeValue(attributeId, entityInstanceId, value);
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

    public List<EntityAttributes> getAllEntitiesByType(EntityType entityType) {
        List<Entity> entities = entityDao.getAllByType(entityType);

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

    public List<EntityInstanceAttributes> getAllEntityInstancesByType(EntityType entityType) {
        List<EntityInstance> entityInstances = entityDao.getAllInstancesByType(entityType);

        List<Long> entityInstanceIds = entityInstances.stream()
                                                      .map(EntityInstance::id)
                                                      .toList();

        Map<Long, List<AttributeValueResponse>> values = attributeValueDao.getAllByEntityInstanceIds(entityInstanceIds, entityType)
                                                                          .stream()
                                                                          .collect(Collectors.groupingBy(
                                                                                  AttributeValue::entityInstanceId,
                                                                                  Collectors.mapping(AttributeValueResponse::fromAttributeValueRow, Collectors.toList()))
                                                                          );

        return entityInstances.stream()
                              .map(row -> new EntityInstanceAttributes(row.id(), row.entityId(), row.targetInstanceId(), values.get(row.id())))
                              .toList();
    }

    public Set<Long> getAllAttributeIdsByEntityId(long entityId) {
        return attributeDao.getAttributesByEntityIds(List.of(entityId))
                           .stream()
                           .map(Attribute::id)
                           .collect(Collectors.toSet());
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
