package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.item.ItemController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

public class ItemsIntegrationTest extends SpringBaseTest {

    @Autowired
    private ItemController itemController;

    @Test
    void grantItem_getByCustomerId() {
        // Given
        long customerId = login();
        long itemId = createItem();
        long itemAttrId1 = createItemAttribute(itemId, "STRING");
        long itemAttrId2 = createItemAttribute(itemId, "STRING");
        long itemAttrId3 = createItemAttribute(itemId, "NUMBER");

        // When
        long grantedItemId = itemController.grantItem(itemId, customerId, Map.of(
                itemAttrId1, "value1",
                itemAttrId2, "value2",
                itemAttrId3, "123"
        ));

        List<EntityInstanceAttributes> grantedItem = itemController.getGrantedItemsByCustomerId(customerId);

        // Then
        assertThat(grantedItem).hasSize(1)
                               .first()
                               .usingRecursiveComparison()
                               .ignoringFields("attributes.entityInstanceId", "attributes.name")
                               .isEqualTo(new EntityInstanceAttributes(grantedItemId, itemId, customerId, List.of(
                                       new AttributeValue(0, itemAttrId1, "", AttributeValueType.STRING, List.of("value1"), false),
                                       new AttributeValue(1, itemAttrId2, "", AttributeValueType.STRING, List.of("value2"), false),
                                       new AttributeValue(2, itemAttrId3, "", AttributeValueType.NUMBER, List.of("123"), false)
                               )));
    }

    @Test
    void grantItems_getByBulkIds() {
        // Given
        long customerId = login();
        long itemId1 = createItem();
        long itemId2 = createItem();
        long itemAttrId1 = createItemAttribute(itemId1, "STRING");
        long itemAttrId2 = createItemAttribute(itemId2, "STRING");

        // When
        long grantedItemId1 = itemController.grantItem(itemId1, customerId, Map.of(itemAttrId1, "value1"));
        long grantedItemId2 = itemController.grantItem(itemId2, customerId, Map.of(itemAttrId2, "value2"));

        List<EntityInstanceAttributes> grantedItems = itemController.getGrantedItemsByIds(Set.of(grantedItemId1, grantedItemId2));
        assertThat(grantedItems).hasSize(2);

        // Then
        List<EntityInstanceAttributes> expected = List.of(
                new EntityInstanceAttributes(grantedItemId1, itemId1, customerId, List.of(new AttributeValue(0, itemAttrId1, "", AttributeValueType.STRING, List.of("value1"), false))),
                new EntityInstanceAttributes(grantedItemId2, itemId2, customerId, List.of(new AttributeValue(0, itemAttrId2, "", AttributeValueType.STRING, List.of("value2"), false)))
        );

        assertThat(grantedItems).usingRecursiveComparison()
                                .ignoringFields("attributes.entityInstanceId", "attributes.name")
                                .isEqualTo(expected);
    }
}