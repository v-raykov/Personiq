package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.domain.action.ActionService;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.reaction.ReactionService;
import com.raykov.rules_engine.domain.rule.RuleService;
import com.raykov.rules_engine.domain.rule.model.Rule;
import com.raykov.rules_engine.domain.rule.node.RuleNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActionServiceTest {

    @Mock
    private EntityAttributeManager entityAttributeManager;

    @Mock
    private RuleService ruleService;

    @Mock
    private ReactionService reactionService;

    @InjectMocks
    private ActionService actionService;

    @Test
    void executeAction_shouldTriggerReaction_whenRulesAreApplicable() {
        // Given
        long actionId = 1L;
        long customerId = 10L;
        long executedActionId = 100L;
        Map<Long, String> attrs = Map.of();

        when(entityAttributeManager.createEntityInstanceAndSetAttributeValue(actionId, customerId, attrs))
                .thenReturn(executedActionId);

        Rule mockRule = new Rule(500L, actionId, mock(RuleNode.class));
        when(ruleService.getRulesByTriggerActionId(actionId))
                .thenReturn(List.of(mockRule));

        when(ruleService.isRuleApplicable(mockRule, executedActionId, customerId))
                .thenReturn(true);

        // When
        actionService.executeAction(actionId, customerId, attrs);

        // Then
        verify(reactionService).executeReaction(executedActionId, customerId, List.of(500L));
    }

    @Test
    void executeAction_shouldNotTriggerReaction_whenRuleIsNotApplicable() {
        // Given
        long actionId = 1L;
        long customerId = 10L;
        long executedActionId = 100L;
        Rule mockRule = new Rule(500L, actionId, mock(RuleNode.class));

        when(entityAttributeManager.createEntityInstanceAndSetAttributeValue(anyLong(), anyLong(), anyMap()))
                .thenReturn(executedActionId);
        when(ruleService.getRulesByTriggerActionId(actionId))
                .thenReturn(List.of(mockRule));
        when(ruleService.isRuleApplicable(mockRule, executedActionId, customerId))
                .thenReturn(false);

        // When
        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        verify(reactionService, never()).executeReaction(anyLong(), anyLong(), anyList());
    }

    @Test
    void executeAction_shouldCollectAllApplicableRules() {
        // Given
        long actionId = 1L;
        long customerId = 10L;
        long executedActionId = 100L;
        Rule rule1 = new Rule(501L, actionId, mock(RuleNode.class));
        Rule rule2 = new Rule(502L, actionId, mock(RuleNode.class));

        when(entityAttributeManager.createEntityInstanceAndSetAttributeValue(actionId, customerId, Map.of()))
                .thenReturn(executedActionId);
        when(ruleService.getRulesByTriggerActionId(actionId))
                .thenReturn(List.of(rule1, rule2));

        when(ruleService.isRuleApplicable(rule1, executedActionId, customerId)).thenReturn(true);
        when(ruleService.isRuleApplicable(rule2, executedActionId, customerId)).thenReturn(true);

        // When
        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        verify(reactionService).executeReaction(executedActionId, customerId, List.of(501L, 502L));
    }

    @Test
    void executeAction_noApplicableRules_shouldNotInvokeReactionService() {
        // Given
        long actionId = 1L;
        long customerId = 10L;

        when(entityAttributeManager.createEntityInstanceAndSetAttributeValue(anyLong(), anyLong(), anyMap()))
                .thenReturn(100L);
        when(ruleService.getRulesByTriggerActionId(actionId))
                .thenReturn(Collections.emptyList());

        // When
        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        verifyNoInteractions(reactionService);
    }

    @Test
    void executeAction_shouldOnlyTriggerApplicableRules_whenSomeRulesFailCondition() {
        // Given
        long actionId = 1L;
        long customerId = 7L;
        long instanceId = 99L;
        Rule applicableRule = new Rule(1L, actionId, mock(RuleNode.class));
        Rule nonApplicableRule = new Rule(2L, actionId, mock(RuleNode.class));

        when(entityAttributeManager.createEntityInstanceAndSetAttributeValue(anyLong(), anyLong(), anyMap()))
                .thenReturn(instanceId);
        when(ruleService.getRulesByTriggerActionId(actionId))
                .thenReturn(List.of(applicableRule, nonApplicableRule));

        when(ruleService.isRuleApplicable(applicableRule, instanceId, customerId)).thenReturn(true);
        when(ruleService.isRuleApplicable(nonApplicableRule, instanceId, customerId)).thenReturn(false);

        // When
        actionService.executeAction(actionId, customerId, Map.of());

        // Then
        verify(reactionService).executeReaction(instanceId, customerId, List.of(1L));
        verify(reactionService, times(1)).executeReaction(anyLong(), anyLong(), anyList());
    }
}