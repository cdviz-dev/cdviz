-- testSuiteRun: The execution of a software testSuite queued, started, finished
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

DROP VIEW "cdviz".testcasesuite;
