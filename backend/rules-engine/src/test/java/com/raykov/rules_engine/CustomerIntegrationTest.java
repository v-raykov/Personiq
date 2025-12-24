package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.model.Attribute;
import com.raykov.rules_engine.domain.attribute.model.AttributeValueRow;
import com.raykov.rules_engine.domain.attribute.model.PutAttributeRequest;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import com.raykov.rules_engine.domain.customer.CustomerController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class CustomerIntegrationTest extends SpringBaseTest {

    @Autowired
    private CustomerController customerController;

    private static final AttributeOwnerType OWNER_TYPE = AttributeOwnerType.CUSTOMER;

    @Test
    public void createAttribute_verifyPersisted() {
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING", false);

        customerController.createAttribute(request);

        List<Attribute> attributes = customerController.getAttributes();
        assertThat(attributes).hasSize(1);
        Attribute attribute = attributes.get(0);
        assertThat(attribute.name()).isEqualTo(name);
        assertThat(attribute.ownerType()).isEqualTo(OWNER_TYPE);
        assertThat(attribute.valueType()).isEqualTo(AttributeValueType.STRING);
        assertThat(attribute.isList()).isFalse();
    }

    @Test
    public void deleteAttribute() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));
        assertThat(customerController.getAttributes()).hasSize(1);

        customerController.deleteAttribute(1L);

        assertThat(customerController.getAttributes()).isEmpty();
    }

    @Test
    public void setAndGetSingleAttributeValue() {
        String name = "name";
        String value = "values";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));

        long id = customerController.getAttributes().get(0).id();
        customerController.setAttributeValue(id, 1L, value);

        AttributeValueRow result = customerController.getAttributeValue(id, 1L);
        assertThat(result.values()).containsExactly(value);
        assertThat(result.valueType()).isEqualTo(AttributeValueType.STRING);
    }

    @Test
    public void deleteSingleAttributeValue() {
        String name = "name";
        String value = "values";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", false));

        long id = customerController.getAttributes().get(0).id();
        customerController.setAttributeValue(id, 1L, value);

        AttributeValueRow beforeDelete = customerController.getAttributeValue(id, 1L);
        assertThat(beforeDelete.values()).containsExactly(value);

        customerController.deleteAttributeValue(id, 1L, value);

        AttributeValueRow afterDelete = customerController.getAttributeValue(id, 1L);
        assertThat(afterDelete.values()).isEmpty();
    }

    @Test
    public void setAndGetListAttributeValues() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", true));

        long id = customerController.getAttributes().get(0).id();

        customerController.setAttributeValue(id, 1L, "value1");
        customerController.setAttributeValue(id, 1L, "value2");
        customerController.setAttributeValue(id, 1L, "value3");

        AttributeValueRow result = customerController.getAttributeValue(id, 1L);
        assertThat(result.values()).containsExactly("value1", "value2", "value3");
    }

    @Test
    public void deleteValueFromListAttribute() {
        String name = "name";
        customerController.createAttribute(new PutAttributeRequest(name, "STRING", true));

        long id = customerController.getAttributes().get(0).id();
        customerController.setAttributeValue(id, 1L, "value1");
        customerController.setAttributeValue(id, 1L, "value2");
        customerController.setAttributeValue(id, 1L, "value3");

        // Delete one values
        customerController.deleteAttributeValue(id, 1L, "value2");

        AttributeValueRow result = customerController.getAttributeValue(id, 1L);
        assertThat(result.values()).containsExactly("value1", "value3");
    }

    @Test
    public void createMultipleAttributesAndValues() {
        // Single-values attribute
        customerController.createAttribute(new PutAttributeRequest("name1", "STRING", false));
        long id1 = customerController.getAttributes().get(0).id();
        customerController.setAttributeValue(id1, 1L, "value");

        // List attribute
        customerController.createAttribute(new PutAttributeRequest("name2", "STRING", true));
        long id2 = customerController.getAttributes().get(1).id();
        customerController.setAttributeValue(id2, 1L, "value1");
        customerController.setAttributeValue(id2, 1L, "value2");
        customerController.setAttributeValue(id2, 1L, "value3");

        List<AttributeValueRow> allValues = customerController.getAllAttributeValues(1L);

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
        long id = customerController.getAttributes().get(0).id();

        assertThatThrownBy(() -> customerController.getAttributeValue(id, 1L));
    }
}
