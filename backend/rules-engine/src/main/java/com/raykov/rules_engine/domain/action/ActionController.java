package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.action.model.Action;
import com.raykov.rules_engine.domain.action.model.ExecutedAction;
import com.raykov.rules_engine.domain.attribute.model.PutAttributeRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/action")
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping
    public long createAction(@RequestParam String name) {
        return actionService.createAction(name);
    }

    @GetMapping
    public List<Action> getActions() {
        return actionService.getActions();
    }

    @DeleteMapping("/{actionId}")
    public void deleteAction(@PathVariable long actionId) {
        actionService.deleteAction(actionId);
    }

    @PutMapping("/{actionId}")
    public void createActionAttribute(@PathVariable long actionId, @RequestBody PutAttributeRequest request) {
        actionService.createActionAttribute(actionId, request.name(), request.type(), request.isList());

    }

    @DeleteMapping
    public void deleteActionAttribute(@RequestParam long attributeId) {
        actionService.deleteAttribute(attributeId);
    }

    @PostMapping("/customer-update")
    public void updateCustomerAttributes(@RequestParam long customerId, @RequestBody Map<Long, String> attributes) {
        actionService.updateCustomerAttributes(customerId, attributes);
    }

    @PostMapping("/{actionId}/execute")
    public void executeAction(@PathVariable long actionId,
                              @RequestParam long customerId,
                              @RequestBody Map<Long, String> attributes) {
        actionService.executeAction(actionId, customerId, attributes);
    }

    @GetMapping("/executed")
    public List<ExecutedAction> getExecutedActions() {
        return actionService.getExecutedActions();
    }
}
