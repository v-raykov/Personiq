package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.CreateAttributeRequest;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.reaction.ReactionService;
import com.raykov.rules_engine.domain.rule.RuleService;
import com.raykov.rules_engine.domain.rule.model.Rule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ActionService {

    private final EntityAttributeManager entityAttributeManager;

    private final RuleService ruleService;

    private final ReactionService reactionService;

    public ActionService(EntityAttributeManager entityAttributeManager, RuleService ruleService, ReactionService reactionService) {
        this.entityAttributeManager = entityAttributeManager;
        this.ruleService = ruleService;
        this.reactionService = reactionService;
    }

    public long createAction(String name, List<CreateAttributeRequest> attributes) {
        long id = entityAttributeManager.createEntity(name, EntityType.ACTION);

        if (attributes != null && !attributes.isEmpty()) {
            attributes.forEach(attribute ->
                                       entityAttributeManager.createAttribute(id, attribute.name(), attribute.type(), attribute.isList()));
        }
        return id;
    }

    public void deleteAction(long actionId) {
        entityAttributeManager.deleteEntity(actionId);
    }

    public long createActionAttribute(long actionId, String name, String type, boolean isList) {
        return entityAttributeManager.createAttribute(actionId, name, type, isList);
    }

    public void deleteAttribute(long attributeId) {
        entityAttributeManager.deleteAttribute(attributeId);
    }

    @Transactional
    public long executeAction(long actionId, long customerId, Map<Long, String> attributes) {
        long executedActionId = entityAttributeManager.createEntityInstanceAndSetAttributeValue(actionId, customerId, attributes);

        List<Long> applicableRuleIds = ruleService.getRulesByTriggerActionId(actionId)
                                                  .stream()
                                                  .filter(rule -> ruleService.isRuleApplicable(rule, executedActionId, customerId))
                                                  .map(Rule::id)
                                                  .toList();

        if (!applicableRuleIds.isEmpty()) {
            reactionService.executeReaction(executedActionId, customerId, applicableRuleIds);
        }

        return executedActionId;
    }

    public List<EntityAttributes> getActions() {
        return entityAttributeManager.getEntityAttributesByType(EntityType.ACTION);
    }

    public List<ExecutedAction> getExecutedActions() {
        return entityAttributeManager.getEntityInstancesByType(EntityType.ACTION)
                                     .stream()
                                     .map(ExecutedAction::fromEntityInstanceAttributes)
                                     .toList();
    }

    public EntityAttributes getAction(Long actionId) {
        return entityAttributeManager.getEntityAttributesById(actionId, EntityType.ACTION);
    }
}
