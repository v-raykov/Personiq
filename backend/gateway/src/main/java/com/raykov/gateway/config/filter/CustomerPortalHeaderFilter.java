package com.raykov.gateway.config.filter;

import com.raykov.gateway.user.CustomerService;
import com.raykov.gateway.user.model.User;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomerPortalHeaderFilter extends AbstractGatewayFilterFactory<CustomerPortalHeaderFilter.Config> {

    private final CustomerService customerService;

    public CustomerPortalHeaderFilter(CustomerService customerService) {
        super(Config.class);
        this.customerService = customerService;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) ->
                ReactiveSecurityContextHolder.getContext()
                                             .map(ctx -> ((User) ctx.getAuthentication().getPrincipal()).id())
                                             .switchIfEmpty(Mono.defer(() -> {
                                                 exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                                                 return exchange.getResponse().setComplete().then(Mono.empty());
                                             }))
                                             .flatMap(userId -> chain.filter(exchange.mutate()
                                                                                     .request(r -> r.header("X-Customer-Id", String.valueOf(customerService.getCustomerIdByUserId(userId))))
                                                                                     .build()));
    }

    public static class Config {

    }
}