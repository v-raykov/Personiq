package com.raykov.rules_engine.domain.core;

import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.attribute.AttributeDao;
import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;
import com.raykov.rules_engine.domain.core.entity.Entity;
import com.raykov.rules_engine.domain.core.entity.EntityDao;
import com.raykov.rules_engine.domain.core.entity.EntityInstance;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.core.value.AttributeValue;
import com.raykov.rules_engine.domain.core.value.AttributeValueDao;
import com.raykov.rules_engine.domain.core.value.AttributeValueRow;
import org.springframework.stereotype.Service;

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
        return entityDao.createEntityInstance(entityId, targetInstanceId);
    }

    public long createAttribute(long entityId, String name, String type, boolean isList) {
        AttributeValueType valueType = AttributeValueType.valueOf(type);

        Attribute attribute = new Attribute(name, valueType, isList);

        return attributeDao.insertAttribute(entityId, attribute);
    }

    public List<Attribute> getAllAttributesByEntityId(long entityId) {
        return attributeDao.getAttributesByEntityId(entityId);
    }

    public void deleteAttribute(long attributeId) {
        attributeDao.deleteAttribute(attributeId);
    }

    public List<AttributeValueRow> getAllAttributeValuesByEntityInstanceId(long entityInstanceId) {
        return attributeValueDao.getAllByEntityInstanceIds(List.of(entityInstanceId));
    }

    public AttributeValueRow getAttributeValue(long attributeId, long entityInstanceId) {
        return attributeValueDao.getByEntityInstanceId(attributeId, entityInstanceId);
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

    public void deleteEntity(long actionId) {
        entityDao.deleteEntity(actionId);
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

        Map<Long, List<AttributeValue>> values = attributeValueDao.getAllByEntityInstanceIds(entityInstanceIds)
                                                                  .stream()
                                                                  .collect(Collectors.groupingBy(
                                                                          AttributeValueRow::entityInstanceId,
                                                                          Collectors.mapping(AttributeValue::fromAttributeValueRow, Collectors.toList()))
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
}
