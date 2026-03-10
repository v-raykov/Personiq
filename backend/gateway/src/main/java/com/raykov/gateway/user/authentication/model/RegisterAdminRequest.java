package com.raykov.gateway.user.authentication.model;

public record RegisterAdminRequest(String username, String password, String email, String authority) {

    public RegisterAdminRequest withPassword(String password) {
        return new RegisterAdminRequest(username, password, email, authority);
    }

}
