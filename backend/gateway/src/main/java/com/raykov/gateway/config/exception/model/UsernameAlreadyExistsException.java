package com.raykov.gateway.config.exception.model;

public class UsernameAlreadyExistsException extends ConflictException {

    public UsernameAlreadyExistsException(String username) {
        super("Username '%s' already exists".formatted(username));
    }
}
