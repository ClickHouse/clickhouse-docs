---
description: 'SQLite データベースに接続し、ClickHouse と SQLite の間でデータを交換するための `INSERT` および `SELECT` クエリを実行できます。'
sidebar_label: 'SQLite'
sidebar_position: 55
slug: /engines/database-engines/sqlite
title: 'SQLite'
doc_type: 'reference'
---



# SQLite

[SQLite](https://www.sqlite.org/index.html) データベースに接続し、`INSERT` および `SELECT` クエリを実行して、ClickHouse と SQLite の間でデータを交換できます。



## データベースの作成 {#creating-a-database}

```sql
    CREATE DATABASE sqlite_database
    ENGINE = SQLite('db_path')
```

**エンジンパラメータ**

- `db_path` — SQLiteデータベースファイルへのパス。


## データ型のサポート {#data_types-support}

| SQLite  | ClickHouse                                          |
| ------- | --------------------------------------------------- |
| INTEGER | [Int32](../../sql-reference/data-types/int-uint.md) |
| REAL    | [Float32](../../sql-reference/data-types/float.md)  |
| TEXT    | [String](../../sql-reference/data-types/string.md)  |
| BLOB    | [String](../../sql-reference/data-types/string.md)  |


## 特性と推奨事項 {#specifics-and-recommendations}

SQLiteは、データベース全体（定義、テーブル、インデックス、およびデータそのもの）を、ホストマシン上の単一のクロスプラットフォームファイルとして保存します。書き込み時にSQLiteはデータベースファイル全体をロックするため、書き込み操作は順次実行されます。読み取り操作はマルチタスクで実行できます。
SQLiteは、サービス管理（起動スクリプトなど）や`GRANT`とパスワードに基づくアクセス制御を必要としません。アクセス制御は、データベースファイル自体に付与されたファイルシステムの権限によって処理されます。


## 使用例 {#usage-example}

SQLiteに接続されたClickHouseのデータベース:

```sql
CREATE DATABASE sqlite_db ENGINE = SQLite('sqlite.db');
SHOW TABLES FROM sqlite_db;
```

```text
┌──name───┐
│ table1  │
│ table2  │
└─────────┘
```

テーブルの表示:

```sql
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

ClickHouseテーブルからSQLiteテーブルへのデータ挿入:

```sql
CREATE TABLE clickhouse_table(`col1` String,`col2` Int16) ENGINE = MergeTree() ORDER BY col2;
INSERT INTO clickhouse_table VALUES ('text',10);
INSERT INTO sqlite_db.table1 SELECT * FROM clickhouse_table;
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
│ text  │   10 │
└───────┴──────┘
```
