-- Revert outcome column addition from testcaserun and testcasesuite views
-- This reverts the views to their original structure from baseline migration

-- testSuiteRun: Remove outcome column (revert to baseline) and change filter & name
CREATE OR REPLACE VIEW "cdviz".testcasesuite AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcasesuite'
GROUP BY
    subject_id;

DROP VIEW "cdviz".testsuiterun;
