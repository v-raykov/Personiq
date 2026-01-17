package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.value.AttributeValueRow;
import com.raykov.rules_engine.domain.core.attribute.CreateAttributeRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public long registerCustomer() {
        return customerService.registerCustomer();
    }

    @PostMapping("/attribute")
    public long createAttribute(@RequestBody CreateAttributeRequest request) {
        return customerService.createAttribute(request.name(), request.type(), request.isList());
    }

    @GetMapping("/attribute")
    public List<Attribute> getAttributes() {
        return customerService.getAttributes();
    }

    @DeleteMapping("/attribute")
    public void deleteAttribute(@RequestParam long attributeId) {
        customerService.deleteAttribute(attributeId);
    }

    @GetMapping("/attribute/value/{attributeId}")
    public AttributeValueRow getAttributeValue(@PathVariable long attributeId,
                                               @RequestParam long customerId) {
        return customerService.getAttributeValue(attributeId, customerId);
    }

    @PostMapping("/attribute/value")
    public void updateCustomerAttributes(@RequestParam long customerId, @RequestBody Map<Long, String> attributes) {
        customerService.updateCustomerAttributes(customerId, attributes);
    }

    @DeleteMapping("/attribute/value/{attributeId}")
    public void deleteAttributeValue(@PathVariable long attributeId,
                                     @RequestParam long customerId,
                                     @RequestParam(required = false) String value) {
        customerService.deleteAttributeValue(customerId, attributeId, value);
    }

    @GetMapping("/attribute/value")
    public List<AttributeValueRow> getAllAttributeValues(@RequestParam long customerId) {
        return customerService.getAllAttributeValues(customerId);
    }
}
