package com.raykov.gateway.user.authentication.model;

public record RegisterCustomerRequest(String username, String password, String email) {

    public RegisterCustomerRequest withPassword(String password) {
        return new RegisterCustomerRequest(username, password, email);
    }

}
