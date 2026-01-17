package com.raykov.rules_engine.domain.reaction;

import com.raykov.rules_engine.domain.reaction.model.CreateReactionRequest;
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

    @PostMapping
    public long createReaction(@RequestBody CreateReactionRequest request) {
        return reactionService.createReaction(request);
    }

    @GetMapping
    public List<Reaction> getAllReactions() {
        return reactionService.getAllReactions();
    }
}
