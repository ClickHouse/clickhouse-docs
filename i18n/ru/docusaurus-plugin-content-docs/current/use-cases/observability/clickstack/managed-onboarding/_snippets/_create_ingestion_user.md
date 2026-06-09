Мы рекомендуем создать отдельного пользователя для коллектора вместо повторного использования `default`. Подключитесь к своему сервису через SQL-консоль и выполните:

```sql
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

:::tip
Замените пароль в приведённом выше фрагменте на надёжный.
:::

При первом использовании коллектор создаёт схему для логов, трейсов и метрик в базе данных `otel`. Дополнительные рекомендации по настройке пользователя для промышленной среды см. в разделе [Переход к промышленной эксплуатации](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed).