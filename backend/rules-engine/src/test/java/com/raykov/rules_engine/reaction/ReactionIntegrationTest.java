package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import com.raykov.rules_engine.domain.reaction.model.AttributeReaction;
import com.raykov.rules_engine.domain.reaction.model.CreateAttributeReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.CreateItemReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.ItemReaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

public class ReactionIntegrationTest extends SpringBaseTest {

    @Autowired
    private ReactionController reactionController;

    @Test
    public void createReaction_valueParameter_String() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When
        CreateAttributeReactionRequest request = new CreateAttributeReactionRequest(ruleId, attributeId, "CONCATENATION", "String", false);
        reactionController.createAttributeReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new AttributeReaction(1L, ruleId, attributeId, UpdateOperation.CONCATENATION, "String", false));
    }

    @Test
    public void createReaction_valueParameter_Number() {
        // Given
        long attributeId = createCustomerAttribute("NUMBER");
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When
        CreateAttributeReactionRequest request = new CreateAttributeReactionRequest(ruleId, attributeId, "ADDITION", "10", false);
        reactionController.createAttributeReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new AttributeReaction(1L, ruleId, attributeId, UpdateOperation.ADDITION, "10", false));
    }

    @Test
    public void createReaction_valueParameter_Boolean() {
        // Given
        long attributeId = createCustomerAttribute("BOOLEAN");
        long ruleId = createRule("%d = true".formatted(attributeId));

        // When
        CreateAttributeReactionRequest request = new CreateAttributeReactionRequest(ruleId, attributeId, "FLIP", null, false);
        reactionController.createAttributeReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new AttributeReaction(1L, ruleId, attributeId, UpdateOperation.FLIP, null, false));
    }

    @Test
    public void createReaction_valueParameter_Date() {
        // Given
        long attributeId = createCustomerAttribute("DATE");
        long ruleId = createRule("%d = %s".formatted(attributeId, ZonedDateTime.now()));

        // When
        CreateAttributeReactionRequest request = new CreateAttributeReactionRequest(ruleId, attributeId, "SET_NOW", null, false);
        reactionController.createAttributeReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new AttributeReaction(1L, ruleId, attributeId, UpdateOperation.SET_NOW, null, false));
    }

    @Test
    public void createReaction_attributeParameter() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId);

        // When
        CreateAttributeReactionRequest request = new CreateAttributeReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        reactionController.createAttributeReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new AttributeReaction(1L, ruleId, attributeId, UpdateOperation.CONCATENATION, String.valueOf(actionAttributeId), true));
    }

    @Test
    public void createReaction_getItemTemplateById() {
        // Given
        long customerAttrId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(customerAttrId));

        long itemId1 = createItem();
        long itemAttrId1 = createItemAttribute(itemId1, "STRING");
        long itemId2 = createItem();
        long itemAttrId2 = createItemAttribute(itemId2, "STRING");

        // When
        CreateItemReactionRequest request1 = new CreateItemReactionRequest(ruleId, itemId1, Map.of(itemAttrId1, "value"));
        long grantedItemId1 = reactionController.createItemReaction(request1);

        CreateItemReactionRequest request2 = new CreateItemReactionRequest(ruleId, itemId2, Map.of(itemAttrId2, "value"));
        long grantedItemId2 = reactionController.createItemReaction(request2);

        Set<Long> itemIds = reactionController.getAllReactions().stream()
                                              .filter(r -> r.ruleId() == ruleId)
                                              .filter(ItemReaction.class::isInstance)
                                              .map(ItemReaction.class::cast)
                                              .map(ItemReaction::templateItemId)
                                              .collect(Collectors.toSet());

        List<EntityInstanceAttributes> itemTemplates = getItemsByIds(itemIds);

        // Then
        assertThat(itemTemplates).hasSize(2);

        List<EntityInstanceAttributes> expected = List.of(
                new EntityInstanceAttributes(grantedItemId1, itemId1, null, List.of(new AttributeValue(grantedItemId1, itemAttrId1, "", AttributeValueType.STRING, List.of("value"), false))),
                new EntityInstanceAttributes(grantedItemId2, itemId2, null, List.of(new AttributeValue(grantedItemId2, itemAttrId2, "", AttributeValueType.STRING, List.of("value"), false)))
        );
        assertThat(itemTemplates)
                .usingRecursiveComparison()
                .ignoringFields("attributes.name")
                .isEqualTo(expected);

    }
}
