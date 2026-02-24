package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.reaction.model.CreateAttributeReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.CreateItemReactionRequest;
import com.raykov.rules_engine.domain.reaction.model.Reaction;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/reaction")
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @PostMapping("/attribute")
    public long createAttributeReaction(@RequestBody CreateAttributeReactionRequest request) {
        return reactionService.createAttributeReaction(request);
    }

    @PostMapping("/item")
    public long createItemReaction(@RequestBody CreateItemReactionRequest request) {
        return reactionService.createItemReaction(request);
    }

    @GetMapping
    public List<Reaction> getAllReactions() {
        return reactionService.getAllReactions();
    }
}
