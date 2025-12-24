package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.action.model.Action;
import com.raykov.rules_engine.domain.action.model.ActionRow;
import com.raykov.rules_engine.domain.action.model.ExecutedAction;
import com.raykov.rules_engine.domain.attribute.AttributeService;
import com.raykov.rules_engine.domain.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ActionService {

    private final ActionDao actionDao;

    private final AttributeService attributeService;

    public ActionService(ActionDao actionDao, AttributeService attributeService) {
        this.actionDao = actionDao;
        this.attributeService = attributeService;
    }

    public long createAction(String name) {
        return actionDao.createAction(name);
    }

    public void deleteAction(long actionId) {
        actionDao.deleteAction(actionId);
    }

    public void createActionAttribute(long actionId, String name, String type, boolean isList) {
        long attributeId = attributeService.createAttribute(AttributeOwnerType.ACTION, name, type, isList);
        actionDao.addAttributeToAction(actionId, attributeId);
    }

    public void deleteAttribute(long attributeId) {
        attributeService.deleteAttribute(attributeId);
    }

    @Transactional
    public void executeAction(long actionId, long customerId, Map<Long, String> attributes) {
        if (!actionDao.getAllAttributeIds(actionId).equals(attributes.keySet())) {
            throw new IllegalArgumentException("Not all attributes are provided for action with id: " + actionId);
        }

        long executedActionId = actionDao.insertExecutedAction(actionId, customerId);

        attributes.forEach((attribute_id, value) ->
                                   attributeService.updateAttributeValue(executedActionId, attribute_id, value));
    }

    public List<Action> getActions() {
        List<ActionRow> actionRows = actionDao.getActions();

        Set<Long> attributeIds = actionRows.stream()
                                           .flatMap(row -> row.attributeIds().stream())
                                           .collect(Collectors.toSet());

        return actionRows.stream()
                         .map(row -> Action.fromRow(row, attributeService.getAttributesByIds(attributeIds)))
                         .toList();
    }

    public List<ExecutedAction> getExecutedActions() {
        Map<Long, ExecutedAction> actions = actionDao.getExecutedActions()
                                                     .stream()
                                                     .collect(Collectors.toMap(ExecutedAction::id, Function.identity()));

        Map<Long, List<AttributeValue>> attributeValues = attributeService.getAttributeValuesByOwnerIds(actions.keySet());

        return actions.values()
                      .stream()
                      .map(action -> action.withAttributes(attributeValues.getOrDefault(action.id(), List.of())))
                      .toList();
    }

    @Transactional
    public void updateCustomerAttributes(long customerId, Map<Long, String> attributes) {
        attributes.forEach((attribute_id, value) -> {
            long executedActionId = actionDao.insertExecutedAction(-1, customerId);
            attributeService.updateAttributeValue(customerId, attribute_id, value);
        });
    }
}
