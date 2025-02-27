---
slug: /engines/table-engines/integrations/postgresql
title: "PostgreSQL テーブルエンジン"
sidebar_position: 160
sidebar_label: PostgreSQL
description: "PostgreSQL エンジンは、リモート PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できます。"
---

PostgreSQL エンジンは、リモート PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できます。

:::note
現在、サポートされているのは PostgreSQL バージョン 12 以上のみです。
:::

:::note Postgres データのレプリケーションまたは移行には PeerDB を使用
> PostgreSQL テーブルエンジンに加えて、[PeerDB](https://docs.peerdb.io/introduction) を ClickHouse で使用して、Postgres から ClickHouse への継続的なデータパイプラインを構築できます。PeerDB は、変更データキャプチャ (CDC) を使用して Postgres から ClickHouse へのデータレプリケーションを目的としたツールです。
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

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query) クエリの詳細な説明を参照してください。

テーブル構造は元の PostgreSQL テーブル構造と異なる場合があります：

- カラム名は元の PostgreSQL テーブルと同じである必要がありますが、これらのカラムの一部だけを使用することができ、順序も任意です。
- カラムの型は元の PostgreSQL テーブルと異なる場合があります。ClickHouse は値を ClickHouse データ型に[キャスト](../../../engines/database-engines/postgresql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](../../../operations/settings/settings.md#external-table-functions-use-nulls) 設定は、Nullable カラムの扱いを定義します。デフォルト値: 1。0の場合、テーブル関数は Nullable カラムを作成せず、null の代わりにデフォルト値を挿入します。これは、配列内の NULL 値にも適用されます。

**エンジンパラメータ**

- `host:port` — PostgreSQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQL ユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — 衝突解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。注意: このオプションを追加すると挿入の効率が低下します。

[名前付きコレクション](/operations/named-collections.md)（バージョン 21.11 以降利用可能）は、運用環境での使用が推奨されます。以下はその例です：

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

いくつかのパラメータはキー値引数によって上書きできます：
``` sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 実装の詳細 {#implementation-details}

PostgreSQL 側での `SELECT` クエリは、読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行され、各 `SELECT` クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`, および `IN` のような単純な `WHERE` 条件は、PostgreSQL サーバーで実行されます。

すべての結合、集計、ソート、`IN [ array ]` 条件および `LIMIT` サンプリング制約は、PostgreSQL へのクエリが終了した後に ClickHouse でのみ実行されます。

PostgreSQL 側での `INSERT` クエリは、PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行され、各 `INSERT` ステートメントの後に自動コミットされます。

PostgreSQL の `Array` 型は ClickHouse の配列に変換されます。

:::note
注意が必要です - PostgreSQL では、`type_name[]` のように作成された配列データは、同じカラム内の異なるテーブル行で異なる次元の多次元配列を含むことがあります。しかし、ClickHouse では、同じカラム内のすべてのテーブル行で同じ数の次元の多次元配列を持つことのみが許可されています。
:::

複数のレプリカがサポートされ、`|` で区切って列挙する必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL 辞書ソースのレプリカの優先度もサポートされています。マップ内の数値が大きいほど優先度が低くなります。最も高い優先度は `0` です。

以下の例では、レプリカ `example01-1` が最も高い優先度を持っています：

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

### ClickHouse でのテーブルの作成と、上記で作成した PostgreSQL テーブルへの接続 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

この例では、[PostgreSQL テーブルエンジン](/engines/table-engines/integrations/postgresql.md)を使用して、ClickHouse テーブルを PostgreSQL テーブルに接続し、両方の SELECT および INSERT ステートメントを PostgreSQL データベースに対して使用します：

``` sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### PostgreSQL テーブルから ClickHouse テーブルへの初期データの挿入、SELECT クエリを使用 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql テーブル関数](/sql-reference/table-functions/postgresql.md)は、PostgreSQL から ClickHouse にデータをコピーします。これは、PostgreSQL ではなく ClickHouse でクエリや分析を実行することによってデータのクエリパフォーマンスを向上させるのに頻繁に使用されます。あるいは、PostgreSQL から ClickHouse へのデータ移行にも使用できます。PostgreSQL から ClickHouse にデータをコピーするため、ClickHouse では MergeTree テーブルエンジンを使用し、名前を postgresql_copy とします：

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

### PostgreSQL テーブルから ClickHouse テーブルへの増分データの挿入 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

その後、初回挿入後に PostgreSQL テーブルと ClickHouse テーブル間で継続的に同期を行う場合、ClickHouse で WHERE 句を使用して、タイムスタンプまたはユニークなシーケンス ID に基づいて PostgreSQL に追加されたデータのみを挿入できます。

これには、前回追加した最大 ID またはタイムスタンプを追跡する必要があります。例えば、以下のようにします：

``` sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

その後、最大よりも大きい PostgreSQL テーブルからの値を挿入します

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password')
WHERE int_id > maxIntID;
```

### 結果として得られた ClickHouse テーブルからのデータの選択 {#selecting-data-from-the-resulting-clickhouse-table}

``` sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

``` text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 非デフォルトのスキーマを使用 {#using-non-default-schema}

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

- [`postgresql` テーブル関数](../../../sql-reference/table-functions/postgresql.md)
- [PostgreSQL を辞書ソースとして使用する](../../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-postgresql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と PostgreSQL - データの天国で生まれたマッチ - パート 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouse と PostgreSQL - データの天国で生まれたマッチ - パート 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
