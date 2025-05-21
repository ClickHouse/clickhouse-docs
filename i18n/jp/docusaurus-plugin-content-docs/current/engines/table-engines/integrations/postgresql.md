description: 'PostgreSQLエンジンは、リモートPostgreSQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQLテーブルエンジン'
```

The PostgreSQLエンジンは、リモートPostgreSQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

:::note
現在、PostgreSQLバージョン12以降のみがサポートされています。
:::

:::note PostgresデータをPeerDBを使用してレプリケートまたは移行する
> Postgresテーブルエンジンに加えて、ClickHouseの[PeerDB](https://docs.peerdb.io/introduction)を使用して、PostgresからClickHouseへの継続的なデータパイプラインを設定できます。PeerDBは、変更データキャプチャ（CDC）を使用してPostgresからClickHouseへのデータをレプリケートするために特別に設計されたツールです。
:::

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

テーブル構造は、元のPostgreSQLテーブル構造とは異なる場合があります：

- カラム名は元のPostgreSQLテーブルと同じである必要がありますが、これらのカラムの一部のみを使用し、任意の順序で指定できます。
- カラムタイプは、元のPostgreSQLテーブルのものとは異なる場合があります。ClickHouseは値をClickHouseデータタイプに[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls)設定は、Nullableカラムをどのように処理するかを定義します。デフォルト値：1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは、配列内のNULL値にも適用されます。

**エンジンパラメーター**

- `host:port` — PostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — コンフリクト解決戦略。例：`ON CONFLICT DO NOTHING`。オプション。注意：このオプションを追加すると、挿入が効率的でなくなります。

[Named collections](/operations/named-collections.md)（バージョン21.11以降は利用可能）は、生産環境に推奨されます。以下はその例です：

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

いくつかのパラメータは、キー値引数によって上書きできます：
```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 実装の詳細 {#implementation-details}

PostgreSQL側の`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`、`!=`、`>`、`>=`、`<`、`<=`、および`IN`のような単純な`WHERE`句は、PostgreSQLサーバー上で実行されます。

すべての結合、集計、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが終了した後にClickHouseでのみ実行されます。

PostgreSQL側の`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`文の後に自動コミットされます。

PostgreSQLの`Array`タイプはClickHouseの配列に変換されます。

:::note
注意が必要です - PostgreSQLでは、`type_name[]`のように作成された配列データには、同じカラムの異なるテーブル行に異なる次元の多次元配列が含まれる可能性があります。しかし、ClickHouseでは、すべてのテーブル行に同じ次元数の多次元配列を持つことのみが許可されています。
:::

複数のレプリカをサポートしており、`|`でリストする必要があります。たとえば：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL辞書ソースのレプリカ優先度がサポートされています。マップ内の数値が大きいほど優先度は低くなります。最高の優先度は`0`です。

以下の例では、レプリカ`example01-1`は最高の優先度を持っています：

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

### PostgreSQLのテーブル {#table-in-postgresql}

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

### ClickHouseでのテーブル作成と、上記で作成したPostgreSQLテーブルへの接続 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、ClickHouseテーブルをPostgreSQLテーブルに接続し、PostgreSQLデータベースへの`SELECT`および`INSERT`文の両方を使用するために[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用します：

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### PostgreSQLテーブルからClickHouseテーブルへの初期データの挿入、SELECTクエリを使用して {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresqlテーブル関数](/sql-reference/table-functions/postgresql.md)は、PostgreSQLからClickHouseにデータをコピーします。これにより、PostgreSQLではなくClickHouseでデータをクエリしたり分析したりすることで、クエリパフォーマンスが向上することがよくあります。また、PostgreSQLからClickHouseにデータを移行するためにも使用できます。PostgreSQLからClickHouseにデータをコピーするため、ClickHouseでMergeTreeテーブルエンジンを使用し、これをpostgresql_copyと呼びます：

```sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### PostgreSQLテーブルからClickHouseテーブルへの増分データの挿入 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

初期の挿入後にPostgreSQLテーブルとClickHouseテーブルの間で継続的な同期を行う場合、タイムスタンプまたは一意のシーケンスIDに基づいて、PostgreSQLに追加されたデータのみを挿入するためにClickHouseで`WHERE`句を使用できます。

これには、以前に追加された最大IDまたはタイムスタンプを追跡する必要があります。以下のようになります：

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

次に、最大より大きいPostgreSQLテーブルからの値を挿入します。

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 結果として得られたClickHouseテーブルからデータを選択 {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 非デフォルトスキーマの使用 {#using-non-default-schema}

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

- [postgresqlテーブル関数](../../../sql-reference/table-functions/postgresql.md)
- [PostgreSQLを辞書ソースとして使用](https://clickhouse.com/docs/ja/sql-reference/dictionaries#mysql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
