---
slug: /sql-reference/table-functions/postgresql
sidebar_position: 160
sidebar_label: postgresql
title: "postgresql"
description: "リモートの PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できるようにします。"
---


# postgresql テーブル関数

リモートの PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できるようにします。

**構文**

``` sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**パラメータ**

- `host:port` — PostgreSQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQL ユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — 競合解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。

引数は [named collections](operations/named-collections.md) を使用しても渡すことができます。この場合、`host` と `port` は別々に指定する必要があります。このアプローチは本番環境で推奨されます。

**返される値**

元の PostgreSQL テーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT` クエリでは、テーブル関数 `postgresql(...)` をカラム名リストと区別するために、キーワード `FUNCTION` または `TABLE FUNCTION` を使用する必要があります。以下の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL 側の `SELECT` クエリは、各 `SELECT` クエリの後にコミットされる読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行されます。

`=`, `!=`, `>`, `>=`, `<`, `<=`、および `IN` のような単純な `WHERE` 条件は PostgreSQL サーバーで実行されます。

全ての結合、集計、ソート、`IN [ array ]` 条件、および `LIMIT` サンプリング制約は、PostgreSQL へのクエリが終了した後にのみ ClickHouse で実行されます。

PostgreSQL 側の `INSERT` クエリは、各 `INSERT` ステートメントの後に自動コミットされる PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行されます。

PostgreSQL の配列型は ClickHouse の配列に変換されます。

:::note
注意してください。PostgreSQL では、Integer[] のような配列データ型のカラムが異なる行に異なる次元の配列を含む場合がありますが、ClickHouse では全ての行に対して同じ次元の多次元配列のみが許可されています。
:::

複数のレプリカがサポートされており、`|` で区切って指定する必要があります。例えば：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL 辞書ソースの対レプリカ優先度をサポートしています。マップ内の数値が大きいほど、優先度は低くなります。最も高い優先度は `0` です。

**例**

PostgreSQL におけるテーブル：

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

ClickHouse からプレーン引数を使用してデータを選択する：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または [named collections](operations/named-collections.md) を使用して：

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

挿入する：

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

非デフォルトスキーマを使用する：

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

- [PostgreSQL テーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQL を辞書ソースとして使用する](../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-postgresql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と PostgreSQL - データの天国における出会い - パート 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouse と PostgreSQL - データの天国における出会い - パート 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### PeerDB を使用した Postgres データのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、ClickHouse による [PeerDB](https://docs.peerdb.io/introduction) を使用して、Postgres から ClickHouse への継続的なデータパイプラインを設定することもできます。PeerDB は、Change Data Capture (CDC) を使用して Postgres から ClickHouse にデータをレプリケートするために特別に設計されたツールです。
