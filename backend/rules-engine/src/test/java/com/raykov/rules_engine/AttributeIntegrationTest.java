package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.rest.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.dao.AttributeRow;
import com.raykov.rules_engine.domain.attribute.type.AttributeOwnerType;
import com.raykov.rules_engine.domain.attribute.type.AttributeValueType;
import com.raykov.rules_engine.domain.attribute.rest.AttributeController;
import com.raykov.rules_engine.domain.attribute.rest.PutAttributeRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class AttributeIntegrationTest extends SpringBaseTest {

    @Autowired
    private AttributeController attributeController;

    @Autowired
    private AttributesTestDao attributesTestDao;

    private static final String OWNER_TYPE = "CUSTOMER";

    @Test
    public void createAttribute_verifyPersisted() {
        // Given
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");

        // When
        attributeController.createAttribute(OWNER_TYPE, request);

        // Then
        List<String> attributes = attributeController.getAttributes(OWNER_TYPE);
        assertThat(attributes.size()).isEqualTo(1);
        assertThat(attributes.getFirst()).isEqualTo(name);

        assertThat(attributesTestDao.getAll().getFirst())
                .isEqualTo(new AttributeRow(AttributeOwnerType.CUSTOMER, name, AttributeValueType.STRING));
    }

    @Test
    public void deleteAttribute() {
        // Given
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");
        attributeController.createAttribute(OWNER_TYPE, request);
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);

        // When
        attributeController.deleteAttribute(OWNER_TYPE, name);

        // Then
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(0);
    }

    @Test
    public void updateAttribute() {
        // Given
        String name = "name";
        String value = "values";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);
        assertThat(attributeController.getAllAttributeValues(id, OWNER_TYPE).size()).isEqualTo(0);

        // When
        attributeController.setAttributeValue(id, OWNER_TYPE, name, value);

        // Then
        List<String> values = attributeController.getAttributeValue(id, OWNER_TYPE, name).values();
        assertThat(values.size()).isEqualTo(1);
        assertThat(values.getFirst()).isEqualTo(value);
    }

    @Test
    public void deleteAttribute_whenItHasSetValue() {
        // Given
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");
        attributeController.createAttribute(OWNER_TYPE, request);
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);
        attributeController.setAttributeValue(1L, OWNER_TYPE, name, "values");
        assertThat(attributeController.getAllAttributeValues(1L, OWNER_TYPE).size()).isEqualTo(1);

        // When
        attributeController.deleteAttribute(OWNER_TYPE, name);

        // Then
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(0);
    }

    @Test
    public void insertAttributeValueList() {
        // Given
        String name = "name";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);
        assertThat(attributeController.getAllAttributeValues(id, OWNER_TYPE).size()).isEqualTo(0);

        // When
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        // Then
        AttributeResponseDto valuesResponse = attributeController.getAttributeValue(id, OWNER_TYPE, name);
        assertThat(valuesResponse.values().size()).isEqualTo(3);
        assertThat(valuesResponse.values()).containsExactly("value1", "value2", "value3");
    }

    @Test
    public void getAttributeValue_whenValueIsNotSet_returnsEmptyList() {
        // Given
        String name = "name";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);

        // When
        AttributeResponseDto valuesResponse = attributeController.getAttributeValue(id, OWNER_TYPE, name);

        // Then
        assertThat(valuesResponse.values().size()).isEqualTo(0);
    }

    @Test
    public void deleteAttributeValue() {
        // Given
        String name = "name";
        String value = "values";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, value);

        // When
        attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.empty(), name);

        // Then
        assertThat(attributeController.getAllAttributeValues(id, OWNER_TYPE).size()).isEqualTo(0);
    }

    @Test
    public void deleteAttributeValue_fromList() {
        // Given
        String name = "name";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        // When
        attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.of(1), name);

        // Then
        List<String> values = attributeController.getAttributeValue(id, OWNER_TYPE, name).values();
        assertThat(values.size()).isEqualTo(2);
        assertThat(values).containsExactly("value1", "value3");
        assertThat(attributesTestDao.getAttributeValueListIndexes(id, AttributeOwnerType.CUSTOMER, name))
                .containsExactly(0, 1);
    }

    @Test
    public void deleteAttributeValue_fromList_withoutProvidingIndex_shouldThrow() {
        // Given
        String name = "name";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        // When & Then
        assertThatThrownBy(() -> attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.empty(), name));
    }

    @Test
    public void createSetAndGetMultipleAttributeValues() {
        // Given
        String name1 = "name1";
        String value = "value";
        long id = 1L;
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name1, "STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name1, value);

        String name2 = "name2";
        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name2, "LIST_STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name2, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name2, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name2, "value3");

        // When
        List<AttributeResponseDto> attributes = attributeController.getAllAttributeValues(id, OWNER_TYPE);

        // Then
        assertThat(attributes.size()).isEqualTo(2);
        assertThat(attributes).containsExactlyInAnyOrder(new AttributeResponseDto(name1, AttributeValueType.STRING, List.of(value)),
                                                         new AttributeResponseDto(name2, AttributeValueType.LIST_STRING, List.of("value1", "value2", "value3")));


    }
}
