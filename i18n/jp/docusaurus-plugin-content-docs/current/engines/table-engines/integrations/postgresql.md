---
'description': 'The PostgreSQL engine allows `SELECT` and `INSERT` queries on data
  stored on a remote PostgreSQL server.'
'sidebar_label': 'PostgreSQL'
'sidebar_position': 160
'slug': '/engines/table-engines/integrations/postgresql'
'title': 'PostgreSQL テーブルエンジン'
---



The PostgreSQL engine allows `SELECT` and `INSERT` queries on data stored on a remote PostgreSQL server.

:::note
現在、PostgreSQLバージョン12以上のみがサポートされています。
:::

:::note Replicating or migrating Postgres data with with PeerDB
> Postgresテーブルエンジンに加えて、[PeerDB](https://docs.peerdb.io/introduction) by ClickHouseを使用して、PostgresからClickHouseへの継続的なデータパイプラインを設定できます。PeerDBは、PostgresからClickHouseへのデータを変更データキャプチャ（CDC）を使用して複製するために特別に設計されたツールです。
:::

## Creating a Table {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

テーブル構造は元のPostgreSQLテーブル構造と異なる場合があります：

- カラム名は元のPostgreSQLテーブルと同じである必要がありますが、これらのカラムの一部のみを使用し、任意の順序で使用することができます。
- カラムタイプは元のPostgreSQLテーブルのものと異なる場合があります。ClickHouseは値をClickHouseデータ型に[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は、Nullableカラムの扱い方を定義します。デフォルト値：1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは、配列内のNULL値にも適用されます。

**Engine Parameters**

- `host:port` — PostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトテーブルスキーマ。オプション。
- `on_conflict` — コンフリクト解決戦略。例：`ON CONFLICT DO NOTHING`。オプション。ただし、このオプションを追加すると、挿入効率が低下します。

[Named collections](/operations/named-collections.md) （バージョン21.11以降で利用可能）は、プロダクション環境での使用を推奨します。以下はその例です：

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

一部のパラメータはキー値引数として上書きできます：
```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## Implementation Details {#implementation-details}

PostgreSQL側の`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`などの単純な`WHERE`句は、PostgreSQLサーバーで実行されます。

すべての結合、集計、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが終了した後にClickHouse内でのみ実行されます。

PostgreSQL側の`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`ステートメントの後に自動コミットが行われます。

PostgreSQLの`Array`タイプはClickHouseの配列に変換されます。

:::note
注意 - PostgreSQLでは、`type_name[]`のように作成された配列データは、同じカラムの異なるテーブル行で異なる次元の多次元配列を含むことができます。しかし、ClickHouseでは、同じカラムのすべてのテーブル行で同じ次元数の多次元配列のみが許可されています。
:::

複数のレプリカをサポートしており、`|`でリストにする必要があります。たとえば：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL辞書ソースのためのレプリカの優先度もサポートされています。地図中の番号が大きいほど、優先度は低くなります。最も高い優先度は`0`です。

以下の例では、レプリカ`example01-1`が最高の優先度を持っています：

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

## Usage Example {#usage-example}

### Table in PostgreSQL {#table-in-postgresql}

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

### Creating Table in ClickHouse, and connecting to PostgreSQL table created above {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用して、ClickHouseテーブルが上記のPostgreSQLテーブルに接続され、SELECTとINSERTステートメントの両方をPostgreSQLデータベースに対して使用します：

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### Inserting initial data from PostgreSQL table into ClickHouse table, using a SELECT query {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresqlテーブル関数](/sql-reference/table-functions/postgresql.md)は、データをPostgreSQLからClickHouseにコピーします。これは、PostgreSQLではなくClickHouseでデータのクエリや分析を行うことでクエリパフォーマンスを向上させるためによく使用されるか、PostgreSQLからClickHouseへのデータ移行にも使用できます。PostgreSQLからClickHouseへデータをコピーするため、ClickHouseでMergeTreeテーブルエンジンを使用し、これをpostgresql_copyと呼びます：

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

### Inserting incremental data from PostgreSQL table into ClickHouse table {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

初期の挿入の後、PostgreSQLテーブルとClickHouseテーブルの間で継続的な同期を行う場合、ClickHouseでWHERE句を使用して、タイムスタンプまたはユニークなシーケンスIDに基づいてPostgreSQLに追加されたデータのみを挿入できます。

これには、以前に追加された最大IDまたはタイムスタンプを追跡する必要があります。たとえば、以下のようにします：

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

その後、最大より大きいPostgreSQLテーブルから値を挿入します。

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### Selecting data from the resulting ClickHouse table {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### Using Non-default Schema {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**See Also**

- [The `postgresql` table function](../../../sql-reference/table-functions/postgresql.md)
- [Using PostgreSQL as a dictionary source](/sql-reference/dictionaries#mysql)

## Related content {#related-content}

- Blog: [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Blog: [ClickHouse and PostgreSQL - a Match Made in Data Heaven - part 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
