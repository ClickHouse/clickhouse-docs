---
'slug': '/integrations/postgresql/inserting-data'
'title': 'How to insert data from PostgreSQL'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': 'Page describing how to insert data from PostgresSQL using ClickPipes,
  PeerDB or the Postgres table function'
---



推奨されるのは、ClickHouseにデータを挿入する際の挿入パフォーマンスを最適化するためのベストプラクティスを学ぶために [このガイド](/guides/inserting-data) を読むことです。

PostgreSQLからデータを一括読み込みするために、ユーザーは以下の方法を利用できます：

- [ClickPipes](/integrations/clickpipes/postgres) を使用すること、これはClickHouse Cloudのためのマネージドインテグレーションサービスで、現在パブリックベータ中です。こちらから [サインアップしてください](https://clickpipes.peerdb.io/)。
- `PeerDB by ClickHouse`、これはPostgreSQLデータベースのレプリケーションのために特別に設計されたETLツールで、セルフホスト型のClickHouseとClickHouse Cloudの両方に対応しています。
    - PeerDBは現在ClickHouse Cloudでネイティブに利用可能です - 我々の[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した超高速なPostgresからClickHouseへのCDC - 現在パブリックベータ中です。こちらから [サインアップしてください](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)。
- データを直接読み取るための[Postgresテーブル関数](/sql-reference/table-functions/postgresql)。これは通常、既知のウォーターマーク（例：タイムスタンプ）に基づくバッチレプリケーションが十分である場合や、単発の移行が目的である場合に適しています。このアプローチは数千万行にスケール可能です。より大きなデータセットを移行しようとするユーザーは、各リクエストがデータの一部を処理する複数のリクエストを検討すべきです。ステージングテーブルは、最終テーブルにパーティションが移動される前の各チャンクに使用できます。これにより、失敗したリクエストの再試行が可能になります。この一括読み込み戦略の詳細については、こちらを参照してください。
- データはCSV形式でPostgresからエクスポートできます。これを使用して、ローカルファイルまたはオブジェクトストレージを介してClickHouseにテーブル関数を使用して挿入することができます。
