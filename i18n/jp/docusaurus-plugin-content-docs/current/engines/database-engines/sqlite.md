---
'description': 'SQLite データベースに接続し、データを ClickHouse と SQLite の間で交換するために `INSERT` と `SELECT`
  クエリを実行することを可能にします。'
'sidebar_label': 'SQLite'
'sidebar_position': 55
'slug': '/engines/database-engines/sqlite'
'title': 'SQLite'
'doc_type': 'reference'
---


# SQLite

ClickHouse と SQLite データベース間でデータを交換するために、`INSERT` および `SELECT` クエリを実行できる [SQLite](https://www.sqlite.org/index.html) データベースへの接続を許可します。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE sqlite_database
ENGINE = SQLite('db_path')
```

**エンジンパラメータ**

- `db_path` — SQLite データベースのファイルへのパス。

## データ型のサポート {#data_types-support}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

## 特殊性と推奨事項 {#specifics-and-recommendations}

SQLite は、ホストマシン上の単一のクロスプラットフォームファイルとして、データベース全体（定義、テーブル、インデックス、およびデータ自体）を保存します。書き込み中は、SQLite がデータベースファイル全体をロックするため、書き込み操作は順次実行されます。読み取り操作はマルチタスクで行うことができます。  
SQLite は、サービス管理（スタートアップスクリプトなど）や `GRANT` とパスワードに基づくアクセス制御を必要としません。アクセス制御は、データベースファイル自体に与えられたファイルシステムの権限によって処理されます。

## 使用例 {#usage-example}

ClickHouse で SQLite に接続されたデータベース：

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

テーブルを表示：

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
ClickHouse テーブルから SQLite テーブルにデータを挿入：

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
