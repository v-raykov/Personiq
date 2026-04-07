package com.raykov.rules_engine.domain.customerportal;

import com.raykov.rules_engine.domain.action.ActionService;
import com.raykov.rules_engine.domain.action.ExecutedAction;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.customer.CustomerService;
import com.raykov.rules_engine.domain.item.ItemService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerPortalService {

    private final CustomerService customerService;

    private final ItemService itemService;

    private final ActionService actionService;

    public CustomerPortalService(CustomerService customerService, ItemService itemService, ActionService actionService) {
        this.customerService = customerService;
        this.itemService = itemService;
        this.actionService = actionService;
    }

    public List<AttributeValue> getAttributeValues(long customerId) {
        return customerService.getAttributeValues(customerId);
    }

    public List<EntityInstanceAttributes> getGrantedItems(long customerId) {
        return itemService.getGrantedItemsByCustomerId(customerId);
    }

    public List<ExecutedAction> getExecutedActions(long customerId) {
        return actionService.getExecutedActions()
                            .stream()
                            .filter(executedAction -> executedAction.customerId() == customerId)
                            .toList();
    }
}
