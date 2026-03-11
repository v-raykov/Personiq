package com.raykov.gateway.config.exception;

import org.springframework.http.HttpStatus;

public record ErrorResponse(HttpStatus status, String message) {

}
