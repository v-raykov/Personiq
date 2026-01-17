package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class ReactionCreationValidationTest extends SpringBaseTest {

    @Autowired
    private ReactionController reactionController;

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_String_shouldThrow() {
        long attributeId = createCustomerAttribute();
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "ADDITION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation for target attribute with type: STRING");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Number_shouldThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation for target attribute with type: NUMBER");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Boolean_shouldThrow() {
        long attributeId = createCustomerAttribute("BOOLEAN");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation for target attribute with type: BOOLEAN");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Date_shouldThrow() {
        long attributeId = createCustomerAttribute("DATE");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation for target attribute with type: DATE");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Number_shouldThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "ADDITION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid value parameter type for operation: ADDITION");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Boolean_shouldThrow() {
        long attributeId = createCustomerAttribute("BOOLEAN");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "FLIP", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid value parameter type for operation: FLIP");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Date_shouldThrow() {
        long attributeId = createCustomerAttribute("DATE");
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "SET_NOW", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid value parameter type for operation: SET_NOW");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_String_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute("NUMBER");
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId, "STRING");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "ADDITION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and parameter attribute types have to match");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Number_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId, "NUMBER");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and parameter attribute types have to match");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Date_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId, "DATE");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and parameter attribute types have to match");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Boolean_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long actionId = createAction();
        long actionAttributeId = createActionAttribute(actionId, "BOOLEAN");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and parameter attribute types have to match");
    }

    @Test
    public void attributeParameter_invalidAttributeId_shouldThrow() {
        long attributeId = createCustomerAttribute();
        long actionId = createAction();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(actionId, attributeId, "CONCATENATION", String.valueOf(ThreadLocalRandom.current().nextLong()), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Attribute with this id does not exist");
    }

    @Test
    public void invalidActionId_shouldThrow() {
        long attributeId = createCustomerAttribute();

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ThreadLocalRandom.current().nextLong(), attributeId, "CONCATENATION", "value", true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Action with this id does not exist");
    }
}
