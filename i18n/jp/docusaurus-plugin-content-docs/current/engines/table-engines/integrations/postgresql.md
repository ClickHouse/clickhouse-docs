---
description: 'PostgreSQL エンジンを使用すると、リモート PostgreSQL サーバー上に保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQL テーブルエンジン'
doc_type: 'guide'
---



# PostgreSQL テーブルエンジン {#postgresql-table-engine}

PostgreSQLエンジンを使用すると、リモートのPostgreSQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

:::note
現在サポートされているのは、PostgreSQL 12以降のバージョンのみです。
:::

:::tip
ClickHouse Cloud ユーザーには、Postgres データを ClickHouse にストリーミングする際に [ClickPipes](/integrations/clickpipes) の利用を推奨します。これは、インジェストとクラスタリソースをそれぞれ独立してスケールさせることで責務を分離しつつ、高パフォーマンスなデータ挿入をネイティブにサポートします。
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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

テーブルの構造は、元の PostgreSQL テーブル構造と異なる場合があります。

* 列名は元の PostgreSQL テーブルと同じである必要がありますが、そのうち一部の列だけを任意の順序で使用できます。
* 列の型は元の PostgreSQL テーブルと異なっていてもかまいません。ClickHouse は値を ClickHouse のデータ型に[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は、Nullable 列をどのように扱うかを定義します。デフォルト値: 1。0 の場合、テーブル関数は Nullable 列を作成せず、null の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

**エンジンパラメータ**

* `host:port` — PostgreSQL サーバーのアドレス。
* `database` — リモートデータベース名。
* `table` — リモートテーブル名。
* `user` — PostgreSQL ユーザー。
* `password` — ユーザーのパスワード。
* `schema` — デフォルト以外のテーブルスキーマ。省略可能。
* `on_conflict` — 競合解決戦略。例: `ON CONFLICT DO NOTHING`。省略可能。注意: このオプションを追加すると、挿入が非効率になります。

本番環境では [Named collections](/operations/named-collections.md)（バージョン 21.11 以降で利用可能）を使用することを推奨します。以下はその例です。

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

一部のパラメータは、キー値引数で上書きできます。

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```


## 実装の詳細 {#implementation-details}

PostgreSQL 側での `SELECT` クエリは、読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行され、各 `SELECT` クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN` といった単純な `WHERE` 句は PostgreSQL サーバー上で実行されます。

すべての JOIN、集約、ソート、`IN [ array ]` 条件、および `LIMIT` によるサンプリング制約は、PostgreSQL へのクエリが完了した後にのみ ClickHouse 側で実行されます。

PostgreSQL 側での `INSERT` クエリは、PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行され、各 `INSERT` 文の後に自動コミットされます。

PostgreSQL の `Array` 型は ClickHouse の配列型に変換されます。

:::note
注意してください。PostgreSQL では、`type_name[]` のように作成された配列データは、同じカラム内の異なるテーブル行ごとに、次元数の異なる多次元配列を含めることができます。しかし ClickHouse では、同じカラム内のすべてのテーブル行で、同じ次元数の多次元配列のみが許可されます。
:::

複数のレプリカをサポートしており、`|` で列挙する必要があります。例:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL の辞書ソースではレプリカの優先度指定がサポートされています。マップ内の数値が大きいほど優先度は低くなります。最も高い優先度は `0` です。

次の例では、レプリカ `example01-1` が最も高い優先度となります。

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

### PostgreSQL のテーブル {#table-in-postgresql}

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

### ClickHouse でテーブルを作成し、前述の PostgreSQL テーブルに接続する {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、[PostgreSQL table engine](/engines/table-engines/integrations/postgresql.md) を使用して、ClickHouse テーブルを PostgreSQL テーブルに接続し、PostgreSQL データベースに対して SELECT 文および INSERT 文を実行します。

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### SELECT クエリを使用して PostgreSQL テーブルから ClickHouse テーブルへ初期データを挿入する {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql テーブル関数](/sql-reference/table-functions/postgresql.md) は PostgreSQL から ClickHouse へデータをコピーします。これは、多くの場合、PostgreSQL ではなく ClickHouse 上でクエリや分析を実行することでデータのクエリパフォーマンスを向上させるため、あるいは PostgreSQL から ClickHouse へデータを移行するために使用されます。ここでは PostgreSQL から ClickHouse へデータをコピーするため、ClickHouse では MergeTree テーブルエンジンを使用したテーブルを作成し、名前を postgresql&#95;copy とします。

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

### PostgreSQL テーブルから ClickHouse テーブルへの増分データ挿入 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

初回の挿入後に PostgreSQL テーブルと ClickHouse テーブルの間で継続的な同期を行う場合、ClickHouse 側で `WHERE` 句を使用して、タイムスタンプまたは一意のシーケンス ID に基づき、PostgreSQL に新たに追加されたデータのみを挿入できます。

これを実現するには、次のように、これまでに取り込んだ最大 ID またはタイムスタンプを追跡しておく必要があります。

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

次に、PostgreSQL テーブルから最大値を超える値を挿入します

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 生成された ClickHouse テーブルからデータを選択する {#selecting-data-from-the-resulting-clickhouse-table}

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

* [`postgresql` テーブル関数](../../../sql-reference/table-functions/postgresql.md)
* [PostgreSQL をディクショナリのソースとして使用する](/sql-reference/dictionaries#mysql)


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と PostgreSQL - データ天国で生まれたベストマッチ - パート 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouse と PostgreSQL - データ天国で生まれたベストマッチ - パート 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
