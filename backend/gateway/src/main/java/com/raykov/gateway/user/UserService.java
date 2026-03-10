package com.raykov.gateway.user;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class UserService {

    private final UserDao userDao;

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public Mono<User> findByUsernameAndTenantId(String username, Long tenantId) {
        return userDao.findUserByUsernameAndTenantId(username, tenantId);
    }

}
