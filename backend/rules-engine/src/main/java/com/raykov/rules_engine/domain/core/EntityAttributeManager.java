package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.entity.Entity;
import com.raykov.rules_engine.domain.core.entity.EntityDao;
import com.raykov.rules_engine.domain.core.entity.EntityInstance;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValueDao;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValueResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

        attributes.forEach((attributeId, value) -> updateAttributeValue(attributeId, entityInstanceId, value));

        return entityInstanceId;
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

    public AttributeValue getAttributeValue(long attributeId, long entityInstanceId, EntityType entityType) {
        return attributeValueDao.getByEntityInstanceId(attributeId, entityInstanceId, entityType);
    }

    public void updateAttributeValue(long attributeId, long entityInstanceId, String value) {
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

    public Map<Long, AttributeValue> getAttributeValuesByIdsAndEntityInstanceIds(Collection<Long> attributeIds, List<Long> entityInstanceIds) {
        return attributeValueDao.getAttributesByIdsAndEntityInstanceIds(attributeIds, entityInstanceIds);
    }
}
