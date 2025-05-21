---
description: 'データベースエンジンのドキュメント'
slug: /engines/database-engines/
toc_folder_title: 'データベースエンジン'
toc_priority: 27
toc_title: 'はじめに'
title: 'データベースエンジン'
---


# データベースエンジン

データベースエンジンは、テーブルを操作するためのものです。デフォルトでは、ClickHouseは[Atomic](../../engines/database-engines/atomic.md)データベースエンジンを使用しており、構成可能な[テーブルエンジン](../../engines/table-engines/index.md)と[SQLダイアレクト](../../sql-reference/syntax.md)を提供します。

利用可能なデータベースエンジンの完全なリストは次のとおりです。詳細についてはリンクを参照してください：

<!-- このページの目次テーブルは自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド：slug、description、titleから。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->| ページ | 説明 |
|-----|-----|
| [Replicated](/engines/database-engines/replicated) | このエンジンはAtomicエンジンに基づいています。特定のデータベースのすべてのレプリカで実行されるDDLログをZooKeeperに書き込むことによって、メタデータのレプリケーションをサポートします。 |
| [MySQL](/engines/database-engines/mysql) | リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQLの間でデータを交換するために`INSERT`および`SELECT`クエリを実行することを可能にします。 |
| [MaterializedPostgreSQL](/engines/database-engines/materialized-postgresql) | PostgreSQLデータベースからテーブルを持つClickHouseデータベースを作成します。 |
| [Atomic](/engines/database-engines/atomic) | `Atomic`エンジンは、ブロッキングしない`DROP TABLE`および`RENAME TABLE`クエリ、および原子的な`EXCHANGE TABLES`クエリをサポートします。`Atomic`データベースエンジンがデフォルトで使用されます。 |
| [Lazy](/engines/database-engines/lazy) | 最後のアクセスから`expiration_time_in_seconds`秒だけ、RAMにテーブルを保持します。Logタイプのテーブルとだけ使用できます。 |
| [PostgreSQL](/engines/database-engines/postgresql) | リモートPostgreSQLサーバー上のデータベースに接続することを許可します。 |
| [Backup](/engines/database-engines/backup) | 読み取り専用モードでバックアップからテーブル/データベースを即座にアタッチすることを可能にします。 |
| [SQLite](/engines/database-engines/sqlite) | SQLiteデータベースに接続し、ClickHouseとSQLiteの間でデータを交換するために`INSERT`および`SELECT`クエリを実行することを可能にします。 |
