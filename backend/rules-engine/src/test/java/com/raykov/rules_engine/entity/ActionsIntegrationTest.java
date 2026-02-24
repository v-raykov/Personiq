package com.raykov.rules_engine.entity;

import com.raykov.rules_engine.SpringBaseTest;
import com.raykov.rules_engine.domain.action.ActionController;
import com.raykov.rules_engine.domain.action.ExecutedAction;
import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public class ActionsIntegrationTest extends SpringBaseTest {

    @Autowired
    private ActionController actionController;

    @Test
    public void createAction_verifyPersisted() {
        long id = actionController.createAction("action", null);

        List<EntityAttributes> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new EntityAttributes(id, "action", List.of()));
    }

    @Test
    public void addAttributeToAction() {
        long actionId = actionController.createAction("action", null);
        long attributeId = actionController.createActionAttribute(actionId, new CreateAttributeRequest("attribute", "STRING", false));

        List<EntityAttributes> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new EntityAttributes(actionId,
                                                                 "action",
                                                                 List.of(new Attribute(attributeId, actionId, "attribute", AttributeValueType.STRING, false)))
        );
    }

    @Test
    public void executeAction() {
        long customerId = login();
        long actionId = actionController.createAction("action", null);
        long attributeId = actionController.createActionAttribute(actionId, new CreateAttributeRequest("attribute", "STRING", false));

        long executedActionId = actionController.executeAction(actionId, customerId, Map.of(attributeId, "value"));


        List<ExecutedAction> executedActions = actionController.getExecutedActions();
        assertThat(executedActions).hasSize(1);

        List<AttributeValue> attributes = List.of(new AttributeValue(executedActionId, attributeId, "attribute", AttributeValueType.STRING, List.of("value"), false));
        assertThat(executedActions).containsExactly(new ExecutedAction(executedActionId, actionId, customerId, attributes));
    }

    @Test
    public void executeAction_withInvalidTargetInstanceId_shouldThrow() {
        long actionId = actionController.createAction("action", null);
        long attributeId = actionController.createActionAttribute(actionId, new CreateAttributeRequest("attribute", "STRING", false));

        assertThatThrownBy(() -> actionController.executeAction(actionId, 1L, Map.of(attributeId, "value")));
    }

    @Test
    public void createAction_includingAttributesRequest() {
        List<CreateAttributeRequest> attributes = List.of(
                new CreateAttributeRequest("attribute1", "STRING", false),
                new CreateAttributeRequest("attribute2", "NUMBER", false),
                new CreateAttributeRequest("attribute3", "STRING", true)
        );
        long actionId = actionController.createAction("action", attributes);

        List<EntityAttributes> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new EntityAttributes(actionId,
                                                                 "action",
                                                                 List.of(new Attribute(1L, actionId, "attribute1", AttributeValueType.STRING, false),
                                                                         new Attribute(2L, actionId, "attribute2", AttributeValueType.NUMBER, false),
                                                                         new Attribute(3L, actionId, "attribute3", AttributeValueType.STRING, true)))
        );
    }
}
