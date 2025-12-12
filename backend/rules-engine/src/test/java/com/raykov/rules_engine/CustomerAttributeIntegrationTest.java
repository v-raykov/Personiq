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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
        customerAttributeController.createCustomerAttribute(request);
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);

        // When
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
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(0);

        // When
        customerAttributeController.setCustomerAttributeValue(customerId, name, value);

        // Then
        List<AttributeResponseDto> values = customerAttributeController.getAllCustomerAttributeValues(customerId);
        assertThat(values.size()).isEqualTo(1);
        assertThat(values.getFirst()).isEqualTo(new AttributeResponseDto(name, value));
    }

    @Test
    public void deleteCustomerAttribute_whenItHasSetValue() {
        // Given
        String name = "name";
        PutCustomerAttributeRequest request = new PutCustomerAttributeRequest(name, "STRING");
        customerAttributeController.createCustomerAttribute(request);
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        customerAttributeController.setCustomerAttributeValue(1L, name, "value");
        assertThat(customerAttributeController.getAllCustomerAttributeValues(1L).size()).isEqualTo(1);

        // When
        customerAttributeController.deleteCustomerAttribute(name);

        // Then
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(0);
    }

    @Test
    public void insertAttributeValueList() {
        // Given
        String name = "name";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "LIST_STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(0);

        // When
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value1");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value2");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value3");


        // Then
        List<AttributeResponseDto> values = customerAttributeController.getAllCustomerAttributeValues(customerId);
        assertThat(values.size()).isEqualTo(3);
        assertThat(values).containsExactly(new AttributeResponseDto(name, "value1"),
                                           new AttributeResponseDto(name, "value2"),
                                           new AttributeResponseDto(name, "value3"));
    }

    @Test
    public void getCustomerAttributeValue_whenValueIsNotSet_returnsEmptyList() {
        // Given
        String name = "name";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(0);

        // When
        List<AttributeResponseDto> values = customerAttributeController.getCustomerAttributeValue(customerId, name);

        // Then
        assertThat(values.size()).isEqualTo(0);
    }

    @Test
    public void deleteCustomerAttributeValue() {
        // Given
        String name = "name";
        String value = "value";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        customerAttributeController.setCustomerAttributeValue(customerId, name, value);
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(1);

        // When
        customerAttributeController.deleteCustomerAttributeValue(customerId, Optional.empty(), name);

        // Then
        List<AttributeResponseDto> values = customerAttributeController.getAllCustomerAttributeValues(customerId);
        assertThat(values.size()).isEqualTo(0);
    }

    @Test
    public void deleteCustomerAttributeValue_fromList() {
        // Given
        String name = "name";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "LIST_STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(0);

        customerAttributeController.setCustomerAttributeValue(customerId, name, "value1");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value2");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value3");

        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(3);

        // When
        customerAttributeController.deleteCustomerAttributeValue(customerId, Optional.of(1), name);

        // Then
        List<AttributeResponseDto> values = customerAttributeController.getAllCustomerAttributeValues(customerId);
        assertThat(values.size()).isEqualTo(2);
        assertThat(values).containsExactly(new AttributeResponseDto(name, "value1"),
                                           new AttributeResponseDto(name, "value3"));
        assertThat(attributesTestDao.getAttributeValueListIndexes(customerId, AttributeOwnerType.CUSTOMER, name))
                .containsExactly(0, 1);

    }

    @Test
    public void deleteCustomerAttributeValue_fromList_withoutProvidingIndex_shouldThrow() {
        // Given
        String name = "name";
        long customerId = 1L;

        customerAttributeController.createCustomerAttribute(new PutCustomerAttributeRequest(name, "LIST_STRING"));
        assertThat(customerAttributeController.getCustomerAttributes().size()).isEqualTo(1);
        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(0);

        customerAttributeController.setCustomerAttributeValue(customerId, name, "value1");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value2");
        customerAttributeController.setCustomerAttributeValue(customerId, name, "value3");

        assertThat(customerAttributeController.getAllCustomerAttributeValues(customerId).size()).isEqualTo(3);

        // When & Then
        assertThatThrownBy(() -> customerAttributeController.deleteCustomerAttributeValue(customerId, Optional.empty(), name));
    }
}
