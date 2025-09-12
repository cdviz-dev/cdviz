# hadolint global ignore=DL3006,DL3007,DL3008
ARG PG_VERSION=17.5
ARG PG_MAJOR=${PG_VERSION%%.*}

#---------------------------------------------------------------------------------------------------
# checkov:skip=CKV_DOCKER_7:Ensure the base image uses a non latest version tag
# trivy:ignore:AVD-DS-0001
FROM --platform=$BUILDPLATFORM arigaio/atlas:0.36.0-community-alpine AS cdviz-db-migration
LABEL org.opencontainers.image.source="https://github.com/cdviz-dev/cdviz"
LABEL org.opencontainers.image.licenses="Apache-2.0"

# Create appuser
ENV USER=nonroot
ENV UID=10001

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid "${UID}" \
  "${USER}"

USER nonroot
HEALTHCHECK NONE

COPY --chown=$USER migrations /migrations

#---------------------------------------------------------------------------------------------------
# Create the image for the database = cloudnative-pg (postgresql + barman + ...) + timescaledb
# WARNING: the configuration "postgresql.conf" is not updated (shared_preload_libraries=timescaledb)
#   - from cli you can use `docker run ... postgres -c shared_preload_libraries=timescaledb`
#     see "Database Configuration" at [postgres - Official Image](https://hub.docker.com/_/postgres)
#   - from kubernetes, search on your operator, chart,... how to set the configuration (sorry)
#
# Based on:
# - https://github.com/cloudnative-pg/postgres-containers
# - https://docs.timescale.com/self-hosted/latest/install/installation-linux/
#
# Alternative:
# - https://github.com/clevyr/docker-cloudnativepg-timescale
# - [A Guide to Setting Up TimeScaleDB on Kubernetes | Ari Seyhun](https://theari.dev/blog/timescaledb-kubernetes/)
#
# checkov:skip=CKV_DOCKER_7:Ensure the base image uses a non latest version tag
# trivy:ignore:AVD-DS-0001
# FROM --platform=$BUILDPLATFORM ghcr.io/cloudnative-pg/postgresql:${PG_VERSION}-minimal-bookworm AS cdviz-db-pg
FROM --platform=$BUILDPLATFORM ghcr.io/cloudnative-pg/postgresql:${PG_VERSION} AS cdviz-db-pg

USER root
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]
RUN \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update -y -qq && \
  apt-get install -y -qq --no-install-recommends gnupg postgresql-common apt-transport-https lsb-release curl && \
  echo "deb https://packagecloud.io/timescale/timescaledb/debian/ $(lsb_release -c -s) main" | tee /etc/apt/sources.list.d/timescaledb.list && \
  curl -fsSL https://packagecloud.io/timescale/timescaledb/gpgkey | gpg --dearmor -o /etc/apt/trusted.gpg.d/timescaledb.gpg && \
  apt-get update -y -qq && \
  apt-get install -y -qq --no-install-recommends "timescaledb-2-postgresql-${PG_MAJOR}" "timescaledb-tools" "timescaledb-toolkit-postgresql-${PG_MAJOR}" && \
  # cleanup
  apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false curl && \
  rm /etc/apt/sources.list.d/timescaledb.list /etc/apt/trusted.gpg.d/timescaledb.gpg &&\
  rm -rf /var/lib/apt/lists/* /var/cache/* /var/log/*

USER 26
