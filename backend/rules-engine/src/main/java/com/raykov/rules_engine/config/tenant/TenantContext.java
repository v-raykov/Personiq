package com.raykov.rules_engine.config.tenant;

public final class TenantContext {

    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();

    public static String getTenantId() {
        return CONTEXT.get();
    }

    public static void setTenantId(String tenantId) {
        CONTEXT.set(tenantId);
    }

    public static void clearTenantId() {
        CONTEXT.remove();
    }
}