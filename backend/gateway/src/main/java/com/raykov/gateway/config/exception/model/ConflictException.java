package com.raykov.gateway.config.exception.model;

public abstract class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }

}
