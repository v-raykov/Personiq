package com.raykov.rules_engine.domain.rule;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.operation.LogicalRuleOperation;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.Rule;
import com.raykov.rules_engine.domain.rule.model.RuleDbo;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import com.raykov.rules_engine.domain.rule.node.ConditionalRuleNode;
import com.raykov.rules_engine.domain.rule.node.LogicalRuleNode;
import com.raykov.rules_engine.domain.rule.node.RuleNode;
import com.raykov.rules_engine.domain.rule.service.RuleComparisonService;
import com.raykov.rules_engine.domain.rule.service.RuleFormatterService;
import com.raykov.rules_engine.domain.rule.service.RuleParserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class RuleService {

    private final RuleParserService parser;

    private final RuleFormatterService formatter;

    private final ObjectMapper objectMapper;

    private final RuleDao ruleDao;

    private final RuleComparisonService ruleComparisonService;

    private final EntityAttributeManager entityAttributeManager;

    public RuleService(RuleParserService parser, RuleFormatterService formatter, ObjectMapper objectMapper, RuleDao ruleDao, RuleComparisonService ruleComparisonService, EntityAttributeManager entityAttributeManager) {
        this.parser = parser;
        this.formatter = formatter;
        this.objectMapper = objectMapper;
        this.ruleDao = ruleDao;
        this.ruleComparisonService = ruleComparisonService;
        this.entityAttributeManager = entityAttributeManager;
    }

    public long createRule(CreateRuleRequest request) {
        try {
            entityAttributeManager.getEntityById(request.triggeredByActionId(), EntityType.ACTION);
            RuleNode rule = parser.parse(request.ruleExpression());

            String expression = objectMapper.writeValueAsString(rule);

            return ruleDao.createRule(request.triggeredByActionId(), expression);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error encountered when parsing expression", e);
        }
    }

    public List<RuleResponse> getRules() {
        return ruleDao.getAllRules()
                      .stream()
                      .map(this::createRuleFromDbo)
                      .map(rule -> new RuleResponse(rule.id(), rule.triggerActionId(), formatter.formatExpression(rule.ruleRoot())))
                      .toList();

    }

    public Rule getRuleById(long id) {
        return ruleDao.getRuleById(id)
                      .map(this::createRuleFromDbo)
                      .orElseThrow(() -> new IllegalArgumentException("Rule with this id does not exist"));
    }

    public List<Rule> getRulesByTriggerActionId(long actionId) {
        return ruleDao.getRulesByTriggerActionId(actionId)
                      .stream()
                      .map(this::createRuleFromDbo)
                      .toList();
    }

    public boolean isRuleApplicable(Rule rule, long executedActionId, long customerId) {
        Map<Long, AttributeValue> attributeValues =
                entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(collectIds(rule.ruleRoot()), List.of(executedActionId, customerId))
                                      .stream()
                                      .collect(Collectors.toMap(AttributeValue::attributeId, av -> av));

        return evaluate(rule.ruleRoot(), attributeValues);
    }

    private boolean evaluate(RuleNode node, Map<Long, AttributeValue> attributeValues) {
        return switch (node) {
            case LogicalRuleNode log -> log.operation() == LogicalRuleOperation.AND
                                        ? evaluate(log.left(), attributeValues) && evaluate(log.right(), attributeValues)
                                        : evaluate(log.left(), attributeValues) || evaluate(log.right(), attributeValues);
            case ConditionalRuleNode cond -> cond.isValueAttributeId()
                                             ? ruleComparisonService.compareAttributes(attributeValues.get(cond.attributeId()), cond.operation(), attributeValues.get(Long.parseLong(cond.value())))
                                             : ruleComparisonService.compareScalar(attributeValues.get(cond.attributeId()), cond.operation(), cond.value());
            default -> throw new IllegalStateException("Unknown node type");
        };
    }

    private Set<Long> collectIds(RuleNode node) {
        return switch (node) {
            case LogicalRuleNode log -> Stream.concat(collectIds(log.left()).stream(), collectIds(log.right()).stream())
                                              .collect(Collectors.toUnmodifiableSet());
            case ConditionalRuleNode cond -> cond.isValueAttributeId()
                                             ? Set.of(cond.attributeId(), Long.parseLong(cond.value()))
                                             : Set.of(cond.attributeId());
            default -> Set.of();
        };
    }

    private Rule createRuleFromDbo(RuleDbo dbo) {
        try {
            RuleNode ruleRoot = objectMapper.readValue(dbo.expression(), RuleNode.class);
            return new Rule(dbo.id(), dbo.triggerActionId(), ruleRoot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
