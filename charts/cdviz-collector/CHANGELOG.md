<!-- markdownlint-disable MD024-->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-03-23

### Fixed

- Bump kind to 0.31.0 (#414) ([066ce92](066ce92525b0980c01c449ccd1dee1a2a0e5a162))
- Bump cdviz-collector to 0.32.0 (#413) ([36134ed](36134ede317327f9e6a677f328bf4052583afa59))
- Bump cdviz-collector to 0.33.0 (#417) ([be8d2cb](be8d2cb1779efff3fbe698619b3a124b71c380d8))

## [1.2.0] - 2026-03-13

### Added

- Enable support to send cdevents v0.5 ([ec729b5](ec729b5640dceb34ebf3a7bf7f798a33ba6f58e8))

## [1.1.6] - 2026-03-12

### Fixed

- Bump cdviz-collector to 0.30.0 (#394) ([a3d0087](a3d0087b6a3038ee34c4f406b71430bc6f6f73b7))

## [1.1.5] - 2026-03-12

### Fixed

- Bump cdviz-collector to 0.28.0 (#384) ([c795941](c795941a411814c8cd37581b4f159802727425a8))
- Bump cdviz-collector to 0.29.0 (#389) ([0e41a70](0e41a70a9d8d0070df782da585f9b52d37cc5acf))

## [1.1.4] - 2026-03-04

### Fixed

- Bump cdviz-collector to 0.25.0 (#377) ([cd0ec29](cd0ec294c9c8521fe60fffe33adeae45cd3c36de))
- Bump cdviz-collector to 0.26.0 (#381) ([82f28e5](82f28e586b0dfcd7b652fbc0e2350f8ffe3d3a51))

## [1.1.3] - 2026-02-27

### Fixed

- Bump kubectl to 1.35.2 (#373) ([b544b31](b544b313b363ba78edd95fa5187d7d4e3b7c8659))
- Bump cdviz-collector to 0.25.0 (#371) ([14f737c](14f737ce2f00284a7c0565c59727344a430c75f4))

## [1.1.2] - 2026-02-18

### Fixed

- Typo in configuration of cdviz-collector chart (prevent to start) ([6fed0e1](6fed0e111158f434df1fcca949c81501c69ea684))

## [1.1.1] - 2026-02-17

### Changed

- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.23.0 (#354) ([f709ea7](f709ea716e35917acf58ba3e7aca2fc8a14d905b))

## [0.5.2] - 2025-12-21

### Changed

- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.19.0 ([dd58b51](dd58b512881280c03831d4b1fa7391e0839e384c))
- Update dependency kubectl to v1.35.0 (#329) ([d8817ab](d8817abd71ae7050e832a57dec7821826d2b1b53))
- Update dependency kind to v0.31.0 (#328) ([b673990](b67399041ef4258e73e3d79aaff3ceca21d3b4fb))

### Fixed

- Use explicitly bash for release script ([f9831b1](f9831b107673a0bb995f813f2218758a6ae837d2))
- Update cdviz-collector.toml ([8e17063](8e17063d216397d81c6420d49248462d2344ea76))

## [0.5.0] - 2025-10-06

### Added

- Update chart of cdviz-collector to 0.5.0 ([62e72d1](62e72d1ad5af8bbec5f988adbb4f0952f1290aa0))
- Cdviz-collector can watch k8s cluster (with kubewatch) ([30e4b28](30e4b2835d93dd6fc02b8d046c0f61345fdf8e5d))

### Changed

- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.6.3 ([3e302b6](3e302b6401c3017f915e7d9c5f4adec28b34b3b1))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.7.2 ([f760a1a](f760a1af92805ec96f7b4d77275c50cbc7329c42))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.8.0 ([3899e2d](3899e2db39944f0b142023e9d793b9b220d0b53b))
- Kubewatch integration configuration ([0f9f2ee](0f9f2ee907a67d3c279f26930d2c053f07a7a486))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.9.0 ([6267292](6267292fd5483eb5fe0df3944377f7fbde2ef1c5))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.11.0 ([35314e4](35314e41657871064496a910d8566a995094218b))
- Update configuration for cdviz-collector 0.11 ([623442f](623442f75b85eae3146688c5060a4f52d9180103))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.12.0 ([cc56593](cc56593d31059976fa06aa6023b8db758f9aced4))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.13.0 ([7675197](7675197ea80d2d9af30aa39eb04ff8974c7358b6))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.14.0 ([0eecb41](0eecb418f0f827940b13f1f98aea235fccd98ecb))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.16.0 ([0f9f2bb](0f9f2bbc7ce2e8128ad522f4b8e0933b6d0783ef))
- Chan the user:group used by cdviz-collector (from 1001 to 65532) ([3347033](334703320a746054eb0e848ecea5e08ab10c70a6))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.18.0 ([1315a94](1315a940949e07abd84ab06260688d7dc1ac1e1a))
- Upgrade cdviz-collector to 0.18.1 ([bf8badd](bf8badde6e4ce60713c9bcc3f340cb0d4b743843))

### Fixed

- Upgrade cdviz-collector to 0.7.6 ([1137e40](1137e40bae9c88db56a7f8684a0c3046607b3c74))
- Missing configuration "enabled" for kubewatch ([405a5c1](405a5c1e5614e533e0cf81033b86f2a16a8ae525))
- Update configuration of cdviz-collector for 0.10+ ([65d7381](65d73819dafb6e5fd3a817229ea953ec78c3d4db))

## [0.2.0] - 2025-02-06

### Added

- ✨ add the umbrella chart `cdviz` to deploy every components (cdviz-collector, grafana, postgresql,...) ([02186aa](02186aa378b2898d9778f26406e0ee24aed9ffdb))
- Allow to override configuration's entry with environment variable ([400b0b8](400b0b8ff7c9e1e9aab5878e46f20dc9115e1dad))
- Allow to define cdviz-collector.toml via values.yaml and override via environment variables, secrets,... ([7c3c520](7c3c520e28bb2ac27f0f69dae79ff8f6fdcf66da))
- Allow extra k8s resources to be deployed with cdviz-grafana ([1fb1e4b](1fb1e4bbbbc9c6a371ffe3ebf9527dcf0f42f0f0))
- `extraResources` defined as a map (previously an array) ([4271ef0](4271ef00b2e336a55fe806dd2e02f350320c6b0c))
- Update chart of cdviz-collector to support multiple config files ([bbcc0e3](bbcc0e3b2e81cc1701c02560c26ee24095b62218))

### Changed

- ✏️ fix typo ([efd2bd8](efd2bd84a8119f1a148ada34c9a389d94e848ff6))
- Remove cdviz-collector from the repository (moved to its own repository) ([c85cc00](c85cc0026540d3f0992cb582f458971495148906))
- Update ghcr.io/cdviz-dev/cdviz-collector docker tag to v0.4.0 ([18455bb](18455bb17f5905e7c6aa0c2a9e095263751fe1d2))

### Fixed

- 🐛 fix yaml syntax error in values.yaml (wrong auto-format) ([40b9b6b](40b9b6ba07bea5e3712e5a45011aa224e0545e0c))
- Definition of charts have missing information and wrong dependencies ([fd82128](fd8212818f804e77774684c351bbc994be40157d))

<!-- generated by git-cliff -->
