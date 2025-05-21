---
description: 'リモートのPostgreSQLサーバーに保存されているデータに対して、`SELECT`および`INSERT`クエリを実行できるようにします。'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
---


# postgresql テーブル関数

リモートのPostgreSQLサーバーに保存されているデータに対して、`SELECT`および`INSERT`クエリを実行できるようにします。

**構文**

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**パラメーター**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — 衝突解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。

引数は、[named collections](operations/named-collections.md)を使用して渡すこともできます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは、本番環境での使用が推奨されます。

**返される値**

オリジナルのPostgreSQLテーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT`クエリでは、テーブル関数`postgresql(...)`をカラム名のリストを持つテーブル名と区別するために、キーワード`FUNCTION`または`TABLE FUNCTION`を使用する必要があります。以下の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL側の`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`などのシンプルな`WHERE`句は、PostgreSQLサーバー上で実行されます。

すべての結合、集計、ソート、`IN [ array ]`条件、`LIMIT`サンプリング制約は、PostgreSQLへのクエリが完了した後にClickHouseのみで実行されます。

PostgreSQL側の`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`ステートメントの後に自動コミットされます。

PostgreSQLの配列型はClickHouseの配列に変換されます。

:::note
注意してください。PostgreSQLでは、配列データ型のカラム（たとえばInteger[]）は、異なる行に異なる次元の配列を含むことができますが、ClickHouseではすべての行に同じ次元の多次元配列だけが許可されています。
:::

複数のレプリカを`|`で列挙することがサポートされています。例えば：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL辞書ソースのレプリカ優先度もサポートされています。マップ内の数値が大きいほど優先度が低くなります。最も高い優先度は`0`です。

**例**

PostgreSQLのテーブル：

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

ClickHouseからプレーン引数を使用してデータを選択：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または[named collections](operations/named-collections.md)を使用：

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

挿入する：

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

**参照**

- [PostgreSQLテーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQLを辞書ソースとして使用する](/sql-reference/dictionaries#postgresql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データの天国での出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国での出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### PeerDBを使用してPostgresデータをレプリケートまたは移行する {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、常にClickHouseの[PeerDB](https://docs.peerdb.io/introduction)を使用して、PostgresからClickHouseへの継続的なデータパイプラインを設定できます。PeerDBは、変更データキャプチャ（CDC）を使用してPostgresからClickHouseにデータをレプリケートするために特別に設計されたツールです。
