package com.raykov.rules_engine.domain.rule.service;

import com.raykov.rules_engine.domain.rule.node.ConditionalRuleNode;
import com.raykov.rules_engine.domain.rule.node.LogicalRuleNode;
import com.raykov.rules_engine.domain.rule.node.RuleNode;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Stack;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RuleParserService {

    public RuleNode parse(String expression) {
        List<String> tokens = tokenize(expression);
        Stack<RuleNode> nodes = new Stack<>();
        Stack<String> operators = new Stack<>();

        for (String token : tokens) {
            String t = token.trim();
            if (t.isEmpty()) continue;

            switch (t) {
                case "(" -> operators.push(t);
                case ")" -> {
                    while (!operators.peek().equals("(")) {
                        nodes.push(buildLogical(nodes, operators.pop()));
                    }
                    operators.pop();
                }
                case "&", "|" -> {
                    while (!operators.isEmpty() && !operators.peek().equals("(") && precedence(operators.peek()) >= precedence(t)) {
                        nodes.push(buildLogical(nodes, operators.pop()));
                    }
                    operators.push(t);
                }
                default -> nodes.push(parseConditional(t));
            }
        }

        while (!operators.isEmpty()) {
            nodes.push(buildLogical(nodes, operators.pop()));
        }
        return nodes.pop();
    }

    private RuleNode parseConditional(String raw) {
        Pattern p = Pattern.compile("(\\d+)(!=|>=|<=|=|>|<|~)(.+)");
        Matcher m = p.matcher(raw.replaceAll("\\s+", ""));

        if (!m.matches()) throw new IllegalArgumentException("Malformed condition: " + raw);

        long attrId = Long.parseLong(m.group(1));
        var operation = ConditionalRuleNode.RuleOperation.getBySign(m.group(2))
                                                         .orElseThrow(() -> new IllegalArgumentException(m.group(2) + " is not a valid operation sign"));
        String valPart = m.group(3);

        boolean isAttr = valPart.startsWith("attr_");
        String finalValue = isAttr ? valPart.substring(5) : valPart;

        return new ConditionalRuleNode(operation, attrId, finalValue, isAttr);
    }

    private List<String> tokenize(String expr) {
        return Arrays.asList(expr.split("(?<=[&|()])|(?=[&|()])"));
    }

    private int precedence(String op) {
        return op.equals("&") ? 2 : 1;
    }

    private RuleNode buildLogical(Stack<RuleNode> nodes, String op) {
        RuleNode right = nodes.pop();
        RuleNode left = nodes.pop();
        return new LogicalRuleNode(op.equals("&")
                                           ? LogicalRuleNode.RuleOperation.AND
                                           : LogicalRuleNode.RuleOperation.OR, left, right);
    }
}