package com.raykov.rules_engine.domain.rule.service;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.entity.Entity;
import com.raykov.rules_engine.domain.rule.node.ConditionalRuleNode;
import com.raykov.rules_engine.domain.rule.node.LogicalRuleNode;
import com.raykov.rules_engine.domain.rule.node.RuleNode;
import org.springframework.stereotype.Service;

@Service
public class RuleFormatterService {

    private final EntityAttributeManager entityAttributeManager;

    public RuleFormatterService(EntityAttributeManager entityAttributeManager) {
        this.entityAttributeManager = entityAttributeManager;
    }

    public String formatExpression(RuleNode node) {
        return switch (node) {
            case LogicalRuleNode logical -> "(%s %s %s)".formatted(formatExpression(logical.left()),
                                                                   logical.operation().getSign(),
                                                                   formatExpression(logical.right()));

            case ConditionalRuleNode cond -> "%s %s %s".formatted(resolveName(cond.attributeId()),
                                                                  cond.operation().getSign(),
                                                                  cond.isValueAttributeId()
                                                                          ? resolveName(Long.parseLong(cond.value()))
                                                                          : cond.value());

            default -> throw new IllegalStateException("Unexpected rule node: " + node);
        };
    }

    private String resolveName(long id) {
        Attribute attribute = entityAttributeManager.getAttributeById(id);
        Entity entity = entityAttributeManager.getEntityById(attribute.entityId());
        return "%s.%s.%d".formatted(entity.type().name(), attribute.name(), attribute.id());
    }
}
