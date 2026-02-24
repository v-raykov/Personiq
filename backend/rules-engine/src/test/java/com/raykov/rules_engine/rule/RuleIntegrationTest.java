package com.raykov.rules_engine.rule;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.action.ActionService;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.rule.RuleController;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class RuleIntegrationTest extends SpringBaseTest {

    @Autowired
    private RuleController ruleController;

    @Autowired
    private ActionService actionService;

    @Test
    void createRule() {
        // Given
        long attrId1 = createCustomerAttribute("NUMBER");
        long attrId2 = createCustomerAttribute("NUMBER");
        long attrId3 = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        // When
        ruleController.createRule(new CreateRuleRequest(actionId, "%d = 1 & (%d > attr_%d | %d > 5)".formatted(attrId1, attrId2, attrId3, attrId2)));
        RuleResponse rule = ruleController.getRules().getFirst();

        // Then
        assertThat(rule.expression())
                .matches("""
                         \\(CUSTOMER\\.attribute[^ ]+ = 1 AND \\(CUSTOMER\\.attribute[^ ]+ > CUSTOMER\\.attribute[^ ]+ OR CUSTOMER\\.attribute[^ ]+ > 5\\)\\)\
                         """);
        assertThat(rule.id()).isEqualTo(1L);
        assertThat(rule.triggerActionId()).isEqualTo(actionId);
    }

    @Test
    void invalidExpression() {
        // Given
        long attrId1 = createCustomerAttribute();
        long attrId2 = createCustomerAttribute();
        long attrId3 = createCustomerAttribute();
        long actionId = createAction();

        // When & Then
        assertThatThrownBy(() -> ruleController.createRule(new CreateRuleRequest(actionId, "%d 1 & (%d > attr_%d | %d > 5)".formatted(attrId1, attrId2, attrId3, attrId2))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Malformed condition");
    }

    @Test
    void invalidActionId() {
        // Given
        long attrId1 = createCustomerAttribute();
        long actionId = ThreadLocalRandom.current().nextLong();

        // When & Then
        assertThatThrownBy(() -> ruleController.createRule(new CreateRuleRequest(actionId, "%d = random".formatted(attrId1))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Entity with this id does not exist");
    }

    @Test
    void invalidLeftHandSideAttributeId() {
        // Given
        long attrId1 = ThreadLocalRandom.current().nextLong(Long.MAX_VALUE);
        long attrId2 = createCustomerAttribute();
        long attrId3 = createCustomerAttribute();
        long actionId = createAction();

        // When & Then
        assertThatThrownBy(() -> ruleController.createRule(new CreateRuleRequest(actionId, "%d = 1 & (%d > attr_%d | %d > 5)".formatted(attrId1, attrId2, attrId3, attrId2))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Attribute with this id does not exist");
    }

    @Test
    void invalidRightHandSideAttributeId() {
        // Given
        long attrId1 = createCustomerAttribute("NUMBER");
        long attrId2 = createCustomerAttribute("NUMBER");
        long attrId3 = ThreadLocalRandom.current().nextLong(Long.MAX_VALUE);
        long actionId = createAction();

        // When & Then
        assertThatThrownBy(() -> ruleController.createRule(new CreateRuleRequest(actionId, "%d = 1 & (%d > attr_%d | %d > 5)".formatted(attrId1, attrId2, attrId3, attrId2))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Attribute with this id does not exist");
    }

    @Test
    void executeActionWithApplicableRules() {
        // Given
        long customerId = login();
        long attrId1 = createCustomerAttributeAndSetValue("NUMBER", customerId, "1");
        long attrId2 = createCustomerAttributeAndSetValue("NUMBER", customerId, "10");
        long attrId3 = createCustomerAttributeAndSetValue("NUMBER", customerId, "9");
        long actionId = createAction();

        // When
        long ruleId1 = ruleController.createRule(new CreateRuleRequest(actionId, "%d = 1 & (%d > attr_%d | %d > 5)".formatted(attrId1, attrId2, attrId3, attrId2)));
        long ruleId2 = ruleController.createRule(new CreateRuleRequest(actionId, "%d = 1 & (%d > attr_%d & %d < 5)".formatted(attrId1, attrId2, attrId3, attrId2)));
        long ruleId3 = ruleController.createRule(new CreateRuleRequest(actionId, "%d = 3 | (%d > attr_%d | %d > 8)".formatted(attrId1, attrId2, attrId3, attrId2)));

        createReaction(new CreateReactionRequest(ruleId1, attrId1, "ADDITION", "5", false));
        createReaction(new CreateReactionRequest(ruleId2, attrId2, "ADDITION", "10", false));
        createReaction(new CreateReactionRequest(ruleId3, attrId2, "SUBTRACTION", String.valueOf(ruleId3), true));

        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        assertThat(getAttributeValue(attrId1, customerId).values().getFirst()).isEqualTo("6");
        assertThat(getAttributeValue(attrId2, customerId).values().getFirst()).isEqualTo("1");
        assertThat(getAttributeValue(attrId3, customerId).values().getFirst()).isEqualTo("9");
    }

    @Test
    void executeActionWithApplicableRules_listAttribute() {
        // Given
        long customerId = login();
        long attrId1 = createCustomerAttributeList("NUMBER");
        setAttributeValue(attrId1, customerId, List.of("1", "2", "3"));
        long actionId = createAction();

        // When
        long ruleId1 = ruleController.createRule(new CreateRuleRequest(actionId, "%d ~ 1".formatted(attrId1)));

        createReaction(new CreateReactionRequest(ruleId1, attrId1, "PREPEND", "5", false));

        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        assertThat(getAttributeValue(attrId1, customerId).values()).isEqualTo(List.of("5", "1", "2", "3"));
    }
}
