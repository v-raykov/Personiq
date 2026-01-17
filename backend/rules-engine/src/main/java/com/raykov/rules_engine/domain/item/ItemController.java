package com.raykov.rules_engine.domain.item;

import com.raykov.rules_engine.domain.core.EntityAttributes;
import com.raykov.rules_engine.domain.core.attribute.CreateAttributeRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/item")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public long createItem(@RequestParam String name, @RequestBody List<CreateAttributeRequest> attributes) {
        return itemService.createItem(name, attributes);
    }

    @GetMapping
    public List<EntityAttributes> getItems() {
        return itemService.getItems();
    }

    @DeleteMapping("/{itemId}")
    public void deleteItem(@PathVariable long itemId) {
        itemService.deleteItem(itemId);
    }

    @PutMapping("/{itemId}")
    public long createItemAttribute(@PathVariable long itemId, @RequestBody CreateAttributeRequest request) {
        return itemService.createItemAttribute(itemId, request.name(), request.type(), request.isList());
    }

    @DeleteMapping
    public void deleteItemAttribute(@RequestParam long attributeId) {
        itemService.deleteAttribute(attributeId);
    }

    @PostMapping("/{itemId}/grant")
    public long grantItem(@PathVariable long itemId,
                          @RequestParam long customerId,
                          @RequestBody Map<Long, String> attributes) {
        return itemService.grantItem(itemId, customerId, attributes);
    }

}
