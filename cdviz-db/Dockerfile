# hadolint global ignore=DL3006,DL3007,DL3008

#---------------------------------------------------------------------------------------------------
# checkov:skip=CKV_DOCKER_7:Ensure the base image uses a non latest version tag
# trivy:ignore:AVD-DS-0001
FROM --platform=$BUILDPLATFORM arigaio/atlas:1.0.0-community-alpine AS cdviz-db-migration
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
