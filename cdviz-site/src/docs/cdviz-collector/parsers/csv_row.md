# CSV Parser

Parse CSV files with one message per data row.

## Configuration

```toml
parser = "csv_row"
```

## Behavior

- First row treated as header (column names → JSON keys)
- One message per data row; all values are strings
- Empty rows are skipped

## Output

Input `deployments.csv`:

```csv
timestamp,service,version
2024-01-15T10:00:00Z,api-gateway,1.2.3
2024-01-15T10:15:00Z,user-service,2.1.0
```

Output (2 messages):

```json
{"timestamp": "2024-01-15T10:00:00Z", "service": "api-gateway", "version": "1.2.3"}
{"timestamp": "2024-01-15T10:15:00Z", "service": "user-service", "version": "2.1.0"}
```

## Example

```toml
[sources.deployment_history.extractor]
type = "opendal"
kind = "fs"
polling_interval = "5m"
path_patterns = ["**/deployments.csv"]
parser = "csv_row"
parameters = { root = "/var/exports" }
```

## CLI Usage

```bash
cdviz-collector send --data @data.csv --input-parser csv_row
```
