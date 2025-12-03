package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import com.raykov.rules_engine.domain.customer.rest.CustomerAttributeController;
import com.raykov.rules_engine.domain.customer.rest.PutCustomerAttributeRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class CustomerAttributeIntegrationTest extends SpringBaseTest {

    @Autowired
    private CustomerAttributeController customerAttributeController;

    @Autowired
    private AttributesTestDao attributesTestDao;

    @Test
    public void createCustomerAttribute_verifyPersisted() {
        // Given
        String name = "name";
        PutCustomerAttributeRequest request = new PutCustomerAttributeRequest(name, "STRING");

        // When
        customerAttributeController.createCustomerAttribute(request);

        // Then
        List<String> attributes = customerAttributeController.getCustomerAttributes();
        assertThat(attributes.size()).isEqualTo(1);
        assertThat(attributes.getFirst()).isEqualTo(name);
        assertThat(attributesTestDao.getAll().getFirst()).isEqualTo(new AttributeRow(AttributeOwnerType.CUSTOMER, name, AttributeValueType.STRING));
    }

    @Test
    public void deleteCustomerAttribute() {
        // Given
        String name = "name";
        PutCustomerAttributeRequest request = new PutCustomerAttributeRequest(name, "STRING");

        // When
        customerAttributeController.createCustomerAttribute(request);
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        customerAttributeController.deleteCustomerAttribute(name);

        // Then
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(0);
    }

    @Test
    public void updateCustomerAttribute() {
        // Given
        String name = "name";
        String value = "value";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        assertThat(customerAttributeController.getCustomerAttributeValue(customerId).size()).isEqualTo(0);

        // When
        customerAttributeController.setCustomerAttributeValue(name, customerId, value);

        // Then
        List<AttributeResponseDto> values = customerAttributeController.getCustomerAttributeValue(customerId);
        assertThat(values.size()).isEqualTo(1);
        assertThat(values.getFirst()).isEqualTo(new AttributeResponseDto(name, value));
    }
}
