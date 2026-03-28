package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.AttributeService;
import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.item.ItemService;
import com.raykov.rules_engine.domain.reaction.model.*;
import com.raykov.rules_engine.domain.rule.RuleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ReactionService {

    private final ReactionDao reactionDao;

    private final AttributeService attributeService;

    private final RuleService ruleService;

    private final EntityAttributeManager entityAttributeManager;

    private final ItemService itemService;

    public ReactionService(ReactionDao reactionDao, AttributeService attributeService, RuleService ruleService, EntityAttributeManager entityAttributeManager, ItemService itemService) {
        this.reactionDao = reactionDao;
        this.attributeService = attributeService;
        this.ruleService = ruleService;
        this.entityAttributeManager = entityAttributeManager;
        this.itemService = itemService;
    }

    public long createAttributeReaction(CreateAttributeReactionRequest request) {
        ruleService.getRuleById(request.ruleId());
        UpdateOperation operation = UpdateOperation.valueOf(request.operation().toUpperCase());
        Attribute attribute = entityAttributeManager.getAttributeById(request.attributeId());

        attributeService.validateTypeCompatibility(attribute.id(), operation, request.value(), request.isValueAttributeId());

        return reactionDao.createAttributeReaction(request.ruleId(), request.attributeId(), operation, request.value(), request.isValueAttributeId());
    }

    public long createItemReaction(CreateItemReactionRequest request) {
        ruleService.getRuleById(request.ruleId());
        entityAttributeManager.getEntityById(request.itemId());

        long templateItemId = entityAttributeManager.createEntityInstanceAndSetAttributeValue(request.itemId(), request.itemAttributes());

        return reactionDao.createItemReaction(request.ruleId(), templateItemId);
    }

    public List<Reaction> getAllReactions() {
        return reactionDao.getAllReactions();
    }

    public void executeReaction(long executedActionId, long customerId, List<Long> ruleIds) {
        List<AttributeReaction> attributeReactions = reactionDao.getAttributeReactionsByRuleIds(ruleIds);
        executeAttributeReactions(executedActionId, customerId, attributeReactions);

        List<ItemReaction> itemReactions = reactionDao.getItemReactionsByRuleIds(ruleIds);
        executeItemReaction(customerId, itemReactions);
    }

    private void executeItemReaction(long customerId, List<ItemReaction> itemReactions) {
        Set<Long> itemTemplatesIds = itemReactions.stream()
                                                  .map(ItemReaction::templateItemId)
                                                  .collect(Collectors.toSet());

        Map<Long, Map<Long, String>> itemTemplates = entityAttributeManager.getEntityInstancesByIds(itemTemplatesIds, EntityType.ITEM)
                                                                           .stream()
                                                                           .collect(Collectors.toMap(
                                                                                   EntityInstanceAttributes::entityId,
                                                                                   ei -> ei.attributes().stream()
                                                                                           .collect(Collectors.toMap(AttributeValue::attributeId, AttributeValue::valueAsString))
                                                                           ));

       itemTemplates.forEach((k, v) -> itemService.grantItem(k, customerId, v));
    }

    private void executeAttributeReactions(long executedActionId, long customerId, List<AttributeReaction> reactions) {
        List<Long> attributeIds = reactions.stream()
                                           .flatMap(r -> r.isValueAttributeId()
                                                         ? Stream.of(r.attributeId(), Long.parseLong(r.value()))
                                                         : Stream.of(r.attributeId()))
                                           .toList();
        if (attributeIds.isEmpty()) {
            return;
        }

        Map<Long, AttributeValue> attributeValues =
                entityAttributeManager.getAttributeValuesByIdsAndEntityInstanceIds(attributeIds, List.of(executedActionId, customerId))
                                      .stream()
                                      .collect(Collectors.toMap(AttributeValue::attributeId, av -> av));

        List<AttributeValue> updates = reactions.stream()
                                                .map(r -> r.isValueAttributeId()
                                                          ? attributeService.updateAttributeValueWithAttribute(attributeValues.get(r.attributeId()), attributeValues.get(Long.parseLong(r.value())), r.operation())
                                                          : attributeService.updateAttributeValueWithScalar(attributeValues.get(r.attributeId()), r.value(), r.operation()))
                                                .toList();

        entityAttributeManager.updateAttributeValues(updates);
    }
}