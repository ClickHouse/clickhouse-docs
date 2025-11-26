---
description: 'SQLite データベースに接続し、ClickHouse と SQLite 間でデータを交換するために `INSERT` および `SELECT`
  クエリを実行できます。'
sidebar_label: 'SQLite'
sidebar_position: 55
slug: /engines/database-engines/sqlite
title: 'SQLite'
doc_type: 'reference'
---



# SQLite

[SQLite](https://www.sqlite.org/index.html) データベースに接続し、`INSERT` および `SELECT` クエリを実行して、ClickHouse と SQLite 間でデータを交換できるようにします。



## データベースの作成

```sql
    CREATE DATABASE sqlite_database
    ENGINE = SQLite('db_path')
```

**エンジンパラメータ**

* `db_path` — SQLite データベースファイルのパス。


## データ型のサポート {#data_types-support}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |



## 詳細と推奨事項 {#specifics-and-recommendations}

SQLite は、データベース全体（定義、テーブル、インデックス、および実データ）をホストマシン上の 1 つのクロスプラットフォームファイルとして保存します。書き込み中、SQLite はデータベースファイル全体をロックするため、書き込み操作は逐次的に実行されます。一方で、読み取り操作は並行して実行できます。
SQLite には、サービスとしての管理（起動スクリプトなど）や、`GRANT` やパスワードに基づくアクセス制御は必要ありません。アクセス制御は、データベースファイル自体に付与されたファイルシステムのパーミッションによって行われます。



## 使用例

SQLite に接続された ClickHouse のデータベース:

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

テーブル一覧を表示します：

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

ClickHouse のテーブルから SQLite のテーブルにデータを挿入する:

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
