package com.raykov.rules_engine.domain.rule;

import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.domain.rule.model.RuleResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/rule")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @PostMapping
    public long createRule(@RequestBody CreateRuleRequest request) {
        return ruleService.createRule(request);
    }

    @GetMapping
    public List<RuleResponse> getRules() {
        return ruleService.getRules();
    }
}
