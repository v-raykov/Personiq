package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class ReactionCreationValidationTest extends SpringBaseTest {

    @Autowired
    private ReactionController reactionController;

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_String_shouldThrow() {
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "ADDITION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation: 'ADDITION' for type: STRING");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Number_shouldThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation: 'CONCATENATION' for type: NUMBER");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Boolean_shouldThrow() {
        long attributeId = createCustomerAttribute("BOOLEAN");
        long ruleId = createRule("%d = true".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation: 'CONCATENATION' for type: BOOLEAN");
    }

    @Test
    public void valueParameter_invalidOperationForTargetAttributeType_Date_shouldThrow() {
        long attributeId = createCustomerAttribute("DATE");
        long ruleId = createRule("%d = %s".formatted(attributeId, ZonedDateTime.now()));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid operation: 'CONCATENATION' for type: DATE");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Number_shouldThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "ADDITION", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid value parameter: 'value' for type: NUMBER");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Boolean_shouldThrow() {
        long attributeId = createCustomerAttribute("BOOLEAN");
        long ruleId = createRule("%d = true".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "FLIP", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Operation FLIP must not have a value.");
    }

    @Test
    public void valueParameter_invalidOperationForValueType_Date_shouldThrow() {
        long attributeId = createCustomerAttribute("DATE");
        long ruleId = createRule("%d = %s".formatted(attributeId, ZonedDateTime.now()));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "SET_NOW", "value", false);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Operation SET_NOW must not have a value.");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_String_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute("NUMBER");
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionAttributeId = createActionAttribute(ruleId, "STRING");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "ADDITION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and Parameter attribute types must match.");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Number_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionAttributeId = createActionAttribute(ruleId, "NUMBER");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and Parameter attribute types must match.");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Date_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionAttributeId = createActionAttribute(ruleId, "DATE");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and Parameter attribute types must match.");
    }

    @Test
    public void attributeParameter_invalidOperationForParameterAttributeType_Boolean_ShouldThrow() {
        // Given
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));
        long actionAttributeId = createActionAttribute(ruleId, "BOOLEAN");

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(actionAttributeId), true);
        assertThatThrownBy(() -> reactionController.createReaction(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Target and Parameter attribute types must match.");
    }

    @Test
    public void attributeParameter_invalidAttributeId_shouldThrow() {
        long attributeId = createCustomerAttribute();
        long ruleId = createRule("%d = 5".formatted(attributeId));

        // When & Then
        CreateReactionRequest request = new CreateReactionRequest(ruleId, attributeId, "CONCATENATION", String.valueOf(ThreadLocalRandom.current().nextLong()), true);
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
                .hasMessage("Rule with this id does not exist");
    }
}
