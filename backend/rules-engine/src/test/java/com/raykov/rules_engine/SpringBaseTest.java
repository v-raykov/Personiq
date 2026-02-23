package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.action.ActionController;
import com.raykov.rules_engine.domain.core.EntityAttributeManager;
import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.model.CreateAttributeRequest;
import com.raykov.rules_engine.domain.customer.CustomerController;
import com.raykov.rules_engine.domain.reaction.ReactionController;
import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
import com.raykov.rules_engine.domain.rule.RuleController;
import com.raykov.rules_engine.domain.rule.model.CreateRuleRequest;
import com.raykov.rules_engine.tenant.TenantController;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import static com.raykov.rules_engine.config.tenant.TenantContext.clearTenantId;
import static com.raykov.rules_engine.config.tenant.TenantContext.setTenantId;
import static java.lang.Math.abs;
import static java.lang.String.valueOf;


@SpringBootTest
public abstract class SpringBaseTest {

    @Autowired
    private TenantController tenantController;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private CustomerController customerController;

    @Autowired
    private ActionController actionController;

    @Autowired
    private RuleController ruleController;

    @Autowired
    private ReactionController reactionController;

    @Autowired
    private EntityAttributeManager entityAttributeManager;

    private long tenantId;

    static final PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("rules_engine")
            .withUrlParam("currentSchema", "master")
            .withUsername("rules_engine")
            .withPassword("rules_engine");

    static {
        postgresContainer.start();
    }

    @DynamicPropertySource
    static void registerPostgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
    }

    @BeforeEach
    void init() {
        tenantId = abs(ThreadLocalRandom.current().nextLong());
        tenantController.createTenantSchema(tenantId);
        setTenantId(valueOf(tenantId));
    }

    @AfterEach
    public void cleanup() throws SQLException {
        clearTenantId();
        try (Connection conn = dataSource.getConnection()) {
            conn.setSchema("master");
            conn.prepareStatement("DROP SCHEMA IF EXISTS tenant_" + tenantId + " CASCADE;").execute();
            conn.prepareStatement("DELETE FROM tenant_registry WHERE id = " + tenantId + ";").execute();
        }
    }

    protected long login() {
        return customerController.registerCustomer();
    }

    protected long createCustomerAttribute() {
        return createCustomerAttribute("STRING");
    }

    protected long createCustomerAttribute(String type) {
        String attributeName = "attribute" + ThreadLocalRandom.current().nextLong();
        CreateAttributeRequest request = new CreateAttributeRequest(attributeName, type, false);
        return customerController.createAttribute(request);
    }

    protected long createCustomerAttributeList(String type) {
        String attributeName = "attribute" + ThreadLocalRandom.current().nextLong();
        CreateAttributeRequest request = new CreateAttributeRequest(attributeName, type, true);
        return customerController.createAttribute(request);
    }

    protected long createCustomerAttributeAndSetValue(String type, long customerId, String value) {
        return createCustomerAttributeAndSetValue(type, customerId, List.of(value));
    }

    protected long createCustomerAttributeAndSetValue(String type, long customerId, List<String> value) {
        long attrId = createCustomerAttribute(type);
        setAttributeValue(attrId, customerId, value);
        return attrId;
    }

    protected long createAction() {
        String actionName = "action" + ThreadLocalRandom.current().nextLong();
        return actionController.createAction(actionName, null);
    }

    protected long createActionAttribute(long actionId) {
        return createActionAttribute(actionId, "STRING");
    }

    protected long createActionAttribute(long actionId, String type) {
        String attributeName = "attribute" + ThreadLocalRandom.current().nextLong();
        CreateAttributeRequest request = new CreateAttributeRequest(attributeName, type, false);
        return actionController.createActionAttribute(actionId, request);
    }

    protected long createRule(long actionId, String expression) {
        return ruleController.createRule(new CreateRuleRequest(actionId, expression));
    }

    protected long createRule(String expression) {
        return ruleController.createRule(new CreateRuleRequest(createAction(), expression));
    }

    protected long createReaction(CreateReactionRequest request) {
        return reactionController.createReaction(request);
    }

    protected void setAttributeValue(long attributeId, long entityInstanceId, List<String> value) {
        entityAttributeManager.updateAttributeValue(attributeId, entityInstanceId, value);
    }

    protected AttributeValue getAttributeValue(long attributeId, long entityInstanceId) {
        return entityAttributeManager.getAttributeValue(attributeId, entityInstanceId).orElseThrow();
    }
}