package com.raykov.rules_engine.domain.attribute.rest;

import com.raykov.rules_engine.domain.attribute.AttributeResponseDto;
import com.raykov.rules_engine.domain.attribute.AttributeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin/{ownerType}/attribute")
public class AttributeController {

    private final AttributeService attributeService;

    public AttributeController(AttributeService attributeService) {
        this.attributeService = attributeService;
    }

    @PostMapping
    public void createAttribute(@PathVariable String ownerType,
                                @RequestBody PutAttributeRequest request) {
        attributeService.createAttribute(ownerType, request.name(), request.type());
    }

    @GetMapping
    public List<String> getAttributes(@PathVariable String ownerType) {
        return attributeService.getAttributes(ownerType);
    }

    @DeleteMapping
    public void deleteAttribute(@PathVariable String ownerType,
                                @RequestParam String attributeName) {
        attributeService.deleteAttribute(ownerType, attributeName);
    }

    @PutMapping("/value/{attributeName}")
    public void setAttributeValue(@RequestParam long ownerId,
                                  @PathVariable String ownerType,
                                  @PathVariable String attributeName,
                                  @RequestParam String value) {
        attributeService.updateAttribute(ownerId, ownerType, attributeName, value);
    }

    @GetMapping("/value/{attributeName}")
    public List<AttributeResponseDto> getAttributeValue(@RequestParam long ownerId,
                                                        @PathVariable String ownerType,
                                                        @PathVariable String attributeName) {
        return attributeService.getAttributeValue(ownerId, ownerType, attributeName);
    }

    @DeleteMapping("/value/{attributeName}")
    public void deleteAttributeValue(@RequestParam long ownerId,
                                     @PathVariable String ownerType,
                                     @RequestParam Optional<Integer> listIndex,
                                     @PathVariable String attributeName) {
        attributeService.deleteAttributeValue(ownerId, ownerType, attributeName, listIndex);
    }

    @GetMapping("/value")
    public List<AttributeResponseDto> getAllAttributeValues(@RequestParam long ownerId,
                                                            @PathVariable String ownerType) {
        return attributeService.getAllAttributeValues(ownerId, ownerType);
    }
}

