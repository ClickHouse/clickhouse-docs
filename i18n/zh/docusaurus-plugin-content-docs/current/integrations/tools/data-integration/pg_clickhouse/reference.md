---
sidebar_label: '参考'
description: 'pg_clickhouse 的完整参考文档'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse 参考文档'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部数据封装器', 'pg_clickhouse', '扩展']
---

# pg_clickhouse 参考文档 {#pg_clickhouse-reference-documentation}

## 描述 {#description}

pg_clickhouse 是一个 PostgreSQL 扩展，可在 ClickHouse 数据库上远程执行查询，并提供一个[外部数据封装器（foreign data wrapper）]。它支持 PostgreSQL 13 及更高版本以及 ClickHouse 23 及更高版本。

## 入门 {#getting-started}

试用 pg&#95;clickhouse 最简单的方式是使用提供的 [Docker image]，该镜像基于标准 PostgreSQL Docker 镜像，并预装了 pg&#95;clickhouse 扩展：

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

请参阅[教程](tutorial.md)，开始导入 ClickHouse 表并启用查询下推。


## 用法 {#usage}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## 版本策略 {#versioning-policy}

pg_clickhouse 在其公开发布中遵循[语义化版本]。

* 主版本号在 API 发生变更时递增
* 次版本号在发生向后兼容的 SQL 变更时递增
* 补丁版本号在仅二进制发生变更时递增

安装完成后，PostgreSQL 会跟踪两类版本信息：

* 库版本（在 PostgreSQL 18 及更高版本中由 `PG_MODULE_MAGIC` 定义）包含完整的语义化版本，可在 `pg_get_loaded_modules()` 函数的输出中查看。
* 扩展版本（在控制文件中定义）仅包含主版本和次版本，可在 `pg_catalog.pg_extension` 表、`pg_available_extension_versions()` 函数的输出以及 `\dx
    pg_clickhouse` 中查看。

在实际使用中，这意味着一个只递增补丁版本的发布，例如从 `v0.1.0` 到 `v0.1.1`，会惠及所有已加载 `v0.1` 的数据库，并且无需运行 `ALTER EXTENSION` 即可获得升级带来的好处。

另一方面，一个递增次版本或主版本的发布，则会附带 SQL 升级脚本，所有包含该扩展的现有数据库都必须运行 `ALTER EXTENSION pg_clickhouse UPDATE` 才能获得升级带来的好处。

## DDL SQL 参考 {#ddl-sql-reference}

以下 SQL [DDL] 表达式使用 pg_clickhouse。

### CREATE EXTENSION {#create-extension}

使用 [CREATE EXTENSION] 将 pg&#95;clickhouse 扩展添加到数据库：

```sql
CREATE EXTENSION pg_clickhouse;
```

使用 `WITH SCHEMA` 将其安装到特定的 schema 中（推荐）：

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION {#alter-extension}

使用 [ALTER EXTENSION] 来更改 pg_clickhouse。示例：

* 在安装新的 pg_clickhouse 版本后，使用 `UPDATE` 子句：

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* 使用 `SET SCHEMA` 将该扩展迁移到新的 schema 中：

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION {#drop-extension}

使用 [DROP EXTENSION] 从数据库中删除 pg&#95;clickhouse 扩展：

```sql
DROP EXTENSION pg_clickhouse;
```

如果存在任何依赖 pg&#95;clickhouse 的对象，此命令将失败。使用
`CASCADE` 子句以便一并删除它们：

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER {#create-server}

使用 [CREATE SERVER] 语句创建一个连接到 ClickHouse 服务器的外部服务器（foreign server）。示例：

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

支持的选项包括：

* `driver`：要使用的 ClickHouse 连接驱动程序，可选值为 &quot;binary&quot; 或
  &quot;http&quot;。**必填。**
* `dbname`：连接后要使用的 ClickHouse 数据库。默认为
  &quot;default&quot;。
* `host`：ClickHouse 服务器的主机名。默认为 &quot;localhost&quot;；
* `port`：连接 ClickHouse 服务器所使用的端口。默认值如下：
  * 当 `driver` 为 &quot;binary&quot; 且 `host` 为 ClickHouse Cloud 主机时为 9440
  * 当 `driver` 为 &quot;binary&quot; 且 `host` 不是 ClickHouse Cloud 主机时为 9004
  * 当 `driver` 为 &quot;http&quot; 且 `host` 为 ClickHouse Cloud 主机时为 8443
  * 当 `driver` 为 &quot;http&quot; 且 `host` 不是 ClickHouse Cloud 主机时为 8123


### ALTER SERVER {#alter-server}

使用 [ALTER SERVER] 来修改外部服务器。示例：

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

选项与 [CREATE SERVER](#create-server) 中的相同。


### DROP SERVER {#drop-server}

使用 [DROP SERVER] 删除外部服务器：

```sql
DROP SERVER taxi_srv;
```

若有其他对象依赖该服务器，此命令将失败。使用 `CASCADE` 可同时删除这些依赖对象：

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING {#create-user-mapping}

使用 [CREATE USER MAPPING] 将 PostgreSQL 用户映射为 ClickHouse 用户。例如，在通过 `taxi_srv` 外部服务器进行连接时，将当前 PostgreSQL 用户映射到远程 ClickHouse 用户：

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

支持的选项包括：

* `user`：ClickHouse 用户名。默认为“default”。
* `password`：ClickHouse 用户的密码。


### ALTER USER MAPPING {#alter-user-mapping}

使用 [ALTER USER MAPPING] 更改用户映射的定义：

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

这些选项与 [CREATE USER MAPPING](#create-user-mapping) 的选项相同。


### DROP USER MAPPING {#drop-user-mapping}

使用 [DROP USER MAPPING] 来删除用户映射：

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA {#import-foreign-schema}

使用 [IMPORT FOREIGN SCHEMA] 将某个 ClickHouse 数据库中定义的所有表作为外部表导入到 PostgreSQL 的某个 schema 中：

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

使用 `LIMIT TO` 将导入限定为特定表：

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

使用 `EXCEPT` 排除表：

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse 将检索指定 ClickHouse 数据库（上述示例中为 &quot;demo&quot;）中的所有表列表，为每个表获取列定义，并执行 [CREATE FOREIGN TABLE](#create-foreign-table) 命令以创建外部表。列将使用[支持的数据类型](#data-types)进行定义，并在可检测的情况下，应用 [CREATE FOREIGN TABLE](#create-foreign-table) 所支持的选项。

:::tip Imported Identifier Case Preservation

`IMPORT FOREIGN SCHEMA` 会对其导入的表名和列名运行 `quote_identifier()`，从而对包含大写字符或空格的标识符加上双引号。因此，在 PostgreSQL 查询中，此类表名和列名必须使用双引号括起。对于全部为小写且不包含空格字符的名称，则不需要加引号。

例如，给定如下 ClickHouse 表：

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

`IMPORT FOREIGN SCHEMA` 会创建如下所示的外部表：

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

因此，在查询中必须正确加引号，例如：

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

若要创建使用不同名称或全部小写（从而不区分大小写）名称的对象，请使用 [CREATE FOREIGN TABLE](#create-foreign-table)。
:::


### CREATE FOREIGN TABLE {#create-foreign-table}

使用 [CREATE FOREIGN TABLE] 创建一个外部表（foreign table），用于从 ClickHouse 数据库查询数据：

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

支持的表选项如下：

* `database`：远程数据库的名称。默认为 foreign server 定义的数据库。
* `table_name`：远程表的名称。默认为该 foreign table 指定的名称。
* `engine`：ClickHouse 表所使用的[表引擎]。对于 `CollapsingMergeTree()` 和 `AggregatingMergeTree()`，pg&#95;clickhouse 会自动将参数应用到在该表上执行的函数表达式。

为每一列使用与远程 ClickHouse 数据类型相匹配的[数据类型](#data-types)。对于 [AggregateFunction Type] 和 [SimpleAggregateFunction Type] 列，将数据类型映射到传递给函数的 ClickHouse 类型，并通过相应的列选项指定聚合函数的名称：

* `AggregateFunction`：应用于 [AggregateFunction Type] 列的聚合函数名称
* `SimpleAggregateFunction`：应用于 [SimpleAggregateFunction Type] 列的聚合函数名称

示例：

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

对于类型为 `AggregateFunction` 的列，pg&#95;clickhouse 会在用于计算该列的聚合函数名后自动追加 `Merge`。


### ALTER FOREIGN TABLE {#alter-foreign-table}

使用 [ALTER FOREIGN TABLE] 来修改外部表的定义：

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

受支持的表和列选项与 [CREATE FOREIGN TABLE] 相同。


### DROP FOREIGN TABLE {#drop-foreign-table}

使用 [DROP FOREIGN TABLE] 删除外部表：

```sql
DROP FOREIGN TABLE uact;
```

如果有任何对象依赖于该外部表，该命令会失败。
使用 `CASCADE` 子句同时将它们删除：

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## DML SQL 参考 {#dml-sql-reference}

下面的 SQL [DML] 表达式会使用 pg&#95;clickhouse。示例依赖于这些由 [make-logs.sql] 创建的 ClickHouse 表：

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

[EXPLAIN] 命令按预期工作，但在使用 `VERBOSE` 选项时，会触发
ClickHouse 发出“Remote SQL”查询：

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

该查询通过名为“Foreign Scan”的计划节点将远程 SQL 下推到 ClickHouse。


### SELECT {#select}

使用 [SELECT] 语句在 pg&#95;clickhouse 表上执行查询，与在其他任意表上一样：

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totam
(1 row)
```

pg&#95;clickhouse 会尽可能将查询执行下推到 ClickHouse，包括聚合函数。使用 [EXPLAIN](#explain) 来确定下推的范围。以上述查询为例，整个查询的执行过程都会下推到 ClickHouse。

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

pg&#95;clickhouse 也会将对来自同一远程服务器的表的 JOIN 下推：

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

如果不进行仔细调优，与本地表进行 JOIN 会生成效率较低的查询。在本例中，我们创建一份 `nodes` 表的本地副本，并与其进行 JOIN，而不是与远程表进行 JOIN：


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

在这种情况下，我们可以通过按 `node_id` 分组而不是按本地列分组，将更多聚合操作下推到 ClickHouse，并在之后再与查找表进行连接：


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

现在，“Foreign Scan” 节点会按 `node_id` 下推聚合操作，将需要从 Postgres 拉回的行数从 1000 行（全部）减少到仅 8 行，每个节点一行。


### PREPARE、EXECUTE、DEALLOCATE {#prepare-execute-deallocate}

自 v0.1.2 起，pg&#95;clickhouse 支持参数化查询，这类查询主要通过 [PREPARE] 命令创建：

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

像往常一样使用 [EXECUTE] 来执行预处理语句：

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

pg&#95;clickhouse 会像往常一样下推聚合操作，如在
[EXPLAIN](#explain) 的详细输出中所示：

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

请注意，这里发送的是完整的日期值，而不是参数占位符。
前五次请求都是如此，这一点在 PostgreSQL 的
[PREPARE notes] 中已有说明。在第六次执行时，它改为发送 ClickHouse
`{param:type}` 风格的[查询参数]：
参数：

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

使用 [DEALLOCATE] 释放预处理语句：

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```


### INSERT {#insert}

使用 [INSERT] 命令向远程 ClickHouse 表中插入数据：

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```


### COPY {#copy}

使用 [COPY] 命令将一批数据行插入到远程 ClickHouse
表中：

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ 批量 API 限制**
>
> pg&#95;clickhouse 尚未实现对 PostgreSQL FDW 批量插入 API 的支持。
> 因此 [COPY] 目前使用 [INSERT](#insert) 语句来插入记录。
> 这一点计划在未来版本中改进。


### LOAD {#load}

使用 [LOAD] 加载 pg&#95;clickhouse 共享库：

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

通常不需要使用 [LOAD]，因为 Postgres 会在首次使用 pg&#95;clickhouse 的任一功能（函数、外部表等）时自动加载它。

唯一可能需要 [LOAD] pg&#95;clickhouse 的情况是，在执行依赖相关参数的查询之前，预先通过 [SET](#set) 设置 pg&#95;clickhouse 参数。


### SET {#set}

使用 [SET] 命令设置运行时参数 `pg_clickhouse.session_settings`。
该参数用于配置在后续查询中要应用的 [ClickHouse settings]。示例：

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

默认值为 `join_use_nulls 1`。将其设为空字符串以使用 ClickHouse 服务器上的设置。

```sql
SET pg_clickhouse.session_settings = '';
```

其语法为逗号分隔的键/值对列表，键/值对之间以一个或多个空格分隔。键必须对应于 [ClickHouse settings]。用反斜杠对值中的空格、逗号和反斜杠本身进行转义：

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

或者使用单引号括起的值，以避免对空格和逗号进行转义；也可以考虑使用 [dollar quoting]，从而不必使用双引号：

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

如果你在意可读性并且需要配置许多参数，可以使用多行，例如：

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

pg&#95;clickhouse 不会验证这些设置，而是会在处理每个查询时将它们传递给 ClickHouse。
因此，它支持各个 ClickHouse 版本提供的所有设置。

请注意，必须在设置 `pg_clickhouse.session_settings` 之前加载 pg&#95;clickhouse；可以使用 [共享库预加载]，或者直接使用该扩展中的任意对象以确保其被加载。


### ALTER ROLE {#alter-role}

使用 [ALTER ROLE] 的 `SET` 命令，为特定角色[预加载](#preloading) pg&#95;clickhouse
和/或[设置](#set)其参数：

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

使用 [ALTER ROLE] 的 `RESET` 命令来重置 pg&#95;clickhouse 的预加载设置和/或参数：

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```


## 预加载 {#preloading}

如果所有或几乎所有 Postgres 连接都需要使用 pg_clickhouse，
建议使用[共享库预加载]来自动加载它：

### `session_preload_libraries` {#session&#95;preload&#95;libraries}

在每个新的 PostgreSQL 连接建立时加载共享库：

```ini
session_preload_libraries = pg_clickhouse
```

无需重启服务器即可利用更新，只需重新连接即可。也可以通过 [ALTER ROLE](#alter-role) 为特定用户或角色单独设置。


### `shared_preload_libraries` {#shared&#95;preload&#95;libraries}

在 PostgreSQL 父进程启动时加载共享库：

```ini
shared_preload_libraries = pg_clickhouse
```

对于每个会话来说有助于节省内存和加载开销，但在更新该库时需要重启集群。


## 函数和运算符参考 {#function-and-operator-reference}

### 数据类型 {#data-types}

pg_clickhouse 将下列 ClickHouse 数据类型映射到 PostgreSQL 数据类型：

| ClickHouse |    PostgreSQL    |             备注              |
| -----------|------------------|-------------------------------|
| Bool       | boolean          |                               |
| Date       | date             |                               |
| Date32     | date             |                               |
| DateTime   | timestamp        |                               |
| Decimal    | numeric          |                               |
| Float32    | real             |                               |
| Float64    | double precision |                               |
| IPv4       | inet             |                               |
| IPv6       | inet             |                               |
| Int16      | smallint         |                               |
| Int32      | integer          |                               |
| Int64      | bigint           |                               |
| Int8       | smallint         |                               |
| JSON       | jsonb            | 仅适用于 HTTP 引擎            |
| String     | text             |                               |
| UInt16     | integer          |                               |
| UInt32     | bigint           |                               |
| UInt64     | bigint           | 当值 > BIGINT 最大值时会报错  |
| UInt8      | smallint         |                               |
| UUID       | uuid             |                               |

### 函数 {#functions}

这些函数提供查询 ClickHouse 数据库的接口。

#### `clickhouse_raw_query` {#clickhouse&#95;raw&#95;query}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

通过 HTTP 接口连接到 ClickHouse 服务，执行一条
查询，然后断开连接。可选的第二个参数指定连接字符串，
默认值为 `host=localhost port=8123`。支持的连接参数有：

* `host`：要连接的主机；必需。
* `port`：要连接的 HTTP 端口；默认值为 `8123`，除非 `host` 是
  ClickHouse Cloud 主机，在这种情况下默认值为 `8443`
* `dbname`：要连接的数据库名称。
* `username`：连接时使用的用户名；默认值为 `default`
* `password`：用于认证的密码；默认情况下不使用密码

适用于不返回记录的查询；对于会返回值的查询，
结果将作为单个文本值返回：

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


### 下推函数 {#pushdown-functions}

在用于查询 ClickHouse 外部表的条件（`HAVING` 和 `WHERE` 子句）中，所有 PostgreSQL 内置函数都会以相同的名称和签名自动下推到 ClickHouse。不过，其中有一些函数在名称或签名上不同，必须映射到它们在 ClickHouse 中的等价函数。`pg_clickhouse` 会映射以下函数：

* `date_part`：
  * `date_part('day')`： [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`： [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`： [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`： [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`： [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`： [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`： [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`： [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`： [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`： [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`： [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`： [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`：
  * `date_trunc('week')`： [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`： [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`： [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`： [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`： [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`： [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`： [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`： [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `array_position`： [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`： [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`： [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`： [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)

### 自定义函数 {#custom-functions}

这些由 `pg_clickhouse` 创建的自定义函数，为部分在 PostgreSQL 中没有等价实现的 ClickHouse 函数提供外部查询下推能力。  
如果其中任何一个函数无法下推，则会抛出异常。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### 下推类型转换 {#pushdown-casts}

pg_clickhouse 会对兼容数据类型下推诸如 `CAST(x AS bigint)` 的类型转换。对于不兼容的数据类型，下推会失败；如果在此示例中 `x` 是 ClickHouse 的 `UInt64`，ClickHouse 将拒绝执行该转换。

为了将类型转换下推到不兼容的数据类型，pg_clickhouse 提供了以下函数。如果这些函数未被下推，则会在 PostgreSQL 中抛出异常。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### 下推聚合 {#pushdown-aggregates}

这些 PostgreSQL 聚合函数可以下推到 ClickHouse 执行。

* [array_agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)

### 自定义聚合 {#custom-aggregates}

这些由 `pg_clickhouse` 创建的自定义聚合函数，为部分在 PostgreSQL 中没有等价实现的 ClickHouse 聚合函数提供外部查询下推能力。若这些函数中的任意一个无法下推，则会抛出异常。

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

### 下推有序集合聚合函数 {#pushdown-ordered-set-aggregates}

这些[有序集合聚合函数]会通过将它们的*直接参数*作为参数传入，并将其 `ORDER BY` 表达式作为聚合函数的参数，映射到 ClickHouse 的[参数化聚合函数]。例如，下面这个 PostgreSQL 查询：

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

对应的 ClickHouse 查询如下：

```sql
SELECT quantile(0.25)(a) FROM t1;
```

请注意，`ORDER BY` 的非默认后缀 `DESC` 和 `NULLS FIRST`
不受支持，并且会导致错误。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


## 作者 {#authors}

[David E. Wheeler](https://justatheory.com/)

## 版权 {#copyright}

版权 (c) 2025-2026，ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL 文档：编写外部数据封装器（Foreign Data Wrapper）"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub 上的最新版本"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "语义化版本规范 2.0.0"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "维基百科：数据定义语言"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "PostgreSQL 文档：CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "PostgreSQL 文档：ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "PostgreSQL 文档：DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "PostgreSQL 文档：CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "PostgreSQL 文档：ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "PostgreSQL 文档：DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "PostgreSQL 文档：CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "PostgreSQL 文档：ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "PostgreSQL 文档：DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "PostgreSQL 文档：IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "PostgreSQL 文档：CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "ClickHouse 文档：表引擎"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "ClickHouse 文档：AggregateFunction 类型"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "ClickHouse 文档：SimpleAggregateFunction 类型"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "PostgreSQL 文档：ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "PostgreSQL 文档：DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "维基百科：数据操作语言"

[make-logs.sql]: https://github.com/ClickHouse/pg_clickhouse/blob/main/doc/make-logs.sql

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html "PostgreSQL 文档：EXPLAIN"

[SELECT]: https://www.postgresql.org/docs/current/sql-select.html "PostgreSQL 文档：SELECT"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL 文档：PREPARE"

[EXECUTE]: https://www.postgresql.org/docs/current/sql-execute.html "PostgreSQL 文档：EXECUTE"

[DEALLOCATE]: https://www.postgresql.org/docs/current/sql-deallocate.html "PostgreSQL 文档：DEALLOCATE"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL 文档：PREPARE"

[INSERT]: https://www.postgresql.org/docs/current/sql-insert.html "PostgreSQL 文档：INSERT"

[COPY]: https://www.postgresql.org/docs/current/sql-copy.html "PostgreSQL 文档：COPY"

[LOAD]: https://www.postgresql.org/docs/current/sql-load.html "PostgreSQL 文档：LOAD"

[SET]: https://www.postgresql.org/docs/current/sql-set.html "PostgreSQL 文档：SET"

[ALTER ROLE]: https://www.postgresql.org/docs/current/sql-alterrole.html "PostgreSQL 文档：ALTER ROLE"

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse 文档：会话设置"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL 文档：以美元符号定界的字符串常量"

[library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD

"PostgreSQL 文档：共享库预加载
  [PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES
    "PostgreSQL 文档：PREPARE 注意事项"
  [query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse
    "ClickHouse 文档：ClickHouse 中预处理语句的替代方案"