package com.raykov.rules_engine.domain.rule;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.raykov.rules_engine.domain.action.ActionService;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.Rule;
import com.raykov.rules_engine.domain.rule.model.RuleDbo;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import com.raykov.rules_engine.domain.rule.node.RuleNode;
import com.raykov.rules_engine.domain.rule.service.RuleFormatterService;
import com.raykov.rules_engine.domain.rule.service.RuleParserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RuleService {

    private final RuleParserService parser;

    private final RuleFormatterService formatter;

    private final ObjectMapper objectMapper;

    private final RuleDao ruleDao;

    private final ActionService actionService;

    public RuleService(RuleParserService parser, RuleFormatterService formatter, ObjectMapper objectMapper, RuleDao ruleDao, ActionService actionService) {
        this.parser = parser;
        this.formatter = formatter;
        this.objectMapper = objectMapper;
        this.ruleDao = ruleDao;
        this.actionService = actionService;
    }

    public long createRule(CreateRuleRequest request) {
        actionService.getActionById(request.triggerdByActionId());

        try {
            RuleNode rule = parser.parse(request.ruleExpression());

            String expression = objectMapper.writeValueAsString(rule);

            return ruleDao.createRule(request.triggerdByActionId(), expression);
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

    private Rule createRuleFromDbo(RuleDbo dbo) {
        try {
            RuleNode ruleRoot = objectMapper.readValue(dbo.expression(), RuleNode.class);
            return new Rule(dbo.id(), dbo.triggerActionId(), ruleRoot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
