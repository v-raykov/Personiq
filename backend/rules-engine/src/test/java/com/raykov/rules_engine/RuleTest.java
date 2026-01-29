package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.rule.RuleController;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class RuleTest extends SpringBaseTest {

    @Autowired
    private RuleController ruleController;

    @Test
    void createRule() {
        // Given
        long attrId1 = createCustomerAttribute();
        long attrId2 = createCustomerAttribute();
        long attrId3 = createCustomerAttribute();
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
}
