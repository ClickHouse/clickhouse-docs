---
'description': 'PostgreSQL エンジンはリモート PostgreSQL サーバーに保存されたデータに対する `SELECT` と `INSERT`
  クエリを許可します。'
'sidebar_label': 'PostgreSQL'
'sidebar_position': 160
'slug': '/engines/table-engines/integrations/postgresql'
'title': 'PostgreSQL テーブルエンジン'
'doc_type': 'guide'
---

The PostgreSQL engine allows `SELECT` and `INSERT` queries on data stored on a remote PostgreSQL server.

:::note
現在、サポートされているのはPostgreSQLバージョン12以降のみです。
:::

:::note
ClickHouse Cloudユーザーは、[ClickPipes](/integrations/clickpipes)を使用してPostgresデータをClickHouseにストリーミングすることを推奨します。これにより、高性能の挿入がネイティブにサポートされ、取り込みとクラスタリソースを独立してスケールする能力によって関心の分離が確保されます。
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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明をご覧ください。

テーブル構造は元のPostgreSQLテーブル構造と異なる場合があります。

- カラム名は元のPostgreSQLテーブルと同じである必要がありますが、これらのカラムの一部を使用し、任意の順序で配置することができます。
- カラム型は元のPostgreSQLテーブルのものと異なる場合があります。ClickHouseは、[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)を試みてClickHouseデータ型に値を変換します。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定はNullableカラムの扱いを定義します。デフォルト値: 1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — デフォルト以外のテーブルスキーマ。オプション。
- `on_conflict` — コンフリクト解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。注意: このオプションを追加すると、挿入が非効率になります。

[Named collections](/operations/named-collections.md) (バージョン21.11以降利用可能) は、本番環境で推奨されます。以下はその例です。

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

一部のパラメータはキー値引数によって上書きできます：
```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 実装の詳細 {#implementation-details}

PostgreSQL側の`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で `COPY (SELECT ...) TO STDOUT` として実行され、各`SELECT`クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, および `IN` のようなシンプルな `WHERE` 節はPostgreSQLサーバーで実行されます。

すべてのジョイン、集約、ソート、`IN [ array ]` 条件、及び `LIMIT` サンプリング制約は、PostgreSQLへのクエリが終了した後にClickHouseでのみ実行されます。

PostgreSQL側の`INSERT`クエリは、PostgreSQLトランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行され、各`INSERT`文の後に自動コミットされます。

PostgreSQLの`Array`型はClickHouseの配列に変換されます。

:::note
注意が必要です - PostgreSQLでは、`type_name[]`のように作成された配列データは、同じカラムの異なるテーブル行に異なる次元の多次元配列を含むことができます。しかし、ClickHouseでは、同じカラムのすべてのテーブル行で同じ次元数の多次元配列のみが許可されています。
:::

複数のレプリカをサポートし、`|`でリストする必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL辞書ソースに対してレプリカの優先順位がサポートされています。マップの数値が大きいほど、優先順位は低くなります。最も高い優先順位は`0`です。

以下の例では、レプリカ`example01-1`が最も高い優先順位を持っています。

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

### ClickHouseでテーブルを作成し、上記で作成したPostgreSQLテーブルに接続する {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用してClickHouseのテーブルをPostgreSQLのテーブルに接続し、両方のSELECTおよびINSERTステートメントをPostgreSQLデータベースに使用します：

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### SELECTクエリを使用してPostgreSQLテーブルからClickHouseテーブルに初期データを挿入する {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresqlテーブル関数](/sql-reference/table-functions/postgresql.md)はデータをPostgreSQLからClickHouseにコピーし、PostgreSQLではなくClickHouseでクエリや分析を行うことでデータのクエリパフォーマンスを向上させるためにしばしば使用され、また、PostgreSQLからClickHouseへのデータ移行にも使用されます。データをPostgreSQLからClickHouseにコピーするため、ClickHouseではMergeTreeテーブルエンジンを使用し、これをpostgresql_copyと呼びます：

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

### PostgreSQLテーブルからClickHouseテーブルに増分データを挿入する {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

初期挿入後にPostgreSQLテーブルとClickHouseテーブル間で継続的な同期を行う場合、タイムスタンプまたはユニークなシーケンスIDに基づいてPostgreSQLに追加されたデータのみを挿入するためにClickHouseでWHERE句を使用できます。

これには、前回追加された最大IDまたはタイムスタンプを追跡する必要があります。例えば以下のように：

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

次に、最大より大きいPostgreSQLテーブルの値を挿入します。

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 結果として得られたClickHouseテーブルからデータを選択する {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### デフォルト以外のスキーマを使用する {#using-non-default-schema}

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

- [`postgresql`テーブル関数](../../../sql-reference/table-functions/postgresql.md)
- [PostgreSQLを辞書ソースとして使用する](/sql-reference/dictionaries#mysql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
