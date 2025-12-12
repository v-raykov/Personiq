package com.raykov.rules_engine;

import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
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
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");

        attributeController.createAttribute(OWNER_TYPE, request);

        List<String> attributes = attributeController.getAttributes(OWNER_TYPE);
        assertThat(attributes.size()).isEqualTo(1);
        assertThat(attributes.getFirst()).isEqualTo(name);

        assertThat(attributesTestDao.getAll().getFirst())
                .isEqualTo(new AttributeRow(AttributeOwnerType.CUSTOMER, name, AttributeValueType.STRING));
    }

    @Test
    public void deleteAttribute() {
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");
        attributeController.createAttribute(OWNER_TYPE, request);
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);

        attributeController.deleteAttribute(OWNER_TYPE, name);

        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(0);
    }

    @Test
    public void updateAttribute() {
        String name = "name";
        String value = "value";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);
        assertThat(attributeController.getAllAttributeValues(id, OWNER_TYPE).size()).isEqualTo(0);

        attributeController.setAttributeValue(id, OWNER_TYPE, name, value);

        List<AttributeResponseDto> values = attributeController.getAllAttributeValues(id, OWNER_TYPE);
        assertThat(values.size()).isEqualTo(1);
        assertThat(values.getFirst()).isEqualTo(new AttributeResponseDto(name, value));
    }

    @Test
    public void deleteAttribute_whenItHasSetValue() {
        String name = "name";
        PutAttributeRequest request = new PutAttributeRequest(name, "STRING");
        attributeController.createAttribute(OWNER_TYPE, request);
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);

        attributeController.setAttributeValue(1L, OWNER_TYPE, name, "value");
        assertThat(attributeController.getAllAttributeValues(1L, OWNER_TYPE).size()).isEqualTo(1);

        attributeController.deleteAttribute(OWNER_TYPE, name);
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(0);
    }

    @Test
    public void insertAttributeValueList() {
        String name = "name";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);
        assertThat(attributeController.getAllAttributeValues(id, OWNER_TYPE).size()).isEqualTo(0);

        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        List<AttributeResponseDto> values = attributeController.getAllAttributeValues(id, OWNER_TYPE);
        assertThat(values.size()).isEqualTo(3);
        assertThat(values).containsExactly(
                new AttributeResponseDto(name, "value1"),
                new AttributeResponseDto(name, "value2"),
                new AttributeResponseDto(name, "value3")
        );
    }

    @Test
    public void getAttributeValue_whenValueIsNotSet_returnsEmptyList() {
        String name = "name";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        assertThat(attributeController.getAttributes(OWNER_TYPE).size()).isEqualTo(1);

        List<AttributeResponseDto> values = attributeController.getAttributeValue(id, OWNER_TYPE, name);
        assertThat(values.size()).isEqualTo(0);
    }

    @Test
    public void deleteAttributeValue() {
        String name = "name";
        String value = "value";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, value);

        attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.empty(), name);

        List<AttributeResponseDto> values = attributeController.getAllAttributeValues(id, OWNER_TYPE);
        assertThat(values.size()).isEqualTo(0);
    }

    @Test
    public void deleteAttributeValue_fromList() {
        String name = "name";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.of(1), name);

        List<AttributeResponseDto> values = attributeController.getAllAttributeValues(id, OWNER_TYPE);
        assertThat(values.size()).isEqualTo(2);
        assertThat(values).containsExactly(
                new AttributeResponseDto(name, "value1"),
                new AttributeResponseDto(name, "value3")
        );

        assertThat(attributesTestDao.getAttributeValueListIndexes(id, AttributeOwnerType.CUSTOMER, name))
                .containsExactly(0, 1);
    }

    @Test
    public void deleteAttributeValue_fromList_withoutProvidingIndex_shouldThrow() {
        String name = "name";
        long id = 1L;

        attributeController.createAttribute(OWNER_TYPE, new PutAttributeRequest(name, "LIST_STRING"));
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value1");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value2");
        attributeController.setAttributeValue(id, OWNER_TYPE, name, "value3");

        assertThatThrownBy(() -> attributeController.deleteAttributeValue(id, OWNER_TYPE, Optional.empty(), name));
    }
}
