package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.action.ActionController;
import com.raykov.rules_engine.domain.action.ExecutedAction;
import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;
import com.raykov.rules_engine.domain.core.attribute.PutAttributeRequest;
import com.raykov.rules_engine.domain.core.value.AttributeValue;
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
        long id = actionController.createAction("action");

        List<EntityAttributes> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new EntityAttributes(id, "action", List.of()));
    }

    @Test
    public void addAttributeToAction() {
        long actionId = actionController.createAction("action");
        long attributeId = actionController.createActionAttribute(actionId, new PutAttributeRequest("attribute", "STRING", false));

        List<EntityAttributes> actions = actionController.getActions();

        assertThat(actions).hasSize(1);
        assertThat(actions).containsExactly(new EntityAttributes(actionId,
                                                                 "action",
                                                                 List.of(new Attribute(attributeId, actionId, "attribute", AttributeValueType.STRING, false)))
        );
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
