# Parsers

Parsers convert file contents into JSON messages for the CDviz pipeline.

## Where Parsers Are Used

- **[`send` command](../send.md)**: Submit CI/CD artifacts directly from pipelines (`--input-parser`)
- **[OpenDAL source](../sources/opendal.md)**: Parse files from filesystem or cloud storage (`parser = "..."`)
- **[`transform` command](../transform.md)**: Batch file processing (auto-detects format)

## Quick Reference

| Parser                        | Format      | Output     | Use Case                                   |
| ----------------------------- | ----------- | ---------- | ------------------------------------------ |
| [`auto`](./auto.md)           | Auto-detect | Varies     | Default — detects format by file extension |
| [`json`](./json.md)           | JSON        | 1 message  | Single JSON object per file                |
| [`jsonl`](./jsonl.md)         | JSON Lines  | N messages | One message per line                       |
| [`csv_row`](./csv_row.md)     | CSV         | N messages | One message per row (header as keys)       |
| [`text`](./text.md)           | Plain text  | 1 message  | Entire file as `{"text": "..."}`           |
| [`text_line`](./text_line.md) | Plain text  | N messages | One message per non-empty line             |
| [`xml`](./xml.md)             | XML         | 1 message  | XML converted to JSON structure            |
| [`tap`](./tap.md)             | TAP format  | 1 message  | Test Anything Protocol results             |
| [`metadata`](./metadata.md)   | Any         | 1 message  | File metadata only (no content)            |

## Feature Flags

`xml` and `tap` parsers require feature flags in the collector build:

```bash
cargo install cdviz-collector --features parser_xml,parser_tap
```

Built-in (always available): `json`, `jsonl`, `csv_row`, `text`, `text_line`, `metadata`, `auto`

## CLI Usage

```bash
# In CI/CD pipelines
cdviz-collector send --data @junit-report.xml --input-parser xml --url $CDVIZ_URL
cdviz-collector send --data @lint-report.txt --input-parser text_line --url $CDVIZ_URL
cdviz-collector send --data @events.jsonl --input-parser jsonl --url $CDVIZ_URL
```
