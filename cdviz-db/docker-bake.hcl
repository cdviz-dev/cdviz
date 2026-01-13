group "default" { // build all targets in the group
  targets = ["cdviz-db-migration"]
}

variable "MIGRATION_VERSION" {
  default = "0.0.0"
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
