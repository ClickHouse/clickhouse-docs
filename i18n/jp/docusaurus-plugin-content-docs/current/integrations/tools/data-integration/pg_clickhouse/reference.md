---
sidebar_label: 'リファレンス'
description: 'pg_clickhouse の完全なリファレンスドキュメント'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse リファレンスドキュメント'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# pg_clickhouse リファレンス ドキュメント {#pg_clickhouse-reference-documentation}

## 説明 {#description}

pg_clickhouse は、[foreign data wrapper] を含め、ClickHouse データベースに対するリモートでのクエリ実行を可能にする PostgreSQL 拡張機能です。PostgreSQL 13 以降および ClickHouse 23 以降をサポートしています。

## はじめに {#getting-started}

pg&#95;clickhouse を試す最も簡単な方法は、pg&#95;clickhouse 拡張機能を組み込んだ標準 PostgreSQL の [Docker image] を使うことです。

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouse テーブルのインポートやクエリのプッシュダウンを始めるには、[チュートリアル](tutorial.md) を参照してください。


## 使用方法 {#usage}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## バージョニングポリシー {#versioning-policy}

pg_clickhouse は公開リリースに対して [Semantic Versioning] に従います。

* メジャーバージョンは API の変更時にインクリメントされます
* マイナーバージョンは後方互換性のある SQL の変更時にインクリメントされます
* パッチバージョンはバイナリのみの変更時にインクリメントされます

インストール後は、PostgreSQL は 2 種類のバージョンを追跡します。

* ライブラリバージョン（PostgreSQL 18 以上では `PG_MODULE_MAGIC` によって定義）は完全なセマンティックバージョンを含み、`pg_get_loaded_modules()` 関数の出力で確認できます。
* 拡張機能バージョン（control ファイルで定義）はメジャーおよびマイナーバージョンのみを含み、`pg_catalog.pg_extension` テーブル、`pg_available_extension_versions()` 関数の出力、そして `\dx
    pg_clickhouse` で確認できます。

実際には、パッチバージョンのみがインクリメントされるリリース、例えば
`v0.1.0` から `v0.1.1` への変更は、`v0.1` をロードしているすべてのデータベースに適用され、アップグレードのために `ALTER EXTENSION` を実行する必要はありません。

一方で、マイナーまたはメジャーバージョンがインクリメントされるリリースには SQL アップグレードスクリプトが伴い、その拡張機能を含む既存のすべてのデータベースは、アップグレードの恩恵を受けるために `ALTER EXTENSION pg_clickhouse UPDATE` を実行する必要があります。

## DDL SQL リファレンス {#ddl-sql-reference}

以下の SQL [DDL] 文は pg_clickhouse を利用します。

### CREATE EXTENSION {#create-extension}

[CREATE EXTENSION] ステートメントを使用して、pg&#95;clickhouse 拡張機能をデータベースに追加します。

```sql
CREATE EXTENSION pg_clickhouse;
```

特定のスキーマにインストールする場合は（推奨）、`WITH SCHEMA` を使用します。

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION {#alter-extension}

[ALTER EXTENSION] を使用して pg_clickhouse を変更します。例：

* 新しいリリースの pg_clickhouse をインストールした後は、`UPDATE` 句を使用します：

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* `SET SCHEMA` を使用して、拡張機能を新しいスキーマに移動します：

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION {#drop-extension}

[DROP EXTENSION] を使用して、データベースから pg&#95;clickhouse 拡張機能を削除します。

```sql
DROP EXTENSION pg_clickhouse;
```

このコマンドは、pg&#95;clickhouse に依存するオブジェクトが存在する場合、失敗します。
それらもまとめて削除するには、`CASCADE` 句を使用してください。

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER {#create-server}

[CREATE SERVER] を使用して、ClickHouse サーバーへの接続を定義する foreign server（外部サーバー）を作成します。例:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

サポートされているオプションは次のとおりです:

* `driver`: 使用する ClickHouse 接続ドライバ。&quot;binary&quot; または
  &quot;http&quot; のいずれか。**必須。**
* `dbname`: 接続時に使用する ClickHouse データベース。デフォルトでは
  &quot;default&quot;。
* `host`: ClickHouse サーバーのホスト名。デフォルトでは &quot;localhost&quot;。
* `port`: ClickHouse サーバーに接続するポート。デフォルトは次のとおり:
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud のホストの場合は 9440
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud のホストではない場合は 9004
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud のホストの場合は 8443
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud のホストではない場合は 8123


### ALTER SERVER {#alter-server}

[ALTER SERVER] を使用して、外部サーバーの定義を変更します。例:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

オプションは [CREATE SERVER](#create-server) の場合と同じです。


### DROP SERVER {#drop-server}

[DROP SERVER] を使用して、外部サーバー定義を削除します。

```sql
DROP SERVER taxi_srv;
```

サーバーに他のオブジェクトが依存している場合、このコマンドは失敗します。それらの依存関係も削除するには、`CASCADE` 句を使用してください。

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING {#create-user-mapping}

[CREATE USER MAPPING] を使用して、PostgreSQL ユーザーを ClickHouse ユーザーにマッピングします。
たとえば、`taxi_srv` フォーリンサーバーに接続する際に、現在の PostgreSQL ユーザーをリモートの ClickHouse ユーザーにマッピングするには、次のようにします。

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

サポートされているオプションは次のとおりです。

* `user`: ClickHouse のユーザー名。既定値は「default」です。
* `password`: ClickHouse のユーザーのパスワード。


### ALTER USER MAPPING {#alter-user-mapping}

ユーザー マッピングの定義を変更するには、[ALTER USER MAPPING] を使用します。

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

オプションは [CREATE USER MAPPING](#create-user-mapping) の場合と同じです。


### DROP USER MAPPING {#drop-user-mapping}

ユーザーマッピングを削除するには、[DROP USER MAPPING] を使用します。

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA {#import-foreign-schema}

[IMPORT FOREIGN SCHEMA] を使用して、ClickHouse データベース内で定義されているすべてのテーブルを、外部テーブルとして PostgreSQL のスキーマ内にインポートします。

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

`LIMIT TO` を使用して、インポートするテーブルを特定のものに絞り込みます。

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

`EXCEPT` を使用してテーブルを除外します:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse は、指定された ClickHouse データベース（上記の例では &quot;demo&quot;）内のすべてのテーブルの一覧を取得し、各テーブルのカラム定義を取得したうえで、外部テーブルを作成するために [CREATE FOREIGN TABLE](#create-foreign-table) コマンドを実行します。カラムは、[サポートされているデータ型](#data-types) と、検出可能な場合には [CREATE FOREIGN TABLE](#create-foreign-table) でサポートされているオプションを使用して定義されます。

:::tip Imported Identifier Case Preservation

`IMPORT FOREIGN SCHEMA` は、インポートするテーブル名およびカラム名に対して `quote_identifier()` を実行し、大文字や空白を含む識別子を二重引用符で囲みます。このようなテーブル名およびカラム名は、PostgreSQL のクエリ内でも二重引用符で囲む必要があります。すべて小文字で空白文字を含まない名前であれば、引用符で囲む必要はありません。

例えば、次の ClickHouse テーブルがあるとします。

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

`IMPORT FOREIGN SCHEMA` によって、次の外部テーブルが作成されます。

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

したがって、クエリでは適切に引用符で囲む必要があります。たとえば、

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

異なる名前やすべて小文字の名前（つまり大文字小文字を区別しない）でオブジェクトを作成するには、[CREATE FOREIGN TABLE](#create-foreign-table) を使用します。
:::


### CREATE FOREIGN TABLE {#create-foreign-table}

[CREATE FOREIGN TABLE] を使用して、ClickHouse データベース内のデータを参照する外部テーブルを作成します。

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

* `database`: リモートデータベース名。指定がない場合は、外部サーバーに対して定義されたデータベースが使用されます。
* `table_name`: リモートテーブル名。指定がない場合は、外部テーブルに指定された名前が使用されます。
* `engine`: ClickHouse テーブルで使用される[テーブルエンジン]。`CollapsingMergeTree()` および `AggregatingMergeTree()` の場合、pg&#95;clickhouse はテーブル上で実行される関数式にパラメータを自動的に適用します。

各カラムのリモート ClickHouse 側のデータ型に適した [data type](#data-types) を使用します。[AggregateFunction Type] および [SimpleAggregateFunction Type] カラムについては、データ型を関数に渡される ClickHouse の型にマッピングし、適切なカラムオプションを使用して集約関数名を指定します。

* `AggregateFunction`: [AggregateFunction Type] カラムに適用される集約関数の名前
* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] カラムに適用される集約関数の名前

例:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

`AggregateFunction` 関数を持つカラムに対しては、pg&#95;clickhouse がそのカラムを評価する集約関数の末尾に自動的に `Merge` を付加します。


### ALTER FOREIGN TABLE {#alter-foreign-table}

[ALTER FOREIGN TABLE] を使用すると、外部テーブルの定義を変更できます。

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

サポートされるテーブルおよびカラムのオプションは、[CREATE FOREIGN TABLE] の場合と同様です。


### DROP FOREIGN TABLE {#drop-foreign-table}

[DROP FOREIGN TABLE] を使用して、外部テーブルを削除します。

```sql
DROP FOREIGN TABLE uact;
```

このコマンドは、外部テーブルに依存するオブジェクトが存在する場合は失敗します。
それらも合わせて削除するには、`CASCADE` 句を使用します。

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## DML SQL リファレンス {#dml-sql-reference}

以下の SQL [DML] ステートメントでは、pg&#95;clickhouse を使用する場合があります。例は、
[make-logs.sql] によって作成されたこれらの ClickHouse テーブルに依存します。

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


### EXPLAIN {#explain}

[EXPLAIN] コマンドは期待どおりに動作しますが、`VERBOSE` オプションを指定すると、
ClickHouse の「Remote SQL」クエリが発行されます。

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

このクエリは「Foreign Scan」プランノードを通じて、リモート SQL が ClickHouse にプッシュダウンされます。


### SELECT {#select}

[SELECT] 文を使用して、他のテーブルと同様に pg&#95;clickhouse テーブルに対してクエリを実行できます。

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totam
(1 row)
```

pg&#95;clickhouse は、集約関数を含め、クエリの実行を可能な限り ClickHouse にプッシュダウンします。[EXPLAIN](#explain) を使用して、どの程度プッシュダウンされるかを確認してください。たとえば上記のクエリでは、すべての処理が ClickHouse 側で実行されます。

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

pg&#95;clickhouse は、同一のリモートサーバー上のテーブル同士の JOIN もプッシュダウンします。

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

ローカルテーブルに対して結合すると、慎重にチューニングしない限り、効率の悪いクエリになってしまいます。次の例では、`nodes` テーブルのローカルコピーを作成し、リモートテーブルではなくそのローカルテーブルに結合します。


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

この場合、ローカルのカラムではなく `node_id` でグループ化することで、
より多くの集約処理を ClickHouse 側に任せ、後でルックアップテーブルと
JOIN することができます。


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

「Foreign Scan」ノードは現在、`node_id` による集約をプッシュダウンするようになり、
Postgres に引き戻す必要がある行数は、1000 行（全行）から 8 行だけ（各ノードにつき 1 行）にまで削減されます。


### PREPARE, EXECUTE, DEALLOCATE {#prepare-execute-deallocate}

v0.1.2 以降の pg&#95;clickhouse ではパラメータ化されたクエリがサポートされており、主に
[PREPARE] コマンドで作成します。

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

準備済みステートメントは、通常どおり [EXECUTE] を使って実行します。

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

集約処理は通常どおりプッシュダウンされ、その様子は [EXPLAIN](#explain) の verbose 出力で確認できます。

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

パラメータプレースホルダーではなく、完全な日付値が送信されていることに注意してください。
これは、PostgreSQL の [PREPARE notes] に記載されているとおり、最初の 5 回のリクエストについても同様です。6 回目の実行時には、ClickHouse の
`{param:type}` 形式の [query parameters] を送信します。
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

プリペアドステートメントを解放するには、[DEALLOCATE] を使用します。

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```


### INSERT {#insert}

[INSERT] コマンドを使用して、リモート側の ClickHouse テーブルに値を挿入します。

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```


### COPY {#copy}

[COPY] コマンドを使用して、複数行をリモート ClickHouse
テーブルに一括挿入します。

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ Batch API の制限事項**
>
> pg&#95;clickhouse は、PostgreSQL FDW の batch insert API を現時点ではまだ実装していません。
> そのため、現在 [COPY] はレコードを挿入するために [INSERT](#insert) 文を使用しています。
> これは今後のリリースで改善される予定です。


### LOAD {#load}

[LOAD] を使用して、pg&#95;clickhouse の共有ライブラリをロードします。

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

通常は [LOAD] を使用する必要はありません。Postgres は、pg&#95;clickhouse の機能（関数、外部テーブルなど）のいずれかが初めて使用されたときに、自動的に pg&#95;clickhouse をロードします。

pg&#95;clickhouse を [LOAD] しておくことが有用なのは、それに依存するクエリを実行する前に、[SET](#set) で pg&#95;clickhouse のパラメータを設定しておきたい場合だけです。


### SET {#set}

[SET] を使用して `pg_clickhouse.session_settings` ランタイムパラメーターを設定します。
このパラメーターで、後続のクエリに適用される [ClickHouse settings] を指定します。例:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

デフォルトは `join_use_nulls 1` です。空文字列に設定すると、
ClickHouse サーバー側の設定が使用されます。

```sql
SET pg_clickhouse.session_settings = '';
```

この構文は、カンマ区切りのキーと値のペアのリストで、1つ以上のスペースで区切られます。キーは [ClickHouse settings] に対応している必要があります。値中の空白、カンマ、およびバックスラッシュは、バックスラッシュでエスケープします:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

スペースやカンマをエスケープせずに済むように値をシングルクォートで囲むか、二重引用符で囲む必要がないように [dollar quoting] の利用を検討してください：

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

可読性を重視し、設定項目が多い場合は、たとえば次のように複数行に分けて記述してください。

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

pg&#95;clickhouse は設定を検証せず、すべてのクエリについて設定をそのまま ClickHouse に渡します。そのため、各 ClickHouse バージョンのすべての設定をサポートします。

なお、`pg_clickhouse.session_settings` を設定する前に pg&#95;clickhouse をロードしておく必要があります。[shared library preloading] を使用するか、拡張機能内のいずれかのオブジェクトを利用してロードされるようにしてください。


### ALTER ROLE {#alter-role}

[ALTER ROLE] の `SET` コマンドを使用すると、特定のロールに対して pg&#95;clickhouse を[プリロード](#preloading)したり、そのパラメータを [SET](#set) したりできます。

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


## 事前読み込み {#preloading}

ほとんどすべて、あるいは大半の Postgres 接続で pg_clickhouse を使用する必要がある場合は、
[共有ライブラリの事前読み込み] を利用して自動的にロードされるようにすることを検討してください。

### `session_preload_libraries` {#session&#95;preload&#95;libraries}

PostgreSQL への新しい接続ごとに、共有ライブラリをロードします。

```ini
session_preload_libraries = pg_clickhouse
```

サーバーを再起動せずに更新内容を反映できるため便利です。再接続するだけで済みます。[ALTER
ROLE](#alter-role) を使用して、特定のユーザーまたはロールに対して設定することもできます。


### `shared_preload_libraries` {#shared&#95;preload&#95;libraries}

PostgreSQL の親プロセスの起動時に共有ライブラリをロードします。

```ini
shared_preload_libraries = pg_clickhouse
```

各セッションのメモリ使用量とロードのオーバーヘッドを削減するのに有効ですが、ライブラリを更新した場合はクラスターを再起動する必要があります。


## 関数と演算子のリファレンス {#function-and-operator-reference}

### データ型 {#data-types}

pg_clickhouse は、次の ClickHouse データ型を PostgreSQL データ型にマッピングします。

| ClickHouse |    PostgreSQL    |                 備考                  |
| -----------|------------------|--------------------------------------|
| Bool       | boolean          |                                      |
| Date       | date             |                                      |
| Date32     | date             |                                      |
| DateTime   | timestamp        |                                      |
| Decimal    | numeric          |                                      |
| Float32    | real             |                                      |
| Float64    | double precision |                                      |
| IPv4       | inet             |                                      |
| IPv6       | inet             |                                      |
| Int16      | smallint         |                                      |
| Int32      | integer          |                                      |
| Int64      | bigint           |                                      |
| Int8       | smallint         |                                      |
| JSON       | jsonb            | HTTP エンジンのみ                    |
| String     | text             |                                      |
| UInt16     | integer          |                                      |
| UInt32     | bigint           |                                      |
| UInt64     | bigint           | 値が BIGINT の最大値を超えるとエラー |
| UInt8      | smallint         |                                      |
| UUID       | uuid             |                                      |

### 関数 {#functions}

これらの関数は、ClickHouse データベースに対してクエリを実行するためのインターフェースを提供します。

#### `clickhouse_raw_query` {#clickhouse&#95;raw&#95;query}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

ClickHouse サービスに HTTP インターフェイス経由で接続し、単一のクエリを実行してから切断します。省略可能な 2 番目の引数には接続文字列を指定でき、指定しない場合のデフォルトは `host=localhost port=8123` です。サポートされている接続パラメータは次のとおりです。

* `host`: 接続先のホスト。必須。
* `port`: 接続先の HTTP ポート。`host` が ClickHouse Cloud のホストでない場合のデフォルトは `8123`、ClickHouse Cloud のホストである場合のデフォルトは `8443`
* `dbname`: 接続先のデータベース名。
* `username`: 接続時に使用するユーザー名。デフォルトは `default`
* `password`: 認証に使用するパスワード。デフォルトはパスワードなし

レコードを返さないクエリに便利ですが、値を返すクエリの場合は、単一のテキスト値として返されます。

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


### プッシュダウン関数 {#pushdown-functions}

条件式（`HAVING` および `WHERE` 句）で使用される PostgreSQL のすべての組み込み関数は、ClickHouse 外部テーブルに対してクエリを実行する際、同じ名前とシグネチャのまま自動的に ClickHouse 側へプッシュダウンされます。ただし、一部の関数は名前やシグネチャが異なるため、同等の関数にマッピングする必要があります。`pg_clickhouse` は次の関数をマッピングします:

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

### カスタム関数 {#custom-functions}

`pg_clickhouse` によって作成されるこれらのカスタム関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 関数に対して、外部クエリのプッシュダウンを可能にします。これらの関数のいずれかがプッシュダウンできない場合は、例外を発生させます。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### キャストのプッシュダウン {#pushdown-casts}

pg_clickhouse は、互換性のあるデータ型に対して `CAST(x AS bigint)` のようなキャストをプッシュダウンします。互換性のない型の場合はプッシュダウンが失敗します。この例で `x` が ClickHouse の `UInt64` である場合、ClickHouse はその値のキャストを拒否します。

互換性のないデータ型へのキャストをプッシュダウンするために、pg_clickhouse は次の関数を提供します。これらの関数がプッシュダウンされなかった場合、PostgreSQL で例外をスローします。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### プッシュダウンされる集約関数 {#pushdown-aggregates}

これらの PostgreSQL 集約関数は ClickHouse へプッシュダウンされます。

* [array_agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)

### カスタム集約関数 {#custom-aggregates}

`pg_clickhouse` によって定義されるこれらのカスタム集約関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 集約関数に対して、外部クエリのプッシュダウンを可能にします。これらの関数のいずれかをプッシュダウンできない場合は、例外を発生させます。

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

### プッシュダウンされる順序付き集合集約 {#pushdown-ordered-set-aggregates}

これらの [ordered-set aggregate functions] は、*direct argument* をパラメータとして渡し、`ORDER BY` の式を引数として渡すことで、ClickHouse の [Parametric
aggregate functions] に対応します。例えば、次の PostgreSQL クエリでは：

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

これは次の ClickHouse クエリに対応しています：

```sql
SELECT quantile(0.25)(a) FROM t1;
```

デフォルト以外の `ORDER BY` 句の接尾辞である `DESC` および `NULLS FIRST` はサポートされておらず、指定するとエラーになります。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


## 著者 {#authors}

[David E. Wheeler](https://justatheory.com/)

## 著作権 {#copyright}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL ドキュメント: Foreign Data Wrapper の作成"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub 上の最新バージョン"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "セマンティック バージョニング 2.0.0"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: データ定義言語"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "PostgreSQL ドキュメント: CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "PostgreSQL ドキュメント: ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "PostgreSQL ドキュメント: DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "PostgreSQL ドキュメント: CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "PostgreSQL ドキュメント: ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "PostgreSQL ドキュメント: DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "PostgreSQL ドキュメント: CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "PostgreSQL ドキュメント: ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "PostgreSQL ドキュメント: DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "PostgreSQL ドキュメント: IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "PostgreSQL ドキュメント: CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "ClickHouse ドキュメント: テーブルエンジン"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "ClickHouse ドキュメント: AggregateFunction 型"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "ClickHouse ドキュメント: SimpleAggregateFunction 型"

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

[Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse Docs: Session Settings"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL ドキュメント: ドル記号で囲まれた文字列定数"

[library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD

"PostgreSQL ドキュメント: 共有ライブラリのプリロード
  [PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES
    "PostgreSQL ドキュメント: PREPARE の注意事項"
  [query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse
    "ClickHouse ドキュメント: ClickHouse におけるプリペアドステートメントの代替手段"