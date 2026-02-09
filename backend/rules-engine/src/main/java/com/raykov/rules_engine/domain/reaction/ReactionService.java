package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.AttributeService;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.rule.RuleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ReactionService {

    private final ReactionDao reactionDao;

    private final AttributeService attributeService;

    private final RuleService ruleService;

    private final EntityAttributeManager entityAttributeManager;

    public ReactionService(ReactionDao reactionDao, AttributeService attributeService, RuleService ruleService, EntityAttributeManager entityAttributeManager) {
        this.reactionDao = reactionDao;
        this.attributeService = attributeService;
        this.ruleService = ruleService;
        this.entityAttributeManager = entityAttributeManager;
    }

    public long createReaction(CreateReactionRequest request) {
        ruleService.getRuleById(request.ruleId());
        UpdateOperation operation = UpdateOperation.valueOf(request.operation().toUpperCase());
        Attribute attribute = entityAttributeManager.getAttributeById(request.attributeId());

        attributeService.validateTypeCompatibility(attribute.id(), operation, request.value(), request.isValueAttributeId());

        return reactionDao.createReaction(request.ruleId(), request.attributeId(), operation, request.value(), request.isValueAttributeId());
    }

    public List<Reaction> getAllReactions() {
        return reactionDao.getAllReactions();
    }

    public void executeReaction(long executedActionId, long customerId, List<Long> ruleIds) {
        List<Reaction> reactions = reactionDao.getReactionsByRuleIds(ruleIds);
        List<Long> attributeIds = reactions.stream()
                                           .flatMap(r -> r.isValueAttributeId()
                                                         ? Stream.of(r.attributeId(), Long.parseLong(r.value()))
                                                         : Stream.of(r.attributeId()))
                                           .toList();
        if (attributeIds.isEmpty()) {
            return;
        }
//        Map<Long, AttributeValue> attributes = entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, List.of(customerId, executedActionId));
//
//        reactions.forEach(r -> {
//            if (r.isValueAttributeId()) {
//                attributeService.updateAttributeValueWithScalar(attributes.get(r.attributeId()), r.value(), r.operation());
//            } else {
//                attributeService.updateAttributeValueWithAttribute(attributes.get(r.attributeId()), attributes.get(Long.parseLong(r.value())), r.operation());
//            }
//        });

        List<AttributeValue> targetContext = entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, List.of(customerId));
        List<AttributeValue> sourceContext = entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, List.of(executedActionId));

        Map<Long, List<Reaction>> reactionsByTarget = reactions.stream()
                                                               .collect(Collectors.groupingBy(Reaction::attributeId));

        Map<Long, AttributeValue> sourceLookup = sourceContext.stream()
                                                              .collect(Collectors.toMap(AttributeValue::attributeId, v -> v));

        List<AttributeValue> updates = targetContext.stream()
                                                    .filter(target -> reactionsByTarget.containsKey(target.attributeId()))
                                                    .flatMap(target -> reactionsByTarget
                                                            .get(target.attributeId())
                                                            .stream()
                                                            .map(r -> r.isValueAttributeId()
                                                                      ? attributeService.updateAttributeValueWithScalar(target, r.value(), r.operation())
                                                                      : attributeService.updateAttributeValueWithAttribute(target, sourceLookup.get(Long.parseLong(r.value())), r.operation())))
                                                    .toList();
        // TODO: fix

        // entityAttributeManager.updateAttributeValues(updates);
    }
}