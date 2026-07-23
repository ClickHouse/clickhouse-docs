We recommend creating a dedicated ingestion user rather than reusing `default`.

```sql
CREATE USER `clickstack-ingest` IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON default.* TO `clickstack-ingest`;
```

:::tip
Replace the password in the snippet above with a strong value.
:::

The OpenTelemetry Collector creates the schema for logs, traces, and metrics inside the `default` database on first use. The Vector path grants this user access to its target table after creating the table. For more guidance on production user setup, see [Going to production](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed).
