package com.raykov.gateway.user;

import com.raykov.gateway.user.model.CustomerDto;
import com.raykov.gateway.user.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final UserService userService;

    private final CustomerDao customerDao;

    public CustomerService(UserService userService, CustomerDao customerDao) {
        this.userService = userService;
        this.customerDao = customerDao;
    }

    public List<CustomerDto> getAllCustomers(Long tenantId) {
        List<User> users = userService.getAllUsers(tenantId);
        List<Long> userIds = users.stream()
                                  .map(User::id)
                                  .collect(Collectors.toList());
        Map<Long, Long> customerIdsByUserIds = customerDao.getCustomerIdsByUserIds(userIds);
        return users.stream()
                    .map(u -> new CustomerDto(u.id(), customerIdsByUserIds.get(u.id()), u.username()))
                    .toList();
    }
}
