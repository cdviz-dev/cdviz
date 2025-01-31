# hadolint global ignore=DL3006,DL3007

#---------------------------------------------------------------------------------------------------
# checkov:skip=CKV_DOCKER_7:Ensure the base image uses a non latest version tag
# trivy:ignore:AVD-DS-0001
FROM --platform=$BUILDPLATFORM alpine:3 AS cdviz-db
LABEL org.opencontainers.image.source="https://github.com/cdviz-dev/cdviz"
LABEL org.opencontainers.image.licenses="MIT OR Apache-2.0"

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

COPY --chown=$USER migrations /migrations
COPY --chown=$USER --chmod=555 --from=arigaio/atlas:0.30.0-community-alpine /atlas /atlas
HEALTHCHECK NONE
ENTRYPOINT ["/atlas"]
