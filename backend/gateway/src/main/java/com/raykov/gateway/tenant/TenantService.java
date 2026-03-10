package com.raykov.gateway.tenant;

import com.raykov.gateway.user.authentication.AuthenticationService;
import com.raykov.gateway.user.authentication.model.RegisterCustomerRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Optional;

@Service
public class TenantService {

    private final TenantDao tenantDao;

    private final RestTemplate restTemplate;

    private final String rulesEngineUri;

    public TenantService(String rulesEngineUri, TenantDao tenantDao, RestTemplate restTemplate) {
        this.tenantDao = tenantDao;
        this.restTemplate = restTemplate;
        this.rulesEngineUri = rulesEngineUri;
    }

    /**
     * This method cannot guarantee full transactionality due to depending on a Distributed transaction.
     * Same thing goes for {@link AuthenticationService#registerCustomer(RegisterCustomerRequest, Long)}
     * or any other methods that use restTemplate inside this project
     */
    @Transactional
    public long createTenant(String tenantUriName) {
        long id = tenantDao.createTenant(tenantUriName);

        String url = UriComponentsBuilder.fromUriString(rulesEngineUri)
                                         .path("/private/tenant/{id}")
                                         .buildAndExpand(id)
                                         .toUriString();

        restTemplate.postForEntity(url, null, Void.class);
        return id;
    }

    public List<String> getTenants() {
        return tenantDao.getTenantUriNames();
    }

    public Optional<Long> getTenantIdByUri(String tenantUri) {
        return tenantDao.getTenantIdByUri(tenantUri);
    }
}
