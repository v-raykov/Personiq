package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.core.attribute.Attribute;
import com.raykov.rules_engine.domain.core.value.AttributeValueRow;
import com.raykov.rules_engine.domain.core.attribute.PutAttributeRequest;
import com.raykov.rules_engine.domain.core.attribute.AttributeValueType;
import com.raykov.rules_engine.domain.customer.CustomerController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class CustomerIntegrationTest extends SpringBaseTest {

    @Autowired
    private CustomerController customerController;

    @Test
    public void createAttribute_verifyPersisted() {
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING", false);

        customerController.createAttribute(request);

        List<Attribute> attributes = customerController.getAttributes();
        assertThat(attributes).hasSize(1);
        Attribute attribute = attributes.getFirst();

        assertThat(attribute.name()).isEqualTo(name);
        assertThat(attribute.valueType()).isEqualTo(AttributeValueType.STRING);
        assertThat(attribute.isList()).isFalse();
    }

    @Test
    public void setAndGetSingleAttributeValue() {
        String name = "name";
        String value = "values";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));

        long customerId = login();
        long id = customerController.getAttributes().getFirst().id();
        customerController.updateCustomerAttributes(customerId, Map.of(id, value));

        AttributeValueRow result = customerController.getAttributeValue(id, customerId);
        assertThat(result.values()).containsExactly(value);
        assertThat(result.valueType()).isEqualTo(AttributeValueType.STRING);
    }

    @Test
    public void deleteSingleAttributeValue() {
        String name = "name";
        String value = "values";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));

        long customerId = login();
        long id = customerController.getAttributes().getFirst().id();
        customerController.updateCustomerAttributes(customerId, Map.of(id, value));

        AttributeValueRow beforeDelete = customerController.getAttributeValue(id, customerId);
        assertThat(beforeDelete.values()).containsExactly(value);

        customerController.deleteAttributeValue(id, customerId, value);

        AttributeValueRow afterDelete = customerController.getAttributeValue(id, customerId);
        assertThat(afterDelete.values()).isEmpty();
    }

    @Test
    public void setAndGetListAttributeValues() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", true));

        long customerId = login();
        long id = customerController.getAttributes().getFirst().id();

        customerController.updateCustomerAttributes(customerId, Map.of(id, "value1"));
        customerController.updateCustomerAttributes(customerId, Map.of(id, "value2"));
        customerController.updateCustomerAttributes(customerId, Map.of(id, "value3"));

        AttributeValueRow result = customerController.getAttributeValue(id, customerId);
        assertThat(result.values()).containsExactly("value1", "value2", "value3");
    }

    @Test
    public void deleteValueFromListAttribute() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", true));

        long customerId = login();
        long id = customerController.getAttributes().getFirst().id();
        customerController.updateCustomerAttributes(customerId, Map.of(id, "value1"));
        customerController.updateCustomerAttributes(customerId, Map.of(id, "value2"));
        customerController.updateCustomerAttributes(customerId, Map.of(id, "value3"));

        // Delete one values
        customerController.deleteAttributeValue(id, customerId, "value2");

        AttributeValueRow result = customerController.getAttributeValue(id, customerId);
        assertThat(result.values()).containsExactly("value1", "value3");
    }

    @Test
    public void createMultipleAttributesAndValues() {
        // Single-values attribute
        long customerId = login();
        long attributeId1 = customerController.createAttribute(new PutAttributeRequest("name1", "STRING", false));
        customerController.updateCustomerAttributes(customerId, Map.of(attributeId1, "value"));

        // List attribute
        long attributeId2 = customerController.createAttribute(new PutAttributeRequest("name2", "STRING", true));
        customerController.updateCustomerAttributes(customerId, Map.of(attributeId2, "value1"));
        customerController.updateCustomerAttributes(customerId, Map.of(attributeId2, "value2"));
        customerController.updateCustomerAttributes(customerId, Map.of(attributeId2, "value3"));

        List<AttributeValueRow> allValues = customerController.getAllAttributeValues(customerId);

        assertThat(allValues).hasSize(2);
        AttributeValueRow attr1 = allValues.stream()
                                           .filter(a -> a.name().equals("name1"))
                                           .findFirst()
                                           .orElseThrow();
        assertThat(attr1.values()).containsExactly("value");

        AttributeValueRow attr2 = allValues.stream()
                                           .filter(a -> a.name().equals("name2"))
                                           .findFirst()
                                           .orElseThrow();
        assertThat(attr2.values()).containsExactly("value1", "value2", "value3");
    }

    // TODO: Attributes should have default values
    @Test
    public void getAttributeValue_whenValueIsNotSet_throws() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));
        long id = customerController.getAttributes().getFirst().id();

        long customerId = login();
        assertThatThrownBy(() -> customerController.getAttributeValue(id, customerId));
    }
}
