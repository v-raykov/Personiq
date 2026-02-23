package com.raykov.rules_engine.domain.core.attribute;

import com.raykov.rules_engine.domain.core.attribute.model.AttributeValue;
import com.raykov.rules_engine.domain.core.attribute.operation.AttributeOperation;
import com.raykov.rules_engine.domain.core.attribute.operation.UpdateOperation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Stream;

@Service
public class AttributeService {

    private final AttributeTypeCompatibilityService typeCompatibilityService;

    AttributeService(AttributeTypeCompatibilityService typeCompatibilityService) {
        this.typeCompatibilityService = typeCompatibilityService;
    }

    public void validateTypeCompatibility(Long id, AttributeOperation operation, String value, boolean valueAttributeId) {
        typeCompatibilityService.validate(id, operation, value, valueAttributeId);
    }

    public AttributeValue updateAttributeValueWithScalar(AttributeValue target, String scalar, UpdateOperation operation) {
        List<String> current = target.values();

        List<String> result = switch (operation) {
            case ADDITION -> List.of(new BigDecimal(current.getFirst()).add(new BigDecimal(scalar)).toString());
            case SUBTRACTION -> List.of(new BigDecimal(current.getFirst()).subtract(new BigDecimal(scalar)).toString());
            case MULTIPLICATION -> List.of(new BigDecimal(current.getFirst()).multiply(new BigDecimal(scalar)).toString());
            case DIVISION -> List.of(new BigDecimal(current.getFirst()).divide(new BigDecimal(scalar), MathContext.DECIMAL128).toString());
            case INCREMENT -> List.of(new BigDecimal(current.getFirst()).add(BigDecimal.ONE).toString());
            case DECREMENT -> List.of(new BigDecimal(current.getFirst()).subtract(BigDecimal.ONE).toString());
            case CONCATENATION -> List.of(current.getFirst() + scalar);
            case SET_TRUE -> List.of("true");
            case SET_FALSE -> List.of("false");
            case FLIP -> List.of(String.valueOf(!Boolean.parseBoolean(current.getFirst())));
            case SET_NOW -> List.of(ZonedDateTime.now().toString());
            case SET -> List.of(scalar);
            case APPEND -> Stream.concat(current.stream(), Stream.of(scalar)).toList();
            case PREPEND -> Stream.concat(Stream.of(scalar), current.stream()).toList();
            case REMOVE -> current.stream().filter(v -> !v.equals(scalar)).toList();
            case CLEAR -> List.of();
        };

        return target.withUpdatedValue(result);
    }

    public AttributeValue updateAttributeValueWithAttribute(AttributeValue target, AttributeValue parameter, UpdateOperation operation) {
        List<String> current = target.values();
        List<String> modifier = parameter.values();

        if (target.isList()) {
            List<String> result = switch (operation) {
                case APPEND -> Stream.concat(current.stream(), modifier.stream()).toList();
                case PREPEND -> Stream.concat(modifier.stream(), current.stream()).toList();
                case REMOVE -> current.stream().filter(v -> !modifier.contains(v)).toList();
                case CLEAR -> List.of();
                default -> throw new IllegalStateException("Unexpected value: " + operation);
            };
            return target.withUpdatedValue(result);
        }

        return updateAttributeValueWithScalar(target, modifier.getFirst(), operation);
    }
}
