package com.raykov.gateway.user.authentication.model;

public record RegisterRequest(String username, String password, String email) {

    public RegisterRequest withPassword(String password) {
        return new RegisterRequest(username, password, email);
    }

}
