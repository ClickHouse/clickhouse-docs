---
description: 'リモート PostgreSQL サーバー上に保存されているデータに対して、`SELECT` および `INSERT` クエリを実行できます。'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---



# postgresql テーブル関数 {#postgresql-table-function}

リモートの PostgreSQL サーバー上に保存されたデータに対して、`SELECT` および `INSERT` クエリを実行できます。



## 構文 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```


## 引数 {#arguments}

| 引数          | 説明                                                                          |
|---------------|-------------------------------------------------------------------------------|
| `host:port`   | PostgreSQL サーバーのアドレス。                                               |
| `database`    | リモートデータベース名。                                                      |
| `table`       | リモートテーブル名。                                                          |
| `user`        | PostgreSQL ユーザー。                                                         |
| `password`    | ユーザーのパスワード。                                                        |
| `schema`      | デフォルト以外のテーブルスキーマ。省略可能。                                  |
| `on_conflict` | 競合解決戦略。例: `ON CONFLICT DO NOTHING`。省略可能。                        |

引数は [named collections](operations/named-collections.md) を使用して渡すこともできます。この場合、`host` と `port` は個別に指定する必要があります。この方法を本番環境で使用することを推奨します。



## 返される値 {#returned_value}

元の PostgreSQL テーブルと同じ列を持つテーブルオブジェクト。

:::note
`INSERT` クエリで、テーブル関数 `postgresql(...)` と、列名リストを伴うテーブル名の指定とを区別するには、キーワード `FUNCTION` または `TABLE FUNCTION` を使用する必要があります。以下の例を参照してください。
:::



## 実装の詳細 {#implementation-details}

PostgreSQL 側での `SELECT` クエリは、読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行され、各 `SELECT` クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN` といった単純な `WHERE` 句は、PostgreSQL サーバー上で実行されます。

すべての結合、集約、ソート、`IN [ array ]` 条件および `LIMIT` によるサンプリング制約は、PostgreSQL へのクエリが完了した後にのみ ClickHouse 側で実行されます。

PostgreSQL 側での `INSERT` クエリは、PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行され、各 `INSERT` ステートメントの後に自動コミットされます。

PostgreSQL の配列型は ClickHouse の配列型に変換されます。

:::note
注意してください。PostgreSQL では Integer[] のような配列データ型のカラムは、行ごとに異なる次元の配列を含むことができますが、ClickHouse ではすべての行で同じ次元の多次元配列のみが許可されています。
:::

`|` で区切って列挙することで、複数レプリカをサポートします。例えば次のとおりです。

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL の辞書ソースで、レプリカの優先度指定をサポートします。マップ内の数値が大きいほど優先度は低くなります。最も高い優先度は `0` です。


## 例 {#examples}

PostgreSQL のテーブルの例:

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
（1行）
```

通常の引数を使って ClickHouse からデータを取得する：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または [named collections](operations/named-collections.md) を使用する場合：

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

データの挿入：

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

デフォルト以外のスキーマを使用する場合:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```


## 関連 {#related}

- [PostgreSQL テーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQL をディクショナリソースとして使用する](/sql-reference/dictionaries#postgresql)

### PeerDB を使用した Postgres データのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、ClickHouse が提供する [PeerDB](https://docs.peerdb.io/introduction) を使用して、Postgres から ClickHouse への継続的なデータパイプラインを構築することもできます。PeerDB は、変更データキャプチャ（CDC）を使用して Postgres から ClickHouse へデータをレプリケートするために専用に設計されたツールです。
