`default` を使い回すのではなく、collector 専用のユーザーを作成することを推奨します。SQLコンソールからサービスに接続し、次を実行してください。

```sql
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

:::tip
上のスニペット内のパスワードは、十分に強力なものに置き換えてください。
:::

collector は初回使用時に、`otel` データベース内にログ、トレース、メトリクスのスキーマを作成します。本番環境向けのユーザー設定の詳細については、[本番環境への移行](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed) を参照してください。