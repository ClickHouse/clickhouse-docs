我们建议为采集器创建一个专用用户，不要复用 `default`。通过 SQL 控制台连接到您的服务，然后运行：

```sql
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

:::tip
请将上方代码片段中的密码替换为高强度密码。
:::

collector 会在首次使用时，在 `otel` 数据库中为日志、链路追踪和指标创建 schema。有关生产环境用户设置的更多指导，请参阅[进入生产环境](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)。