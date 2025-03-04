group "default" { // build all targets in the group
  targets = ["cdviz-db-migration", "cdviz-db-pg"]
}

variable "MIGRATION_VERSION" {
  default = "0.0.0"
}

variable "PG_VERSION" {
  default = "17.4"
}

target "cdviz-db-migration" {
  target = "cdviz-db-migration"
  tags = [
    "ghcr.io/cdviz-dev/cdviz-db-migration:${MIGRATION_VERSION}",
    "ghcr.io/cdviz-dev/cdviz-db-migration:latest",
  ]
  output = [
    {type="image" , compression="zstd", oci-mediatypes="true"},
  ]
  attest = [
    {type = "provenance", mode="max"},
    {type = "sbom"},
  ]
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]
}

target "cdviz-db-pg" {
  target = "cdviz-db-pg"
  args = {
    PG_VERSION = PG_VERSION,
  }
  tags = [
    "ghcr.io/cdviz-dev/cdviz-db-pg:${PG_VERSION}",
    "ghcr.io/cdviz-dev/cdviz-db-pg:latest",
  ]
  output = [
    {type="image" , compression="zstd", oci-mediatypes="true"},
  ]
  attest = [
    {type = "provenance", mode="max"},
    {type = "sbom"},
  ]
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]
}
