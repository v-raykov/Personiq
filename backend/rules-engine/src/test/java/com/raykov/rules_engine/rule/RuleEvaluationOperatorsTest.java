package com.raykov.rules_engine.rule;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.rule.RuleService;
import com.raykov.rules_engine.domain.rule.model.Rule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.SoftAssertions.assertSoftly;

class RuleEvaluationOperatorsTest extends SpringBaseTest {

    @Autowired
    private RuleService ruleService;

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    private boolean isApplicable(long ruleId, long executedActionId, long customerId) {
        Rule rule = ruleService.getRuleById(ruleId);
        return ruleService.isRuleApplicable(rule, executedActionId, customerId);
    }

    @ParameterizedTest(name = "NUMBER: {0} {1} {2} -> {3}")
    @CsvSource({
            "5,  =,  5,  true",
            "5,  !=, 3,  true",
            "5,  !=, 5,  false",
            "5,  >,  3,  true",
            "5,  >,  7,  false",
            "5,  <,  7,  true",
            "5,  <,  3,  false",
            "5,  >=, 5,  true",
            "5,  >=, 4,  true",
            "5,  >=, 6,  false",
            "5,  <=, 5,  true",
            "5,  <=, 6,  true",
            "5,  <=, 4,  false"
    })
    void evaluates_numeric_operations(String actual, String sign, String scalar, boolean expected) {
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("NUMBER", customerId, actual);
        long actionId = createAction();
        long ruleId = createRule(actionId, "%d %s %s".formatted(attrId, sign, scalar));

        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        assertThat(isApplicable(ruleId, executedActionId, customerId)).isEqualTo(expected);
    }

    @ParameterizedTest(name = "STRING: \"{0}\" {1} \"{2}\" -> {3}")
    @CsvSource({
            "foobar,  =,            foobar,  true",
            "foobar,  =,            foo,     false",
            "foobar,  !=,           foobar,  false",
            "foobar,  !=,           foo,     true",
            "foobar,  ~,            bar,     true",
            "foobar,  ~,            baz,     false",
            "foobar,  !~,           bar,     false",
            "foobar,  !~,           baz,     true"
    })
    void evaluates_string_operations(String actual, String sign, String scalar, boolean expected) {
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("STRING", customerId, actual);
        long actionId = createAction();
        long ruleId = createRule(actionId, "%d %s %s".formatted(attrId, sign, scalar));

        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        assertThat(isApplicable(ruleId, executedActionId, customerId)).isEqualTo(expected);
    }

    @Test
    void evaluates_date_operations() {
        long customerId = login();

        ZonedDateTime base = ZonedDateTime.parse("2024-01-01T00:00:00Z");
        ZonedDateTime before = base.minusDays(1);
        ZonedDateTime after = base.plusDays(1);

        long attrId = createCustomerAttributeAndSetValue("DATE", customerId, base.toString());
        long actionId = createAction();
        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        long eqRule = createRule(actionId, "%d = %s".formatted(attrId, base));
        long neRule = createRule(actionId, "%d != %s".formatted(attrId, after));
        long gtRule = createRule(actionId, "%d > %s".formatted(attrId, before));
        long ltRule = createRule(actionId, "%d < %s".formatted(attrId, after));
        long geRule = createRule(actionId, "%d >= %s".formatted(attrId, base));
        long leRule = createRule(actionId, "%d <= %s".formatted(attrId, base));

        assertThat(isApplicable(eqRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(neRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(gtRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(ltRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(geRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(leRule, executedActionId, customerId)).isTrue();
    }

    @ParameterizedTest(name = "BOOLEAN: {0} {1} {2} -> {3}")
    @CsvSource({
            "true,  =,  true,   true",
            "true,  =,  false,  false",
            "true,  !=, false,  true",
            "false, !=, false,  false"
    })
    void evaluates_boolean_operations(String actual, String sign, String scalar, boolean expected) {
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("BOOLEAN", customerId, actual);
        long actionId = createAction();
        long ruleId = createRule(actionId, "%d %s %s".formatted(attrId, sign, scalar));

        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        assertThat(isApplicable(ruleId, executedActionId, customerId)).isEqualTo(expected);
    }

    @Test
    void evaluates_list_contains_and_not_contains() {
        long customerId = login();
        long attrId = createCustomerAttributeList("STRING");
        setAttributeValue(attrId, customerId, List.of("basic", "silver", "gold"));
        long actionId = createAction();
        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        long containsSilver = createRule(actionId, "%d ~ silver".formatted(attrId));
        long containsPremium = createRule(actionId, "%d ~ premium".formatted(attrId));
        long notContainsSilver = createRule(actionId, "%d !~ silver".formatted(attrId));
        long notContainsPremium = createRule(actionId, "%d !~ premium".formatted(attrId));

        assertSoftly(s -> {
            s.assertThat(isApplicable(containsSilver, executedActionId, customerId)).isTrue();
            s.assertThat(isApplicable(containsPremium, executedActionId, customerId)).isFalse();
            s.assertThat(isApplicable(notContainsSilver, executedActionId, customerId)).isFalse();
            s.assertThat(isApplicable(notContainsPremium, executedActionId, customerId)).isTrue();
        });
    }

    @Test
    void evaluates_attribute_to_attribute_comparisons() {
        long customerId = login();

        long left = createCustomerAttributeAndSetValue("NUMBER", customerId, "10");
        long right = createCustomerAttributeAndSetValue("NUMBER", customerId, "5");

        long actionId = createAction();
        long executedActionId = entityAttributeManager.createEntityInstance(actionId);

        long geRule = createRule(actionId, "%d >= attr_%d".formatted(left, right));
        long ltRule = createRule(actionId, "%d < attr_%d".formatted(left, right));

        assertThat(isApplicable(geRule, executedActionId, customerId)).isTrue();
        assertThat(isApplicable(ltRule, executedActionId, customerId)).isFalse();
    }
}