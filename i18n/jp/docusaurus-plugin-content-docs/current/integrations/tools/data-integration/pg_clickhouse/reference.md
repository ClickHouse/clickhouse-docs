---
sidebar_label: 'リファレンス'
description: 'pg_clickhouse の完全なリファレンスドキュメント'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse リファレンスドキュメント'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', '拡張機能']
---

## 説明 \{#description\}

pg_clickhouse は、[foreign data wrapper] を含む ClickHouse データベース上でのリモートでのクエリ実行を可能にする PostgreSQL 拡張機能です。PostgreSQL 13 以降および ClickHouse 23 以降に対応しています。

## はじめに \{#getting-started\}

pg&#95;clickhouse を試してみる最も簡単な方法は [Docker image] を利用することです。これは、
pg&#95;clickhouse と [re2][re2
extension] 拡張機能を組み込んだ標準の PostgreSQL Docker イメージを含んでいます。

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouse テーブルのインポートとクエリのプッシュダウンを開始するには、[チュートリアル](tutorial.md)をご覧ください。

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

pg&#95;clickhouse はパブリックリリースに対して [Semantic Versioning] に準拠します。

* メジャーバージョンは API の変更に対してインクリメントされます
* マイナーバージョンは後方互換性のある SQL の変更に対してインクリメントされます
* パッチバージョンはバイナリのみの変更に対してインクリメントされます

インストール後、PostgreSQL は 2 種類のバージョンを管理します:

* ライブラリバージョン (PostgreSQL 18 以降では `PG_MODULE_MAGIC` により定義) は完全なセマンティックバージョンを含み、`pgch_version()` 関数または Postgres の [`pg_get_loaded_modules()`]
  関数の出力で確認できます。
* 拡張機能バージョン (control ファイルで定義) はメジャーおよびマイナーのみを含み、`pg_catalog.pg_extension` テーブル、`pg_available_extension_versions()` 関数の出力、および `\dx
    pg_clickhouse` で確認できます。

実際には、パッチバージョンのみがインクリメントされるリリース、たとえば
`v0.1.0` から `v0.1.1` への変更は、`v0.1` をロードしているすべてのデータベースに対して有益であり、その恩恵を受けるために `ALTER EXTENSION` を実行する必要はありません。

一方で、マイナーまたはメジャーバージョンがインクリメントされるリリースには SQL アップグレードスクリプトが付随し、拡張機能を含む既存のすべてのデータベースは、アップグレードの恩恵を受けるために `ALTER EXTENSION pg_clickhouse UPDATE` を実行する必要があります。

## DDL SQL リファレンス \{#ddl-sql-reference\}

次に示す SQL の [DDL] 文は、pg_clickhouse を使用します。

### CREATE EXTENSION \{#create-extension\}

[CREATE EXTENSION] を使用して、pg&#95;clickhouse をデータベースに追加できます。

```sql
CREATE EXTENSION pg_clickhouse;
```

`WITH SCHEMA` を使用して特定のスキーマにインストールします（推奨）：

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION \{#alter-extension\}

[ALTER EXTENSION] を使用して pg_clickhouse 拡張機能を変更します。例：

* 新バージョンの pg_clickhouse をインストールした後、`UPDATE` 句を使用します：

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* `SET SCHEMA` を使用して、拡張機能を新しいスキーマに移動します：

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION \{#drop-extension\}

[DROP EXTENSION] を使用して、データベースから拡張機能 pg&#95;clickhouse を削除します。

```sql
DROP EXTENSION pg_clickhouse;
```

このコマンドは、pg&#95;clickhouse に依存するオブジェクトが 1 つでも存在すると失敗します。`CASCADE` 句を使用して、それらも同時に削除してください。

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER \{#create-server\}

[CREATE SERVER] を使用して、ClickHouse サーバーに接続するための外部サーバーを作成します。例：

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

サポートされているオプションは次のとおりです:

* `driver`: 使用する ClickHouse 接続ドライバ。&quot;binary&quot; または
  &quot;http&quot; のいずれか。**必須。**
* `dbname`: 接続時に使用する ClickHouse データベース。デフォルトは
  &quot;default&quot;。
* `fetch_size`: HTTP ストリーミングのバッチの概算サイズ (バイト単位) 。
  バッチは行境界で分割されます。デフォルトは `50000000` (50 MB) です。`0` を指定すると
  ストリーミングは無効になり、レスポンス全体がバッファリングされます。外部テーブルではこの
  値をオーバーライドできます。
* `host`: ClickHouse サーバのホスト名。デフォルトは &quot;localhost&quot;。
* `port`: ClickHouse サーバに接続する際のポート。デフォルト値は次のとおりです:
  * `driver` が &quot;binary&quot; かつ `host` が ClickHouse Cloud ホストの場合は 9440
  * `driver` が &quot;binary&quot; かつ `host` が ClickHouse Cloud ホストではない場合は 9004
  * `driver` が &quot;http&quot; かつ `host` が ClickHouse Cloud ホストの場合は 8443
  * `driver` が &quot;http&quot; かつ `host` が ClickHouse Cloud ホストではない場合は 8123

### ALTER SERVER \{#alter-server\}

[ALTER SERVER] を使用して外部サーバーの定義を変更します。例:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

オプションは [CREATE SERVER](#create-server) と同様です。


### DROP SERVER \{#drop-server\}

外部サーバーを削除するには、[DROP SERVER] を使用します。

```sql
DROP SERVER taxi_srv;
```

サーバーに他のオブジェクトが依存している場合、このコマンドは失敗します。それらの依存関係も削除するには、`CASCADE` を使用してください。

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING \{#create-user-mapping\}

[CREATE USER MAPPING] を使用すると、PostgreSQL ユーザーを ClickHouse ユーザーにマッピングできます。
たとえば、`taxi_srv` 外部サーバーに接続する際に、現在の PostgreSQL ユーザーを
リモートの ClickHouse ユーザーに対応付けるには、次のようにします。

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

サポートされているオプションは次のとおりです。

* `user`: ClickHouse のユーザー名。デフォルトは &quot;default&quot; です。
* `password`: ClickHouse のユーザーのパスワードです。

### ALTER USER MAPPING \{#alter-user-mapping\}

[ALTER USER MAPPING] を使用してユーザーマッピングの定義を変更します。

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

オプションは [CREATE USER MAPPING](#create-user-mapping) と同じです。


### DROP USER MAPPING \{#drop-user-mapping\}

ユーザー・マッピングを削除するには、[DROP USER MAPPING] を使用します。

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

[IMPORT FOREIGN SCHEMA] を使用して、ClickHouse データベースで定義されているすべてのテーブルを、外部テーブルとして PostgreSQL のスキーマにインポートします。

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

`LIMIT TO` を使用して、インポート対象を特定のテーブルのみに制限します。

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

テーブルを除外するには、`EXCEPT` を使用します。

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse は、指定された ClickHouse データベース（上記の例では「demo」）内のすべてのテーブルの一覧を取得し、各テーブルのカラム定義を取得したうえで、外部テーブルを作成するために [CREATE FOREIGN TABLE](#create-foreign-table) コマンドを実行します。カラムは [対応しているデータ型](#data-types) および、検出可能な場合は [CREATE
FOREIGN TABLE](#create-foreign-table) でサポートされているオプションを用いて定義されます。

:::tip Imported Identifier Case Preservation

`IMPORT FOREIGN SCHEMA` は、取り込むテーブル名とカラム名に対して `quote_identifier()` を実行し、大文字や空白を含む識別子を二重引用符で囲みます。そのようなテーブル名やカラム名は、PostgreSQL のクエリ内でも二重引用符で囲む必要があります。すべてが小文字で空白文字を含まない名前は、引用する必要はありません。

たとえば、次のような ClickHouse テーブルがある場合:

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

`IMPORT FOREIGN SCHEMA` は次の外部テーブルを作成します：

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

したがって、クエリでは適切に引用符で囲む必要があります。例：

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

異なる名前やすべて小文字（そのため大文字と小文字を区別しない）でオブジェクトを作成するには、[CREATE FOREIGN TABLE](#create-foreign-table) を使用します。
:::


### CREATE FOREIGN TABLE \{#create-foreign-table\}

[CREATE FOREIGN TABLE] を使用して、ClickHouse データベース内のデータをクエリできる外部テーブルを作成します。

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

* `database`: リモートデータベースの名前です。デフォルトでは、外部サーバーに対して
  定義されたデータベース名が使用されます。
* `fetch_size`: HTTP ストリーミングにおける、おおよそのバッチサイズ (バイト単位) です。サーバーレベルの
  `fetch_size` を上書きします。デフォルトは `50000000` (50 MB) です。`0` を指定すると
  ストリーミングは無効になり、レスポンス全体がバッファされます。
* `table_name`: リモートテーブルの名前です。デフォルトでは、外部テーブルに
  指定された名前が使用されます。
* `engine`: ClickHouse テーブルで使用される[テーブルエンジン]です。
  `CollapsingMergeTree()` および `AggregatingMergeTree()` の場合、pg&#95;clickhouse は
  テーブル上で実行される関数式にパラメータを自動的に適用します。

各カラムについて、リモート側の ClickHouse データ型に適した[データ型](#data-types)を使用してください。
サポートされているカラムオプションは次のとおりです。

* `column_name`: ClickHouse 側のカラム名です。クエリや挿入をデパースする際に、
  PostgreSQL の属性名より優先して使用されます。引用符なしの小文字の PostgreSQL カラム名を、
  大文字と小文字を区別する ClickHouse のカラムにマッピングする場合に便利です。たとえば次のとおりです。

  ```sql
  CREATE FOREIGN TABLE hits (
      watchid    bigint   OPTIONS(column_name 'WatchID'),
      javaenable smallint OPTIONS(column_name 'JavaEnable'),
      title      text     OPTIONS(column_name 'Title')
  ) SERVER taxi_srv OPTIONS(table_name 'hits');
  ```

* `AggregateFunction`: [AggregateFunction Type] カラムに適用される集約関数の名前です。
  データ型をその関数に渡される ClickHouse の型にマッピングし、適切なカラムオプションで
  集約関数名を指定すると、pg&#95;clickhouse はそのカラムを評価する集約関数に
  自動的に `Merge` を付加します。

  ```sql
  CREATE FOREIGN TABLE test (
      column1 bigint  OPTIONS(AggregateFunction 'uniq'),
      column2 integer OPTIONS(AggregateFunction 'anyIf'),
      column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
  ) SERVER clickhouse_srv;
  ```

* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] カラムに適用される
  集約関数の名前です。データ型をその関数に渡される ClickHouse の型にマッピングし、
  適切なカラムオプションで集約関数名を指定します。

### ALTER FOREIGN TABLE \{#alter-foreign-table\}

[ALTER FOREIGN TABLE] を使用して、外部テーブルの定義を変更します。

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

サポートされているテーブルおよびカラムのオプションは、[CREATE FOREIGN TABLE] と同じです。


### DROP FOREIGN TABLE \{#drop-foreign-table\}

[DROP FOREIGN TABLE] ステートメントを使用して、外部テーブルを削除します。

```sql
DROP FOREIGN TABLE acts;
```

外部テーブルに依存しているオブジェクトが存在する場合、このコマンドは失敗します。
それらも同時に削除するには、`CASCADE` 句を指定します。

```sql
DROP FOREIGN TABLE acts CASCADE;
```

## DML SQL リファレンス \{#dml-sql-reference\}

以下の SQL [DML] 文では pg&#95;clickhouse を使用する場合があります。例は次の ClickHouse テーブルを前提としています。

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

[EXPLAIN] コマンドは期待どおりに動作しますが、`VERBOSE` オプションを指定すると、
ClickHouse に対して「Remote SQL」クエリが発行されます。

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

このクエリでは、「Foreign Scan」プランノードを介してリモート SQL が ClickHouse にプッシュダウンされます。


### SELECT \{#select\}

[SELECT] ステートメントを使用して、pg&#95;clickhouse テーブルに対しても他のテーブルと同様にクエリを実行できます。

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totem
(1 row)
```

pg&#95;clickhouse は、集約関数を含め、可能な限り多くのクエリ実行を ClickHouse 側にプッシュダウンするように動作します。[EXPLAIN](#explain) を使用して、どの程度プッシュダウンされているかを確認してください。たとえば上記のクエリでは、実行はすべて ClickHouse 側にプッシュダウンされます。

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

pg&#95;clickhouse は、同じリモートサーバー上にあるテーブルに対する JOIN もプッシュダウンできます。

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

ローカルテーブルとの結合は、慎重にチューニングしないと非効率なクエリを生成します。この例では、`nodes` テーブルのローカルコピーを作成し、リモートテーブルではなくそのローカルテーブルと結合します。

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

この場合は、ローカルのカラムではなく `node_id` でグループ化することで、集約処理のより多くの部分を ClickHouse 側に押し込み、その後でルックアップテーブルと結合できます。


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

&quot;Foreign Scan&quot; ノードは `node_id` ごとに集約をプッシュダウンするようになり、
Postgres 側に取り込む必要がある行数は 1000 行（すべて）からわずか 8 行（各ノードにつき 1 行）に減少します。


### PREPARE、EXECUTE、DEALLOCATE \{#prepare-execute-deallocate\}

v0.1.2 以降、pg&#95;clickhouse はパラメータ化されたクエリをサポートしており、主に [PREPARE] コマンドによって作成されます。

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

準備済みステートメントを実行するには、通常どおり [EXECUTE] を使用してください。

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
パラメータ化された実行を行うと、[underlying bug] が [fixed] された 25.8 より前の ClickHouse バージョンでは、[http driver](#create-server) が DateTime のタイムゾーンを正しく変換できなくなります。PostgreSQL は、`PREPARE` を使用していない場合でも、パラメータ化されたクエリプランを使用することがある点に注意してください。正確なタイムゾーン変換が必要なクエリで、かつ 25.8 以降へのアップグレードが選択肢にない場合は、代わりに [binary driver](#create-server) を使用してください。
:::

pg&#95;clickhouse は、集約処理を通常どおりプッシュダウンし、その様子は [EXPLAIN](#explain) の verbose 出力から確認できます。

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

ここでは、パラメータプレースホルダではなく、完全な日付値そのものが送信されている点に注意してください。
これは、PostgreSQL の [PREPARE notes] で説明されているとおり、最初の 5 回のリクエストについて当てはまります。6 回目の実行時には、ClickHouse には
`{param:type}` 形式の [クエリパラメータ] を送信します:
パラメータ:

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

準備済みステートメントを解放するには [DEALLOCATE] を使用します。

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```


### INSERT \{#insert\}

[INSERT] コマンドを使用して、リモートの ClickHouse テーブルに値を挿入します。

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```


### COPY \{#copy\}

[COPY] コマンドを使用して、リモートの ClickHouse テーブルに複数行を一括挿入します。

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ バッチ API の制限事項**
>
> pg&#95;clickhouse では、PostgreSQL FDW のバッチ挿入 API はまだサポートされていません。
> そのため、現在 [COPY] はレコードを挿入するために [INSERT](#insert) 文を使用しています。
> この制限は今後のリリースで改善される予定です。


### LOAD \{#load\}

[LOAD] を使用して pg&#95;clickhouse の共有ライブラリを読み込みます。

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

通常、[LOAD] を使用する必要はありません。Postgres は、pg&#95;clickhouse のいずれかの機能（関数、外部テーブルなど）が初めて使用されたときに、自動的に pg&#95;clickhouse をロードします。

[LOAD] を使って pg&#95;clickhouse をロードすることが有用になる唯一のケースは、それに依存するクエリを実行する前に、[SET](#set) を用いて pg&#95;clickhouse のパラメータを設定したい場合です。


### SET \{#set\}

[SET] を使用して、pg&#95;clickhouse のカスタム構成パラメータを設定します。

#### `pg_clickhouse.session_settings` \{#pg_clickhousesession_settings\}

このパラメータによって、後続のクエリに適用される [ClickHouse 設定] が構成されます。例:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

デフォルトは `join_use_nulls 1, group_by_use_nulls 1, final 1` です。空文字列に設定すると、ClickHouse サーバー側の設定にフォールバックします。

```sql
SET pg_clickhouse.session_settings = '';
```

構文は、キーと値のペアをカンマ区切りで並べたリストで、ペア同士は 1 つ以上のスペースで区切ります。キーは [ClickHouse settings] に対応する必要があります。値中のスペース、カンマ、バックスラッシュは、バックスラッシュでエスケープします。

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

または、スペースやカンマをエスケープせずに済むよう、値をシングルクォートで囲みます。ダブルクォートを二重に記述する必要を避けるために、[dollar quoting] の使用を検討してください。

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

可読性を重視し、多くの設定を行う必要がある場合は、例えば次のように複数行に分けて記述します。

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

pg&#95;clickhouse 自身の動作を妨げる場合には、一部の設定は無視されます。
対象となる設定は次のとおりです:

* `date_time_output_format`: HTTP ドライバでは「iso」である必要があります
* `format_tsv_null_representation`: HTTP ドライバではデフォルト値である必要があります
* `output_format_tsv_crlf_end_of_line` HTTP ドライバではデフォルト値である必要があります

それ以外の場合、pg&#95;clickhouse は設定を検証せず、クエリごとにそれらをそのまま ClickHouse に渡します。
したがって、ClickHouse の各バージョンで利用可能なすべての設定をサポートします。

pg&#95;clickhouse は `pg_clickhouse.session_settings` を設定する前にロードされている必要があることに注意してください。[shared library preloading] を利用するか、
拡張機能内のいずれかのオブジェクトを単純に使用して、ロードされるようにしてください。

#### `pg_clickhouse.pushdown_regex` \{#pg_clickhousepushdown_regex\}

`pg_clickhouse.pushdown_regex` パラメータは、pg&#95;clickhouse
が正規表現関数および演算子をプッシュダウンするかどうかを制御します。デフォルトではプッシュダウンされます。
プッシュダウンしないようにするには、このパラメータを false に設定します:

```sql
SET pg_clickhouse.pushdown_regex = 'false';
```

詳しくは、[正規表現](#regular-expressions)を参照してください。

### ALTER ROLE \{#alter-role\}

[ALTER ROLE] の `SET` コマンドを使用して、特定のロールに対して pg&#95;clickhouse を[プリロード](#preloading)したり、パラメータを [SET](#set) で設定したりします。

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

[ALTER ROLE] の `RESET` コマンドを使用して、pg&#95;clickhouse のプリロードおよび／またはパラメータをリセットします。

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```


## プリロード \{#preloading\}

ほとんど、またはすべての Postgres 接続で pg_clickhouse を使用する必要がある場合は、
[共有ライブラリのプリロード] を使用して自動的にロードされるようにすることを検討してください。

### `session_preload_libraries` \{#session_preload_libraries\}

PostgreSQLへの新規接続ごとに共有ライブラリをロードします。

```ini
session_preload_libraries = pg_clickhouse
```

サーバーを再起動せずに更新を反映できるため便利です。再接続するだけで済みます。特定のユーザーやロールごとに、[ALTER
ROLE](#alter-role) で設定することもできます。


### `shared_preload_libraries` \{#shared_preload_libraries\}

PostgreSQL の親プロセス起動時に、共有ライブラリをロードします。

```ini
shared_preload_libraries = pg_clickhouse
```

各セッションのメモリ使用量と読み込みオーバーヘッドを削減するのに有用ですが、ライブラリを更新した場合はクラスターを再起動する必要があります。


## データ型 \{#data-types\}

pg&#95;clickhouse は、次の ClickHouse データ型を PostgreSQL データ型にマッピングします。[IMPORT FOREIGN SCHEMA](#import-foreign-schema) はカラムをインポートする際に PostgreSQL カラムで最初に指定されている型を使用し、追加の型は [CREATE FOREIGN TABLE](#create-foreign-table) 文で使用できます：

| ClickHouse | PostgreSQL       | 備考                     |
| ---------- | ---------------- | ---------------------- |
| Bool       | boolean          |                        |
| Date       | date             |                        |
| Date32     | date             |                        |
| DateTime   | timestamptz      |                        |
| Decimal    | numeric          |                        |
| Float32    | real             |                        |
| Float64    | double precision |                        |
| IPv4       | inet             |                        |
| IPv6       | inet             |                        |
| Int16      | smallint         |                        |
| Int32      | integer          |                        |
| Int64      | bigint           |                        |
| Int8       | smallint         |                        |
| JSON       | jsonb, json      |                        |
| String     | text, bytea      |                        |
| UInt16     | integer          |                        |
| UInt32     | bigint           |                        |
| UInt64     | bigint           | 値が BIGINT の最大値を超えるとエラー |
| UInt8      | smallint         |                        |
| UUID       | uuid             |                        |

追加の注意事項と詳細は以下のとおりです。

### BYTEA \{#bytea\}

ClickHouse は PostgreSQL の [BYTEA] 型に相当する型を提供していませんが、[String] 型に任意のバイト列を格納することができます。一般的に、ClickHouse の文字列は PostgreSQL の [TEXT] にマッピングしますが、バイナリデータを扱う場合は [BYTEA] にマッピングしてください。例：

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

ClickHouse のカラムにヌルバイトが含まれている場合、[TEXT] カラムを使用する外部テーブルは正しい値を出力しないことに注意してください。

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

2行目と3行目には切り詰められた値が含まれていることに注意してください。これは、PostgreSQLがNUL終端文字列に依存しており、文字列内のNULをサポートしていないためです。

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

しかし、それらを [BYTEA] として読み取った場合は、以下のようにはなりません：

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
原則として、エンコードされた文字列には [TEXT] カラム、バイナリデータには [BYTEA] カラムを使用し、これらを入れ替えて使わないでください。
:::

## 関数と演算子のリファレンス \{#function-and-operator-reference\}

### 関数 \{#functions\}

これらの関数は、ClickHouse データベースに対してクエリを実行するためのインターフェースを提供します。

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

HTTP インターフェイス経由で ClickHouse サービスに接続し、単一の
クエリを実行してから切断します。省略可能な第 2 引数には接続文字列を指定でき、
指定しない場合は `host=localhost port=8123` がデフォルトになります。サポートされている接続パラメータは次のとおりです。

* `host`: 接続先ホスト。必須。
* `port`: 接続先の HTTP ポート。`host` が
  ClickHouse Cloud のホストでない場合のデフォルトは `8123`、ClickHouse Cloud のホストである場合のデフォルトは `8443`
* `dbname`: 接続するデータベース名。
* `username`: 接続に使用するユーザー名。デフォルトは `default`
* `password`: 認証に使用するパスワード。デフォルトはパスワードなし

デフォルトでは、どのロールにもこの関数に対する `EXECUTE` 権限は付与されていません。たとえば専用の ClickHouse 管理者ロールなど、アドホックな ClickHouse
クエリを実行する正当な必要があるロールにのみ、[GRANT] によってアクセス権を付与することを検討してください。

レコードを返さないクエリに有用ですが、値を返すクエリの場合は、
結果は 1 つのテキスト値として返されます：

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

`pg_clickhouse` は、条件 (`HAVING` 句および `WHERE` 句) で使用される
PostgreSQL 組み込み関数の一部を ClickHouse にプッシュダウンします。その一部は、次のとおり
ClickHouse の対応する関数にマッピングされます:

* `abs`: [abs](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#abs)
* `factorial`: [factorial](https://clickhouse.com/docs/sql-reference/functions/math-functions#factorial)
* `mod` (int2/int4/int8/numeric): [modulo](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#modulo)
* `pow` &amp; `power` (float8/numeric): [pow](https://clickhouse.com/docs/sql-reference/functions/math-functions#pow)
* `round`: [round](https://clickhouse.com/docs/sql-reference/functions/rounding-functions#round)
* `sin`, `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `asinh`, `degrees`, `radians`, `pi`: 同名の [ClickHouse math functions](https://clickhouse.com/docs/sql-reference/functions/math-functions)。
  `asin`, `acos`, `atanh`, `acosh` はプッシュダウンされません: PG では範囲外の入力に対してエラーになりますが、CH では `NaN` が返されます。
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
  (CH の alias `date` としてデパースされます)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `array_cat`: [arrayConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayConcat)
* `array_append`: [arrayPushBack](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushBack)
* `array_prepend`: [arrayPushFront](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushFront)
* `array_remove`: [arrayRemove](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRemove)
* `array_length` &amp; `cardinality`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `array_to_string`: [arrayStringConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayStringConcat)
* `string_to_array`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString)
* `split_part`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString) + 配列の添字
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
* `regexp_replace`: 通常は [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne)、`g` フラグが指定されている場合は [replaceRegexpAll](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `regexp_split_to_array`: [splitByRegexp](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByRegexp)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)
* `json_extract_path_text`: [サブカラム構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `json_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [サブカラム構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path_text`: [サブカラム構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [サブカラム構文](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `bit_count(bytea)`: [bitCount](https://clickhouse.com/docs/sql-reference/functions/bit-functions#bitcount)
* `to_timestamp(float8)`: [fromUnixTimestamp](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#fromUnixTimestamp)
* `to_char(timestamp[tz], fmt)`: [formatDateTime](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime)
  `fmt` が文字列定数であり、そのすべてのキーワードに対応する
  ClickHouse の同等機能が存在する場合。サポートされているキーワードについては、
  互換性に関する注記の [to&#95;char()](#to_char) を参照してください。それ以外の場合、
  この関数は PostgreSQL 側でローカルに評価されます。
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
* `CURRENT_DATABASE`: PostgreSQL 関数の値として渡されます。
* `CURRENT_SCHEMA`: PostgreSQL 関数から値として渡される。
* `CURRENT_CATALOG`: PostgreSQL 関数の値として渡されます。
* `CURRENT_USER`: PostgreSQL 関数の値として渡されます。
* `USER`: PostgreSQL 関数から値として渡される。
* `CURRENT_ROLE`: PostgreSQL 関数から渡される値。
* `SESSION_USER`: PostgreSQL 関数の値として渡されます。

### プッシュダウン演算子 \{#pushdown-operators\}

* 配列スライス (`arr[L:U]`): [arraySlice](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySlice)
* `@>` (配列が含む): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `<@` (配列に含まれる): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `&&` (配列の重なり): [hasAny](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAny)
* `~` (正規表現に一致): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~` (正規表現に一致しない): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `~*` (大文字と小文字を区別しない正規表現に一致しない): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~*` (大文字と小文字を区別しない正規表現に一致しない): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `->>` (JSON/JSONB の要素をテキストとして抽出): [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `->` (JSON/JSONB を抽出): [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [sub-column syntax](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)

### カスタム関数 \{#custom-functions\}

`pg_clickhouse` によって作成されるこれらのカスタム関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 関数に対して、外部クエリのプッシュダウンを提供します。これらの関数のいずれかがプッシュダウンできない場合は、例外を発生させます。

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

次の [intarray] 関数 1 つが ClickHouse にプッシュダウンされます:

* `idx` → [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)

#### fuzzystrmatch \{#fuzzystrmatch\}

[fuzzystrmatch] の 2 つの関数は ClickHouse にプッシュダウンされます:

* `soundex`: [soundex](https://clickhouse.com/docs/sql-reference/functions/string-functions#soundex)
* `levenshtein` (2-arg): [editDistanceUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#editDistanceUTF8)

### キャストのプッシュダウン \{#pushdown-casts\}

pg&#95;clickhouse は、互換性のあるデータ型に対しては `CAST(x AS bigint)` のような
キャストをプッシュダウンします。互換性のない型に対してはプッシュダウンは失敗します。
この例で `x` が ClickHouse の `UInt64` の場合、ClickHouse は値のキャストを拒否します。

互換性のないデータ型へのキャストをプッシュダウンするために、pg&#95;clickhouse は
次の関数を提供します。これらがプッシュダウンされない場合、PostgreSQL 側で例外が送出されます。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### プッシュダウン集約 \{#pushdown-aggregates\}

これらの PostgreSQL の集約関数は ClickHouse にプッシュダウンされます。

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

### カスタム集約関数 \{#custom-aggregates\}

`pg_clickhouse` によって作成されるこれらのカスタム集約関数は、PostgreSQL に同等の機能が存在しない特定の ClickHouse 集約関数に対して、外部クエリプッシュダウンを提供します。これらの関数のいずれかをプッシュダウンできない場合には、例外をスローします。

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

### プッシュダウン順序付き Set 集約 \{#pushdown-ordered-set-aggregates\}

これらの [ordered-set aggregate functions] は、*direct argument* をパラメータとして渡し、`ORDER BY` 式を引数として渡すことで、ClickHouse の [Parametric
aggregate functions] に対応します。例えば、次の PostgreSQL クエリです。

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

これは次の ClickHouse クエリに対応します:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

デフォルト以外の `ORDER BY` 接尾辞である `DESC` および `NULLS FIRST` は
サポートされておらず、使用するとエラーになります。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### プッシュダウン対応のウィンドウ関数 \{#pushdown-window-functions\}

以下の PostgreSQL の[ウィンドウ関数]は、該当する場合はフレーム指定も含めて、`OVER
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
* `min` / `max` (`OVER` 句付き) 

ランキング関数 (`row_number`、`rank`、`dense_rank`、`ntile`、`cume_dist`、
`percent_rank`) は、ClickHouse ではこれらの関数にフレーム指定を指定できないため、プッシュダウン時にはフレーム句を省略します。

## 互換性に関する注意事項 \{#compatibility-notes\}

### 正規表現 \{#regular-expressions\}

[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) が true の場合
 (デフォルト) 、pg&#95;clickhouse は正規表現を ClickHouse の同等表現に
プッシュダウンし、基本的な互換性を確保するよう努めます。ただし、両者の違いと、
pg&#95;clickhouse がそれらをどのように扱うかを理解しておいてください。

* PostgreSQL は [POSIX Regular Expressions] をサポートし、ClickHouse は
  [RE2 Regular Expressions][RE2] をサポートします。動作の違いに注意してください。
  正規表現が ClickHouse で評価される場合 (たとえば `WHERE` 句内) は RE2 を、
  Postgres で評価される場合 (たとえば `SELECT` 句内) は POSIX を使用してください。

* pg&#95;clickhouse は、Postgres の [Regex flags] を ClickHouse の正規表現の先頭に
  `(?)` 内で付加してプッシュダウンします。たとえば:

  ```sql
  regexp_like(val, '^VAL\d', 'i')
  ```

  は次のようになります。

  ```sql
  match(val, concat('(?i-s)', '^VAL\\d'))
  ```

  `-s` が含まれている点に注意してください。これは、ClickHouse でデフォルトで有効な `s` を
  無効化し、Postgres の正規表現の動作に合わせるためです。
  Postgres の関数呼び出しのフラグに `s` が含まれている場合、pg&#95;clickhouse は `-s` を
  付加しません。残念ながら、この動作により Postgres 24 以前では一部の正規表現との互換性が
  損なわれます。

* 両方でサポートされており、したがって ClickHouse で評価される場合に
  使用できるフラグは次のとおりです。

  * `i`: 大文字・小文字を区別しない
  * `m`: 複数行モード
  * `s`: `.` を `\n` に一致させる
  * `p`: 改行に部分的に敏感なマッチング (`s` と同様に扱われます) 
  * `t`: 厳密な構文 (デフォルト。pg&#95;clickhouse により削除されます) 

  RE2 がサポートするのはこれらのフラグだけです。[Postgres flags] の他のフラグは使用しないでください。

* 正規表現関数にこれ以外のフラグを渡すと、その関数は
  プッシュダウンされません。

* 例外は `regexp_replace()` で、これは `g` フラグもサポートします。
  `g` が設定されている場合、pg&#95;clickhouse は
  `replaceRegexpOne()` の代わりに `replaceRegexpAll()` を使用し、
  他のフラグを前置する前に `g` フラグを削除します。

* Postgres の `regexp_replace()` の置換引数では、一致全体を参照するために `\&` を
  サポートしていますが、ClickHouse では一致全体の参照に `\0` を使用します。
  関数が ClickHouse にプッシュダウンされる場合は、必ず `\0` を使用してください。

曖昧さを完全になくしたい場合は、
[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) を設定して
Postgres の正規表現が ClickHouse にプッシュダウンされないようにし、
ClickHouse 互換の [RE2] 正規表現に対して pg&#95;clickhouse が
[direct pushdown](#re2) をサポートしている
[re2 extension] の使用を検討してください。

### `to_char()` \{#to_char\}

`timestamp` および `timestamp with time zone` に対する PostgreSQL の [`to_char()`] は、format 引数が非 `NULL` の文字列定数であり、かつ含まれる PostgreSQL キーワードのすべてに、ClickHouse 側でバイト単位で完全一致する対応語がある場合にのみ、ClickHouse の [formatDateTime] にプッシュダウンされます。format が動的な場合 (`Const` ではない場合) 、または未対応のキーワードや修飾子を含む場合、この呼び出しは PostgreSQL でローカル評価にフォールバックします。部分的な変換でプッシュダウンを試みることはないため、出力は PG 互換のまま保たれます。

`numeric`、`interval`、およびその他の timestamp 以外の型に対する 2 引数形式の `to_char()` は、プッシュダウンされません。ClickHouse の [formatDateTime] は日付時刻値のみをフォーマットします。

#### 変換されるキーワード \{#translated-keywords\}

| PostgreSQL                 | ClickHouse | 意味                      |
| -------------------------- | ---------- | ----------------------- |
| `YYYY`, `yyyy`             | `%Y`       | 4桁の年                    |
| `YY`, `yy`                 | `%y`       | 2桁の年                    |
| `MM`, `mm`                 | `%m`       | ゼロ埋めされた月 (01–12)        |
| `DD`, `dd`                 | `%d`       | ゼロ埋めされた日 (01–31)        |
| `DDD`, `ddd`               | `%j`       | ゼロ埋めされた年内通算日 (001–366)  |
| `HH24`, `hh24`             | `%H`       | ゼロ埋めされた24時間表記の時 (00–23) |
| `HH`, `hh`, `HH12`, `hh12` | `%I`       | ゼロ埋めされた12時間表記の時 (01–12) |
| `MI`, `mi`                 | `%i`       | ゼロ埋めされた分 (00–59)        |
| `SS`, `ss`                 | `%S`       | ゼロ埋めされた秒 (00–59)        |
| `Q`, `q`                   | `%Q`       | 四半期 (1–4)               |
| `Mon`                      | `%b`       | 省略形の月名。例: `Oct`         |
| `Dy`                       | `%a`       | 省略形の曜日名。例: `Mon`        |
| `AM`, `PM`                 | `%p`       | 午前・午後の指定子。常に大文字         |

#### 引用符付きテキストとリテラル \{#quoted-text-and-literals\}

`"..."` で囲まれたテキストはそのまま出力され、リテラルの `%` は
ClickHouse の指定子プレフィックスをエスケープするため `%%` に
重ねられます。引用符の外側にある `\"` も、リテラルの `"` として
そのまま出力されます。`"..."` の内側では、バックスラッシュで
エスケープできるのは `"` のみで、それ以外のバックスラッシュ
シーケンスはリテラルのテキストとして扱われます。

## 著者 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## Copyright \{#copyright\}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL ドキュメント: Foreign Data Wrapper の記述"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub上の最新バージョン"

[ClickHouse]: https://clickhouse.com/clickhouse

[セマンティック バージョニング]: https://semver.org/spec/v2.0.0.html "セマンティック バージョニング 2.0.0"

[`pg_get_loaded_modules()`]: https://pgpedia.info/g/pg_get_loaded_modules.html "pgPedia: pg_get_loaded_modules()"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: データ定義言語"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "PostgreSQL ドキュメント: CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "PostgreSQL ドキュメント: ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "PostgreSQL ドキュメント: DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "PostgreSQLドキュメント: CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "PostgreSQL ドキュメント: ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "PostgreSQL ドキュメント: DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "PostgreSQL ドキュメント: CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "PostgreSQLドキュメント: ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "PostgreSQL ドキュメント: DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "PostgreSQL ドキュメント: IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "PostgreSQL ドキュメント: CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "ClickHouseドキュメント: テーブルエンジン"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "ClickHouseドキュメント: AggregateFunctionタイプ"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "ClickHouseドキュメント：SimpleAggregateFunction型"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "PostgreSQL ドキュメント: ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "PostgreSQL ドキュメント: DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: データ操作言語"

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html "PostgreSQL ドキュメント: EXPLAIN"

[SELECT]: https://www.postgresql.org/docs/current/sql-select.html "PostgreSQL ドキュメント: SELECT"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL ドキュメント: PREPARE"

[EXECUTE]: https://www.postgresql.org/docs/current/sql-execute.html "PostgreSQL ドキュメント: EXECUTE"

[DEALLOCATE]: https://www.postgresql.org/docs/current/sql-deallocate.html "PostgreSQL ドキュメント: DEALLOCATE"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL ドキュメント: PREPARE"

[INSERT]: https://www.postgresql.org/docs/current/sql-insert.html "PostgreSQL ドキュメント: INSERT"

[COPY]: https://www.postgresql.org/docs/current/sql-copy.html "PostgreSQL ドキュメント: COPY"

[LOAD]: https://www.postgresql.org/docs/current/sql-load.html "PostgreSQL ドキュメント: LOAD"

[SET]: https://www.postgresql.org/docs/current/sql-set.html "PostgreSQL ドキュメント: SET"

[ALTER ROLE]: https://www.postgresql.org/docs/current/sql-alterrole.html "PostgreSQL ドキュメント: ALTER ROLE"

[shared library preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD "PostgreSQL ドキュメント: 共有ライブラリのプリロード"

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings "ClickHouse ドキュメント: セッション設定"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING "PostgreSQL ドキュメント: ドル引用符付き文字列定数"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES "PostgreSQL ドキュメント: PREPARE に関する注意事項"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse "ClickHouse ドキュメント: ClickHouse でのプリペアドステートメントの代替手段"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847 "ClickHouse/ClickHouse#85847 マルチパートフォームの一部のクエリが settings を読み込まない"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570 "ClickHouse/ClickHouse#85570 HTTP の multipart 処理を修正"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html "PostgreSQL ドキュメント: バイナリデータ型"

[GRANT]: https://www.postgresql.org/docs/current/sql-grant.html "PostgreSQL ドキュメント: GRANT"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string "ClickHouse ドキュメント: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html "PostgreSQL ドキュメント: 文字データ型"

[window functions]: https://www.postgresql.org/docs/current/functions-window.html "PostgreSQL ドキュメント: ウィンドウ関数"

[POSIX Regular Expressions]: https://www.postgresql.org/docs/18/functions-matching.html#FUNCTIONS-POSIX-REGEXP "PostgreSQL ドキュメント: POSIX 正規表現"

[Postgres flags]: https://www.postgresql.org/docs/18/functions-matching.html#POSIX-EMBEDDED-OPTIONS-TABLE "PostgreSQL ドキュメント: ARE 埋め込みオプション文字"

[RE2]: https://github.com/google/re2/wiki/Syntax "RE2 構文"

[re2 extension]: https://github.com/ClickHouse/pg_re2 "pg_re2: RE2 を使用する ClickHouse 互換の正規表現関数"

[intarray]: https://www.postgresql.org/docs/current/intarray.html "PostgreSQL ドキュメント: intarray"

[fuzzystrmatch]: https://www.postgresql.org/docs/current/fuzzystrmatch.html "PostgreSQL ドキュメント: fuzzystrmatch"

[`to_char()`]: https://www.postgresql.org/docs/current/functions-formatting.html "PostgreSQL ドキュメント: データ型書式設定関数"

[formatDateTime]: https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime "ClickHouse ドキュメント: formatDateTime"