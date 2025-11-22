---
description: 'リモートのPostgreSQLサーバー上に保存されているデータに対して、`SELECT` および `INSERT` クエリを実行できるようにします。'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---



# postgresql テーブル関数

リモートの PostgreSQL サーバー上に保存されているデータに対して、`SELECT` および `INSERT` クエリを実行できます。



## 構文 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```


## 引数 {#arguments}

| 引数          | 説明                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `host:port`   | PostgreSQLサーバーのアドレス。                                              |
| `database`    | リモートデータベース名。                                                    |
| `table`       | リモートテーブル名。                                                        |
| `user`        | PostgreSQLユーザー。                                                        |
| `password`    | ユーザーパスワード。                                                        |
| `schema`      | デフォルト以外のテーブルスキーマ。省略可能。                                |
| `on_conflict` | 競合解決戦略。例: `ON CONFLICT DO NOTHING`。省略可能。                      |

引数は[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`host`と`port`は個別に指定する必要があります。本番環境ではこのアプローチを推奨します。


## 戻り値 {#returned_value}

元のPostgreSQLテーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT`クエリにおいて、テーブル関数`postgresql(...)`をカラム名リスト付きのテーブル名と区別するには、キーワード`FUNCTION`または`TABLE FUNCTION`を使用する必要があります。以下の例を参照してください。
:::


## 実装の詳細 {#implementation-details}

PostgreSQL側の`SELECT`クエリは、各`SELECT`クエリ後にコミットされる読み取り専用PostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行されます。

`=`、`!=`、`>`、`>=`、`<`、`<=`、`IN`などの単純な`WHERE`句はPostgreSQLサーバー上で実行されます。

すべての結合、集計、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが完了した後にClickHouse上でのみ実行されます。

PostgreSQL側の`INSERT`クエリは、各`INSERT`ステートメント後に自動コミットされるPostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行されます。

PostgreSQLの配列型はClickHouseの配列に変換されます。

:::note
注意: PostgreSQLでは、Integer[]のような配列データ型カラムは行ごとに異なる次元の配列を含むことができますが、ClickHouseではすべての行で同じ次元の多次元配列のみが許可されます。
:::

`|`で区切って列挙する複数のレプリカをサポートします。例:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL辞書ソースのレプリカ優先度をサポートします。マップ内の数値が大きいほど優先度は低くなります。最高優先度は`0`です。


## 例 {#examples}

PostgreSQLのテーブル:

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

プレーン引数を使用したClickHouseからのデータ選択:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または[名前付きコレクション](operations/named-collections.md)を使用:

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

非デフォルトスキーマの使用:

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

- [PostgreSQLテーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQLをディクショナリソースとして使用する](/sql-reference/dictionaries#postgresql)

### PeerDBを使用したPostgresデータのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、ClickHouseの[PeerDB](https://docs.peerdb.io/introduction)を使用して、PostgresからClickHouseへの継続的なデータパイプラインを設定することもできます。PeerDBは、変更データキャプチャ(CDC)を使用してPostgresからClickHouseへデータをレプリケートするために特別に設計されたツールです。
