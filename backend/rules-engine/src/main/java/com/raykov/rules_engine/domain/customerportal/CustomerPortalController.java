package com.raykov.rules_engine.domain.customerportal;


import com.raykov.rules_engine.domain.action.ExecutedAction;
import com.raykov.rules_engine.domain.core.EntityInstanceAttributes;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/customer-portal")
public class CustomerPortalController {

    private final CustomerPortalService customerPortalService;

    public CustomerPortalController(CustomerPortalService customerPortalService) {
        this.customerPortalService = customerPortalService;
    }

    @GetMapping("/attribute-value")
    public List<AttributeValue> getAttributeValues(@RequestHeader("X-Customer-Id") long customerId) {
        return customerPortalService.getAttributeValues(customerId);
    }

    @GetMapping("/granted-item")
    public List<EntityInstanceAttributes> getAttributeValue(@RequestHeader("X-Customer-Id") long customerId) {
        return customerPortalService.getGrantedItems(customerId);
    }

    @GetMapping("/executed-action")
    public List<ExecutedAction> getExecutedActions(@RequestHeader("X-Customer-Id") long customerId) {
        return customerPortalService.getExecutedActions(customerId);
    }
}
