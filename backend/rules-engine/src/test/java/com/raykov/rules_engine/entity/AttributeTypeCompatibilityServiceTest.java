package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.attribute.AttributeService;
import com.raykov.rules_engine.domain.core.attribute.operation.ConditionalRuleOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatNoException;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

public class AttributeTypeCompatibilityServiceTest extends SpringBaseTest {

    @Autowired
    private AttributeService attributeService;

    @ParameterizedTest()
    @CsvSource({
            "STRING , CONCATENATION , abc",
            "NUMBER , ADDITION      , 5",
            "BOOLEAN, FLIP          , ",
            "DATE   , SET_NOW       , "
    })
    void scalarParameter_valid(String attributeType, UpdateOperation operation, String value) {
        long attributeId = createCustomerAttribute(attributeType);

        assertThatNoException().isThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, operation, value, false));
    }

    @ParameterizedTest()
    @CsvSource({
            "STRING , ADDITION      , 1",
            "NUMBER , CONCATENATION , abc",
            "BOOLEAN, ADDITION      , true",
            "DATE   , CONCATENATION , 2024-01-01"
    })
    void scalarParameter_invalid(String attributeType, UpdateOperation operation, String value) {
        long attributeId = createCustomerAttribute(attributeType);
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, operation, value, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching(".*");
    }

    @ParameterizedTest()
    @CsvSource({
            "NUMBER , ADDITION , NUMBER"
    })
    void attributeParameter_valid(String targetType, UpdateOperation operation, String paramType) {
        long targetAttributeId = createCustomerAttribute(targetType);
        long parameterAttributeId = createCustomerAttribute(paramType);
        assertThatNoException().isThrownBy(() -> attributeService.validateTypeCompatibility(targetAttributeId, operation,
                                                                           String.valueOf(parameterAttributeId), true));
    }

    @ParameterizedTest(name = "[{index}] INVALID attribute-param {0} + {1}")
    @CsvSource({
            "NUMBER , ADDITION , STRING"
    })
    void attributeParameter_invalid(String targetType, UpdateOperation operation, String paramType) {
        long targetAttributeId = createCustomerAttribute(targetType);
        long parameterAttributeId = createCustomerAttribute(paramType);
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(targetAttributeId, operation,
                                                           String.valueOf(parameterAttributeId), true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Target and Parameter attribute types must match.");
    }

    @Test
    void givenAttributeParameterReferencingItself_whenValidated_thenThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        assertThatThrownBy(() ->
                                   attributeService.validateTypeCompatibility(attributeId, UpdateOperation.ADDITION,
                                                             String.valueOf(attributeId), true)
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageMatching(".*cannot reference itself.");
    }

    @Test
    void givenOperationRequiringValue_whenValueIsNull_thenThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.ADDITION,
                                                           null, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Operation .* must have a value.");
    }

    @Test
    void givenOperationForbiddingValue_whenValueProvided_thenThrow() {
        long attributeId = createCustomerAttribute("DATE");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.SET_NOW,
                                                           "2024-01-01", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Operation .* must not have a value.");
    }

    @Test
    void givenEmptyValue_whenValueRequired_thenThrow() {
        long attributeId = createCustomerAttribute("STRING");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.CONCATENATION,
                                                           "", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Operation .* must have a value.");
    }

    @Test
    void givenWhitespaceValue_whenValueRequired_thenThrow() {
        long attributeId = createCustomerAttribute("STRING");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.CONCATENATION,
                                                           "   ", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Operation .* must have a value.");
    }

    @Test
    void givenIsAttributeIdTrue_whenValueIsNotNumeric_thenThrow() {
        long attributeId = createCustomerAttribute("NUMBER");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.ADDITION,
                                                           "abc", true))
                .isInstanceOf(NumberFormatException.class);
    }

    @Test
    void givenOperationThatDoesNotSupportAttributeParameters_whenUsed_thenThrow() {
        long attributeId = createCustomerAttribute("DATE");
        long parameterAttributeId = createCustomerAttribute("DATE");
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attributeId, UpdateOperation.SET_NOW,
                                                           String.valueOf(parameterAttributeId), true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageMatching("Operation .* must not have a value.");
    }

    @ParameterizedTest(name = "Rule Valid: {0} {1} {2}")
    @CsvSource({
            "NUMBER  , GREATER_THAN , 100",
            "NUMBER  , EQUAL_TO     , 50.5",
            "STRING  , CONTAINS     , 'premium'",
            "DATE    , LESS_THAN    , 2026-01-01T00:00:00Z",
            "BOOLEAN , EQUAL_TO     , true"
    })
    void rule_scalarParameter_valid(String type, ConditionalRuleOperation op, String val) {
        long id = createCustomerAttribute(type);
        assertThatNoException().isThrownBy(() -> attributeService.validateTypeCompatibility(id, op, val, false));
    }

    @ParameterizedTest(name = "Rule Invalid: {0} {1}")
    @CsvSource({
            "BOOLEAN , GREATER_THAN , true",
            "NUMBER  , CONTAINS     , 10",
            "DATE    , CONTAINS     , 2024",
            "STRING  , LESS_THAN    , 'abc'"
    })
    void rule_scalarParameter_invalid(String type, ConditionalRuleOperation op, String val) {
        long id = createCustomerAttribute(type);
        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(id, op, val, false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rule_attributeComparison_valid() {
        long attr1 = createCustomerAttribute("NUMBER");
        long attr2 = createCustomerAttribute("NUMBER");

        assertThatNoException().isThrownBy(() -> attributeService.validateTypeCompatibility(attr1, ConditionalRuleOperation.GREATER_THAN, String.valueOf(attr2), true));
    }

    @Test
    void rule_attributeComparison_invalidType() {
        long attr1 = createCustomerAttribute("NUMBER");
        long attr2 = createCustomerAttribute("STRING");

        assertThatThrownBy(() -> attributeService.validateTypeCompatibility(attr1, ConditionalRuleOperation.EQUAL_TO, String.valueOf(attr2), true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("match");
    }
}
