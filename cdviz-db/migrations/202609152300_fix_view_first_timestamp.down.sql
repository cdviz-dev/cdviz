-- Restore the baseline definitions: MAX(...) on every predicate.
DROP FUNCTION IF EXISTS "cdviz".normalize_run_name(TEXT);

CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'pipelinerun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'taskrun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".build AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'build'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".artifact AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'packaged' THEN timestamp END) AS packaged_at,
    MAX(CASE WHEN "predicate" = 'signed' THEN timestamp END) AS signed_at,
    MAX(CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
    MAX(CASE WHEN "predicate" = 'downloaded' THEN timestamp END) AS downloaded_at,
    MAX(CASE WHEN "predicate" = 'deleted' THEN timestamp END) AS deleted_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'artifact'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".incident AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'detected' THEN timestamp END) AS detected_at,
    MAX(CASE WHEN "predicate" = 'reported' THEN timestamp END) AS reported_at,
    MAX(CASE WHEN "predicate" = 'resolved' THEN timestamp END) AS resolved_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'incident'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    MAX(CASE WHEN "predicate" = 'skipped' THEN timestamp END) AS skipped_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcaserun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".testsuiterun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testsuiterun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".ticket AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'created' THEN timestamp END) AS created_at,
    MAX(CASE WHEN "predicate" = 'updated' THEN timestamp END) AS updated_at,
    MAX(CASE WHEN "predicate" = 'closed' THEN timestamp END) AS closed_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'ticket'
GROUP BY
    subject_id;
