package com.raykov.gateway.user.model;

import com.raykov.gateway.config.security.role.Authority;

public record UserDto(Long id, String username, String email, Authority authority) {

    public static UserDto fromUser(User user) {
        return new UserDto(user.id(), user.username(), user.email(), user.authority());
    }

}
