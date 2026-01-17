package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.entity.EntityType;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import com.raykov.rules_engine.domain.reaction.operation.UpdateOperation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReactionService {

    private final EntityAttributeManager entityAttributeManager;

    private final ReactionDao reactionDao;

    public ReactionService(EntityAttributeManager entityAttributeManager, ReactionDao reactionDao) {
        this.entityAttributeManager = entityAttributeManager;
        this.reactionDao = reactionDao;
    }

    public long createReaction(CreateReactionRequest request) {
        UpdateOperation operation = UpdateOperation.valueOf(request.operation().toUpperCase());
        entityAttributeManager.getEntityById(request.actionId(), EntityType.ACTION);
        Attribute attribute = entityAttributeManager.getAttributeById(request.attributeId());

        if (!operation.isValidOperationForAttributeType(attribute.valueType())) {
            throw new IllegalArgumentException("Invalid operation for target attribute with type: " + attribute.valueType());
        }

        if (request.isValueAttributeId()) {
            Attribute parameterAttribute = entityAttributeManager.getAttributeById(request.value());
            if (parameterAttribute.valueType() != attribute.valueType()) {
                throw new IllegalArgumentException("Target and parameter attribute types have to match");
            }
        } else {
            validateOperationForParameterValue(request.value(), operation);
        }

        return reactionDao.createReaction(request.actionId(), request.attributeId(), operation, request.value(), request.isValueAttributeId());
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