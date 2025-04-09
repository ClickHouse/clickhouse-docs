---
slug: /engines/table-engines/integrations/postgresql
title: "PostgreSQL テーブルエンジン"
sidebar_position: 160
sidebar_label: PostgreSQL
description: "PostgreSQLエンジンは、リモートのPostgreSQLサーバーに保存されたデータに対して、`SELECT`および`INSERT`クエリを使用することを許可します。"
---

PostgreSQLエンジンは、リモートのPostgreSQLサーバーに保存されたデータに対して、`SELECT`および`INSERT`クエリを使用することを許可します。

:::note
現在、サポートされているのはPostgreSQLバージョン12以降のみです。
:::

:::note Postgresデータの複製または移行にPeerDBを使用する
> Postgresテーブルエンジンに加えて、ClickHouseの[PeerDB](https://docs.peerdb.io/introduction)を使用して、PostgresからClickHouseへの継続的なデータパイプラインを設定できます。PeerDBは、変更データキャプチャ（CDC）を使用してPostgresからClickHouseにデータを複製するために特別に設計されたツールです。
:::

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

テーブル構造は元のPostgreSQLテーブル構造と異なる場合があります：

- カラム名は元のPostgreSQLテーブルと同じである必要がありますが、これらのカラムの一部のみを使用することができ、順序も任意です。
- カラムタイプは元のPostgreSQLテーブルのものとは異なる場合があります。ClickHouseは値をClickHouseのデータ型に[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls)設定はNullableカラムの処理方法を定義します。デフォルト値は1です。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは、配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — コンフリクト解決戦略。例：`ON CONFLICT DO NOTHING`。オプション。注：このオプションを追加すると、挿入の効率が低下します。

[Named collections](/operations/named-collections.md)（バージョン21.11以降利用可能）は、プロダクション環境での使用が推奨されます。以下はその例です：

```xml
<named_collections>
    <postgres_creds>
        <host>localhost</host>
        <port>5432</port>
        <user>postgres</user>
        <password>****</password>
        <schema>schema1</schema>
    </postgres_creds>
</named_collections>
```

一部のパラメータはキー値引数で上書きできます：
``` sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 実装の詳細 {#implementation-details}

PostgreSQLサイドでの`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`、`!=`、`>`、`>=`、`<`、`<=`、および`IN`のような単純な`WHERE`句は、PostgreSQLサーバーで実行されます。

すべての結合、集約、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが終了した後にのみClickHouseで実行されます。

PostgreSQLサイドでの`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`ステートメントの後に自動コミットされます。

PostgreSQLの`Array`タイプは、ClickHouseの配列に変換されます。

:::note
注意が必要です。PostgreSQLでは、`type_name[]`のように作成された配列データは、同じカラム内の異なるテーブル行で異なる次元の多次元配列を含む可能性があります。しかしClickHouseでは、すべてのテーブル行の同じカラム内で次元数が同じ多次元配列のみが許可されています。
:::

複数のレプリカをサポートしており、`|`でリストする必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL辞書ソースに対するレプリカの優先度がサポートされています。マップ内の数が大きいほど、優先度は低くなります。最も高い優先度は`0`です。

以下の例では、レプリカ`example01-1`が最も高い優先度を持っています：

```xml
<postgresql>
    <port>5432</port>
    <user>clickhouse</user>
    <password>qwerty</password>
    <replica>
        <host>example01-1</host>
        <priority>1</priority>
    </replica>
    <replica>
        <host>example01-2</host>
        <priority>2</priority>
    </replica>
    <db>db_name</db>
    <table>table_name</table>
    <where>id=10</where>
    <invalidate_query>SQL_QUERY</invalidate_query>
</postgresql>
</source>
```

## 使用例 {#usage-example}

### PostgreSQLでのテーブル {#table-in-postgresql}

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

### ClickHouseでのテーブル作成と上記のPostgreSQLテーブルへの接続 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、ClickHouseテーブルをPostgreSQLテーブルに接続し、PostgreSQLデータベースに対して`SELECT`および`INSERT`ステートメントの両方を使用するために[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用します：

``` sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### SELECTクエリを使用してPostgreSQLテーブルからClickHouseテーブルに初期データを挿入する {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresqlテーブル関数](/sql-reference/table-functions/postgresql.md)は、PostgreSQLからClickHouseにデータをコピーします。これは、PostgreSQLではなくClickHouseでデータをクエリしたり分析したりすることでデータのクエリ性能を改善するためによく使用され、またPostgreSQLからClickHouseへのデータ移行にも使用できます。PostgreSQLからClickHouseにデータをコピーするために、ClickHouseではMergeTreeテーブルエンジンを使用し、それをpostgresql_copyと呼びます：

``` sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### PostgreSQLテーブルからClickHouseテーブルへのインクリメンタルデータを挿入する {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

初期挿入後、PostgreSQLテーブルとClickHouseテーブルの間で継続的な同期を行う場合、ClickHouseでWHERE句を使用して、タイムスタンプまたは一意のシーケンスIDに基づいてPostgreSQLに追加されたデータのみを挿入できます。

このためには、以前に追加された最大IDまたはタイムスタンプを追跡する必要があります。以下のように：

``` sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

そして、最大より大きいPostgreSQLテーブルから値を挿入します。

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password')
WHERE int_id > maxIntID;
```

### 結果として得られたClickHouseテーブルからデータを選択する {#selecting-data-from-the-resulting-clickhouse-table}

``` sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

``` text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 非デフォルトスキーマを使用する {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**関連事項**

- [`postgresql`テーブル関数](../../../sql-reference/table-functions/postgresql.md)
- [PostgreSQLを辞書ソースとして使用する](/sql-reference/dictionaries#mysql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データの天国で生まれたマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国で生まれたマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
