---
slug: /engines/database-engines/
toc_folder_title: データベースエンジン
toc_priority: 27
toc_title: はじめに
---

# データベースエンジン

データベースエンジンは、テーブルを操作することを可能にします。デフォルトで、ClickHouseは[Atomic](../../engines/database-engines/atomic.md)データベースエンジンを使用し、構成可能な[テーブルエンジン](../../engines/table-engines/index.md)と[SQLダイアレクト](../../sql-reference/syntax.md)を提供します。

以下は、利用可能なデータベースエンジンの完全なリストです。詳細についてはリンクを参照してください：

<!-- このページの目次テーブルは自動的に生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLのフロントマターのフィールドから：slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->| ページ | 説明 |
|-----|-----|
| [Replicated](/engines/database-engines/replicated) | このエンジンはAtomicエンジンに基づいています。メタデータのレプリケーションをサポートし、DDLログがZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されます。 |
| [MySQL](/engines/database-engines/mysql) | リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQL間でデータを交換するために`INSERT`および`SELECT`クエリを実行することができます。 |
| [MaterializedPostgreSQL](/engines/database-engines/materialized-postgresql) | PostgreSQLデータベースからテーブルを取得して、ClickHouseデータベースを作成します。 |
| [Atomic](/engines/database-engines/atomic) | `Atomic`エンジンは、非ブロッキングの`DROP TABLE`および`RENAME TABLE`クエリ、及び原子的な`EXCHANGE TABLES`クエリをサポートします。`Atomic`データベースエンジンはデフォルトで使用されます。 |
| [Lazy](/engines/database-engines/lazy) | 最後のアクセスから`expiration_time_in_seconds`秒間のみ、テーブルをRAMに保持します。Logタイプのテーブルのみで使用できます。 |
| [PostgreSQL](/engines/database-engines/postgresql) | リモートPostgreSQLサーバー上のデータベースに接続できます。 |
| [Backup](/engines/database-engines/backup) | 読み取り専用モードでバックアップからテーブル/データベースを即座にアタッチすることを可能にします。 |
| [SQLite](/engines/database-engines/sqlite) | SQLiteデータベースに接続し、ClickHouseとSQLite間でデータを交換するために`INSERT`および`SELECT`クエリを実行することができます。 |
