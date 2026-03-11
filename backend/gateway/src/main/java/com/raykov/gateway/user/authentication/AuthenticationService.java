package com.raykov.gateway.user.authentication;

import com.raykov.gateway.config.security.auth.TenantAuthenticationToken;
import com.raykov.gateway.config.security.auth.TenantAwareAuthenticationManager;
import com.raykov.gateway.config.security.auth.jwt.JwtUtils;
import com.raykov.gateway.config.security.role.Authority;
import com.raykov.gateway.user.CustomerDao;
import com.raykov.gateway.user.User;
import com.raykov.gateway.user.UserDao;
import com.raykov.gateway.user.authentication.model.JwtTokenResponse;
import com.raykov.gateway.user.authentication.model.LoginRequest;
import com.raykov.gateway.user.authentication.model.RegisterAdminRequest;
import com.raykov.gateway.user.authentication.model.RegisterRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Service
public class AuthenticationService {

    private final JwtUtils jwtUtils;

    private final ReactiveAuthenticationManager authenticationManager;

    private final RestTemplate restTemplate;

    private final String rulesEngineUri;

    private final UserDao userDao;

    private final CustomerDao customerDao;

    public AuthenticationService(UserDao userDao, JwtUtils jwtUtils, TenantAwareAuthenticationManager authenticationManager, RestTemplate restTemplate, String rulesEngineUri, CustomerDao customerDao) {
        this.userDao = userDao;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.restTemplate = restTemplate;
        this.rulesEngineUri = rulesEngineUri;
        this.customerDao = customerDao;
    }

    public Mono<JwtTokenResponse> loginUser(LoginRequest details, Long tenantId) {
        var authRequest = new TenantAuthenticationToken(details.username(), details.password(), tenantId);

        return authenticationManager.authenticate(authRequest)
                                    .map(auth ->
                                                 new JwtTokenResponse(jwtUtils.generateToken(auth.getName(), ((TenantAuthenticationToken) auth).getTenantId())));
    }

    @Transactional
    public Long registerCustomer(RegisterRequest details, Long tenantId) {
        long userId = userDao.createUser(new User(details.username(), details.password(), details.email(), Authority.ROLE_CUSTOMER, tenantId));

        String url = UriComponentsBuilder.fromUriString(rulesEngineUri)
                                         .path("/private/customer/register")
                                         .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Tenant-Id", String.valueOf(tenantId));
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        Long customerId = restTemplate.postForEntity(url, entity, Long.class).getBody();

        customerDao.createCustomer(userId, customerId);
        return userId;
    }

    @Transactional
    public Long register(RegisterAdminRequest details, Long tenantId) {
        Authority authority = Authority.valueOf(details.authority());
        if (authority == Authority.ROLE_CUSTOMER) {
            return registerCustomer(new RegisterRequest(details.username(), details.password(), details.email()), tenantId);
        }

        return userDao.createUser(new User(details.username(), details.password(), details.email(), authority, tenantId));
    }
}
