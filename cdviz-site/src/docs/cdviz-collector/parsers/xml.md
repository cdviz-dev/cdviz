# XML Parser

Parse XML documents and convert them to JSON structure.

## Configuration

```toml
parser = "xml"
```

> [!IMPORTANT]
> Requires the `parser_xml` feature flag in your cdviz-collector build.

## Behavior

- Entire XML document → 1 message
- XML attributes become JSON keys prefixed with `@`
- Text content becomes `#text` key
- Multiple children with the same name become arrays

## Output

Input `junit-report.xml`:

```xml
<testsuite name="Unit Tests" tests="5" failures="1">
  <testcase name="test_auth" time="0.12"/>
</testsuite>
```

Output:

```json
{
  "testsuite": {
    "@name": "Unit Tests",
    "@tests": "5",
    "@failures": "1",
    "testcase": [{ "@name": "test_auth", "@time": "0.12" }]
  }
}
```

## Primary Use Case

```bash
# Send JUnit XML from CI/CD pipeline
npm test --reporter=jest-junit --outputFile=junit.xml
cdviz-collector send --data @junit.xml --input-parser xml --url $CDVIZ_URL
```

## Example

```toml
[sources.junit_results.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
path_patterns = ["**/TEST-*.xml", "**/junit-*.xml"]
parser = "xml"
parameters = { root = "./test-reports" }
```

## CLI Usage

```bash
cdviz-collector send --data @junit-report.xml --input-parser xml
cdviz-collector send --data @test-results.xml --input-parser auto  # auto-detect by extension
```
