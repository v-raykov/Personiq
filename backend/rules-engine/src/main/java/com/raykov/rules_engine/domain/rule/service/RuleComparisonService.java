package com.raykov.rules_engine.domain.rule.service;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValueType;
import com.raykov.rules_engine.domain.core.attribute.operation.ConditionalRuleOperation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class RuleComparisonService {

    public boolean compareAttributes(AttributeValue actual, ConditionalRuleOperation op, AttributeValue expected) {
        return performComparison(actual, op, expected.values());
    }

    public boolean compareScalar(AttributeValue actual, ConditionalRuleOperation op, String scalar) {
        return performComparison(actual, op, List.of(scalar));
    }

    private boolean performComparison(AttributeValue actual, ConditionalRuleOperation op, List<String> expectedValues) {
        return actual.isList()
               ? compareList(actual.values(), op, expectedValues)
               : match(actual.values().getFirst(), actual.valueType(), op, expectedValues);
    }

    private boolean match(String actual, AttributeValueType type, ConditionalRuleOperation op, List<String> expected) {
        return switch (type) {
            case NUMBER ->
                    expected.stream().anyMatch(e -> compareNumeric(new BigDecimal(actual), op, new BigDecimal(e)));
            case STRING -> expected.stream().anyMatch(e -> compareString(actual, op, e));
            case DATE ->
                    expected.stream().anyMatch(e -> compareDate(ZonedDateTime.parse(actual), op, ZonedDateTime.parse(e)));
            case BOOLEAN ->
                    expected.stream().anyMatch(e -> compareBoolean(Boolean.valueOf(actual), op, Boolean.valueOf(e)));
        };
    }

    private boolean compareNumeric(BigDecimal a, ConditionalRuleOperation op, BigDecimal e) {
        int cmp = a.compareTo(e);
        return switch (op) {
            case EQUAL_TO -> cmp == 0;
            case NOT_EQUAL_TO -> cmp != 0;
            case GREATER_THAN -> cmp > 0;
            case LESS_THAN -> cmp < 0;
            case GREATER_THAN_OR_EQUAL_TO -> cmp >= 0;
            case LESS_THAN_OR_EQUAL_TO -> cmp <= 0;
            default -> false;
        };
    }

    private boolean compareString(String a, ConditionalRuleOperation op, String e) {
        return switch (op) {
            case EQUAL_TO -> a.equals(e);
            case NOT_EQUAL_TO -> !a.equals(e);
            case CONTAINS -> a.contains(e);
            case NOT_CONTAINS -> !a.contains(e);
            default -> false;
        };
    }

    private boolean compareDate(ZonedDateTime a, ConditionalRuleOperation op, ZonedDateTime e) {
        return switch (op) {
            case EQUAL_TO -> a.isEqual(e);
            case NOT_EQUAL_TO -> !a.isEqual(e);
            case GREATER_THAN -> a.isAfter(e);
            case LESS_THAN -> a.isBefore(e);
            case GREATER_THAN_OR_EQUAL_TO -> a.isAfter(e) || a.isEqual(e);
            case LESS_THAN_OR_EQUAL_TO -> a.isBefore(e) || a.isEqual(e);
            default -> false;
        };
    }

    private boolean compareBoolean(Boolean a, ConditionalRuleOperation op, Boolean e) {
        return switch (op) {
            case EQUAL_TO -> a.equals(e);
            case NOT_EQUAL_TO -> !a.equals(e);
            default -> false;
        };
    }

    private boolean compareList(List<String> a, ConditionalRuleOperation op, List<String> e) {
        return switch (op) {
            case CONTAINS -> a.stream().anyMatch(e::contains);
            case NOT_CONTAINS -> a.stream().noneMatch(e::contains);
            default -> false;
        };
    }
}