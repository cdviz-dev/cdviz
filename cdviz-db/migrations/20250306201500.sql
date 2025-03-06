-- !! Hand written migration

-- pipelineRun An instance of a pipeline queued, started, finished
CREATE OR REPLACE VIEW pipelinerun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN predicate = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload,
    -- pre-extracted colums (often used)
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER(WHERE predicate = 'finished') AS outcome
FROM
    cdevents_lake
WHERE
    subject = 'pipelinerun'
GROUP BY
    subject_id
;

-- taskRun An instance of a task started, finished
CREATE OR REPLACE VIEW taskrun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload,
    -- pre-extracted colums (often used)
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER(WHERE predicate = 'finished') AS outcome
FROM
    cdevents_lake
WHERE
    subject = 'taskrun'
GROUP BY
    subject_id
;

-- build A software build queued, started, finished
CREATE OR REPLACE VIEW build AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN predicate = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'build'
GROUP BY
    subject_id
;

-- artifact An artifact produced by a build packaged, signed, published, downloaded, deleted
CREATE OR REPLACE VIEW artifact AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'packaged' THEN timestamp END) AS packaged_at,
    MAX(CASE WHEN predicate = 'signed' THEN timestamp END) AS signed_at,
    MAX(CASE WHEN predicate = 'published' THEN timestamp END) AS published_at,
    MAX(CASE WHEN predicate = 'downloaded' THEN timestamp END) AS downloaded_at,
    MAX(CASE WHEN predicate = 'deleted' THEN timestamp END) AS deleted_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'artifact'
GROUP BY
    subject_id
;

-- service A service deployed, upgraded, rolledback, removed, published
CREATE OR REPLACE VIEW service AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'deployed' THEN timestamp END) AS deployed_at,
    MAX(CASE WHEN predicate = 'upgraded' THEN timestamp END) AS upgraded_at,
    MAX(CASE WHEN predicate = 'rolledback' THEN timestamp END) AS rolledback_at,
    MAX(CASE WHEN predicate = 'removed' THEN timestamp END) AS removed_at,
    MAX(CASE WHEN predicate = 'published' THEN timestamp END) AS published_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'service'
GROUP BY
    subject_id
;

-- TODO view for incident A problem in a production environment detected, reported, resolved
CREATE OR REPLACE VIEW incident AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'detected' THEN timestamp END) AS detected_at,
    MAX(CASE WHEN predicate = 'reported' THEN timestamp END) AS reported_at,
    MAX(CASE WHEN predicate = 'resolved' THEN timestamp END) AS resolved_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'incident'
GROUP BY
    subject_id
;

-- testCaseRun The execution of a software testCase queued, started, finished, skipped
CREATE OR REPLACE VIEW testcaserun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN predicate = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN timestamp END) AS finished_at,
    MAX(CASE WHEN predicate = 'skipped' THEN timestamp END) AS skipped_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'testcaserun'
GROUP BY
    subject_id
;

-- testSuiteRun The execution of a software testSuite queued, started, finished
CREATE OR REPLACE VIEW testcasesuite AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN predicate = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN predicate = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    cdevents_lake
WHERE
    subject = 'testcasesuite'
GROUP BY
    subject_id
;
