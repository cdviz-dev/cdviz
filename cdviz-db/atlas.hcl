// [Project Configuration | Atlas | Manage your database schema as code](https://atlasgo.io/atlas-schema/projects)
variable "local_url" {
  type = string
  default = getenv("PG_LOCAL_URL")
}

env "db-local" {
  // Declare where the schema definition resides.
  // Also supported: ["file://multi.hcl", "file://schema.hcl"].
  src = "file://src/schema.sql"
  migration {
    // URL where the migration directory resides.
    dir = "file://migrations"
  }
  // Define the URL of the database which is managed
  // in this environment.
  url = var.local_url

  // Define the URL of the Dev Database for this environment
  // See: https://atlasgo.io/concepts/dev-database
  //
  // but the shared_preload_libraries is not set => failed to load extensions.
  // dev = "docker+postgres://ghcr.io/cdviz-dev/cdviz-db-pg:latest/dev?search_path=public"
  dev = var.local_url
}
