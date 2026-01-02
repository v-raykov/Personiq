package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.action.ActionController;
import com.raykov.rules_engine.domain.action.model.Action;
import com.raykov.rules_engine.domain.action.model.ExecutedAction;
import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.attribute.model.PutAttributeRequest;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

public class ActionsIntegrationTest extends SpringBaseTest {

    @Autowired
    private ActionController actionController;

    @Test
    public void createAction() {
        actionController.createAction("action");

        List<Action> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new Action(1L, "action", List.of()));
    }

    @Test
    public void addAttributeToAction() {
        long actionId = actionController.createAction("action");
        actionController.createActionAttribute(actionId, new PutAttributeRequest("attribute", "STRING", false));

        List<Action> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new Action(1L, "action", List.of(new Attribute(1L, "attribute", AttributeValueType.STRING, false))));
    }

    @Test
    public void executeAction() {
        long actionId = actionController.createAction("action");
        long attributeId = actionController.createActionAttribute(actionId, new PutAttributeRequest("attribute", "STRING", false));

        actionController.executeAction(actionId, 1L, Map.of(attributeId, "value"));

        List<ExecutedAction> executedActions = actionController.getExecutedActions();
        assertThat(executedActions).hasSize(1);
        List<AttributeValue> attributes = List.of(new AttributeValue(attributeId, "attribute", AttributeValueType.STRING, List.of("value"), false));
        assertThat(executedActions).containsExactly(new ExecutedAction(1L, actionId, 1L, attributes));
    }
}
