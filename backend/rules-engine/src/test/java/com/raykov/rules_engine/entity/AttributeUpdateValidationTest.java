package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

public class AttributeUpdateValidationTest extends SpringBaseTest {

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    @Test
    void number_updateWithString_shouldThrow() {
        // Given
        long customerId = login();
        long entityId = entityAttributeManager.createEntity("test", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId, customerId);
        long attrId = entityAttributeManager.createAttribute(entityId, "test", "NUMBER", false);

        // When
        AttributeValue value = getAttributeValue(attrId, entityInstanceId);
        AttributeValue newValue = value.withUpdatedValue("test2");

        // Then
        assertThatThrownBy(() -> entityAttributeManager.updateAttributeValues(List.of(newValue)));
    }

    @Test
    void number_updateWithString_shouldThrow_2() {
        // Given
        long customerId = login();
        long entityId = entityAttributeManager.createEntity("test", EntityType.ACTION);
        long entityInstanceId = entityAttributeManager.createEntityInstance(entityId, customerId);
        long attrId = entityAttributeManager.createAttribute(entityId, "test", "NUMBER", false);

        // When
        AttributeValue value = getAttributeValue(attrId, entityInstanceId);

        // Then
        assertThatThrownBy(() -> entityAttributeManager.updateAttributeValues(List.of(entityId), Map.of(value.attributeId(), "test2"), false));
    }

}
