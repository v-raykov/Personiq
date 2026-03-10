package com.raykov.rules_engine.domain.customer;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/private/customer/register")
public class RegisterCustomerController {

    private final CustomerService customerService;

    public RegisterCustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public long registerCustomer() {
        return customerService.registerCustomer();
    }

}
