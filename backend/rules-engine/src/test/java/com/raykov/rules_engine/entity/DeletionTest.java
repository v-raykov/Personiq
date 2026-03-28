package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class DeletionTest extends SpringBaseTest {

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    @Test
    public void deleteAttribute() {
        long entityId = entityAttributeManager.createEntity("entity", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId);

        long attributeId = entityAttributeManager.createAttribute(entityId, "attribute", "STRING", false);
        assertThat(entityAttributeManager.getAttributesByEntityId(entityId)).hasSize(1);

        setAttributeValue(attributeId, entityInstanceId, List.of("value"));
        entityAttributeManager.deleteAttribute(attributeId);

        assertThat(entityAttributeManager.getAttributeIdsByEntityId(entityId)).isEmpty();
        assertThat(entityAttributeManager.getAttributeValue(attributeId, entityInstanceId)).isEmpty();
    }

    @Test
    public void deleteEntity() {
        long entityId = entityAttributeManager.createEntity("entity", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId);
        long attributeId = entityAttributeManager.createAttribute(entityId, "attribute", "STRING", false);

        setAttributeValue(attributeId, entityInstanceId, List.of("value"));

        entityAttributeManager.deleteEntity(entityId);

        assertThat(entityAttributeManager.getAttributeIdsByEntityId(entityId)).hasSize(1);
        assertThat(entityAttributeManager.getAttributeValue(attributeId, entityInstanceId)).isEmpty();
        assertThat(entityAttributeManager.getEntityInstancesByType(EntityType.ACTION)).isEmpty();
    }
}
