package com.raykov.rules_engine.domain.action;

import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.PutAttributeRequest;
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
    public List<EntityAttributes> getActions() {
        return actionService.getActions();
    }

    @DeleteMapping("/{actionId}")
    public void deleteAction(@PathVariable long actionId) {
        actionService.deleteAction(actionId);
    }

    @PutMapping("/{actionId}")
    public long createActionAttribute(@PathVariable long actionId, @RequestBody PutAttributeRequest request) {
        return actionService.createActionAttribute(actionId, request.name(), request.type(), request.isList());
    }

    @DeleteMapping
    public void deleteActionAttribute(@RequestParam long attributeId) {
        actionService.deleteAttribute(attributeId);
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
