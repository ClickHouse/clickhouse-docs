Send a test log with the current timestamp:

```shell
NOW_NANO="$(date +%s)000000000"

curl -i "http://localhost:4318/v1/logs" \
  -H "Content-Type: application/json" \
  --data-binary @- <<EOF
{
  "resourceLogs": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "clickstack-docs-test"}
      }]
    },
    "scopeLogs": [{
      "scope": {"name": "clickstack-docs-test"},
      "logRecords": [{
        "timeUnixNano": "${NOW_NANO}",
        "severityText": "INFO",
        "body": {"stringValue": "ClickStack ingestion test"}
      }]
    }]
  }]
}
EOF
```

If you use an existing collector, replace `http://localhost:4318` with its OTLP HTTP endpoint. If the receiver requires authentication, add the required header to the `curl` command.

A successful request returns `HTTP/1.1 200 OK`.

After a few seconds, confirm in the ClickHouse Cloud SQL console that the event reached the logs table:

```sql
SELECT Timestamp, Body
FROM default.otel_logs
WHERE Body = 'ClickStack ingestion test'
ORDER BY Timestamp DESC
LIMIT 1;
```
