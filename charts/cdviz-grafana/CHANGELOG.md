<!-- markdownlint-disable MD024-->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-02-14

### Added

- Add `max` to timeseries in execution dashboards ([77e3c7b](77e3c7b655253cd336fd2d1a2f544e0b56b284d7))

### Fixed

- Purl `pkg:oci` should not include `namespace` ([bbee859](bbee859517857adbdb76d8fe7e3c9b064a0d0cb5))
- Execution dashboard should aggregate (sum) fail/failure/error ([cc991c0](cc991c0c4500d80d2df1e29d8611c4d840f090d5))

## [1.2.0] - 2026-02-13

### Added

- `execution` dashboards provide an overview section and switch to the `cdiz-executiontable-panel` to display execution as table ([c4955f6](c4955f696ed94acdaf803ed81eb5073c216f3ac5))

### Changed

- Update the informations about the executions dashboards ([d8a14d3](d8a14d39712e218a383ea90a5542e815119411d3))

### Fixed

- Link to database schema/migrations into the documentation ([3f003d9](3f003d98511eeee05b5994a296d97433c12fd3fc))
- Don't mix package from different repository_url (and sub-namespace) in artifact timeline ([b8f6158](b8f615807a4c837cd52cbba1a95eaaf8779a4022))

## [1.0.0] - 2026-01-14

### Changed

- Update deps of cdviz-grafana ([53bee9e](53bee9e891c0844b96b92c7931ee0f310ee3c09b))

## [0.5.2] - 2025-12-21

### Added

- Feat!(grafana): use table on schema `cdviz` ([7f8cd2c](7f8cd2cd28aaa9231d627c570a5c5bb1c96398b0))
- Display custom_data into "cdevents activity" dashboards ([d6f6e7b](d6f6e7b8d5af8af2bdbd3a9ef30284369c8af92f))

### Changed

- Update doc about grafana ([820ff61](820ff6125ff0396be1d7c074411d7ea5551f7203))
- Update screenchots for execution dashboard ([8a0a33a](8a0a33a37dcd75acec9e0b426ca92c96d86a4914))
- Try to reword with a more professional tone ([4fe0261](4fe02616ea83a206174cbb27084447458bb81be7))
- Remove disclaimer about alpha/preview ([ddac4b6](ddac4b6080ab8f95a53001ea35c2bf008736f277))
- Reformat code ([f114dc3](f114dc35738afff57b26f72f3d85aea145b8b87c))
- Migrate from biome to dprint (yaml, md, json, ts, vue) ([0343c2e](0343c2e76e166f556258332ba5fb897d42911940))
- Reformat ([9f6e809](9f6e809def39036a9d730c6075f9b4874c5d9b34))

### Fixed

- Artifact_timeline handle data with a single point ([9b1538c](9b1538c573638ed9b3c433ea119858043d34ea03))
- Partial workaround in topologicalSort for "cycle" (parallele deployement of service) ([6b97cd3](6b97cd39a6b520e14be036c240c88251c9ba3e19))
- Queued info was missing in some executions dashboards ([a1e8467](a1e84674593715839d8ed86e45fb4b008f09dd4b))
- Fix linting ([555b9bd](555b9bd90fe60c9bc0d2a49f19a71460ed288f20))
- Use explicitly bash for release script ([f9831b1](f9831b107673a0bb995f813f2218758a6ae837d2))

## [0.3.0] - 2025-06-06

### Added

- Use sunburst to display cdevents'activities ([714cba3](714cba38c401d769170575c11f36e36344d3747e))
- Add dashboard for pipelinerun ([14d8ec3](14d8ec35ddba06317723eb7336e72673349261aa))
- Add dashboard for taskrun ([206a508](206a5082d11ccd272fd65568f1a0d0d948d22377))
- Introduce a dashboard to demo handling of service deployment ([b147232](b1472326c9a3c394919dffea673ce0f04462ce48))
- Add metrics and doc into the playground/demo dashboard ([92b1ea1](92b1ea1139be279adf7be9f14e1ee6959be1b82e))
- Add a dashboard to display the artifact timelines over the stages (publication, deployment,...) ([fb9b714](fb9b714c9d0d105371b62e5d7a7a2c36dd29b133))
- Feat!(grafana): generate same base dashboard for every "run/excutions" subjects ([eb50f49](eb50f498d0ae0ed21e8ee5f0f3c6eb628722d865))
- Feat!(chart): disable by default the setup of the grafana datasource (and rename it `cdviz-db`) ([caac31e](caac31e5fe4dd8cab6c2945fbe7881b18c450c3f))
- Generate artifacts's timeline with metrics ([095e4b2](095e4b2dc0bfe034ec6461b0a1f19c36a0633070))

### Changed

- Bootstrap with vitepress ([449e384](449e3841f68fb96db6d8f515831214dade383363))
- Start documentation with cdviz-collector ([05d9914](05d9914b77639dc4f6ff13917a09c219087c72b2))

### Fixed

- Enable timescale into definition of datasource ([b1b2a9d](b1b2a9ddefda7ecafd93c0049fa62de609cb5d10))
- Fix(charts)(grafana): import raw dashboards (not as a template) ([c9faaaa](c9faaaa75b88cd0ab11ec5fc1e21bd6c7dd64173))
- Sql error when dashboard's variable are empty ([3599a5e](3599a5ec7eb6bc47e44de2be12ffd22b0d0b9594))
- Syntax error in SQL query ([8985420](89854208d640f07fa8c9c7cc7f38458df00f4bb7))
- Repeat configuration for pipelines & tasks dashboard ([e6a7f41](e6a7f41f542cb97ed9854012b4e4c84413fd47f6))
- Sql query & tags ([ebf7f15](ebf7f1536e8870b852f6ce3ca329f809652508b8))
- Rename configmap of dashboard from snake_case to kebabcase ([64b834f](64b834f742df6a8c31cefb4a53c75003da8f0b53))
- Use wrong table for "executions" panel ([de81214](de8121494e99217c0f26be33bd6df59c874916dd))

## [0.2.0] - 2025-02-06

### Added

- Allow extra k8s resources to be deployed with cdviz-grafana ([1fb1e4b](1fb1e4bbbbc9c6a371ffe3ebf9527dcf0f42f0f0))
- Allow to setup a local demo k8s cluster ([796799b](796799bde24a52aa6dbd19cd075c10321dd8f4b6))
- `extraResources` defined as a map (previously an array) ([4271ef0](4271ef00b2e336a55fe806dd2e02f350320c6b0c))

### Changed

- 💄 (cdviz-grafana) add filter on cdevents activity dashboard ([daaa7f0](daaa7f0feef016e73fcdd937fe19689b9de28d6e))
- Start the landingpage (#100) ([854586c](854586c61acca9304f0dfc1c3e29e889e04b1fa7))

### Fixed

- Definition of charts have missing information and wrong dependencies ([fd82128](fd8212818f804e77774684c351bbc994be40157d))
- Integration of cdviz-grafana with grafana ([9acf578](9acf578f7dd539e08bae0aca645acfad61f164be))

<!-- generated by git-cliff -->
