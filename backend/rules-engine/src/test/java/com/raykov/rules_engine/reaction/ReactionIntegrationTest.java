package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.reaction.operation.UpdateOperation;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


public class ReactionIntegrationTest extends SpringBaseTest {

    @Autowired
    private ReactionController reactionController;

    @Test
    public void createReaction_valueParameter_String() {
        // Given
        long attributeId = createCustomerAttribute();
        long actionId = createAction();

        // When
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", "String", false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, actionId, attributeId, UpdateOperation.CONCATENATION, "String", false));
    }

    @Test
    public void createReaction_valueParameter_Number() {
        // Given
        long attributeId = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        // When
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "ADDITION", "10", false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, actionId, attributeId, UpdateOperation.ADDITION, "10", false));
    }

    @Test
    public void createReaction_valueParameter_Boolean() {
        // Given
        long attributeId = createCustomerAttribute("BOOLEAN");
        long actionId = createAction();

        // When
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "FLIP", "false", false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, actionId, attributeId, UpdateOperation.FLIP, "false", false));
    }

    @Test
    public void createReaction_valueParameter_Date() {
        // Given
        long attributeId = createCustomerAttribute("DATE");
        long actionId = createAction();

        // When
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "SET_NOW", null, false);
        reactionController.createReaction(request);

        // Then
        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, actionId, attributeId, UpdateOperation.SET_NOW, null, false));
    }

    @Test
    public void createReaction_attributeParameter() {
        // Given
        long attributeId = createCustomerAttribute();
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId);

        // When
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        reactionController.createReaction(request);

        assertThat(reactionController.getAllReactions())
                .containsExactly(new Reaction(1L, actionId, attributeId, UpdateOperation.CONCATENATION, String.valueOf(actionAttributeId), true));
    }
}
