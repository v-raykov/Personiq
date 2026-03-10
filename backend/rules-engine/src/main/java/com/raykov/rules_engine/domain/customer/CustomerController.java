package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.core.attribute.model.Attribute;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.CreateAttributeRequest;
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
    public AttributeValue getAttributeValue(@PathVariable long attributeId,
                                            @RequestParam long customerId) {
        return customerService.getAttributeValue(attributeId, customerId);
    }

    @PostMapping("/attribute/value")
    public void updateCustomerAttributes(@RequestParam long customerId,
                                         @RequestParam(required = false) boolean overwriteList,
                                         @RequestBody Map<Long, String> attributes) {
        customerService.updateCustomerAttributes(customerId, attributes, overwriteList);
    }

    @DeleteMapping("/attribute/value/{attributeId}")
    public void deleteAttributeValue(@PathVariable long attributeId,
                                     @RequestParam long customerId,
                                     @RequestParam(required = false) String value) {
        customerService.deleteAttributeValue(customerId, attributeId, value);
    }

    @GetMapping("/attribute/value")
    public List<AttributeValue> getAllAttributeValues(@RequestParam long customerId) {
        return customerService.getAllAttributeValues(customerId);
    }
}
