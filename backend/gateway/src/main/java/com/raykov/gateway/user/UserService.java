package com.raykov.gateway.user;

import com.raykov.gateway.user.model.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class UserService {

    private final UserDao userDao;

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public Mono<User> findByUsernameAndTenantId(String username, Long tenantId) {
        return userDao.findUserByUsernameAndTenantId(username, tenantId);
    }

    public List<User> getAllUsers(Long tenantId) {
        return userDao.getAllUsers(tenantId);
    }
}
