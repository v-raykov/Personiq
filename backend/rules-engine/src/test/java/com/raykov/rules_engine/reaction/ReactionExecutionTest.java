package com.raykov.rules_engine.reaction;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.reaction.ReactionService;
import com.raykov.rules_engine.domain.reaction.model.CreateAttributeReactionRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class ReactionExecutionTest extends SpringBaseTest {

    @Autowired
    private ReactionService reactionService;

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    @ParameterizedTest
    @CsvSource({
            "ADDITION,       5,     6",
            "SUBTRACTION,    5,    -4",
            "MULTIPLICATION, 5,     5",
            "DIVISION,       5,     0.2",
            "INCREMENT,      null,  2",
            "DECREMENT,      null,  0",
            "SET,            5,     5"
    })
    public void numbers(String operation, String input, String expected) {
        // Given
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("NUMBER", customerId, "1");
        long ruleId = createRule("%d = 1".formatted(attrId));

        String actualInput = "null".equals(input) ? null : input;
        reactionService.createAttributeReaction(new CreateAttributeReactionRequest(ruleId, attrId, operation, actualInput, false));

        // When
        long executedActionId = entityAttributeManager.createEntityInstance(createAction());
        reactionService.executeReaction(executedActionId, customerId, List.of(ruleId));

        // Then
        assertThat(getAttributeValue(attrId, customerId).values()).isEqualTo(List.of(expected));
    }

    @ParameterizedTest
    @CsvSource({
            "CONCATENATION, testing, valuetesting",
            "SET,           testing, testing"
    })
    public void strings(String operation, String input, String expected) {
        // Given
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("STRING", customerId, "value");
        long ruleId = createRule("%d = value".formatted(attrId));

        reactionService.createAttributeReaction(new CreateAttributeReactionRequest(ruleId, attrId, operation, input, false));

        // When
        long executedActionId = entityAttributeManager.createEntityInstance(createAction());
        reactionService.executeReaction(executedActionId, customerId, List.of(ruleId));

        // Then
        assertThat(getAttributeValue(attrId, customerId).values()).isEqualTo(List.of(expected));
    }

    @ParameterizedTest
    @CsvSource({
            "SET_TRUE,  null, true",
            "SET_FALSE, null, false",
            "FLIP,      null, false",
            "SET,       false, false"
    })
    public void booleans(String operation, String input, String expected) {
        // Given
        long customerId = login();
        long attrId = createCustomerAttributeAndSetValue("BOOLEAN", customerId, "true");
        long ruleId = createRule("%d = true".formatted(attrId));

        String actualInput = "null".equals(input) ? null : input;
        reactionService.createAttributeReaction(new CreateAttributeReactionRequest(ruleId, attrId, operation, actualInput, false));

        // When
        long executedActionId = entityAttributeManager.createEntityInstance(createAction());
        reactionService.executeReaction(executedActionId, customerId, List.of(ruleId));

        // Then
        assertThat(getAttributeValue(attrId, customerId).values()).isEqualTo(List.of(expected));
    }

    @Test
    public void timestamps() {
        // Given
        long customerId = login();
        ZonedDateTime now = ZonedDateTime.now();
        long attrId = createCustomerAttributeAndSetValue("DATE", customerId, now.toString());
        long ruleId = createRule("%d = %s".formatted(attrId, now));

        reactionService.createAttributeReaction(new CreateAttributeReactionRequest(ruleId, attrId, "SET_NOW", null, false));

        // When
        long executedActionId = entityAttributeManager.createEntityInstance(createAction());
        reactionService.executeReaction(executedActionId, customerId, List.of(ruleId));

        // Then
        List<String> values = getAttributeValue(attrId, customerId).values();
        assertThat(values.size()).isEqualTo(1);
        assertThat(ZonedDateTime.parse(values.getFirst())).isAfter(now);
    }

    @ParameterizedTest
    @CsvSource(value = {
            "PREPEND | 5    | 5,1,2,3",
            "APPEND  | 5    | 1,2,3,5",
            "REMOVE  | 2    | 1,3",
            "CLEAR   | null | ''"
    }, delimiter = '|')
    public void lists(String operation, String input, String expectedCsv) {
        // Given
        long customerId = login();
        long attrId = createCustomerAttributeList("NUMBER");
        long ruleId = createRule("%d ~ 1".formatted(attrId));
        setAttributeValue(attrId, customerId, List.of("1", "2", "3"));

        String actualInput = "null".equals(input) ? null : input;
        reactionService.createAttributeReaction(new CreateAttributeReactionRequest(ruleId, attrId, operation, actualInput, false));

        // When
        long executedActionId = entityAttributeManager.createEntityInstance(createAction());
        reactionService.executeReaction(executedActionId, customerId, List.of(ruleId));

        // Then
        List<String> expectedList = expectedCsv.isEmpty() ? List.of() : List.of(expectedCsv.split(","));
        assertThat(getAttributeValue(attrId, customerId).values()).isEqualTo(expectedList);
    }
}
