---
slug: /sql-reference/table-functions/postgresql
sidebar_position: 160
sidebar_label: postgresql
---

# postgresql

リモートのPostgreSQLサーバーに保存されたデータに対して、`SELECT`および`INSERT`クエリを実行することができます。

**構文**

``` sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**パラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。
- `schema` — 非デフォルトのテーブルスキーマ。オプション。
- `on_conflict` — コンフリクト解決戦略。例: `ON CONFLICT DO NOTHING`。オプション。

引数は、[名前付きコレクション](/operations/named-collections.md)を使用しても渡すことができます。この場合、`host`および`port`は別々に指定する必要があります。このアプローチは、プロダクション環境での使用が推奨されます。

**返される値**

元のPostgreSQLテーブルと同じカラムを持つテーブルオブジェクト。

:::note
`INSERT`クエリにおいて、テーブル関数`postgresql(...)`とカラム名リストを持つテーブル名を区別するためには、`FUNCTION`または`TABLE FUNCTION`というキーワードを使用する必要があります。下記の例を参照してください。
:::

## 実装の詳細 {#implementation-details}

PostgreSQL側での`SELECT`クエリは、読み取り専用のPostgreSQLトランザクション内で`COPY (SELECT ...) TO STDOUT`として実行され、各`SELECT`クエリの後にコミットされます。

`=`, `!=`, `>`, `>=`, `<`, `<=`、および`IN`のような単純な`WHERE`句は、PostgreSQLサーバー上で実行されます。

すべての結合、集約、ソート、`IN [ array ]`条件、および`LIMIT`サンプリング制約は、PostgreSQLへのクエリが終了した後にのみClickHouseで実行されます。

PostgreSQL側での`INSERT`クエリは、PostgreSQLトランザクション内で`COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`として実行され、各`INSERT`文の後に自動コミットされます。

PostgreSQLの配列型はClickHouseの配列に変換されます。

:::note
注意してください。PostgreSQLでは、Integer[] のような配列データ型のカラムは異なる行に異なる次元の配列が含まれることがありますが、ClickHouseでは、すべての行に同じ次元の多次元配列のみが許可されています。
:::

複数のレプリカがサポートされており、`|`で区切ってリストします。たとえば：

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

または

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL辞書ソースのためのレプリカの優先順位もサポートされています。マップ内の数値が大きいほど、優先度は低くなります。最も高い優先度は`0`です。

**例**

PostgreSQLにおけるテーブル：

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

ClickHouseからプレーン引数を使用してデータを選択：

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

または[名前付きコレクション](/operations/named-collections.md)を使用：

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

挿入：

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

非デフォルトスキーマを使用：

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

- [PostgreSQLテーブルエンジン](../../engines/table-engines/integrations/postgresql.md)
- [DictionaryのソースとしてPostgreSQLを使用](../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-postgresql)

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとPostgreSQL - データ天国でのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データ天国でのマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### PeerDBを使用したPostgresデータのレプリケーションまたは移行 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> テーブル関数に加えて、ClickHouseによる[PeerDB](https://docs.peerdb.io/introduction)を使用して、PostgresからClickHouseへの連続データパイプラインを設定することができます。PeerDBは、変更データキャプチャ（CDC）を使用して、PostgresからClickHouseへデータをレプリケートするために特別に設計されたツールです。
