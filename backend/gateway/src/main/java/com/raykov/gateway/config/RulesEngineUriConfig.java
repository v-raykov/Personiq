package com.raykov.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RulesEngineUriConfig {

    @Bean(name = "rulesEngineUri")
    public String rulesEngineUri(@Value("${rules-engine.uri}") String rulesEngineUri) {
        return rulesEngineUri;
    }
}
