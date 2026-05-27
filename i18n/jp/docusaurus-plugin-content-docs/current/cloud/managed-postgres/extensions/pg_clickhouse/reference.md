---
sidebar_label: 'リファレンス'
description: 'pg_clickhouse の完全なリファレンス資料'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse/reference'
title: 'pg_clickhouse リファレンス資料'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部データラッパー', 'pg_clickhouse', '拡張機能']
---

## 説明 \{#description\}

pg&#95;clickhouse は、[外部データラッパー] を含む、ClickHouse データベースに対するリモート
クエリの実行を可能にする PostgreSQL の拡張機能です。PostgreSQL 13 以降と
ClickHouse 23 以降をサポートしています。

## はじめに \{#getting-started\}

pg&#95;clickhouse を試す最も簡単な方法は [Docker イメージ] を使うことです。これには、
pg&#95;clickhouse と [re2][re2
extension] 拡張機能を含む標準の PostgreSQL Docker イメージが含まれています。

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouseテーブルのインポートと
クエリのプッシュダウンを始めるには、[チュートリアル](tutorial.md)を参照してください。

## 使用方法 \{#usage\}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```

## バージョニングポリシー \{#versioning-policy\}

pg&#95;clickhouse は、公開リリースにおいて [Semantic Versioning] に準拠しています。

* API の変更時にはメジャーバージョンを上げます
* 後方互換性のある SQL の変更時にはマイナーバージョンを上げます
* バイナリのみの変更時にはパッチバージョンを上げます

インストール後、PostgreSQL は 2 種類のバージョン情報を追跡します。

* ライブラリバージョン (PostgreSQL 18 以降では `PG_MODULE_MAGIC` で定義) は完全なセマンティックバージョンを含み、`pgch_version()` 関数の出力または Postgres の [`pg_get_loaded_modules()`] 関数で確認できます。
* 拡張機能バージョン (control file で定義) はメジャーバージョンとマイナーバージョンのみを含み、`pg_catalog.pg_extension` テーブル、`pg_available_extension_versions()` 関数の出力、および `\dx
  pg_clickhouse` で確認できます。

実際には、これは、たとえば `v0.1.0` から `v0.1.1` のようにパッチバージョンのみが増えるリリースでは、`v0.1` を読み込んでいるすべてのデータベースがそのままアップグレードの恩恵を受けられ、`ALTER EXTENSION` を実行する必要がないことを意味します。

一方、マイナーまたはメジャーバージョンが増えるリリースには SQL アップグレードスクリプトが付属するため、拡張機能を含む既存のすべてのデータベースで、アップグレードの恩恵を受けるには `ALTER EXTENSION pg_clickhouse UPDATE` を実行する必要があります。

## DDL SQL リファレンス \{#ddl-sql-reference\}

以下の SQL [DDL] 式では、pg&#95;clickhouse を使用します。

### CREATE EXTENSION \{#create-extension\}

データベースに pg&#95;clickhouse を追加するには、[CREATE EXTENSION] を使用します。

```sql
CREATE EXTENSION pg_clickhouse;
```

特定のスキーマにインストールする場合は、`WITH SCHEMA` を使用します (推奨) :

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```

### ALTER EXTENSION \{#alter-extension\}

[ALTER EXTENSION] を使用して pg&#95;clickhouse を変更します。例:

* pg&#95;clickhouse の新しいリリースをインストールした後は、`UPDATE` 句を使用します:

  ```sql
  ALTER EXTENSION pg_clickhouse UPDATE;
  ```

* `SET SCHEMA` を使用して、拡張機能を新しいスキーマへ移動します:

  ```sql
  CREATE SCHEMA ch;
  ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
  ```

### DROP EXTENSION \{#drop-extension\}

データベースから pg&#95;clickhouse 拡張機能を削除するには、[DROP EXTENSION] を使用します。

```sql
DROP EXTENSION pg_clickhouse;
```

このコマンドは、pg&#95;clickhouse に依存するオブジェクトが存在すると失敗します。これらも削除するには、
`CASCADE` 句を使用します:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```

### CREATE SERVER \{#create-server\}

[CREATE SERVER] を使用して、ClickHouse サーバーに接続する 外部サーバー を作成します。例:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

サポートされているオプションは次のとおりです。

* `driver`: 使用する ClickHouse 接続ドライバーです。&quot;binary&quot; または
  &quot;http&quot; のいずれかを指定します。**必須です。**
* `dbname`: 接続時に使用する ClickHouse データベースです。デフォルトは
  &quot;default&quot; です。
* `fetch_size`: HTTP ストリーミングのバイト単位のおおよそのバッチサイズです。バッチは
  行境界で分割されます。デフォルトは `50000000` (50 MB) です。`0` を指定すると
  ストリーミングは無効になり、応答全体がバッファリングされます。外部テーブルではこの
  値を上書きできます。
* `host`: ClickHouse サーバーのホスト名です。デフォルトは &quot;localhost&quot; です。
* `port`: ClickHouse サーバーへの接続に使用するポートです。デフォルト値は
  次のとおりです。
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud ホストの場合は 9440
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud ホストでない場合は 9004
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud ホストの場合は 8443
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud ホストでない場合は 8123

### ALTER SERVER \{#alter-server\}

[ALTER SERVER] を使用して 外部サーバー を変更します。例:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

[CREATE SERVER](#create-server) と同じオプションを使用できます。

### DROP SERVER \{#drop-server\}

外部サーバーを削除するには、[DROP SERVER] を使用します:

```sql
DROP SERVER taxi_srv;
```

このコマンドは、そのサーバーに依存する他のオブジェクトがある場合は失敗します。`CASCADE` を使用して、
それらの依存オブジェクトも削除します:

```sql
DROP SERVER taxi_srv CASCADE;
```

### CREATE USER MAPPING \{#create-user-mapping\}

[CREATE USER MAPPING] を使用して、PostgreSQL ユーザーを ClickHouse ユーザーにマッピングします。たとえば、`taxi_srv` 外部サーバー 経由で接続する際に、現在の PostgreSQL ユーザーをリモートの ClickHouse ユーザーにマッピングするには、次のようにします。

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

サポートされているオプションは次のとおりです。

* `user`: ClickHouse ユーザーの名前です。既定値は &quot;default&quot; です。
* `password`: ClickHouse ユーザーのパスワードです。

### ALTER USER MAPPING \{#alter-user-mapping\}

ユーザーマッピングの定義を変更するには、[ALTER USER MAPPING] を使用します。

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

オプションは [CREATE USER MAPPING](#create-user-mapping) と同じです。

### DROP USER MAPPING \{#drop-user-mapping\}

ユーザーマッピングを削除するには、[DROP USER MAPPING] を使用します:

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```

### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

[IMPORT FOREIGN SCHEMA] を使用すると、ClickHouse
データベースで定義されているすべてのテーブルを、外部テーブルとして PostgreSQL スキーマにインポートできます:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

`LIMIT TO` を使用して、特定のテーブルのみにインポートを制限します。

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

`EXCEPT` を使用してテーブルを除外します：

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse は、指定した ClickHouse
データベース (上記の例では &quot;demo&quot;) 内のすべてのテーブルの一覧を取得し、各テーブルのカラム定義を取得したうえで、
外部テーブルを作成するための [CREATE FOREIGN TABLE](#create-foreign-table) コマンドを実行します。
カラムは、[サポートされているデータ
型](#data-types) と、検出できる場合は [CREATE
FOREIGN TABLE](#create-foreign-table) でサポートされるオプションを使用して定義されます。

:::tip インポートした識別子の大文字小文字の保持

`IMPORT FOREIGN SCHEMA` は、インポートするテーブル名とカラム名に対して `quote_identifier()` を実行します。これにより、大文字や空白を含む識別子は二重引用符で囲まれます。
そのため、そのようなテーブル名やカラム名は PostgreSQL クエリ内で二重引用符で囲む必要があります。
すべて小文字で空白を含まない名前は、引用符で囲む必要はありません。

たとえば、次のような ClickHouse テーブルがあるとします。

```sql
 CREATE OR REPLACE TABLE test
 (
     id UInt64,
     Name TEXT,
     updatedAt DateTime DEFAULT now()
 )
 ENGINE = MergeTree
 ORDER BY id;
```

`IMPORT FOREIGN SCHEMA` は、次の外部テーブルを作成します:

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

したがって、クエリ内では適切に引用符で囲む必要があります。たとえば、

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

別の名前、またはすべて小文字の名前 (つまり
大文字と小文字を区別しない名前) のオブジェクトを作成するには、[CREATE FOREIGN TABLE](#create-foreign-table) を使用します。
:::

### CREATE FOREIGN TABLE \{#create-foreign-table\}

[CREATE FOREIGN TABLE] を使用して、ClickHouse データベース内のデータを
クエリできる外部テーブルを作成します:

```sql
CREATE FOREIGN TABLE acts (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'acts'
    engine 'CollapsingMergeTree'
);
```

サポートされているテーブルオプションは次のとおりです。

* `database`: リモートデータベースの名前です。デフォルトでは、外部サーバー に
  定義されているデータベースが使用されます。
* `fetch_size`: HTTP ストリーミングにおける、おおよそのバッチサイズ (バイト単位) です。サーバーレベルの
  `fetch_size` を上書きします。デフォルトは `50000000` (50 MB) です。`0` を指定すると
  ストリーミングが無効になり、レスポンス全体がバッファされます。
* `table_name`: リモートテーブルの名前です。デフォルトでは、foreign table に
  指定された名前が使用されます。
* `engine`: ClickHouse テーブルで使用する [テーブルエンジン] です。
  `CollapsingMergeTree()` および `AggregatingMergeTree()` では、pg&#95;clickhouse が
  テーブル上で実行される関数式に対してパラメータを自動的に適用します。

各カラムについて、リモートの ClickHouse における対応するデータ
型に適した [データ型](#data-types) を使用してください。サポートされているカラムオプションは次のとおりです。

* `column_name`: ClickHouse 側のカラム名です。クエリや insert の
  デパース時には、PostgreSQL の attribute 名よりもこちらが優先して使用されます。
  これは、引用符なしの小文字の PostgreSQL カラム名を、大文字と小文字を区別する
  ClickHouse のカラムに対応付ける場合に便利です。たとえば次のとおりです。

  ```sql
  CREATE FOREIGN TABLE hits (
      watchid    bigint   OPTIONS(column_name 'WatchID'),
      javaenable smallint OPTIONS(column_name 'JavaEnable'),
      title      text     OPTIONS(column_name 'Title')
  ) SERVER taxi_srv OPTIONS(table_name 'hits');
  ```

* `AggregateFunction`: [AggregateFunction 型] カラムに適用される
  集約関数の名前です。データ型は、その関数に渡す ClickHouse 型に対応付けます。
  適切なカラムオプションで集約関数名を指定すると、pg&#95;clickhouse はそのカラムを評価する
  集約関数に `Merge` を自動的に付加します。

  ```sql
  CREATE FOREIGN TABLE test (
      column1 bigint  OPTIONS(AggregateFunction 'uniq'),
      column2 integer OPTIONS(AggregateFunction 'anyIf'),
      column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
  ) SERVER clickhouse_srv;
  ```

* `SimpleAggregateFunction`: [SimpleAggregateFunction 型] カラムに適用される
  集約関数の名前です。データ型は、その関数に渡す
  ClickHouse 型に対応付け、適切なカラムオプションで
  集約関数名を指定してください。

### ALTER FOREIGN TABLE \{#alter-foreign-table\}

外部テーブルの定義を変更するには、[ALTER FOREIGN TABLE] を使用します。

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

サポートされるテーブルおよびカラムのオプションは、[CREATE FOREIGN
TABLE] の場合と同じです。

### DROP FOREIGN TABLE \{#drop-foreign-table\}

外部テーブルを削除するには、[DROP FOREIGN TABLE] を使用します。

```sql
DROP FOREIGN TABLE acts;
```

このコマンドは、外部テーブルに依存するオブジェクトがある場合は失敗します。
それらも削除するには、`CASCADE` 句を使用します。

```sql
DROP FOREIGN TABLE acts CASCADE;
```

## DML SQL リファレンス \{#dml-sql-reference\}

以下の SQL の [DML] 式では、pg&#95;clickhouse を使用する場合があります。例では、
以下の ClickHouse テーブルを使用します。

```sql
CREATE TABLE logs (
    req_id    Int64 NOT NULL,
    start_at   DateTime64(6, 'UTC') NOT NULL,
    duration  Int32 NOT NULL,
    resource  Text  NOT NULL,
    method    Enum8('GET' = 1, 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'QUERY') NOT NULL,
    node_id   Int64 NOT NULL,
    response  Int32 NOT NULL
) ENGINE = MergeTree
  ORDER BY start_at;

CREATE TABLE nodes (
    node_id Int64 NOT NULL,
    name    Text  NOT NULL,
    region  Text  NOT NULL,
    arch    Text  NOT NULL,
    os      Text  NOT NULL
) ENGINE = MergeTree
  PRIMARY KEY node_id;
```

### EXPLAIN \{#explain\}

[EXPLAIN] コマンドは想定どおりに動作しますが、`VERBOSE` オプションを指定すると、
ClickHouse の &quot;Remote SQL&quot; クエリが出力されます:

```pgsql
try=# EXPLAIN (VERBOSE)
       SELECT resource, avg(duration) AS average_duration
         FROM logs
        GROUP BY resource;
                                     QUERY PLAN
------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=64)
   Output: resource, (avg(duration))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT resource, avg(duration) FROM "default".logs GROUP BY resource
(4 rows)
```

このクエリは、「Foreign Scan」プランノードを介して ClickHouse にプッシュダウンされ、
リモート SQL として実行されます。

### SELECT \{#select\}

[SELECT]ステートメントを使用すると、pg&#95;clickhouse テーブルに対しても、他のテーブルと同様に
クエリを実行できます。

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totem
(1 row)
```

pg&#95;clickhouse は、集約関数を含め、可能な限りクエリ実行を ClickHouse に
プッシュダウンします。プッシュダウンの範囲を確認するには、
[EXPLAIN](#explain) を使用します。たとえば、上記のクエリでは、実行はすべて
ClickHouse にプッシュダウンされます

```pgsql
try=# EXPLAIN (VERBOSE, COSTS OFF)
       SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
                                             QUERY PLAN
-----------------------------------------------------------------------------------------------------
 Foreign Scan on public.logs
   Output: start_at, duration, resource
   Remote SQL: SELECT start_at, duration, resource FROM "default".logs WHERE ((req_id = 4117909262))
(3 rows)
```

pg&#95;clickhouse は、同じリモートサーバー上にあるテーブル同士の JOIN もプッシュダウンします:

```pgsql
try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN nodes on logs.node_id = nodes.node_id
        GROUP BY name;
                                                                                  QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=72) (actual time=3.201..3.221 rows=8.00 loops=1)
   Output: nodes.name, (count(*)), (round(avg(logs.duration), 0))
   Relations: Aggregate on ((logs) LEFT JOIN (nodes))
   Remote SQL: SELECT r2.name, count(*), round(avg(r1.duration), 0) FROM  "default".logs r1 ALL LEFT JOIN "default".nodes r2 ON (((r1.node_id = r2.node_id))) GROUP BY r2.name
   FDW Time: 0.086 ms
 Planning Time: 0.335 ms
 Execution Time: 3.261 ms
(7 rows)
```

ローカルテーブルとの結合では、適切に
チューニングしないと、非効率なクエリが生成されます。この例では、
`nodes` テーブルのローカルコピーを作成し、リモートテーブルではなく
これに結合します。

```pgsql
try=# CREATE TABLE local_nodes AS SELECT * FROM nodes;
SELECT 8

try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN local_nodes on logs.node_id = local_nodes.node_id
        GROUP BY name;
                                                             QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------
 HashAggregate  (cost=147.65..150.65 rows=200 width=72) (actual time=6.215..6.235 rows=8.00 loops=1)
   Output: local_nodes.name, count(*), round(avg(logs.duration), 0)
   Group Key: local_nodes.name
   Batches: 1  Memory Usage: 32kB
   Buffers: shared hit=1
   ->  Hash Left Join  (cost=31.02..129.28 rows=2450 width=36) (actual time=2.202..5.125 rows=1000.00 loops=1)
         Output: local_nodes.name, logs.duration
         Hash Cond: (logs.node_id = local_nodes.node_id)
         Buffers: shared hit=1
         ->  Foreign Scan on public.logs  (cost=10.00..20.00 rows=1000 width=12) (actual time=2.089..3.779 rows=1000.00 loops=1)
               Output: logs.req_id, logs.start_at, logs.duration, logs.resource, logs.method, logs.node_id, logs.response
               Remote SQL: SELECT duration, node_id FROM "default".logs
               FDW Time: 1.447 ms
         ->  Hash  (cost=14.90..14.90 rows=490 width=40) (actual time=0.090..0.091 rows=8.00 loops=1)
               Output: local_nodes.name, local_nodes.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               Buffers: shared hit=1
               ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.069..0.073 rows=8.00 loops=1)
                     Output: local_nodes.name, local_nodes.node_id
                     Buffers: shared hit=1
 Planning:
   Buffers: shared hit=14
 Planning Time: 0.551 ms
 Execution Time: 6.589 ms
```

この場合、ローカルのカラムではなく `node_id` でグループ化することで、より多くの集約処理を ClickHouse 側にプッシュダウンし、その後でルックアップテーブルと join できます。

```sql
try=# EXPLAIN (ANALYZE, VERBOSE)
       WITH remote AS (
           SELECT node_id, count(*), round(avg(duration))
             FROM logs
            GROUP BY node_id
       )
       SELECT name, remote.count, remote.round
         FROM remote
         JOIN local_nodes
           ON remote.node_id = local_nodes.node_id
        ORDER BY name;
                                                          QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=65.68..66.91 rows=490 width=72) (actual time=4.480..4.484 rows=8.00 loops=1)
   Output: local_nodes.name, remote.count, remote.round
   Sort Key: local_nodes.name
   Sort Method: quicksort  Memory: 25kB
   Buffers: shared hit=4
   ->  Hash Join  (cost=27.60..43.79 rows=490 width=72) (actual time=4.406..4.422 rows=8.00 loops=1)
         Output: local_nodes.name, remote.count, remote.round
         Inner Unique: true
         Hash Cond: (local_nodes.node_id = remote.node_id)
         Buffers: shared hit=1
         ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.010..0.016 rows=8.00 loops=1)
               Output: local_nodes.node_id, local_nodes.name, local_nodes.region, local_nodes.arch, local_nodes.os
               Buffers: shared hit=1
         ->  Hash  (cost=15.10..15.10 rows=1000 width=48) (actual time=4.379..4.381 rows=8.00 loops=1)
               Output: remote.count, remote.round, remote.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               ->  Subquery Scan on remote  (cost=1.00..15.10 rows=1000 width=48) (actual time=4.337..4.360 rows=8.00 loops=1)
                     Output: remote.count, remote.round, remote.node_id
                     ->  Foreign Scan  (cost=1.00..5.10 rows=1000 width=48) (actual time=4.330..4.349 rows=8.00 loops=1)
                           Output: logs.node_id, (count(*)), (round(avg(logs.duration), 0))
                           Relations: Aggregate on (logs)
                           Remote SQL: SELECT node_id, count(*), round(avg(duration), 0) FROM "default".logs GROUP BY node_id
                           FDW Time: 0.055 ms
 Planning:
   Buffers: shared hit=5
 Planning Time: 0.319 ms
 Execution Time: 4.562 ms
```

&quot;Foreign Scan&quot; ノードで `node_id` ごとの集約がプッシュダウンされるようになり、
Postgres に引き戻す必要がある行数は 1000 行 (全件) から、
各ノードにつき 1 行の合計 8 行まで削減されました。

### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

v0.1.2以降、pg&#95;clickhouse はパラメータ化クエリをサポートしており、これらは主に [PREPARE] コマンドで作成されます。

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

通常どおり [EXECUTE] を使用して、プリペアドステートメントを実行します。

```pgsql
try=# EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
    date    | average_duration
------------+------------------
 2025-12-09 |              190
 2025-12-10 |              194
 2025-12-11 |              197
 2025-12-12 |              190
 2025-12-13 |              195
(5 rows)
```

:::warning
パラメーター化された実行では、ClickHouse 25.8 より前のバージョンで、
[http driver](#create-server) が DateTime のタイムゾーンを正しく変換できません。
この問題は、25.8 で[根本的なバグ]が[修正された]ことで解消されています。なお、PostgreSQL では
`PREPARE` を使用していなくても、パラメーター化されたクエリプランが使われることがあります。正確なタイムゾーン変換が必要なクエリで、
25.8 以降にアップグレードできない場合は、代わりに
[binary driver](#create-server) を使用してください。
:::

pg&#95;clickhouse は、通常どおり、[EXPLAIN](#explain) の詳細出力に
示されているように、集計をプッシュダウンします。

```pgsql
try=# EXPLAIN (VERBOSE) EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
                                                                                                            QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= '2025-12-09')) AND ((date(start_at) <= '2025-12-13')) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

完全な日付値が送信されており、パラメータのプレースホルダーではない点に注意してください。
これは、PostgreSQL の
[PREPARE に関する注記]で説明されているとおり、最初の 5 回のリクエストに当てはまります。6 回目の実行では、ClickHouse の
`{param:type}` 形式の[クエリパラメータ]を送信します。
parameters:

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

プリペアドステートメントの割り当てを解除するには、[DEALLOCATE] を使用します。

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```

### INSERT \{#insert\}

リモートのClickHouseテーブルに値を挿入するには、[INSERT]コマンドを使用します。

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```

### COPY \{#copy\}

リモートの ClickHouse テーブルに複数の行をまとめて挿入するには、[COPY] コマンドを使用します。

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ Batch API の制限**
>
> pg&#95;clickhouse では、PostgreSQL FDW のバッチ
> insert API のサポートがまだ実装されていません。そのため、現時点では [COPY] は [INSERT](#insert) 文を使用して
> レコードを挿入します。これは今後のリリースで改善される予定です。

### LOAD \{#load\}

pg&#95;clickhouse 共有ライブラリを読み込むには、[LOAD] を使用します：

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

通常、[LOAD] を使用する必要はありません。Postgres では、その機能 (関数、外部
テーブルなど) のいずれかを初めて使用した時点で、自動的に
pg&#95;clickhouse が読み込まれます。

[LOAD] pg&#95;clickhouse が有用になる可能性があるのは、[SET](#set) を使って、
それらに依存するクエリを実行する前に pg&#95;clickhouse のパラメータを設定したい場合です。

### SET \{#set\}

pg&#95;clickhouse のカスタム設定パラメータを設定するには、[SET] を使用します。

#### `pg_clickhouse.session_settings` \{#pg_clickhousesession_settings\}

`pg_clickhouse.session_settings` パラメータは、後続のクエリに適用する [ClickHouse
設定] を指定します。例:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

デフォルトは `join_use_nulls 1, group_by_use_nulls 1, final 1` です。空文字列に設定すると、
ClickHouse server の設定が使用されます。

```sql
SET pg_clickhouse.session_settings = '';
```

構文は、1 つ以上のスペースで区切られた、キー/値のペアからなるカンマ区切りのリストです。キーは [ClickHouse 設定] に対応している必要があります。値に含まれるスペース、カンマ、バックスラッシュは、バックスラッシュでエスケープします。

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

あるいは、スペースやカンマをエスケープしなくて済むように、値を単一引用符で囲んでください。[dollar quoting] を使うと、二重引用符で囲む必要もなくなります。

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

可読性を重視し、多くの設定を行う必要がある場合は、複数行で
記述してください。例:

```sql
SET pg_clickhouse.session_settings TO $$
    connect_timeout 2,
    count_distinct_implementation uniq,
    final 1,
    group_by_use_nulls 1,
    join_algorithm 'prefer_partial_merge',
    join_use_nulls 1,
    log_queries_min_type QUERY_FINISH,
    max_block_size 32768,
    max_execution_time 45,
    max_result_rows 1024,
    metrics_perf_events_list 'this,that',
    network_compression_method ZSTD,
    poll_interval 5,
    totals_mode after_having_auto
$$;
```

一部の設定は、pg&#95;clickhouse 自体の動作に支障をきたす場合、無視されます。対象は次のとおりです。

* `date_time_output_format`: HTTP ドライバーでは &quot;iso&quot; である必要があります
* `format_tsv_null_representation`: HTTP ドライバーではデフォルト値が必要です
* `output_format_tsv_crlf_end_of_line`: HTTP ドライバーではデフォルト値が必要です

それ以外の設定については、pg&#95;clickhouse は検証を行わず、すべてのクエリで
そのまま ClickHouse に渡します。そのため、各 ClickHouse バージョンで利用可能な
すべての設定をサポートします。

`pg_clickhouse.session_settings` を設定する前に、pg&#95;clickhouse がロードされている必要があることに
注意してください。そのため、[共有ライブラリのプリロード] を使用するか、
拡張機能内のいずれかのオブジェクトを使って確実にロードされるようにしてください。

#### `pg_clickhouse.pushdown_regex` \{#pg_clickhousepushdown_regex\}

`pg_clickhouse.pushdown_regex` パラメータは、pg&#95;clickhouse
が正規表現関数および演算子をプッシュダウンするかどうかを制御します。既定では有効です。
これらがプッシュダウンされないようにするには、このパラメータを false に設定します:

```sql
SET pg_clickhouse.pushdown_regex = 'false';
```

詳細については、[正規表現](#regular-expressions)を参照してください。

### ALTER ROLE \{#alter-role\}

[ALTER ROLE]&#39;s `SET` コマンドを使用して、pg&#95;clickhouse を[プリロード](#preloading)したり、
特定のロールに対してその[パラメーターを `SET`](#set) したりできます。

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

[ALTER ROLE] の `RESET` コマンドを使用して、pg&#95;clickhouse のプリロード
および/またはパラメーターをリセットします:

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```

## プリロード \{#preloading\}

ほぼすべて、またはすべての Postgres 接続で pg&#95;clickhouse を使用する必要がある場合は、[共有ライブラリのプリロード]を使用して自動的に読み込むことを検討してください。

### `session_preload_libraries` \{#session_preload_libraries\}

PostgreSQL への新規接続ごとに共有ライブラリを読み込みます。

```ini
session_preload_libraries = pg_clickhouse
```

サーバーを再起動せずに更新を反映できるので便利です。再接続するだけで済みます。[ALTER
ROLE](#alter-role) を使用して、特定のユーザーまたはロールに対して設定することもできます。

### `shared_preload_libraries` \{#shared_preload_libraries\}

起動時に、共有ライブラリを PostgreSQL の親プロセスに読み込みます。

```ini
shared_preload_libraries = pg_clickhouse
```

各セッションでのメモリ使用量とロードのオーバーヘッドを抑えるのに有用ですが、ライブラリの更新時には
クラスターを再起動する必要があります。

## データ型 \{#data-types\}

pg&#95;clickhouse では、以下の ClickHouse データ型を PostgreSQL のデータ
型にマッピングします。[IMPORT FOREIGN SCHEMA](#import-foreign-schema) で
カラムをインポートする際は、PostgreSQL カラム型のうち最初の型が使用され
ます。追加の型は、[CREATE FOREIGN TABLE](#create-foreign-table) ステート
メントで使用できます。

| ClickHouse | PostgreSQL       | 備考                    |
| ---------- | ---------------- | --------------------- |
| Bool       | boolean          |                       |
| Date       | date             |                       |
| Date32     | date             |                       |
| DateTime   | timestamptz      |                       |
| Decimal    | numeric          |                       |
| Float32    | real             |                       |
| Float64    | double precision |                       |
| IPv4       | inet             |                       |
| IPv6       | inet             |                       |
| Int16      | smallint         |                       |
| Int32      | integer          |                       |
| Int64      | bigint           |                       |
| Int8       | smallint         |                       |
| JSON       | jsonb, json      |                       |
| String     | text, bytea      |                       |
| UInt16     | integer          |                       |
| UInt32     | bigint           |                       |
| UInt64     | bigint           | BIGINT の最大値を超える値ではエラー |
| UInt8      | smallint         |                       |
| UUID       | uuid             |                       |

追加の注記と詳細は以下のとおりです。

### BYTEA \{#bytea\}

ClickHouse は PostgreSQL の [BYTEA] 型に相当する型を提供していませんが、任意のバイト列を [String] 型に格納できます。一般的に、ClickHouse の文字列は PostgreSQL の [TEXT] にマップしますが、バイナリデータを扱う場合は [BYTEA] にマップしてください。例:

```sql
-- Create clickHouse table with String columns.
SELECT clickhouse_raw_query($$
    CREATE TABLE bytes (
        c1 Int8, c2 String, c3 String
    ) ENGINE = MergeTree ORDER BY (c1);
$$);

-- Create foreign table with BYTEA columns.
CREATE FOREIGN TABLE bytes (
    c1 int,
    c2 BYTEA,
    c3 BYTEA
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Insert binary data into the foreign table.
INSERT INTO bytes
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the results.
SELECT * FROM bytes;
```

最後の`SELECT`クエリの出力は以下のとおりです：

```pgsql
 c1 |                             c2                             |                 c3
----+------------------------------------------------------------+------------------------------------
  1 | \x1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | \xae3b28cde02542f81acce8783245430d
  2 | \x5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | \x23e7c6cacb8383f878ad093b0027d72b
  3 | \x53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | \x7e969132fc656148b97b6a2ee8bc83c1
  4 | \x4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | \x8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

ClickHouseのカラムにnulバイトが含まれている場合、[TEXT]カラムを使用する外部テーブルは正しい値を出力しません。

```sql
-- Create foreign table with TEXT columns.
CREATE FOREIGN TABLE texts (
    c1 int,
    c2 TEXT,
    c3 TEXT
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Encode binary data as hex.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

出力結果:

```pgsql
 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b
  3 | 53ac2c1fa83c8f64603fe9568d883331                         | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

2行目と3行目には切り詰められた値が含まれていることに注意してください。これは、PostgreSQLがnul終端文字列に依存しており、文字列内のnulをサポートしていないためです。

バイナリ値を [TEXT] カラムに挿入しようとすると、成功し、期待どおりに動作します：

```sql
-- Insert via text columns:
TRUNCATE texts;
INSERT INTO texts
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the data.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

テキストのカラムは正しく表示されます：

```pgsql

 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b0027d72b
  3 | 53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

ただし、[BYTEA] としては読み取れません:

```pgsql
# SELECT * FROM bytes;
 c1 |                                                           c2                                                           |                                   c3
----+------------------------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------
  1 | \x5c783162663766306363383231643331313738363136613535613865306335323637373733353339376364646536663431353361396664336437 | \x5c786165336232386364653032353432663831616363653837383332343534333064
  2 | \x5c783566366539653132636438353932373132653633383031366634623161326537333233306565343064623439386330663062316463383431 | \x5c783233653763366361636238333833663837386164303933623030323764373262
  3 | \x5c783533616332633166613833633866363436303366653935363864383833333331303037643632383164653333306134623565373238663965 | \x5c783765393639313332666336353631343862393762366132656538626338336331
  4 | \x5c783465336332653463623735343261343531373361386461633933396464633462633735323032653334326562633736396230663564613266 | \x5c783865663330663434633635343830643132623635306162366232623034323435
(4 rows)
```

:::tip
原則として、エンコード済みの文字列には [TEXT] カラムのみを使用し、[BYTEA] カラムは
バイナリデータにのみ使用してください。両者を使い分けず、決して混在させないでください。
:::

## 関数と演算子のリファレンス \{#function-and-operator-reference\}

### 関数 \{#functions\}

これらの関数は、ClickHouseデータベースにクエリを実行するためのインターフェイスです。

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

ClickHouse service の HTTP インターフェイス経由で接続し、単一の
クエリを実行して切断します。省略可能な 2 番目の引数には、既定で `host=localhost port=8123` となる接続
文字列を指定します。サポートされている接続
パラメータは次のとおりです。

* `host`: 接続先のホスト。必須です。
* `port`: 接続先の HTTP ポート。既定値は `8123` ですが、`host` が
  ClickHouse Cloud ホストの場合、既定値は `8443`
  です
* `dbname`: 接続先のデータベース名。
* `username`: 接続に使用するユーザー名。既定値は `default`
* `password`: 認証に使用するパスワード。既定ではパスワードは設定されません

既定では、どのロールにもこの関数に対する `EXECUTE` 権限はありません。アドホックな ClickHouse
クエリを実行する正当な必要があるロール、たとえば専用の ClickHouse
管理者ロールにのみ、[GRANT] でアクセスを付与することを検討してください。

結果レコードを返さないクエリに便利ですが、値を返すクエリの結果は
単一のテキスト値として返されます。

```sql
SELECT clickhouse_raw_query(
    'SELECT schema_name, schema_owner from information_schema.schemata',
    'host=localhost port=8123'
);
```

```sql
      clickhouse_raw_query
---------------------------------
 INFORMATION_SCHEMA      default+
 default default                +
 git     default                +
 information_schema      default+
 system  default                +

(1 row)
```

### プッシュダウン関数 \{#pushdown-functions\}

`pg_clickhouse` は、条件式 (`HAVING` 句および `WHERE` 句) で使用される PostgreSQL の組み込み関数の一部を ClickHouse にプッシュダウンします。対応する ClickHouse の関数は次のとおりです。

* `abs`: [abs](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#abs)
* `factorial`: [factorial](https://clickhouse.com/docs/sql-reference/functions/math-functions#factorial)
* `mod` (int2/int4/int8/numeric): [剰余](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#modulo)
* `pow` &amp; `power` (float8/numeric): [pow](https://clickhouse.com/docs/sql-reference/functions/math-functions#pow)
* `round`: [round](https://clickhouse.com/docs/sql-reference/functions/rounding-functions#round)
* `sin`, `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `asinh`, `degrees`, `radians`, `pi`: [ClickHouse math functions](https://clickhouse.com/docs/sql-reference/functions/math-functions) の同名の関数です。
  `asin`, `acos`, `atanh`, `acosh` はプッシュダウンされません。範囲外の入力に対しては、CH は `NaN` を返しますが、PG はエラーになります。
* `date_part`:
  * `date_part('day')`: [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`: [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`: [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`: [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`: [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`: [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`: [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`: [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`: [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`:
  * `date_trunc('week')`: [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`: [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`: [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`: [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`: [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`: [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`: [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`: [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `extract(field FROM source)`: `date_part` と同じ対応関係
* `date(timestamp)` &amp; `date(timestamptz)`: [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (CH のエイリアス `date` として逆解析)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `array_cat`: [arrayConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayConcat)
* `array_append`: [arrayPushBack](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushBack)
* `array_prepend`: [arrayPushFront](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushFront)
* `array_remove`: [arrayRemove](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRemove)
* `array_length` &amp; `cardinality`: [長さ](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `array_to_string`: [arrayStringConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayStringConcat)
* `string_to_array`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString)
* `split_part`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString) + 配列添字
* `trim_array`: [arrayResize](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayResize)
* `array_fill`: [arrayWithConstant](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayWithConstant)
* `array_reverse`: [arrayReverse](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverse)
* `array_shuffle`: [arrayShuffle](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayShuffle)
* `array_sample`: [arrayRandomSample](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRandomSample)
* `array_sort`: [arraySort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySort) / [arrayReverseSort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverseSort)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `ltrim`: [ltrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#ltrim)
* `rtrim`: [rtrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#rtrim)
* `concat_ws`: [concatWithSeparator](https://clickhouse.com/docs/sql-reference/functions/string-functions#concatwithseparator)
* `lower(text)`: [lowerUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lowerutf8)
* `upper(text)`: [upperUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#upperutf8)
* `substring(text, ...)` &amp; `substr(text, ...)`: [substringUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#substringutf8)
* `substring(bytea, ...)` &amp; `substr(bytea, ...)`: [substring](https://clickhouse.com/docs/sql-reference/functions/string-functions#substring)
* `length(text)`: [lengthUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lengthutf8)
* `length(bytea)` &amp; `octet_length`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `reverse(text)`: [reverseUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverseutf8)
* `reverse(bytea)`: [reverse](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverse)
* `strpos`: [positionUTF8](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#positionutf8)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `regexp_replace`: `g` フラグが指定されている場合は [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne) または [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `regexp_split_to_array`: [splitByRegexp](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByRegexp)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)
* `json_extract_path_text`: [サブカラムの構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `json_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [サブカラムの構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path_text`: [サブカラム構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [サブカラムの構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `bit_count(bytea)`: [bitCount](https://clickhouse.com/docs/sql-reference/functions/bit-functions#bitcount)
* `to_timestamp(float8)`: [fromUnixTimestamp](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#fromUnixTimestamp)
* `to_char(timestamp[tz], fmt)`: `fmt` が、すべてのキーワードに対応する
  ClickHouse の同等表現を持つ文字列定数である場合は、[formatDateTime](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime)
  です。サポートされるキーワードについては、互換性に関する注記の
  [to&#95;char()](#to_char) を参照してください。それ以外の場合、この関数は
  PostgreSQL 側でローカルに評価されます。
* `statement_timestamp`, `transaction_timestamp`, &amp; `clock_timestamp`:
  [nowInBlock64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#nowInBlock64)
  (`nowInBlock64(9, $session_timezone)`)
* `CURRENT_DATE`:
  [now](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now) および
  [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (`toDate(now($session_timezone))`)
* `now`, `CURRENT_TIMESTAMP`, &amp; `LOCALTIMESTAMP`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(9, $session_timezone)`)
* `CURRENT_TIMESTAMP(n)` &amp; `LOCALTIMESTAMP(n)`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(n, $session_timezone)`)
* `CURRENT_DATABASE`: PostgreSQL の関数から値として渡されます。
* `CURRENT_SCHEMA`: PostgreSQL関数から渡される値。
* `CURRENT_CATALOG`: PostgreSQL の関数から渡される値。
* `CURRENT_USER`: PostgreSQL 関数から渡される値。
* `USER`: PostgreSQL関数から値として渡されます。
* `CURRENT_ROLE`: PostgreSQL関数から値として渡される。
* `SESSION_USER`: PostgreSQL 関数の値として渡されます。

### プッシュダウン演算子 \{#pushdown-operators\}

* Array のスライス (`arr[L:U]`): [arraySlice](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySlice)
* `@>`  (配列が含む) : [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `<@`  (配列に含まれる) : [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `&&`  (配列が重複する) : [hasAny](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAny)
* `~`  (正規表現に一致) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~`  (正規表現に一致しない) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `~*`  (大文字と小文字を区別しない正規表現に一致) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~*`  (大文字と小文字を区別しない正規表現に一致しない) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `->>`  (JSON/JSONB の要素をテキストとして抽出) : [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `->`  (JSON/JSONB を抽出) : [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)

### カスタム関数 \{#custom-functions\}

`pg_clickhouse` で作成されたこれらのカスタム関数は、PostgreSQL に対応する機能がない一部の ClickHouse 関数について、外部クエリの
プッシュダウンを実現します。これらの関数のいずれかを
プッシュダウンできない場合は、例外が発生します。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### 拡張機能のプッシュダウン \{#extension-pushdown\}

pg&#95;clickhouse は、一部のコア拡張機能およびサードパーティ製拡張機能の関数を認識し、対応する ClickHouse の関数としてプッシュダウンします。

#### re2 \{#re2\}

すべての [re2 拡張機能] 関数は、ClickHouse に 1:1 でプッシュダウンされます。

* `re2match` → [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `re2extract` → [extract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extract)
* `re2extractall` → [extractAll](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractAll)
* `re2regexpextract` → [regexpExtract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#regexpExtract)
* `re2extractgroups` → [extractGroups](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractGroups)
* `re2replaceregexpone` → [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne)
* `re2replaceregexpall` → [replaceRegexpAll](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `re2countmatches` → [countMatches](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatches)
* `re2countmatchescaseinsensitive` → [countMatchesCaseInsensitive](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatchesCaseInsensitive)
* `re2multimatchany` → [multiMatchAny](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAny)
* `re2multimatchanyindex` → [multiMatchAnyIndex](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAnyIndex)
* `re2multimatchallindices` → [multiMatchAllIndices](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAllIndices)

#### intarray \{#intarray\}

ClickHouse にプッシュダウンされる [intarray] 関数は 1 つあります。

* `idx` → [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)

#### fuzzystrmatch \{#fuzzystrmatch\}

次の 2 つの [fuzzystrmatch] 関数は ClickHouse にプッシュダウンされます。

* `soundex`: [soundex](https://clickhouse.com/docs/sql-reference/functions/string-functions#soundex)
* `levenshtein` (2 引数) : [editDistanceUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#editDistanceUTF8)

### キャストのプッシュダウン \{#pushdown-casts\}

pg&#95;clickhouse は、`CAST(x AS bigint)` のようなキャストを、互換性のあるデータ型に対してプッシュダウンします。互換性のない型ではプッシュダウンに失敗します。たとえば、この例で `x` が ClickHouse の `UInt64` の場合、ClickHouse はその値のキャストを拒否します。

互換性のないデータ型へのキャストをプッシュダウンするために、pg&#95;clickhouse は
次の関数を提供しています。これらがプッシュダウンされなかった場合、PostgreSQL で例外が発生します。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### プッシュダウン集約 \{#pushdown-aggregates\}

これらの PostgreSQL 集約関数は ClickHouse にプッシュダウンされます。

* [array&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [bit&#95;and](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bit&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [bit&#95;xor](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitxor)
* [bool&#95;and / every](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bool&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)
* [string&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupconcat)
* [sum](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/sum)

### カスタム集約 \{#custom-aggregates\}

`pg_clickhouse` が作成するこれらのカスタム aggregate functions は、PostgreSQL に対応する関数がない一部の ClickHouse 集約関数について、外部クエリの プッシュダウン を提供します。これらの関数のいずれかを プッシュダウン できない場合は、例外を送出します。

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### 順序付き集合集約のプッシュダウン \{#pushdown-ordered-set-aggregates\}

これらの[順序付き集合集約関数]は、*直接引数*をパラメータとして渡し、
`ORDER BY` 式を引数として渡すことで、ClickHouse の[Parametric
aggregate functions]に対応付けられます。たとえば、次の PostgreSQL クエリです。

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

これは次のClickHouseクエリに相当します:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

デフォルト以外の `ORDER BY` 接尾辞である `DESC` と `NULLS FIRST` は
サポートされておらず、指定するとエラーになります。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### プッシュダウンされるウィンドウ関数 \{#pushdown-window-functions\}

以下の PostgreSQL の [ウィンドウ関数] は、該当する場合はフレーム指定も含めて、`OVER
(PARTITION BY ... ORDER BY ...)` 句とともに ClickHouse にプッシュダウンされます。

* [row&#95;number](https://clickhouse.com/docs/sql-reference/window-functions#row_number)
* [rank](https://clickhouse.com/docs/sql-reference/window-functions#rank)
* [dense&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#dense_rank)
* [ntile](https://clickhouse.com/docs/sql-reference/window-functions#ntile)
* [cume&#95;dist](https://clickhouse.com/docs/sql-reference/window-functions#cume_dist)
* [percent&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#percent_rank)
* [lead](https://clickhouse.com/docs/sql-reference/window-functions#lead)
* [lag](https://clickhouse.com/docs/sql-reference/window-functions#lag)
* [first&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#first_value)
* [last&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#last_value)
* [nth&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#nth_value)
* `min` / `max` (`OVER` 句を使用)

ランキング関数 (`row_number`, `rank`, `dense_rank`, `ntile`, `cume_dist`,
`percent_rank`) は、ClickHouse ではこれらの関数に対するフレーム指定が許可されていないため、プッシュダウン時にフレーム句を省略します。

## 互換性に関する注意点 \{#compatibility-notes\}

### 正規表現 \{#regular-expressions\}

[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) が true の場合
(デフォルト) 、pg&#95;clickhouse は正規表現を ClickHouse の同等表現へ
プッシュダウンし、基本的な互換性を確保しようとします。ただし、両者の違いと、
pg&#95;clickhouse がそれらをどのように扱うかを理解しておいてください。

* PostgreSQL は [POSIX Regular Expressions] をサポートし、ClickHouse は
  [RE2 Regular Expressions][RE2] をサポートします。動作の違いに注意して
  ください。正規表現が ClickHouse で評価される場合 (たとえば `WHERE` 句内)
  は RE2 を、Postgres で評価される場合 (たとえば `SELECT` 句内) は
  POSIX を記述してください。

* pg&#95;clickhouse は、Postgres の [Regex flags] を ClickHouse の正規表現の先頭に
  `(?)` 内で付加してプッシュダウンします。たとえば:

  ```sql
  regexp_like(val, '^VAL\d', 'i')
  ```

  は次のようになります。

  ```sql
  match(val, concat('(?i-s)', '^VAL\\d'))
  ```

  `-s` が含まれている点に注意してください。これは、ClickHouse でデフォルトで
  有効になっている `s` を無効にし、Postgres の正規表現の動作に合わせるためです。
  Postgres の関数呼び出しに `s` フラグが含まれている場合、pg&#95;clickhouse は
  `-s` を付加しません。残念ながら、この動作により Postgres 24 以前では
  一部の正規表現との互換性が失われます。

* 両方でサポートされており、そのため ClickHouse で評価される場合に使用できる
  フラグは、次のものだけです:

  * `i`: 大文字と小文字を区別しない
  * `m`: 複数行モード
  * `s`: `.` が `\n` に一致する
  * `p`: 改行に部分的に敏感なマッチング (`s` と同様に扱われます)
  * `t`: 厳密な構文 (デフォルト、pg&#95;clickhouse によって削除されます)

  RE2 がサポートするフラグはこれらだけです。[Postgres flags] のそれ以外の
  フラグは使用しないでください。

* 正規表現関数にそれ以外のフラグを渡すと、その関数はプッシュダウンされません。

* 例外は `regexp_replace()` で、これには `g` フラグも使えます。`g` が
  設定されている場合、pg&#95;clickhouse は `replaceRegexpOne()` の代わりに
  `replaceRegexpAll()` を使用し、他のフラグを先頭に付加する前に `g` を
  取り除きます。

* Postgres の `regexp_replace()` の置換引数では、マッチ全体を参照するために
  `\&` を使用できますが、ClickHouse ではマッチ全体に `\0` を使用します。
  関数が ClickHouse にプッシュダウンされる場合は、必ず `\0` を使用してください。

あいまいさを完全に避けるには、Postgres の正規表現が ClickHouse に
プッシュダウンされないよう
[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) を設定し、
pg&#95;clickhouse が ClickHouse 互換の [RE2] 正規表現の
[direct プッシュダウン](#re2) をサポートしている [re2 拡張機能] の使用を
検討してください。

### `to_char()` \{#to_char\}

`timestamp` および `timestamp with time zone` に対する PostgreSQL の [`to_char()`] は、フォーマット引数が非 NULL の文字列定数であり、かつ含まれるすべての PostgreSQL キーワードにバイト単位で完全一致する ClickHouse の対応語がある場合にのみ、ClickHouse の [formatDateTime] にプッシュダウンされます。フォーマットが動的な場合 (`Const` ではない場合) 、または未対応のキーワードや修飾子を含む場合、呼び出しは PostgreSQL でローカル評価にフォールバックします。部分的な変換でプッシュダウンが試みられることはないため、出力は PG 互換のまま維持されます。

`numeric`、`interval`、その他の非 timestamp 型に対する 2 引数形式の `to_char()` は、プッシュダウンされません。ClickHouse の [formatDateTime] でフォーマットできるのは、日付時刻値のみです。

#### 対応するキーワード \{#translated-keywords\}

| PostgreSQL                 | ClickHouse | 意味                        |
| -------------------------- | ---------- | ------------------------- |
| `YYYY`, `yyyy`             | `%Y`       | 4 桁の年                     |
| `YY`, `yy`                 | `%y`       | 2 桁の年                     |
| `MM`, `mm`                 | `%m`       | ゼロ埋めされた月 (01–12)          |
| `DD`, `dd`                 | `%d`       | ゼロ埋めされた日 (01–31)          |
| `DDD`, `ddd`               | `%j`       | ゼロ埋めされた年内通算日 (001–366)    |
| `HH24`, `hh24`             | `%H`       | ゼロ埋めされた 24 時間表記の時 (00–23) |
| `HH`, `hh`, `HH12`, `hh12` | `%I`       | ゼロ埋めされた 12 時間表記の時 (01–12) |
| `MI`, `mi`                 | `%i`       | ゼロ埋めされた分 (00–59)          |
| `SS`, `ss`                 | `%S`       | ゼロ埋めされた秒 (00–59)          |
| `Q`, `q`                   | `%Q`       | 四半期 (1–4)                 |
| `Mon`                      | `%b`       | 月名の省略形 (例: `Oct`)         |
| `Dy`                       | `%a`       | 曜日名の省略形 (例: `Mon`)        |
| `AM`, `PM`                 | `%p`       | 午前/午後インジケーター (常に大文字)      |

#### 引用符付きテキストとリテラル \{#quoted-text-and-literals\}

`"..."` で囲まれたテキストはそのまま渡され、リテラルの `%` は
ClickHouse の指定子プレフィックスをエスケープするため `%%` に
重ねられます。引用符の外側にある `\"` も、リテラルの `"` として
そのまま渡されます。`"..."` の中では、バックスラッシュで
エスケープできるのは `"` のみです。その他のバックスラッシュ
シーケンスは、リテラルテキストとして扱われます。

## 著者 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## 著作権 \{#copyright\}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL Docs: Foreign Data Wrapper の作成"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub の最新バージョン"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "セマンティックバージョニング 2.0.0"

[`pg_get_loaded_modules()`]: https://pgpedia.info/g/pg_get_loaded_modules.html "pgPedia: pg_get_loaded_modules()"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: データ定義言語"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "PostgreSQL Docs: CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "PostgreSQL Docs: ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "PostgreSQL Docs: DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "PostgreSQL Docs: CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "PostgreSQL Docs: ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "PostgreSQL Docs: DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "PostgreSQL Docs: CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "PostgreSQL Docs: ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "PostgreSQL Docs: DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "PostgreSQL Docs: IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "PostgreSQL Docs: CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "ClickHouse Docs: テーブルエンジン"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "ClickHouse Docs: AggregateFunction Type"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "ClickHouse Docs: SimpleAggregateFunction Type"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "PostgreSQL Docs: ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "PostgreSQL Docs: DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: データ操作言語"

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html "PostgreSQL Docs: EXPLAIN"

[SELECT]: https://www.postgresql.org/docs/current/sql-select.html "PostgreSQL Docs: SELECT"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL Docs: PREPARE"

[EXECUTE]: https://www.postgresql.org/docs/current/sql-execute.html "PostgreSQL Docs: EXECUTE"

[DEALLOCATE]: https://www.postgresql.org/docs/current/sql-deallocate.html "PostgreSQL Docs: DEALLOCATE"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL Docs: PREPARE"

[INSERT]: https://www.postgresql.org/docs/current/sql-insert.html "PostgreSQL Docs: INSERT"

[COPY]: https://www.postgresql.org/docs/current/sql-copy.html "PostgreSQL Docs: COPY"

[LOAD]: https://www.postgresql.org/docs/current/sql-load.html "PostgreSQL Docs: LOAD"

[SET]: https://www.postgresql.org/docs/current/sql-set.html "PostgreSQL Docs: SET"

[ALTER ROLE]: https://www.postgresql.org/docs/current/sql-alterrole.html "PostgreSQL Docs: ALTER ROLE"

[shared library preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD "PostgreSQL Docs: 共有ライブラリのプリロード"

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings "ClickHouse Docs: セッション設定"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING "PostgreSQL Docs: ドル引用の文字列定数"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES "PostgreSQL Docs: PREPARE に関する注記"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse "ClickHouse Docs: ClickHouse におけるプリペアドステートメントの代替手段"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847 "ClickHouse/ClickHouse#85847 multipart フォーム内の一部のクエリで設定が読み込まれない"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570 "ClickHouse/ClickHouse#85570 multipart を使用する HTTP を修正"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html "PostgreSQL Docs: バイナリデータ型"

[GRANT]: https://www.postgresql.org/docs/current/sql-grant.html "PostgreSQL Docs: GRANT"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string "ClickHouse Docs: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html "PostgreSQL Docs: 文字データ型"

[window functions]: https://www.postgresql.org/docs/current/functions-window.html "PostgreSQL Docs: ウィンドウ関数"

[POSIX Regular Expressions]: https://www.postgresql.org/docs/18/functions-matching.html#FUNCTIONS-POSIX-REGEXP "PostgreSQL Docs: POSIX 正規表現"

[Postgres flags]: https://www.postgresql.org/docs/18/functions-matching.html#POSIX-EMBEDDED-OPTIONS-TABLE "PostgreSQL Docs: ARE 埋め込みオプション文字"

[RE2]: https://github.com/google/re2/wiki/Syntax "RE2 の構文"

[re2 extension]: https://github.com/ClickHouse/pg_re2 "pg_re2: RE2 を使用する ClickHouse 互換の正規表現関数"

[intarray]: https://www.postgresql.org/docs/current/intarray.html "PostgreSQL Docs: intarray"

[fuzzystrmatch]: https://www.postgresql.org/docs/current/fuzzystrmatch.html "PostgreSQL Docs: fuzzystrmatch"

[`to_char()`]: https://www.postgresql.org/docs/current/functions-formatting.html "PostgreSQL Docs: データ型のフォーマット関数"

[formatDateTime]: https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime "ClickHouse Docs: formatDateTime"