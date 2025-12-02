DROP SCHEMA IF EXISTS master CASCADE;

DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name LIKE 'tenant_%'
            LOOP
                EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE;', r.schema_name);
            END LOOP;
    END;
$$;
