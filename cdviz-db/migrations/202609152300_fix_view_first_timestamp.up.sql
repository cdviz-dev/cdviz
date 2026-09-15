-- Lifecycle-start timestamps must be the FIRST occurrence, not the last.
--
-- Every view created by the baseline used MAX(...) for every predicate. That is correct
-- for terminal/latest-state predicates, but wrong for the start of a single instance:
-- upstreams re-deliver lifecycle events (GitHub sends `workflow_run.in_progress` once per
-- job pick-up, a REST backfill re-emits `change.created`/`ticket.created` on every pass),
-- so MAX picked the LAST re-delivery. A pipeline queued at T, started at T+4s and finished
-- at T+13m was reported as 13m queued / 31s running.
--
-- Rule: when `subject.id` identifies ONE instance/run, a lifecycle-start predicate is
-- MIN; when it identifies a long-lived entity (`service`), MAX stays correct because it
-- expresses the current state. `cdviz.graph_nodes.first_seen_at` already follows this.

-- pipelineRun: An instance of a pipeline queued, started, finished
CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'pipelinerun'
GROUP BY
    subject_id;

-- taskRun: An instance of a task started, finished
CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'taskrun'
GROUP BY
    subject_id;

-- build: A software build queued, started, finished
CREATE OR REPLACE VIEW "cdviz".build AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'build'
GROUP BY
    subject_id;

-- artifact: An artifact produced by a build packaged, signed, published, downloaded, deleted
-- packaged/signed/published happen once per artifact version (and are re-emitted by
-- backfill); downloaded genuinely repeats, so its MAX (last download) is kept.
CREATE OR REPLACE VIEW "cdviz".artifact AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'packaged' THEN timestamp END) AS packaged_at,
    MIN(CASE WHEN "predicate" = 'signed' THEN timestamp END) AS signed_at,
    MIN(CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
    MAX(CASE WHEN "predicate" = 'downloaded' THEN timestamp END) AS downloaded_at,
    MAX(CASE WHEN "predicate" = 'deleted' THEN timestamp END) AS deleted_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'artifact'
GROUP BY
    subject_id;

-- incident: A problem in a production environment detected, reported, resolved
CREATE OR REPLACE VIEW "cdviz".incident AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'detected' THEN timestamp END) AS detected_at,
    MIN(CASE WHEN "predicate" = 'reported' THEN timestamp END) AS reported_at,
    MAX(CASE WHEN "predicate" = 'resolved' THEN timestamp END) AS resolved_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'incident'
GROUP BY
    subject_id;

-- testCaseRun: The execution of a software testCase queued, started, finished, skipped
CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    MAX(CASE WHEN "predicate" = 'skipped' THEN timestamp END) AS skipped_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcaserun'
GROUP BY
    subject_id;

-- testSuiteRun: The execution of a software testSuite queued, started, finished
CREATE OR REPLACE VIEW "cdviz".testsuiterun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testsuiterun'
GROUP BY
    subject_id;

-- ticket: An issue or work item created, updated, closed in a ticketing system
-- `ticket.created` is re-emitted by every REST backfill pass, hence MIN.
CREATE OR REPLACE VIEW "cdviz".ticket AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'created' THEN timestamp END) AS created_at,
    MAX(CASE WHEN "predicate" = 'updated' THEN timestamp END) AS updated_at,
    MAX(CASE WHEN "predicate" = 'closed' THEN timestamp END) AS closed_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'ticket'
GROUP BY
    subject_id;

-- Collapse run-instance noise in pipeline/task display names so dashboards can group them.
--
-- Some tools append a per-run token to the workflow/job name: Dependabot uses `#1234`,
-- others append a bare git sha (`@3f2a1b9`, or just `3f2a1b9`). Without collapsing, every
-- run becomes its own row in the execution table (which is `GROUP BY name ... LIMIT 20`).
--
-- Applied at query time rather than at ingest so it also fixes data already stored, and so
-- the raw name stays available in `payload`. The `#...` output matches what the collector's
-- `normalize_names` VRL transformer already writes, so both paths collapse to the same key.
--
-- Deliberately NOT collapsed, because they are meaningful matrix axes rather than noise:
-- tokens containing `.`, `-` or `_` (`v1.2.3`, `3.11`, `ubuntu-22.04`, `x86_64`), short
-- tokens (`CI 2026`), and tokens whose digits only trail the letters (`python3`, `node18`,
-- `ubuntu24`, `win2019`). A token is treated as random only when a digit is *followed* by a
-- letter somewhere (`a1b2c3`) — a shape versions and platform names do not have. A trailing
-- lowercase-hex token of 7+ chars is a sha, but only when it contains a digit, so English
-- words that happen to be hex (`deadbeef`, `defaced`) survive.
-- Known limits: a purely trailing-digit token (`build 123456`) and an all-letters random
-- token are left alone; both are indistinguishable from legitimate names.
CREATE OR REPLACE FUNCTION "cdviz".normalize_run_name(name TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $$
    SELECT
        -- 4. trailing token (>= 6) interleaving digits and letters: `build a1b2c3`
        REGEXP_REPLACE(
            -- 3. trailing lowercase-hex token with a digit (>= 7 chars): a bare sha
            REGEXP_REPLACE(
                -- 2. git sha in the display name, attached (`deploy@3f2a1b9`) or spaced
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        -- 1. `#1234` -> `#...` (idempotent over an already-collapsed `#...`)
                        REGEXP_REPLACE(name, '(\s#)[0-9A-Za-z.]+', '\1...', 'g'),
                        '(\s@)[0-9A-Za-z][0-9A-Za-z._-]*', '\1...', 'g'
                    ),
                    '(@)[0-9a-f]{7,40}(?![0-9A-Za-z])', '\1...', 'g'
                ),
                '\s(?=[0-9a-f]{7,40}$)(?=[0-9a-f]*[0-9])[0-9a-f]+$', ' ...', ''
            ),
            '\s(?=[0-9A-Za-z]{6,}$)(?=[0-9A-Za-z]*[0-9][0-9A-Za-z]*[A-Za-z])[0-9A-Za-z]+$',
            ' ...',
            ''
        )
$$;

COMMENT ON FUNCTION "cdviz".normalize_run_name(TEXT) IS
'Collapse per-run tokens (#1234, @<sha>, trailing random alnum) in a pipeline/task name so runs of the same definition group together.';
