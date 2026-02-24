package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;

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
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", "String", false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, ruleId, attributeId, UpdateOperation.CONCATENATION, "String", false));
    }

    @Test
    public void createReaction_valueParameter_Number() {
        // Given
        long attributeId = createCustomerAttribute("NUMBER");
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "ADDITION", "10", false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, ruleId, attributeId, UpdateOperation.ADDITION, "10", false));
    }

    @Test
    public void createReaction_valueParameter_Boolean() {
        // Given
        long attributeId = createCustomerAttribute("BOOLEAN");
        long ruleId = createRule("%d = true".formatted(attributeId));

        // When
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "FLIP", null, false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, ruleId, attributeId, UpdateOperation.FLIP, null, false));
    }

    @Test
    public void createReaction_valueParameter_Date() {
        // Given
        long attributeId = createCustomerAttribute("DATE");
        long ruleId = createRule("%d = %s".formatted(attributeId, ZonedDateTime.now()));

        // When
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "SET_NOW", null, false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, ruleId, attributeId, UpdateOperation.SET_NOW, null, false));
    }

    @Test
    public void createReaction_attributeParameter() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId);

        // When
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, ruleId, attributeId, UpdateOperation.CONCATENATION, String.valueOf(actionAttributeId), true));
    }
}
