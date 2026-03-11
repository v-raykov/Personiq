package com.raykov.gateway.user.authentication.model;

import com.raykov.gateway.config.security.role.Authority;

public record AuthenticationContext(String username, String email, Authority authority) {

}
