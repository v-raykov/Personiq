package com.raykov.rules_engine.domain.customer.rest;

import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
import com.raykov.rules_engine.domain.customer.CustomerAttributeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("/admin/customer/attribute")
public class CustomerAttributeController {

    private final CustomerAttributeService customerAttributeService;

    public CustomerAttributeController(CustomerAttributeService customerAttributeService) {
        this.customerAttributeService = customerAttributeService;
    }

    @PostMapping
    public void createCustomerAttribute(@RequestBody PutCustomerAttributeRequest request) {
        customerAttributeService.createAttribute(request.name(), request.type());
    }

    @GetMapping
    public List<String> getCustomerAttributes() {
        return customerAttributeService.getAttributes();
    }

    @DeleteMapping
    public void deleteCustomerAttribute(@RequestParam String attributeName) {
        customerAttributeService.deleteAttribute(attributeName);
    }

    @PutMapping("/value/{attributeName}")
    public void setCustomerAttributeValue(@PathVariable String attributeName,
                                          @RequestParam long customerId,
                                          @RequestParam String value) {
        customerAttributeService.updateAttribute(customerId, attributeName, value);
    }

    @GetMapping("/value")
    public List<AttributeResponseDto> getCustomerAttributeValue(@RequestParam long customerId) {
        return customerAttributeService.getAttributeValues(customerId);
    }
}
