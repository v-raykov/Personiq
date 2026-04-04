package com.raykov.rules_engine.domain.core.entity;

public record EntityInstance(long id, long entityId, Long targetInstanceId, String name) {

}
