-- Batch variant of store_cdevent, for producers (pollers, backfills) that accumulate
-- several events before writing, so they pay one round trip instead of one per event.
--
-- Backward compatible: store_cdevent(jsonb) is untouched. This loops and CALLs it per
-- element rather than duplicating the context/type parsing logic, trading a bit of
-- per-row overhead for a single source of truth on how a cdevent is decomposed.
CREATE OR REPLACE PROCEDURE "cdviz".store_cdevents(
    cdevents jsonb []
)
AS $$
DECLARE
    cdevent jsonb;
BEGIN
    FOREACH cdevent IN ARRAY cdevents
    LOOP
        BEGIN
            CALL cdviz.store_cdevent(cdevent);
        EXCEPTION WHEN unique_violation THEN
            -- duplicate event (context_id, subject, timestamp already stored): skip it,
            -- same dedup semantics as the single-event path.
            NULL;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
