---
'slug': '/integrations/postgresql/inserting-data'
'title': 'PostgreSQLからデータを挿入する方法'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': 'ページは、ClickPipes、PeerDB、またはPostgres テーブル関数を使用してPostgreSQLからデータを挿入する方法を説明しています。'
'doc_type': 'guide'
---

ClickHouseへのデータ挿入に最適なパフォーマンスを得るためのベストプラクティスを学ぶには、[このガイド](/guides/inserting-data)を読むことをお勧めします。

PostgreSQLからの大量データのロードには、以下の方法を使用できます。

- [ClickPipes](/integrations/clickpipes/postgres)、ClickHouse Cloudのためのマネージド統合サービスを使用する。
- `PeerDB by ClickHouse`、セルフホスティングされたClickHouseおよびClickHouse Cloud向けに特別に設計されたPostgreSQLデータベースレプリケーション用のETLツール。
- データを直接読み取るための[Postgres Table Function](/sql-reference/table-functions/postgresql)。これは通常、知られたウォーターマークに基づくバッチレプリケーション、例えばタイムスタンプが十分である場合や、一度限りの移行の場合に適しています。このアプローチは数千万行にスケールすることができます。より大きなデータセットを移行しようとするユーザーは、それぞれデータのチャンクを扱う複数のリクエストを検討すべきです。各チャンクのためにステージングテーブルを使用し、最終テーブルにパーティションを移動させる前に利用できます。これにより、失敗したリクエストを再試行できます。この大量ローディング戦略の詳細については、こちらを参照してください。
- データはCSV形式でPostgresからエクスポートできます。これにより、ローカルファイルまたはテーブル関数を使用してオブジェクトストレージ経由でClickHouseに挿入することができます。
