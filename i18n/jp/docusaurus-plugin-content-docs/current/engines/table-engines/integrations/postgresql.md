---
description: 'PostgreSQLエンジンは、リモートのPostgreSQLサーバーに格納されたデータに対して `SELECT` および `INSERT` クエリを実行できます。'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQLテーブルエンジン'
doc_type: 'guide'
---



# PostgreSQL テーブルエンジン

PostgreSQL エンジンを使用すると、リモートの PostgreSQL サーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

:::note
現在、サポートされているのは PostgreSQL バージョン 12 以降のみです。
:::

:::tip
ClickHouse Cloud のユーザーには、Postgres データを ClickHouse にストリーミングするために [ClickPipes](/integrations/clickpipes) の利用を推奨します。ClickPipes は、取り込み処理とクラスタリソースを独立してスケールさせることで責務の分離を維持しつつ、高パフォーマンスなデータ挿入をネイティブにサポートします。
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

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細については、こちらを参照してください。

テーブル構造は元のPostgreSQLテーブル構造と異なっていても構いません:

- カラム名は元のPostgreSQLテーブルと同じである必要がありますが、一部のカラムのみを任意の順序で使用できます。
- カラム型は元のPostgreSQLテーブルと異なっていても構いません。ClickHouseは値をClickHouseデータ型に[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls)設定は、Nullableカラムの処理方法を定義します。デフォルト値は1です。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — デフォルト以外のテーブルスキーマ。オプション。
- `on_conflict` — 競合解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。注意: このオプションを追加すると挿入の効率が低下します。

本番環境では[名前付きコレクション](/operations/named-collections.md)(バージョン21.11以降で利用可能)の使用を推奨します。以下は例です:

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

一部のパラメータはキーバリュー引数で上書きできます:

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```


## 実装の詳細 {#implementation-details}

PostgreSQL側の`SELECT`クエリは、読み取り専用PostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`、`!=`、`>`、`>=`、`<`、`<=`、`IN`などの単純な`WHERE`句はPostgreSQLサーバー上で実行されます。

すべての結合、集計、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが完了した後にClickHouse側でのみ実行されます。

PostgreSQL側の`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`文の後に自動コミットされます。

PostgreSQLの`Array`型はClickHouseの配列に変換されます。

:::note
注意 - PostgreSQLでは、`type_name[]`のように作成された配列データは、同じカラム内の異なるテーブル行で異なる次元の多次元配列を含むことができます。しかし、ClickHouseでは、同じカラム内のすべてのテーブル行で同じ次元数の多次元配列のみが許可されます。
:::

`|`で区切って列挙する複数のレプリカをサポートします。例:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL辞書ソースのレプリカ優先度がサポートされています。マップ内の数値が大きいほど、優先度は低くなります。最高優先度は`0`です。

以下の例では、レプリカ`example01-1`が最高優先度を持ちます:

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

### ClickHouseでのテーブル作成と上記で作成したPostgreSQLテーブルへの接続 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用してClickHouseテーブルをPostgreSQLテーブルに接続し、PostgreSQLデータベースに対してSELECT文とINSERT文の両方を使用します:

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### SELECTクエリを使用したPostgreSQLテーブルからClickHouseテーブルへの初期データの挿入 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresqlテーブル関数](/sql-reference/table-functions/postgresql.md)は、PostgreSQLからClickHouseにデータをコピーします。これは、PostgreSQLではなくClickHouseでクエリを実行したり分析を行うことでデータのクエリパフォーマンスを向上させるためによく使用されます。また、PostgreSQLからClickHouseへのデータ移行にも使用できます。PostgreSQLからClickHouseにデータをコピーするため、ClickHouseでMergeTreeテーブルエンジンを使用し、postgresql_copyという名前を付けます:

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

初期挿入後にPostgreSQLテーブルとClickHouseテーブル間で継続的な同期を行う場合、ClickHouseのWHERE句を使用して、タイムスタンプまたは一意のシーケンスIDに基づいてPostgreSQLに追加されたデータのみを挿入できます。

これには、以下のように、以前に追加された最大IDまたはタイムスタンプを追跡する必要があります:

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

次に、最大値より大きいPostgreSQLテーブルの値を挿入します:

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 結果として得られるClickHouseテーブルからのデータ選択 {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### デフォルト以外のスキーマの使用 {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**関連項目**

- [`postgresql`テーブル関数](../../../sql-reference/table-functions/postgresql.md)
- [辞書ソースとしてのPostgreSQLの使用](/sql-reference/dictionaries#mysql)


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouse and PostgreSQL - a Match Made in Data Heaven - part 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
