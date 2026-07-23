Send a representative event through the input of your existing Vector pipeline.

In the ClickHouse Cloud SQL console, confirm that the event reached the target table:

```sql
SELECT *
FROM logs.nginx_logs
ORDER BY time_local DESC
LIMIT 1;
```

The result should contain the event you sent. For more Vector source and transformation examples, see [Ingesting with Vector](/use-cases/observability/clickstack/ingesting-data/vector).
