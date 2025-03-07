---
slug: /sql-reference/table-functions/postgresql
sidebar_position: 160
sidebar_label: postgresql
title: 'postgresql'
description: 'リモートのPostgreSQLサーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行することを可能にします。'
---


# postgresql テーブル関数

リモートのPostgreSQLサーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行することを可能にします。

**構文**

``` sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**パラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — 衝突解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。

引数は[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`host` と `port` は別々に指定する必要があります。このアプローチは本番環境で推奨されます。

**返される値**

元のPostgreSQLテーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT` クエリでは、テーブル関数 `postgresql(...)` をカラム名リストを持つテーブル名から区別するために、キーワード `FUNCTION` または `TABLE FUNCTION` を使用する必要があります。以下の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL側の `SELECT` クエリは `COPY (SELECT ...) TO STDOUT` として、リードオンリーのPostgreSQLトランザクション内で各 `SELECT` クエリの後にコミットされます。

単純な `WHERE` 句（`=`, `!=`, `>`, `>=`, `<`, `<=`, および `IN` など）はPostgreSQLサーバー上で実行されます。

すべての結合、集約、ソート、`IN [ array ]` 条件および `LIMIT` サンプリング制約は、PostgreSQLへのクエリが終了した後にClickHouse内でのみ実行されます。

PostgreSQL側の `INSERT` クエリは `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として、各 `INSERT` 文の後に自動コミットされるPostgreSQLトランザクション内で実行されます。

PostgreSQLの配列型はClickHouseの配列に変換されます。

:::note
注意が必要です。PostgreSQLでは、Integer[] のような配列データ型のカラムは異なる行に異なる次元の配列を含む場合がありますが、ClickHouseではすべての行で同じ次元の多次元配列を持つことのみが許可されます。
:::

複数のレプリカのサポートがあり、`|` でリストする必要があります。例えば：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL辞書ソースのためのレプリカの優先順位もサポートしています。マップ内の数が大きいほど優先順位は低くなります。最高の優先順位は `0` です。

**例**

PostgreSQLにおけるテーブル：

``` text
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

プレーン引数を使用してClickHouseからデータを選択：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または [名前付きコレクション](operations/named-collections.md) を使用して：

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

挿入：

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

非デフォルトスキーマを使用：

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**関連情報**

- [PostgreSQLテーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQLを辞書ソースとして使用]( /sql-reference/dictionaries#postgresql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データ天国での出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データ天国での出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### PeerDBを使用したPostgresデータのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、PostgresからClickHouseへの継続的なデータパイプラインを設定するために、ClickHouseによる[PeerDB](https://docs.peerdb.io/introduction)を使用することができます。PeerDBは、変更データキャプチャ（CDC）を使用してPostgresからClickHouseへデータをレプリケートするために特別に設計されたツールです。
