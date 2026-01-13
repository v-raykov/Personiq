package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class DeletionTest extends SpringBaseTest {

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    @Test
    public void deleteAttribute() {
        long entityId = entityAttributeManager.createEntity("entity", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId);

        long attributeId = entityAttributeManager.createAttribute(entityId, "attribute", "STRING", false);
        assertThat(entityAttributeManager.getAllAttributesByEntityId(entityId)).hasSize(1);

        entityAttributeManager.updateAttributeValue(attributeId, entityInstanceId, "value");
        entityAttributeManager.deleteAttribute(attributeId);

        assertThat(entityAttributeManager.getAllAttributeIdsByEntityId(entityId)).isEmpty();
        assertThat(entityAttributeManager.getAttributeValue(attributeId, entityInstanceId, EntityType.ACTION)).isNull();
    }

    @Test
    public void deleteEntity() {
        long entityId = entityAttributeManager.createEntity("entity", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId);
        long attributeId = entityAttributeManager.createAttribute(entityId, "attribute", "STRING", false);

        entityAttributeManager.updateAttributeValue(attributeId, entityInstanceId, "value");

        entityAttributeManager.deleteEntity(entityId);

        assertThat(entityAttributeManager.getAllAttributeIdsByEntityId(entityId)).hasSize(1);
        assertThat(entityAttributeManager.getAttributeValue(attributeId, entityInstanceId, EntityType.ACTION)).isNull();
        assertThat(entityAttributeManager.getAllEntityInstancesByType(EntityType.ACTION)).isEmpty();
    }
}
