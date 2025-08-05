---
description: 'Allows `SELECT` and `INSERT` queries to be performed on data that
  is stored on a remote PostgreSQL server.'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: '/sql-reference/table-functions/postgresql'
title: 'postgresql'
---




# postgresql テーブル関数

リモートの PostgreSQL サーバーに保存されたデータに対して `SELECT` と `INSERT` クエリを実行できるようにします。

## 構文 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## 引数 {#arguments}

| 引数          | 説明                                                                  |
|---------------|-----------------------------------------------------------------------|
| `host:port`   | PostgreSQL サーバーのアドレス。                                      |
| `database`    | リモートデータベース名。                                             |
| `table`       | リモートテーブル名。                                                |
| `user`        | PostgreSQL ユーザー。                                               |
| `password`    | ユーザーのパスワード。                                               |
| `schema`      | 非デフォルトのテーブルスキーマ。オプション。                        |
| `on_conflict` | この時の解決策。例: `ON CONFLICT DO NOTHING`。オプション。          |

引数は [名前付きコレクション](operations/named-collections.md) を使用して渡すこともできます。この場合、`host` と `port` は別々に指定する必要があります。このアプローチは運用環境での使用を推奨します。

## 戻り値 {#returned_value}

元の PostgreSQL テーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT` クエリでは、テーブル関数 `postgresql(...)` をカラム名リストのテーブル名と区別するために、キーワード `FUNCTION` または `TABLE FUNCTION` を使用する必要があります。以下の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL 側での `SELECT` クエリは、読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行され、各 `SELECT` クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN` などの単純な `WHERE` 句は PostgreSQL サーバー上で実行されます。

すべてのジョイン、集計、ソート、`IN [ array ]` 条件および `LIMIT` サンプリング制約は、PostgreSQL へのクエリが終了した後に ClickHouse でのみ実行されます。

PostgreSQL 側での `INSERT` クエリは、PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行され、各 `INSERT` ステートメントの後に自動コミットされます。

PostgreSQL の配列型は ClickHouse の配列に変換されます。

:::note
注意してください。PostgreSQL では Integer[] のような配列データ型のカラムが異なる行で異なる次元の配列を含むことがありますが、ClickHouse ではすべての行で同じ次元の多次元配列を持つことのみが許可されています。
:::

複数のレプリカをサポートし、これらは `|` で列挙する必要があります。例えば:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL 辞書ソースのためのレプリカ優先度をサポートします。マップの番号が大きいほど、優先度が低くなります。最も高い優先度は `0` です。

## 例 {#examples}

PostgreSQL のテーブル:

```text
postgres=# CREATE TABLE "public"."test" (
"int_id" SERIAL,
"int_nullable" INT NULL DEFAULT NULL,
"float" FLOAT NOT NULL,
"str" VARCHAR(100) NOT NULL DEFAULT '',
"float_nullable" FLOAT NULL DEFAULT NULL,
PRIMARY KEY (int_id));

CREATE TABLE

postgres=# INSERT INTO test (int_id, str, "float") VALUES (1,'test',2);
INSERT 0 1

postgresql> SELECT * FROM test;
  int_id | int_nullable | float | str  | float_nullable
 --------+--------------+-------+------+----------------
       1 |              |     2 | test |
(1 row)
```

プレーン引数を使用して ClickHouse からデータを選択する:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または [名前付きコレクション](operations/named-collections.md) を使用する:

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

挿入:

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

非デフォルトスキーマを使用する:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

## 関連項目 {#related}

- [PostgreSQL テーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQL を辞書ソースとして使用する](/sql-reference/dictionaries#postgresql)

### PeerDB を使用した Postgres データの複製または移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、ClickHouse を使用して Postgres から ClickHouse への継続的データパイプラインを設定するために、常に [PeerDB](https://docs.peerdb.io/introduction) を使用できます。PeerDB は、変化データキャプチャ (CDC) を使用して Postgres から ClickHouse へのデータを複製するために特別に設計されたツールです。
