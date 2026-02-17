-- ticket: An issue or work item created, updated, closed in a ticketing system
CREATE OR REPLACE VIEW "cdviz".ticket AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'created' THEN timestamp END) AS created_at,
    MAX(CASE WHEN "predicate" = 'updated' THEN timestamp END) AS updated_at,
    MAX(CASE WHEN "predicate" = 'closed' THEN timestamp END) AS closed_at,
    LAST(payload, timestamp) AS last_payload
FROM "cdviz".cdevents_lake
WHERE subject = 'ticket'
GROUP BY subject_id;
