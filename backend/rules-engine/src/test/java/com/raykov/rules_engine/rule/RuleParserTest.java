package com.raykov.rules_engine.rule;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.rule.RuleController;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RuleParserTest extends SpringBaseTest {

    @Autowired
    private RuleController ruleController;

    @ParameterizedTest(name = "parse NUMBER with sign {1}")
    @CsvSource({
            "NUMBER, =",
            "NUMBER, !=",
            "NUMBER, >",
            "NUMBER, <",
            "NUMBER, >=",
            "NUMBER, <="
    })
    void parses_all_numeric_signs(String type, String sign) {
        long attrId = createCustomerAttribute(type);
        long actionId = createAction();

        long ruleId = ruleController.createRule(new CreateRuleRequest(actionId, "%d %s 5".formatted(attrId, sign)));
        RuleResponse response = ruleController.getRules().getFirst();

        assertThat(ruleId).isPositive();
        assertThat(response.id()).isEqualTo(ruleId);
        assertThat(response.expression()).contains(sign);
    }

    @ParameterizedTest(name = "parse STRING with sign {0}")
    @CsvSource({
            "=",      "!=",
            "~",      "!~"
    })
    void parses_all_string_and_list_signs(String sign) {
        long attrId = createCustomerAttribute("STRING");
        long actionId = createAction();

        long ruleId = ruleController.createRule(new CreateRuleRequest(actionId, "%d %s premium".formatted(attrId, sign)));
        RuleResponse response = ruleController.getRules().getFirst();

        assertThat(ruleId).isPositive();
        assertThat(response.expression()).contains(sign);
    }

    @Test
    void parses_not_contains_for_list_attribute() {
        long attrId = createCustomerAttributeList("STRING");
        long actionId = createAction();

        long ruleId = ruleController.createRule(new CreateRuleRequest(actionId, "%d !~ premium".formatted(attrId)));
        RuleResponse response = ruleController.getRules().getFirst();

        assertThat(ruleId).isPositive();
        assertThat(response.expression()).contains("!~");
    }

    @Test
    void parses_attribute_to_attribute_comparisons() {
        long left = createCustomerAttribute("NUMBER");
        long right = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        long ruleId = ruleController.createRule(
                new CreateRuleRequest(actionId, "%d >= attr_%d".formatted(left, right))
        );
        RuleResponse response = ruleController.getRules().getFirst();

        assertThat(ruleId).isPositive();
        assertThat(response.expression()).contains(">=");
    }

    @Test
    void malformed_expression_throws() {
        long attrId = createCustomerAttribute("NUMBER");
        long actionId = createAction();

        assertThatThrownBy(() ->
                                   ruleController.createRule(new CreateRuleRequest(actionId, "%d 5".formatted(attrId)))
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Malformed condition");
    }
}