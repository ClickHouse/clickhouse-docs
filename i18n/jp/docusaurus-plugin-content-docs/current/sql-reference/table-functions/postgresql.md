---
'description': 'リモート PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できるようにします。'
'sidebar_label': 'postgresql'
'sidebar_position': 160
'slug': '/sql-reference/table-functions/postgresql'
'title': 'postgresql'
'doc_type': 'reference'
---


# postgresql テーブル関数

リモートの PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行することを許可します。

## 構文 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## 引数 {#arguments}

| 引数          | 説明                                                                     |
|---------------|---------------------------------------------------------------------------|
| `host:port`   | PostgreSQL サーバーアドレス。                                           |
| `database`    | リモートデータベース名。                                                |
| `table`       | リモートテーブル名。                                                   |
| `user`        | PostgreSQL ユーザー。                                                   |
| `password`    | ユーザーパスワード。                                                    |
| `schema`      | 非デフォルトのテーブルスキーマ。オプション。                            |
| `on_conflict` | 競合解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。                 |

引数は、[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。この場合、`host` と `port` は別々に指定する必要があります。このアプローチは本番環境で推奨されます。

## 戻り値 {#returned_value}

オリジナルの PostgreSQL テーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT` クエリでは、テーブル関数 `postgresql(...)` をカラム名リストを持つテーブル名と区別するために、キーワード `FUNCTION` または `TABLE FUNCTION` を使用する必要があります。以下の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL 側の `SELECT` クエリは、各 `SELECT` クエリの後にコミットを行う、読み取り専用の PostgreSQL トランザクション内で `COPY (SELECT ...) TO STDOUT` として実行されます。

`=`, `!=`, `>`, `>=`, `<`, `<=` および `IN` のような単純な `WHERE` 条件は、PostgreSQL サーバー上で実行されます。

すべての結合、集約、ソート、`IN [ array ]` 条件、および `LIMIT` サンプリング制約は、PostgreSQL へのクエリが完了した後に ClickHouse でのみ実行されます。

PostgreSQL 側の `INSERT` クエリは、各 `INSERT` ステートメントの後に自動コミットで PostgreSQL トランザクション内で `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` として実行されます。

PostgreSQL の配列型は、ClickHouse の配列に変換されます。

:::note
注意してください。PostgreSQL では、Integer[] のような配列データ型のカラムは、異なる行の中で異なる次元の配列を含むことがありますが、ClickHouse ではすべての行で同じ次元の多次元配列を持つことがのみ許可されます。
:::

複数のレプリカをサポートしており、`|` でリストする必要があります。例えば：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL 辞書ソースのためのレプリカの優先度をサポートします。マップ内の数値が大きいほど、優先度は低くなります。最高の優先度は `0` です。

## 例 {#examples}

PostgreSQL のテーブル：

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

平文引数を使用して ClickHouse からデータを選択する：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または [名前付きコレクション](operations/named-collections.md) を使用して：

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

挿入：

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

非デフォルトのスキーマを使用：

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
- [PostgreSQL を辞書ソースとして使用する](/sql-reference/dictionaries#postgresql)

### PeerDB を使用した PostgreSQL データのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、常に [PeerDB](https://docs.peerdb.io/introduction) を使用して、Postgres から ClickHouse への継続的なデータパイプラインを設定できます。PeerDB は、変更データキャプチャ (CDC) を使用して Postgres から ClickHouse へデータをレプリケートするために特別に設計されたツールです。
