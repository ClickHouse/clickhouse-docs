import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Send a test event through the ingestion path you configured.

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

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

</TabItem>

<TabItem value="vector" label="Vector">

Send a representative event through the input of your existing Vector pipeline.

In the ClickHouse Cloud SQL console, confirm that the event reached the target table:

```sql
SELECT *
FROM logs.nginx_logs
ORDER BY time_local DESC
LIMIT 1;
```

The result should contain the event you sent. For more Vector source and transformation examples, see [Ingesting with Vector](/use-cases/observability/clickstack/ingesting-data/vector).

</TabItem>

</Tabs>
