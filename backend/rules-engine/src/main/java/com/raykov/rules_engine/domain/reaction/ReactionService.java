package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.attribute.AttributeService;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.core.attribute.value.AttributeValue;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.rule.RuleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
public class ReactionService {

    private final ReactionDao reactionDao;

    private final AttributeService attributeService;

    private final RuleService ruleService;

    public ReactionService(ReactionDao reactionDao, AttributeService attributeService, RuleService ruleService) {
        this.reactionDao = reactionDao;
        this.attributeService = attributeService;
        this.ruleService = ruleService;
    }

    public long createReaction(CreateReactionRequest request) {
        ruleService.getRuleById(request.ruleId());
        UpdateOperation operation = UpdateOperation.valueOf(request.operation().toUpperCase());
        Attribute attribute = attributeService.getAttributeById(request.attributeId());

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
        Map<Long, AttributeValue> attributes = attributeService.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, List.of(customerId, executedActionId));
        reactions.forEach(r -> { if (r.isValueAttributeId()) {
            attributeService.updateAttributeValueWithScalar(attributes.get(r.attributeId()), r.value(), r.operation());
        } else {
            attributeService.updateAttributeValueWithAttribute(attributes.get(r.attributeId()), attributes.get(Long.parseLong(r.value())), r.operation());
        }
        });
    }
}