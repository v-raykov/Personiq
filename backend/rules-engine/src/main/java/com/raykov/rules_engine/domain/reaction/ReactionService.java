package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.attribute.operation.AttributeTypeCompatibilityService;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import com.raykov.rules_engine.domain.rule.RuleService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReactionService {

    private final EntityAttributeManager entityAttributeManager;

    private final ReactionDao reactionDao;

    private final RuleService ruleService;

    private final AttributeTypeCompatibilityService attributeTypeCompatibilityService;

    public ReactionService(EntityAttributeManager entityAttributeManager, ReactionDao reactionDao, RuleService ruleService, AttributeTypeCompatibilityService attributeTypeCompatibilityService) {
        this.entityAttributeManager = entityAttributeManager;
        this.reactionDao = reactionDao;
        this.ruleService = ruleService;
        this.attributeTypeCompatibilityService = attributeTypeCompatibilityService;
    }

    public long createReaction(CreateReactionRequest request) {
        UpdateOperation operation = UpdateOperation.valueOf(request.operation().toUpperCase());
        ruleService.getRuleById(request.ruleId());
        Attribute attribute = entityAttributeManager.getAttributeById(request.attributeId());

        attributeTypeCompatibilityService.validate(attribute.id(), operation, request.value(), request.isValueAttributeId());

        return reactionDao.createReaction(request.ruleId(), request.attributeId(), operation, request.value(), request.isValueAttributeId());
    }

    public List<Reaction> getAllReactions() {
        return reactionDao.getAllReactions();
    }

    // TODO: Make this method not shit AND date validation should have a more descriptive message
    private void validateOperationForParameterValue(String value, UpdateOperation operation) {
        try {
            switch (operation) {
                case ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, INCREMENT, DECREMENT -> new BigDecimal(value);
                case SET_FALSE, SET_TRUE, FLIP -> {
                    if (!(value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false"))) {
                        throw new IllegalArgumentException();
                    }
                }
                case SET_NOW -> {
                    if (value != null) {
                        throw new IllegalArgumentException();
                    }
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid value parameter type for operation: " + operation.name());
        }
    }
}