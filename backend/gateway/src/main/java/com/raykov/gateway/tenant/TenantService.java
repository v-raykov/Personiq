package com.raykov.gateway.tenant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.springframework.web.util.UriComponentsBuilder.fromUriString;

@Service
public class TenantService {

    private final TenantDao tenantDao;

    private final RestTemplate restTemplate;

    private final String rulesEngineUri;

    public TenantService(@Value("${rules-engine.uri}") String rulesEngineUri, TenantDao tenantDao, RestTemplate restTemplate) {
        this.tenantDao = tenantDao;
        this.restTemplate = restTemplate;
        this.rulesEngineUri = rulesEngineUri;
    }

    @Transactional
    public void createTenant(String tenantUriName) {
        long id = tenantDao.createTenant(tenantUriName);

        String url = fromUriString(rulesEngineUri).path("/private/tenant/{id}")
                                                  .buildAndExpand(id)
                                                  .toUriString();

        restTemplate.postForEntity(url, null, Void.class);
    }

    public List<String> getTenants() {
        return tenantDao.getTenantUriNames();
    }

    public Optional<Long> getTenantIdByUri(String tenantUri) {
        return tenantDao.getTenantIdByUri(tenantUri);
    }
}
