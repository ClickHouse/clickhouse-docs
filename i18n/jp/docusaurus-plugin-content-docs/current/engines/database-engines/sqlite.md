---
description: 'SQLiteデータベースに接続し、`INSERT`および`SELECT`クエリを実行してClickHouseとSQLite間でデータを交換します。'
sidebar_label: 'SQLite'
sidebar_position: 55
slug: /engines/database-engines/sqlite
title: 'SQLite'
---


# SQLite

[SQLite](https://www.sqlite.org/index.html)データベースに接続し、`INSERT`および`SELECT`クエリを実行してClickHouseとSQLite間でデータを交換します。

## データベースの作成 {#creating-a-database}

```sql
    CREATE DATABASE sqlite_database
    ENGINE = SQLite('db_path')
```

**エンジンパラメータ**

- `db_path` — SQLiteデータベースファイルのパス。

## データ型のサポート {#data_types-support}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

## 特徴と推奨事項 {#specifics-and-recommendations}

SQLiteは、データベース全体（定義、テーブル、インデックス、およびデータ自体）をホストマシン上の単一のクロスプラットフォームファイルとして保存します。書き込み中、SQLiteは全データベースファイルをロックするため、書き込み操作は順次実行されます。読み取り操作はマルチタスクで実行可能です。
SQLiteはサービス管理（起動スクリプトなど）や`GRANT`およびパスワードに基づくアクセス制御を必要としません。アクセス制御は、データベースファイル自体に付与されたファイルシステムの権限によって処理されます。

## 使用例 {#usage-example}

ClickHouse内のSQLiteに接続されたデータベース:

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
ClickHouseテーブルからSQLiteテーブルへのデータの挿入:

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
