package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.CreateAttributeRequest;
import com.raykov.rules_engine.domain.core.entity.Entity;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ActionService {

    private final EntityAttributeManager entityAttributeManager;

    public ActionService(EntityAttributeManager entityAttributeManager) {
        this.entityAttributeManager = entityAttributeManager;
    }

    public long createAction(String name, List<CreateAttributeRequest> attributes) {
        long id = entityAttributeManager.createEntity(name, EntityType.ACTION);

        if (attributes != null && !attributes.isEmpty()) {
            attributes.forEach(attribute ->
                                       entityAttributeManager.createAttribute(id, attribute.name(), attribute.type(), attribute.isList()));
        }
        return id;
    }

    public void deleteAction(long actionId) {
        entityAttributeManager.deleteEntity(actionId);
    }

    public long createActionAttribute(long actionId, String name, String type, boolean isList) {
        return entityAttributeManager.createAttribute(actionId, name, type, isList);
    }

    public void deleteAttribute(long attributeId) {
        entityAttributeManager.deleteAttribute(attributeId);
    }

    @Transactional
    public long executeAction(long actionId, long customerId, Map<Long, String> attributes) {
        if (!entityAttributeManager.getAllAttributeIdsByEntityId(actionId).equals(attributes.keySet())) {
            throw new IllegalArgumentException("Not all attributes are provided for action with id: " + actionId);
        }

        long executedActionId = entityAttributeManager.createEntityInstance(actionId, customerId);

        attributes.forEach((attribute_id, value) ->
                                   entityAttributeManager.updateAttributeValue(attribute_id, executedActionId, value));
        return executedActionId;
    }

    public List<EntityAttributes> getActions() {
        return entityAttributeManager.getAllEntitiesByType(EntityType.ACTION);
    }

    public List<ExecutedAction> getExecutedActions() {
        return entityAttributeManager.getAllEntityInstancesByType(EntityType.ACTION)
                                     .stream()
                                     .map(ExecutedAction::fromEntityInstanceAttributes)
                                     .toList();
    }

    public Entity getActionById(long id) {
        return entityAttributeManager.getEntityById(id, EntityType.ACTION);
    }
}
