package com.raykov.rules_engine.domain.item;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.CreateAttributeRequest;
import com.raykov.rules_engine.domain.core.entity.EntityInstance;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final EntityAttributeManager entityAttributeManager;

    public ItemService(EntityAttributeManager entityAttributeManager) {
        this.entityAttributeManager = entityAttributeManager;
    }

    public long createItem(String name, List<CreateAttributeRequest> attributes) {
        long id = entityAttributeManager.createEntity(name, EntityType.ITEM);

        if (attributes != null && !attributes.isEmpty()) {
            attributes.forEach(attribute ->
                                       entityAttributeManager.createAttribute(id, attribute.name(), attribute.type(), attribute.isList()));
        }
        return id;
    }

    public List<EntityAttributes> getItems() {
        return entityAttributeManager.getEntityAttributesByType(EntityType.ITEM);
    }

    public void deleteItem(long itemId) {
        entityAttributeManager.deleteEntity(itemId);
    }

    public long createItemAttribute(long itemId, String name, String type, boolean isList) {
        return entityAttributeManager.createAttribute(itemId, name, type, isList);
    }

    public void deleteAttribute(long attributeId) {
        entityAttributeManager.deleteAttribute(attributeId);
    }

    public long grantItem(long itemId, long customerId, Map<Long, String> attributes) {
        return entityAttributeManager.createEntityInstanceAndSetAttributeValue(itemId, customerId, attributes);
    }

    public List<EntityInstanceAttributes> getGrantedItemsByCustomerId(long customerId) {
        Set<Long> grantedItemsIds = entityAttributeManager.getEntityInstancesByTargetInstanceId(customerId, EntityType.ITEM)
                                                          .stream()
                                                          .map(EntityInstance::id)
                                                          .collect(Collectors.toSet());

        return entityAttributeManager.getEntityInstanceAttributesByIds(grantedItemsIds, EntityType.ITEM);
    }

    public List<EntityInstanceAttributes> getGrantedItemsByIds(Set<Long> itemIds) {
        return entityAttributeManager.getEntityInstanceAttributesByIds(itemIds, EntityType.ITEM);
    }
}
