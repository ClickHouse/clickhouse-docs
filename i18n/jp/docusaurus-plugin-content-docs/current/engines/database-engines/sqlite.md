---
description: 'SQLite データベースに接続し、ClickHouse と SQLite 間でデータを交換するために `INSERT` および `SELECT`
  クエリを実行できます。'
sidebar_label: 'SQLite'
sidebar_position: 55
slug: /engines/database-engines/sqlite
title: 'SQLite'
doc_type: 'reference'
---

# SQLite \{#sqlite\}

[SQLite](https://www.sqlite.org/index.html) データベースに接続し、`INSERT` および `SELECT` クエリを実行して、ClickHouse と SQLite 間でデータを交換できるようにします。

## データベースの作成 \{#creating-a-database\}

```sql
    CREATE DATABASE sqlite_database
    ENGINE = SQLite('db_path')
```

**エンジンパラメータ**

* `db_path` — SQLite データベースファイルのパス。


## データ型サポート \{#data_types-support\}

下表は、ClickHouse が SQLite からスキーマを自動推論する際に使用するデフォルトの型マッピングを示します。

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| TEXT          | [UUID](../../sql-reference/data-types/uuid.md)          |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

[SQLite table engine](../../engines/table-engines/integrations/sqlite.md) を使って特定の ClickHouse 型でテーブルを明示的に定義する場合、SQLite の TEXT カラムからは次の ClickHouse 型を解釈できます。

- [Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md)
- [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md)
- [UUID](../../sql-reference/data-types/uuid.md)
- [Enum8, Enum16](../../sql-reference/data-types/enum.md)
- [Decimal32, Decimal64, Decimal128, Decimal256](../../sql-reference/data-types/decimal.md)
- [FixedString](../../sql-reference/data-types/fixedstring.md)
- すべての整数型（[UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../../sql-reference/data-types/int-uint.md)）
- [Float32, Float64](../../sql-reference/data-types/float.md)

SQLite は動的型付けであり、その型アクセス用関数は自動的に型変換を行います。例えば、TEXT カラムを整数として読み取ると、そのテキストが数値として解釈できない場合は 0 が返されます。つまり、ClickHouse テーブルが基盤となる SQLite のカラムとは異なる型で定義されている場合、エラーにはならずに値が暗黙的に変換されてしまう可能性があります。

## 詳細と推奨事項 \{#specifics-and-recommendations\}

SQLite は、データベース全体（定義、テーブル、インデックス、および実データ）をホストマシン上の 1 つのクロスプラットフォームファイルとして保存します。書き込み中、SQLite はデータベースファイル全体をロックするため、書き込み操作は逐次的に実行されます。一方で、読み取り操作は並行して実行できます。
SQLite には、サービスとしての管理（起動スクリプトなど）や、`GRANT` やパスワードに基づくアクセス制御は必要ありません。アクセス制御は、データベースファイル自体に付与されたファイルシステムのパーミッションによって行われます。

## 使用例 \{#usage-example\}

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
