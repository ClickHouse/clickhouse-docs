---
sidebar_label: 'リファレンス'
description: 'pg_clickhouse の完全なリファレンスドキュメント'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse リファレンスドキュメント'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部データラッパー', 'pg_clickhouse', '拡張機能']
---

# pg_clickhouse リファレンス ドキュメント \{#pg_clickhouse-reference-documentation\}

## 説明 \{#description\}

pg_clickhouse は、[foreign data wrapper] を含む ClickHouse データベース上でのリモートでのクエリ実行を可能にする PostgreSQL 拡張機能です。PostgreSQL 13 以降および ClickHouse 23 以降に対応しています。

## はじめに \{#getting-started\}

pg&#95;clickhouse を試してみる最も簡単な方法は [Docker image] を利用することです。これは、
pg&#95;clickhouse 拡張機能を組み込んだ標準の PostgreSQL Docker イメージを含んでいます。

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

pg_clickhouse はパブリックリリースに対して [Semantic Versioning] に準拠します。

* メジャーバージョンは API の変更に対してインクリメントされます
* マイナーバージョンは後方互換性のある SQL の変更に対してインクリメントされます
* パッチバージョンはバイナリのみの変更に対してインクリメントされます

インストール後、PostgreSQL は 2 種類のバージョンを管理します:

* ライブラリバージョン（PostgreSQL 18 以降では `PG_MODULE_MAGIC` により定義）は完全なセマンティックバージョンを含み、`pg_get_loaded_modules()` 関数の出力で確認できます。
* エクステンションバージョン（control ファイルで定義）はメジャーおよびマイナーのみを含み、`pg_catalog.pg_extension` テーブル、`pg_available_extension_versions()` 関数の出力、および `\dx
    pg_clickhouse` で確認できます。

実際には、パッチバージョンのみがインクリメントされるリリース、たとえば
`v0.1.0` から `v0.1.1` への変更は、`v0.1` をロードしているすべてのデータベースに対して有益であり、その恩恵を受けるために `ALTER EXTENSION` を実行する必要はありません。

一方で、マイナーまたはメジャーバージョンがインクリメントされるリリースには SQL アップグレードスクリプトが付随し、エクステンションを含む既存のすべてのデータベースは、アップグレードの恩恵を受けるために `ALTER EXTENSION pg_clickhouse UPDATE` を実行する必要があります。

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

[CREATE FOREIGN TABLE] を使用して、ClickHouse データベース上のデータに対してクエリを実行できる外部テーブルを作成します。

```sql
CREATE FOREIGN TABLE uact (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'uact'
    engine 'CollapsingMergeTree'
);
```

サポートされているテーブルオプションは次のとおりです。

* `database`: リモートデータベースの名前。指定しない場合、外部サーバーに対して
  定義されたデータベースが使用されます。
* `table_name`: リモートテーブルの名前。指定しない場合、外部テーブルに対して
  指定された名前が使用されます。
* `engine`: ClickHouse テーブルで使用される[テーブルエンジン]。
  `CollapsingMergeTree()` および `AggregatingMergeTree()` の場合、pg&#95;clickhouse は
  テーブル上で実行される関数式に対して、自動的にパラメータを適用します。

各カラムのリモート側 ClickHouse データ型に適した[データ型](#data-types)を使用します。
[AggregateFunction Type] および [SimpleAggregateFunction Type] カラムの場合、
データ型を関数に渡される ClickHouse 型にマッピングし、適切なカラムオプションを
使用して集約関数の名前を指定します。

* `AggregateFunction`: [AggregateFunction Type] カラムに適用される
  集約関数の名前
* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] カラムに適用される
  集約関数の名前

例:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

`AggregateFunction` 型のカラムに対しては、pg&#95;clickhouse は
そのカラムを評価する集約関数に自動的に `Merge` を付与します。


### ALTER FOREIGN TABLE \{#alter-foreign-table\}

[ALTER FOREIGN TABLE] を使用して、外部テーブルの定義を変更します。

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

サポートされているテーブルおよびカラムのオプションは、[CREATE FOREIGN TABLE] と同じです。


### DROP FOREIGN TABLE \{#drop-foreign-table\}

[DROP FOREIGN TABLE] ステートメントを使用して、外部テーブルを削除します。

```sql
DROP FOREIGN TABLE uact;
```

外部テーブルに依存しているオブジェクトが存在する場合、このコマンドは失敗します。
それらも同時に削除するには、`CASCADE` 句を指定します。

```sql
DROP FOREIGN TABLE uact CASCADE;
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
 2025-12-05 15:07:32.944188 |      175 | /widgets/totam
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

[SET] を使用して、`pg_clickhouse.session_settings` ランタイムパラメータを指定します。
このパラメータによって、後続のクエリに適用される [ClickHouse 設定] が構成されます。例:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

デフォルトは `join_use_nulls 1` です。空文字列に設定すると、ClickHouse サーバー側の設定にフォールバックします。

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

pg_clickhouse は、次の ClickHouse データ型を PostgreSQL データ型にマッピングします。[IMPORT FOREIGN SCHEMA](#import-foreign-schema) はカラムをインポートする際に PostgreSQL カラムで最初に指定されている型を使用し、追加の型は [CREATE FOREIGN TABLE](#create-foreign-table) 文で使用できます：

| ClickHouse |    PostgreSQL    |                 備考                  |
|------------|------------------|---------------------------------------|
| Bool       | boolean          |                                       |
| Date       | date             |                                       |
| Date32     | date             |                                       |
| DateTime   | timestamptz      |                                       |
| Decimal    | numeric          |                                       |
| Float32    | real             |                                       |
| Float64    | double precision |                                       |
| IPv4       | inet             |                                       |
| IPv6       | inet             |                                       |
| Int16      | smallint         |                                       |
| Int32      | integer          |                                       |
| Int64      | bigint           |                                       |
| Int8       | smallint         |                                       |
| JSON       | jsonb            | HTTP エンジンのみ                     |
| String     | text, bytea      |                                       |
| UInt16     | integer          |                                       |
| UInt32     | bigint           |                                       |
| UInt64     | bigint           | 値が BIGINT の最大値を超えるとエラー |
| UInt8      | smallint         |                                       |
| UUID       | uuid             |                                       |

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

```pgdsql

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
* `port`: 接続先の HTTP ポート。`host` が ClickHouse Cloud のホストでない場合のデフォルトは `8123`、ClickHouse Cloud のホストである場合のデフォルトは `8443`
* `dbname`: 接続するデータベース名。
* `username`: 接続に使用するユーザー名。デフォルトは `default`
* `password`: 認証に使用するパスワード。デフォルトはパスワードなし

レコードを返さないクエリに有用ですが、値を返すクエリの場合は、
結果は 1 つのテキスト値として返されます。

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

ClickHouse 外部テーブルをクエリするために条件（`HAVING` 句および `WHERE`
句）で使用されるすべての PostgreSQL 組み込み関数は、同じ名前とシグネチャのまま
ClickHouse に自動的にプッシュダウンされます。ただし、一部の関数は名前または
シグネチャが異なるため、対応する関数にマッピングする必要があります。
`pg_clickhouse` は次の関数をマッピングします:

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
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`: [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)

### カスタム関数 \{#custom-functions\}

`pg_clickhouse` によって作成されるこれらのカスタム関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 関数に対して、外部クエリのプッシュダウンを提供します。これらの関数のいずれかがプッシュダウンできない場合は、例外を発生させます。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### キャストのプッシュダウン \{#pushdown-casts\}

pg_clickhouse は、互換性のあるデータ型に対しては `CAST(x AS bigint)` のような
キャストをプッシュダウンします。互換性のない型に対してはプッシュダウンは失敗します。
この例で `x` が ClickHouse の `UInt64` の場合、ClickHouse は値のキャストを拒否します。

互換性のないデータ型へのキャストをプッシュダウンするために、pg_clickhouse は
次の関数を提供します。これらがプッシュダウンされない場合、PostgreSQL 側で例外が送出されます。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### プッシュダウン集約 \{#pushdown-aggregates\}

これらの PostgreSQL の集約関数は ClickHouse にプッシュダウンされます。

* [array_agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)

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


## 著者 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## Copyright \{#copyright\}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL ドキュメント: Foreign Data Wrapper の記述"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub上の最新バージョン"

[ClickHouse]: https://clickhouse.com/clickhouse

[セマンティック バージョニング]: https://semver.org/spec/v2.0.0.html "セマンティック バージョニング 2.0.0"

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

[make-logs.sql]: https://github.com/ClickHouse/pg_clickhouse/blob/main/doc/make-logs.sql

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

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[パラメトリック集計関数]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse ドキュメント: セッション設定"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL ドキュメント: ドル引用符付き文字列定数"

[library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "PostgreSQL ドキュメント: 共有ライブラリのプリロード"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES
    "PostgreSQL ドキュメント: PREPARE に関する注意事項"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse
    "ClickHouse ドキュメント: ClickHouse でのプリペアドステートメントの代替手段"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847
    "ClickHouse/ClickHouse#85847 マルチパートフォームの一部のクエリが settings を読み込まない"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570
    "ClickHouse/ClickHouse#85570 HTTP の multipart 処理を修正"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html
    "PostgreSQL ドキュメント: バイナリデータ型"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string
    "ClickHouse ドキュメント: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html
    "PostgreSQL ドキュメント: 文字データ型"