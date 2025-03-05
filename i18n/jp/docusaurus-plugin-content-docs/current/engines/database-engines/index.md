---
slug: /engines/database-engines/
toc_folder_title: データベースエンジン
toc_priority: 27
toc_title: はじめに
---


# データベースエンジン

データベースエンジンは、テーブルを操作するためのものです。デフォルトでは、ClickHouseは[Atomic](../../engines/database-engines/atomic.md)データベースエンジンを使用しており、設定可能な[テーブルエンジン](../../engines/table-engines/index.md)と[SQLダイアレクト](../../sql-reference/syntax.md)を提供します。

以下は、利用可能なデータベースエンジンの完全なリストです。詳細についてはリンクをたどってください。

<!-- このページの目次テーブルは自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 
YAMLフロントマターのフィールドから生成されています: slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。 -->
| ページ | 説明 |
|-----|-----|
| [Replicated](/docs/engines/database-engines/replicated) | このエンジンはAtomicエンジンに基づいています。DDLログをZooKeeperに書き込み、指定されたデータベースのすべてのレプリカで実行することで、メタデータのレプリケーションをサポートします。 |
| [MySQL](/docs/engines/database-engines/mysql) | リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQLの間でデータを交換するために`INSERT`および`SELECT`クエリを実行できます。 |
| [MaterializedPostgreSQL](/docs/engines/database-engines/materialized-postgresql) | PostgreSQLデータベースからのテーブルを持つClickHouseデータベースを作成します。 |
| [Atomic](/docs/engines/database-engines/atomic) | `Atomic`エンジンは、非ブロッキングの`DROP TABLE`および`RENAME TABLE`クエリ、さらには原子的な`EXCHANGE TABLES`クエリをサポートします。`Atomic`データベースエンジンはデフォルトで使用されます。 |
| [Lazy](/docs/engines/database-engines/lazy) | 最後のアクセスから`expiration_time_in_seconds`秒間だけテーブルをRAMに保持します。Logタイプのテーブルとだけ使用できます。 |
| [PostgreSQL](/docs/engines/database-engines/postgresql) | リモートPostgreSQLサーバー上のデータベースに接続できます。 |
| [Backup](/docs/engines/database-engines/backup) | テーブル/データベースを読み取り専用モードでバックアップから瞬時に接続することを可能にします。 |
| [SQLite](/docs/engines/database-engines/sqlite) | SQLiteデータベースに接続し、ClickHouseとSQLiteの間でデータを交換するために`INSERT`および`SELECT`クエリを実行できます。 |
