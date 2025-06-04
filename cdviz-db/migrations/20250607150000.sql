-- !! Hand written migration
CREATE SCHEMA IF NOT EXISTS cdviz;

ALTER TABLE public.cdevents_lake SET SCHEMA cdviz;
ALTER PROCEDURE public.store_cdevent SET SCHEMA cdviz;
ALTER TABLE public.pipelinerun SET SCHEMA cdviz;
ALTER TABLE public.taskrun SET SCHEMA cdviz;
ALTER TABLE public.build SET SCHEMA cdviz;
ALTER TABLE public.artifact SET SCHEMA cdviz;
ALTER TABLE public.service SET SCHEMA cdviz;
ALTER TABLE public.incident SET SCHEMA cdviz;
ALTER TABLE public.testcaserun SET SCHEMA cdviz;
ALTER TABLE public.testcasesuite SET SCHEMA cdviz;
