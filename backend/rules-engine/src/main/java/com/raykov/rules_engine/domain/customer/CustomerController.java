package com.raykov.rules_engine.domain.customer;

import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.model.PutAttributeRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/customer-attribute")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public void createAttribute(@RequestBody PutAttributeRequest request) {
        customerService.createAttribute(request.name(), request.type(), request.isList());
    }

    @GetMapping
    public List<Attribute> getAttributes() {
        return customerService.getAttributes();
    }

    @DeleteMapping
    public void deleteAttribute(@RequestParam long attributeId) {
        customerService.deleteAttribute(attributeId);
    }

    @PutMapping("/value/{attributeId}")
    public void setAttributeValue(@PathVariable long attributeId,
                                  @RequestParam long customerId,
                                  @RequestParam String value) {
        customerService.updateAttributeValue(customerId, attributeId, value);
    }

    @GetMapping("/value/{attributeId}")
    public AttributeValueRow getAttributeValue(@PathVariable long attributeId,
                                               @RequestParam long customerId) {
        return customerService.getAttributeValue(customerId, attributeId);
    }

    @DeleteMapping("/value/{attributeId}")
    public void deleteAttributeValue(@PathVariable long attributeId,
                                     @RequestParam long customerId,
                                     @RequestParam(required = false) String value) {
        customerService.deleteAttributeValue(customerId, attributeId, value);
    }

    @GetMapping("/value")
    public List<AttributeValueRow> getAllAttributeValues(@RequestParam long ownerId) {
        return customerService.getAllAttributeValues(ownerId);
    }
}
