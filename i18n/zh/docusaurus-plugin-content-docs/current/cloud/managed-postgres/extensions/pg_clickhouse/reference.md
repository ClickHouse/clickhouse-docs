---
sidebar_label: '参考'
description: 'pg_clickhouse 的完整参考文档'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse/reference'
title: 'pg_clickhouse 参考文档'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '外部数据包装器', 'pg_clickhouse', '扩展']
---

## 说明 \{#description\}

pg&#95;clickhouse 是一个 PostgreSQL 扩展，可在
ClickHouse 数据库上远程执行查询，并包含 [外部数据包装器]。它支持
PostgreSQL 13 及以上版本，以及 ClickHouse 23 及以上版本。

## 快速开始 \{#getting-started\}

体验 pg&#95;clickhouse 最简单的方式是使用 [Docker image]，其中包含
标准的 PostgreSQL Docker 镜像，以及 pg&#95;clickhouse 和 [re2][re2
扩展] 扩展：

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

请参阅[教程](tutorial.md)，了解如何开始导入 ClickHouse 表并
下推查询。

## 用法 \{#usage\}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```

## 版本策略 \{#versioning-policy\}

pg&#95;clickhouse 的公开发布版本遵循[语义化版本控制]。

* API 发生变更时，主版本号递增
* 进行向后兼容的 SQL 变更时，次版本号递增
* 仅有 binary 变更时，补丁版本号递增

安装后，PostgreSQL 会跟踪两种版本：

* 库版本 (在 PostgreSQL 18 及更高版本中由 `PG_MODULE_MAGIC` 定义)
  包含完整的语义化版本，可在
  `pgch_version()` 函数的输出或 Postgres 的 [`pg_get_loaded_modules()`]
  函数输出中查看。
* 扩展版本 (在控制文件中定义) 仅包含主版本号和次版本号，可在
  `pg_catalog.pg_extension` 表、`pg_available_extension_versions()`
  函数的输出以及 `\dx
  pg_clickhouse` 中查看。

这实际上意味着，补丁版本号递增的发布版本 (例如
从 `v0.1.0` 升级到 `v0.1.1`) 会使所有已加载 `v0.1` 的数据库受益，
且无需运行 `ALTER EXTENSION` 即可获得升级带来的改进。

另一方面，次版本号或主版本号递增的发布版本
会附带 SQL 升级脚本，所有包含该扩展的现有数据库
都必须运行 `ALTER EXTENSION pg_clickhouse UPDATE` 才能获得
升级带来的改进。

## DDL SQL 参考 \{#ddl-sql-reference\}

以下 SQL [DDL] 表达式适用于 pg&#95;clickhouse。

### CREATE EXTENSION \{#create-extension\}

使用 [CREATE EXTENSION] 向数据库添加 pg&#95;clickhouse：

```sql
CREATE EXTENSION pg_clickhouse;
```

使用 `WITH SCHEMA` 将其安装到指定的 schema 中 (推荐) ：

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```

### ALTER EXTENSION \{#alter-extension\}

使用 [ALTER EXTENSION] 修改 pg&#95;clickhouse。示例：

* 安装 pg&#95;clickhouse 的新版本后，使用 `UPDATE` 子句：

  ```sql
  ALTER EXTENSION pg_clickhouse UPDATE;
  ```

* 使用 `SET SCHEMA` 将该扩展移动到新的 schema：

  ```sql
  CREATE SCHEMA ch;
  ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
  ```

### DROP EXTENSION \{#drop-extension\}

使用 [DROP EXTENSION] 从数据库中删除 pg&#95;clickhouse 扩展：

```sql
DROP EXTENSION pg_clickhouse;
```

如果有任何对象依赖于 pg&#95;clickhouse，此命令会失败。使用
`CASCADE` 子句可将它们一并删除：

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```

### CREATE SERVER \{#create-server\}

使用 [CREATE SERVER] 创建连接到 ClickHouse
服务器的 外部服务器。示例：

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

支持的选项如下：

* `driver`：要使用的 ClickHouse 连接驱动，可以是 &quot;binary&quot; 或
  &quot;http&quot;。**必填。**
* `dbname`：建立连接时要使用的 ClickHouse 数据库。默认为
  &quot;default&quot;。
* `fetch_size`：HTTP 流式传输的近似批次大小 (以字节为单位) 。批次
  按行边界拆分。默认为 `50000000` (50 MB) 。`0` 会禁用
  流式传输并缓冲整个响应。foreign table 可以覆盖此
  值。
* `host`：ClickHouse服务器 的主机名。默认为 &quot;localhost&quot;；
* `port`：连接到 ClickHouse服务器 时使用的端口。默认值
  如下：
  * 如果 `driver` 为 &quot;binary&quot; 且 `host` 是 ClickHouse Cloud 主机，则为 9440
  * 如果 `driver` 为 &quot;binary&quot; 且 `host` 不是 ClickHouse Cloud 主机，则为 9004
  * 如果 `driver` 为 &quot;http&quot; 且 `host` 是 ClickHouse Cloud 主机，则为 8443
  * 如果 `driver` 为 &quot;http&quot; 且 `host` 不是 ClickHouse Cloud 主机，则为 8123

### ALTER SERVER \{#alter-server\}

使用 [ALTER SERVER] 更改外部服务器。示例：

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

这些选项与 [CREATE SERVER](#create-server) 中的相同。

### DROP SERVER \{#drop-server\}

可使用 [DROP SERVER] 删除外部服务器：

```sql
DROP SERVER taxi_srv;
```

如果有任何其他对象依赖于该服务器，此命令将失败。使用 `CASCADE` 可
一并删除这些依赖项：

```sql
DROP SERVER taxi_srv CASCADE;
```

### CREATE USER MAPPING \{#create-user-mapping\}

使用 [CREATE USER MAPPING] 将 PostgreSQL 用户映射为 ClickHouse 用户。例如，要在
通过 `taxi_srv` 外部服务器 连接时，将当前 PostgreSQL 用户映射到远程 ClickHouse 用户：

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

支持的选项如下：

* `user`：ClickHouse 用户名。默认为 &quot;default&quot;。
* `password`：ClickHouse 用户的密码。

### ALTER USER MAPPING \{#alter-user-mapping\}

使用 [ALTER USER MAPPING] 修改用户映射的定义：

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

这些选项与 [CREATE USER MAPPING](#create-user-mapping) 中的选项相同。

### DROP USER MAPPING \{#drop-user-mapping\}

使用 [DROP USER MAPPING] 移除用户映射：

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```

### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

使用 [IMPORT FOREIGN SCHEMA] 可将 ClickHouse
数据库中定义的所有表作为外部表导入到 PostgreSQL schema 中：

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

使用 `LIMIT TO` 将导入范围限制为特定的表：

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

使用 `EXCEPT` 排除相关表：

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse 会拉取指定 ClickHouse
数据库 (上述示例中的 &quot;demo&quot;) 中所有表的列表，拉取每个表的列定义，
并执行 [CREATE FOREIGN TABLE](#create-foreign-table) 命令来创建
外部表。列将使用[支持的数据
类型](#data-types)定义，并在可检测的情况下，使用 [CREATE
FOREIGN TABLE](#create-foreign-table) 支持的选项。

:::tip 导入的标识符大小写保留

`IMPORT FOREIGN SCHEMA` 会对其导入的表名和列名执行 `quote_identifier()`，
这会为包含大写字母或空格的标识符添加双引号。
因此，此类表名和列名在 PostgreSQL 查询中必须用双引号括起来。
完全为小写且不包含空格字符的名称则无需加引号。

例如，给定以下 ClickHouse 表：

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

`IMPORT FOREIGN SCHEMA` 会创建以下外部表：

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

因此，查询必须正确使用引号，例如：

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

如果要创建名称不同或名称全部为小写 (因此
不区分大小写) 的对象，请使用 [CREATE FOREIGN TABLE](#create-foreign-table)。
:::

### CREATE FOREIGN TABLE \{#create-foreign-table\}

使用 [CREATE FOREIGN TABLE] 创建可查询 ClickHouse 数据库中数据的外部表：

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

支持的表选项包括：

* `database`：远程数据库的名称。默认为为外部服务器
  定义的数据库。
* `fetch_size`：用于 HTTP 流式传输的近似批次大小 (以字节为单位) 。会覆盖
  服务器级别的 `fetch_size`。默认为 `50000000` (50 MB) 。`0` 会禁用
  流式传输，并缓冲完整响应。
* `table_name`：远程表的名称。默认为为外部表
  指定的名称。
* `engine`：ClickHouse 表使用的[表引擎]。对于
  `CollapsingMergeTree()` 和 `AggregatingMergeTree()`，pg&#95;clickhouse
  会自动将参数应用于
  在该表上执行的函数表达式。

对于每一列，请使用与远程 ClickHouse
数据类型相对应的[数据类型](#data-types)。支持的列选项包括：

* `column_name`：ClickHouse 侧列的名称，在反解析查询和
  插入语句时，会优先使用它而不是 PostgreSQL 属性名。
  这对于将未加引号的小写 PostgreSQL 列名映射到
  区分大小写的 ClickHouse 列很有用，例如：

  ```sql
  CREATE FOREIGN TABLE hits (
      watchid    bigint   OPTIONS(column_name 'WatchID'),
      javaenable smallint OPTIONS(column_name 'JavaEnable'),
      title      text     OPTIONS(column_name 'Title')
  ) SERVER taxi_srv OPTIONS(table_name 'hits');
  ```

* `AggregateFunction`：应用于
  [AggregateFunction Type] 列的聚合函数名称。将数据类型映射为传递给该函数的 ClickHouse 类型，
  并通过相应的列选项指定聚合函数名称，
  pg&#95;clickhouse 会自动在计算该列的聚合函数后附加
  `Merge`。

  ```sql
  CREATE FOREIGN TABLE test (
      column1 bigint  OPTIONS(AggregateFunction 'uniq'),
      column2 integer OPTIONS(AggregateFunction 'anyIf'),
      column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
  ) SERVER clickhouse_srv;
  ```

* `SimpleAggregateFunction`：应用于
  [SimpleAggregateFunction Type] 列的聚合函数名称。将数据类型映射为
  传递给该函数的 ClickHouse 类型，并通过相应的
  列选项指定聚合函数名称。

### ALTER FOREIGN TABLE \{#alter-foreign-table\}

使用 [ALTER FOREIGN TABLE] 修改外部表的定义：

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

支持的表和列选项与 [CREATE FOREIGN
TABLE] 中的相同。

### DROP FOREIGN TABLE \{#drop-foreign-table\}

使用 [DROP FOREIGN TABLE] 删除外部表：

```sql
DROP FOREIGN TABLE acts;
```

如果有任何对象依赖于该 外部表，此命令将失败。
也可使用 `CASCADE` 子句将它们一并删除：

```sql
DROP FOREIGN TABLE acts CASCADE;
```

## DML SQL 参考 \{#dml-sql-reference\}

下面的 SQL [DML] 表达式可能会使用 pg&#95;clickhouse。以下示例依赖于
这些 ClickHouse 表：

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

[EXPLAIN] 命令可正常工作，但 `VERBOSE` 选项会触发输出 ClickHouse 的 &quot;Remote SQL&quot; 查询：

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

该查询会通过 &quot;Foreign Scan&quot; 计划节点下推到 ClickHouse，即作为远程 SQL 执行。

### SELECT \{#select\}

使用 [SELECT] 语句对 pg&#95;clickhouse 表执行查询，与查询其他任何表的方式相同：

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totem
(1 row)
```

pg&#95;clickhouse 会尽可能将查询执行下推到 ClickHouse，
包括聚合函数。使用 [EXPLAIN](#explain) 可确定
下推的范围。以上述查询为例，所有执行都会下推到
ClickHouse

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

pg&#95;clickhouse 还会将同一远程服务器上各表之间的 JOIN 下推：

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

如果不进行细致调优，与本地表进行连接会生成效率较低的查询。在此示例中，我们创建
`nodes` 表的本地副本，并与其连接，而不是连接远程表：

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

在这种情况下，我们可以不按本地列分组，而改为按 `node_id` 分组，
这样就能把更多聚合下推到 ClickHouse，之后再与查找表 join：

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

“Foreign Scan” 节点现在会按 `node_id` 下推聚合，从而将必须从 Postgres 拉回的行数从 1000 行 (即全部
行) 减少到仅 8 行，每个节点对应一行。

### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

从 v0.1.2 起，pg&#95;clickhouse 支持参数化查询，主要通过 [PREPARE] 命令创建：

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

像平常一样，使用 [EXECUTE] 执行预处理语句：

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
参数化执行会导致 [http 驱动](#create-server) 在 25.8 之前的 ClickHouse 版本中
无法正确处理 DateTime 的时区转换；该问题在[底层缺陷]被[修复]后才得到解决。请注意，
PostgreSQL 有时即使不使用 `PREPARE`，也会采用参数化查询计划。对于任何
需要精确时区转换、且无法升级到 25.8 或更高版本的查询，请改用
[二进制驱动程序](#create-server)。
:::

与往常一样，pg&#95;clickhouse 会将聚合操作下推，这一点可从
[EXPLAIN](#explain) 的详细输出中看出：

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

请注意，它发送的是完整的日期值，而不是参数占位符。
前五次请求均是如此，如 PostgreSQL
[PREPARE 说明]中所述。到第六次执行时，它会发送 ClickHouse
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

### INSERT \{#insert\}

使用 [INSERT] 命令将值插入远程 ClickHouse 表：

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```

### COPY \{#copy\}

使用 [COPY] 命令将一批行插入远程 ClickHouse
表：

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ 批次 API 限制**
>
> pg&#95;clickhouse 尚未支持 PostgreSQL FDW 的批量
> insert API。因此，[COPY] 目前通过 [INSERT](#insert) 语句
> 插入记录。该问题将在后续版本中改进。

### LOAD \{#load\}

使用 [LOAD] 加载 pg&#95;clickhouse 共享库：

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

通常不需要使用 [LOAD]，因为 Postgres 会在首次使用 pg&#95;clickhouse 的任一功能 (函数、外部表等) 时自动加载
pg&#95;clickhouse。

不过，在一种情况下，[LOAD] pg&#95;clickhouse 可能会有用：在执行依赖这些参数的查询之前，先 [SET](#set)
pg&#95;clickhouse 参数。

### SET \{#set\}

使用 [SET] 设置 pg&#95;clickhouse 的自定义配置参数。

#### `pg_clickhouse.session_settings` \{#pg_clickhousesession_settings\}

`pg_clickhouse.session_settings` 参数用于配置应用于后续查询的 [ClickHouse
设置]。示例：

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

默认值为 `join_use_nulls 1, group_by_use_nulls 1, final 1`。将其设置为空字符串，即可恢复为
ClickHouse服务器 的设置。

```sql
SET pg_clickhouse.session_settings = '';
```

其语法为由键/值对组成的逗号分隔列表，各键/值对之间用一个或
多个空格分隔。键必须对应于 [ClickHouse Settings]。对值中的空格、
逗号和反斜杠，使用反斜杠进行转义：

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

或者使用单引号括起的值，以避免对空格和逗号进行转义；也可以考虑
使用[美元引号]，以避免必须使用双引号：

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

如果你比较注重可读性，并且需要设置很多配置项，可以分多
行书写，例如：

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

某些设置如果会干扰 pg&#95;clickhouse 自身的运行，将被忽略。包括：

* `date_time_output_format`：http 驱动要求其为 &quot;iso&quot;
* `format_tsv_null_representation`：http 驱动要求使用默认值
* `output_format_tsv_crlf_end_of_line`：http 驱动要求使用默认值

除此之外，pg&#95;clickhouse 不会校验这些设置，而是会在每次查询时将其传递给
ClickHouse。因此，它支持各个 ClickHouse 版本的所有设置。

请注意，必须先加载 pg&#95;clickhouse，才能设置
`pg_clickhouse.session_settings`；可以使用[共享库预加载]，或者
直接使用扩展中的某个对象以确保其已被加载。

#### `pg_clickhouse.pushdown_regex` \{#pg_clickhousepushdown_regex\}

`pg_clickhouse.pushdown_regex` 参数用于控制 pg&#95;clickhouse
是否下推正则表达式函数和运算符。默认情况下会下推；
将此参数设为 false 可阻止下推：

```sql
SET pg_clickhouse.pushdown_regex = 'false';
```

详情请参见[正则表达式](#regular-expressions)。

### ALTER ROLE \{#alter-role\}

使用 [ALTER ROLE] 的 `SET` 命令，可为特定角色[预加载](#preloading) pg&#95;clickhouse
和/或[设置](#set)其参数：

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

使用 [ALTER ROLE] 的 `RESET` 命令重置 pg&#95;clickhouse 的预加载
和/或参数：

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```

## 预加载 \{#preloading\}

如果每个或几乎每个 Postgres 连接都需要使用 pg&#95;clickhouse，
可考虑使用[共享库预加载]自动加载它：

### `session_preload_libraries` \{#session_preload_libraries\}

为 PostgreSQL 的每个新连接都会加载该共享库：

```ini
session_preload_libraries = pg_clickhouse
```

可用于在无需重启服务器的情况下应用更新：只需
重新连接即可。也可以通过 [ALTER
ROLE](#alter-role) 为特定用户或角色单独设置。

### `shared_preload_libraries` \{#shared_preload_libraries\}

在启动时将共享库加载到 PostgreSQL 主进程中：

```ini
shared_preload_libraries = pg_clickhouse
```

有助于减少每个会话的内存占用和加载开销，但在库更新后需要重启
集群。

## 数据类型 \{#data-types\}

pg&#95;clickhouse 将以下 ClickHouse 数据类型映射为 PostgreSQL 数据
类型。[IMPORT FOREIGN SCHEMA](#import-foreign-schema) 在导入列时，会使用
PostgreSQL 列类型中的第一个类型；其他类型可用于
[CREATE FOREIGN TABLE](#create-foreign-table) 语句：

| ClickHouse | PostgreSQL       | 备注                  |
| ---------- | ---------------- | ------------------- |
| Bool       | boolean          |                     |
| Date       | date             |                     |
| Date32     | date             |                     |
| DateTime   | timestamptz      |                     |
| Decimal    | numeric          |                     |
| Float32    | real             |                     |
| Float64    | double precision |                     |
| IPv4       | inet             |                     |
| IPv6       | inet             |                     |
| Int16      | smallint         |                     |
| Int32      | integer          |                     |
| Int64      | bigint           |                     |
| Int8       | smallint         |                     |
| JSON       | jsonb, json      |                     |
| String     | text, bytea      |                     |
| UInt16     | integer          |                     |
| UInt32     | bigint           |                     |
| UInt64     | bigint           | 当值大于 BIGINT 最大值时会报错 |
| UInt8      | smallint         |                     |
| UUID       | uuid             |                     |

更多说明和详细信息见下文。

### BYTEA \{#bytea\}

ClickHouse 不提供与 PostgreSQL [BYTEA] 类型等效的类型，但允许将任意字节存储在 [String] 类型中。一般情况下，ClickHouse 字符串应映射到 PostgreSQL 的 [TEXT] 类型；若需使用二进制数据，则应映射到 [BYTEA]。示例：

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

最终的 `SELECT` 查询将输出：

```pgsql
 c1 |                             c2                             |                 c3
----+------------------------------------------------------------+------------------------------------
  1 | \x1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | \xae3b28cde02542f81acce8783245430d
  2 | \x5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | \x23e7c6cacb8383f878ad093b0027d72b
  3 | \x53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | \x7e969132fc656148b97b6a2ee8bc83c1
  4 | \x4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | \x8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

请注意，如果 ClickHouse 列中存在空字节，使用 [TEXT] 列的外部表将无法输出正确的值：

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

输出结果：

```pgsql
 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b
  3 | 53ac2c1fa83c8f64603fe9568d883331                         | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

请注意，第二行和第三行包含被截断的值。这是因为
PostgreSQL 依赖以 nul 结尾的字符串，且不支持在字符串中使用 nul 字符。

尝试向 [TEXT] 列插入二进制值将会成功，并按预期运行：

```sql
-- Insert via text columns:
TRUNCATE texts;
INSERT INTO texts
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the data.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

文本列将正确显示：

```pgsql

 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b0027d72b
  3 | 53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

但如果按 [BYTEA] 读取，则不会：

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
一般来说，[TEXT] 列只用于存放编码后的字符串，[BYTEA] 列只用于存放二进制数据，切勿在两者之间来回切换。
:::

## 函数与运算符参考 \{#function-and-operator-reference\}

### 函数 \{#functions\}

这些函数提供了查询 ClickHouse 数据库的接口。

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

通过其 HTTP 接口连接到 ClickHouse 服务，执行单个
查询，然后断开连接。可选的第二个参数用于指定连接
字符串，默认为 `host=localhost port=8123`。支持的连接
参数包括：

* `host`：要连接的主机；必填。
* `port`：要连接的 HTTP 端口；默认为 `8123`，除非 `host` 是
  ClickHouse Cloud 主机，此时默认值为 `8443`
* `dbname`：要连接的数据库名称。
* `username`：连接时使用的用户名；默认为 `default`
* `password`：用于身份验证的密码；默认为无密码

默认情况下，没有任何角色拥有此函数的 `EXECUTE` 权限；请考虑仅向确实需要执行临时 ClickHouse
查询的角色授予权限，例如专用的 ClickHouse 管理员角色：

适用于不返回记录的查询，但如果查询确实返回值，
则会以单个文本值的形式返回：

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

### 下推函数 \{#pushdown-functions\}

`pg_clickhouse` 会下推条件子句 (`HAVING` 和 `WHERE` 子句) 中使用的部分 PostgreSQL 内置函数。这部分函数与 ClickHouse 中的对应函数如下：

* `abs`: [abs](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#abs)
* `factorial`: [factorial](https://clickhouse.com/docs/sql-reference/functions/math-functions#factorial)
* `mod` (int2/int4/int8/numeric): [取模](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#modulo)
* `pow` &amp; `power` (float8/numeric): [pow](https://clickhouse.com/docs/sql-reference/functions/math-functions#pow)
* `round`: [round](https://clickhouse.com/docs/sql-reference/functions/rounding-functions#round)
* `sin`, `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `asinh`, `degrees`, `radians`, `pi`：对应 [ClickHouse 中的同名数学函数](https://clickhouse.com/docs/sql-reference/functions/math-functions)。
  `asin`、`acos`、`atanh`、`acosh` 不会下推：PG
  会在输入超出范围时报错，而 CH 会返回 `NaN`。
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
* `extract(field FROM source)`：映射关系与 `date_part` 相同
* `date(timestamp)` &amp; `date(timestamptz)`: [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (反向解析为 CH 别名 `date`)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `array_cat`: [arrayConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayConcat)
* `array_append`: [arrayPushBack](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushBack)
* `array_prepend`: [arrayPushFront](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushFront)
* `array_remove`: [arrayRemove](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRemove)
* `array_length` &amp; `cardinality`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `array_to_string`: [arrayStringConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayStringConcat)
* `string_to_array`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString)
* `split_part`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString) + 数组下标
* `trim_array`: [arrayResize](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayResize)
* `array_fill`: [arrayWithConstant](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayWithConstant)
* `array_reverse`: [arrayReverse](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverse)
* `array_shuffle`: [arrayShuffle](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayShuffle)
* `array_sample`: [arrayRandomSample](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRandomSample)
* `array_sort`： [arraySort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySort) / [arrayReverseSort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverseSort)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `ltrim`：[ltrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#ltrim)
* `rtrim`: [rtrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#rtrim)
* `concat_ws`: [concatWithSeparator](https://clickhouse.com/docs/sql-reference/functions/string-functions#concatwithseparator)
* `lower(text)`: [lowerUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lowerutf8)
* `upper(text)`: [upperUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#upperutf8)
* `substring(text, ...)` &amp; `substr(text, ...)`：[substringUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#substringutf8)
* `substring(bytea, ...)` &amp; `substr(bytea, ...)`：[子串](https://clickhouse.com/docs/sql-reference/functions/string-functions#substring)
* `length(text)`: [lengthUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lengthutf8)
* `length(bytea)` &amp; `octet_length`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `reverse(text)`: [reverseUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverseutf8)
* `reverse(bytea)`: [reverse](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverse)
* `strpos`: [positionUTF8](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#positionutf8)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `regexp_replace`：[replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne)，或在存在 `g` 标志时使用 [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `regexp_split_to_array`: [splitByRegexp](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByRegexp)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)
* `json_extract_path_text`：[子列表示法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `json_extract_path`：[toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [子列语法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path_text`：[子列语法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path`：[toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [子列语法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `bit_count(bytea)`: [bitCount](https://clickhouse.com/docs/sql-reference/functions/bit-functions#bitcount)
* `to_timestamp(float8)`: [fromUnixTimestamp](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#fromUnixTimestamp)
* `to_char(timestamp[tz], fmt)`: [formatDateTime](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime)
  当 `fmt` 为字符串常量，且其中每个关键字都能在 ClickHouse 中找到完全对应的
  等价写法时，使用该函数。有关支持的关键字，请参阅兼容性说明中的
  [to&#95;char()](#to_char)。否则，该函数会在 PostgreSQL 本地求值。
* `statement_timestamp`, `transaction_timestamp`, &amp; `clock_timestamp`:
  [nowInBlock64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#nowInBlock64)
  (`nowInBlock64(9, $session_timezone)`)
* `CURRENT_DATE`:
  [now](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now) 以及
  [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (`toDate(now($session_timezone))`)
* `now`, `CURRENT_TIMESTAMP`, &amp; `LOCALTIMESTAMP`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(9, $session_timezone)`)
* `CURRENT_TIMESTAMP(n)` &amp; `LOCALTIMESTAMP(n)`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(n, $session_timezone)`)
* `CURRENT_DATABASE`：作为值由 PostgreSQL 函数传入。
* `CURRENT_SCHEMA`：由 PostgreSQL 函数作为值传入。
* `CURRENT_CATALOG`：作为值从 PostgreSQL 函数中传入。
* `CURRENT_USER`：作为值从 PostgreSQL 函数中传入。
* `USER`：由 PostgreSQL 函数作为值传入。
* `CURRENT_ROLE`：由 PostgreSQL 函数作为值传递。
* `SESSION_USER`：作为值由 PostgreSQL 函数传入。

### 下推运算符 \{#pushdown-operators\}

* 数组切片 (`arr[L:U]`): [arraySlice](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySlice)
* `@>` (数组包含) : [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `<@` (包含于数组) : [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `&&` (数组重叠) : [hasAny](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAny)
* `~` (正则表达式匹配) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~` (正则表达式不匹配) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `~*` (不区分大小写的正则表达式不匹配) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~*` (不区分大小写的正则表达式不匹配) : [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `->>` (将 JSON/JSONB 元素提取为文本) : [子列语法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `->` (提取 JSON/JSONB) : [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [子列语法](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)

### 自定义函数 \{#custom-functions\}

这些由 `pg_clickhouse` 创建的自定义函数可为部分在 PostgreSQL 中没有对应等价函数的 ClickHouse 函数提供外部查询下推。如果其中任何函数无法下推，就会引发异常。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### 扩展下推 \{#extension-pushdown\}

pg&#95;clickhouse 可识别 select core 及第三方扩展中的函数，并将其下推为 ClickHouse 中的对应函数。

#### re2 \{#re2\}

所有 [re2 扩展] 函数都可 1:1 下推到 ClickHouse：

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

有一个 [intarray] 函数可下推至 ClickHouse：

* `idx` → [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)

#### fuzzystrmatch \{#fuzzystrmatch\}

有两个 [fuzzystrmatch] 函数可下推到 ClickHouse：

* `soundex`：[soundex](https://clickhouse.com/docs/sql-reference/functions/string-functions#soundex)
* `levenshtein` (2 参数) ：[editDistanceUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#editDistanceUTF8)

### 下推类型转换 \{#pushdown-casts\}

对于兼容的数据类型，pg&#95;clickhouse 会下推 `CAST(x AS bigint)` 这类类型转换。
对于不兼容的类型，下推会失败；例如，如果本例中的 `x` 是 ClickHouse 的 `UInt64``，ClickHouse 将拒绝执行该转换。

为了将类型转换下推到不兼容的数据类型，pg&#95;clickhouse 提供了
以下函数。如果这些函数没有被下推，它们会在 PostgreSQL 中引发异常。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### 下推聚合函数 \{#pushdown-aggregates\}

以下 PostgreSQL 聚合函数可下推到 ClickHouse 执行。

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

### 自定义聚合函数 \{#custom-aggregates\}

这些由 `pg_clickhouse` 创建的自定义聚合函数，可对部分在 PostgreSQL
中没有对应实现的 ClickHouse 聚合函数提供外部查询下推支持。如果其中任何一个函数无法下推，
则会引发异常。

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

### 下推有序集合聚合 \{#pushdown-ordered-set-aggregates\}

这些[有序集合聚合函数]通过将其*直接参数*作为参数传递、将其
`ORDER BY` 表达式作为实参传递，映射到 ClickHouse 的[参数化
聚合函数]。例如，下面这个 PostgreSQL 查询：

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

对应以下 ClickHouse 查询：

```sql
SELECT quantile(0.25)(a) FROM t1;
```

请注意，非默认的 `ORDER BY` 后缀 `DESC` 和 `NULLS FIRST`` 不受支持，并且会报错。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### 下推窗口函数 \{#pushdown-window-functions\}

这些 PostgreSQL [窗口函数]可通过 `OVER
(PARTITION BY ... ORDER BY ...)` 子句下推到 ClickHouse，并在适用时包含
窗口帧定义。

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
* `min` / `max` (带 `OVER` 子句)

排名函数 (`row_number`、`rank`、`dense_rank`、`ntile`、`cume_dist`、
`percent_rank`) 在下推时会省略其窗口帧子句，因为 ClickHouse
不支持为这些函数指定窗口帧。

## 兼容性说明 \{#compatibility-notes\}

### 正则表达式 \{#regular-expressions\}

当 [pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) 为 true (默认值) 时，
pg&#95;clickhouse 会将正则表达式下推为 ClickHouse 中的等价形式，
并尽力保证基本兼容性；但请注意两者之间的差异，以及
pg&#95;clickhouse 对这些差异的处理方式。

* PostgreSQL 支持 [POSIX Regular Expressions]，而 ClickHouse 支持
  [RE2 Regular Expressions][RE2]。请注意两者在行为上的差异：当正则表达式由 ClickHouse
  求值时 (例如在 `WHERE` 子句中) ，请按 RE2 语法编写；当它由 Postgres
  求值时 (例如在 `SELECT` 子句中) ，请按 POSIX 语法编写。

* pg&#95;clickhouse 会通过将 Postgres 的 [Regex flags] 预加到
  ClickHouse 正则表达式前面的 `(?)` 中，来下推这些标志。例如：

  ```sql
  regexp_like(val, '^VAL\d', 'i')
  ```

  会变为

  ```sql
  match(val, concat('(?i-s)', '^VAL\\d'))
  ```

  注意这里包含了 `-s`；这是为了禁用 ClickHouse 默认启用的 `s`，
  从而使其行为与 Postgres 正则表达式保持一致。
  如果 Postgres 函数调用中的标志包含 `s`，pg&#95;clickhouse 就不会添加 `-s`。
  不过，遗憾的是，这种行为会破坏 Postgres 24 及更早版本中某些正则表达式的兼容性。

* 两者都支持、因此可在由 ClickHouse 求值时使用的标志只有：

  * `i`：不区分大小写
  * `m`：多行模式：
  * `s`：使 `.` 匹配 `\n`
  * `p`：部分换行敏感匹配 (处理方式与 `s` 相同)
  * `t`：紧凑语法 (默认值，会被 pg&#95;clickhouse 移除)

  RE2 只支持这些标志；不要使用任何其他 [Postgres flags]

* 传递给正则表达式函数的任何其他标志都会导致该函数无法下推。

* 例外情况是 `regexp_replace()`，它还支持 `g` 标志。设置
  `g` 后，pg&#95;clickhouse 会使用 `replaceRegexpAll()` 而不是
  `replaceRegexpOne()`，并在预加其他标志之前移除该标志。

* Postgres `regexp_replace()` 的替换参数支持使用 `\&`
  来引用整个匹配内容，而 ClickHouse 则使用 `\0` 表示整个匹配内容。
  当该函数会下推到 ClickHouse 时，请务必使用 `\0`。

为避免任何歧义，可以考虑设置
[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex) 以阻止
Postgres 正则表达式下推到 ClickHouse，并使用
[re2 extension]；对于该扩展，pg&#95;clickhouse 支持对与 ClickHouse 兼容的
[RE2] 正则表达式进行[直接下推](#re2)。

### `to_char()` \{#to_char\}

用于 `timestamp` 和 `timestamp with time zone` 的 PostgreSQL [`to_char()`]
只有在格式参数是非 NULL 的字符串常量，且其中每个 PostgreSQL 关键字在
ClickHouse 中都能找到按字节完全一致的对应项时，才会下推到 ClickHouse
[formatDateTime]。如果格式是动态的 (不是 `Const`) ，或包含任何不受支持的
关键字或修饰符，则该调用会回退为在 PostgreSQL 中本地求值——绝不会在仅做
部分转换的情况下尝试下推，因此输出会保持与 PG 兼容。

用于 `numeric`、`interval` 及其他非时间戳类型的双参数 `to_char()` 形式
永远不会下推；ClickHouse [formatDateTime] 只能格式化日期时间值。

#### 已转换的关键字 \{#translated-keywords\}

| PostgreSQL                 | ClickHouse | 含义                    |
| -------------------------- | ---------- | --------------------- |
| `YYYY`, `yyyy`             | `%Y`       | 4 位年份                 |
| `YY`, `yy`                 | `%y`       | 2 位年份                 |
| `MM`, `mm`                 | `%m`       | 补零的月份 (01–12)         |
| `DD`, `dd`                 | `%d`       | 补零的日期 (01–31)         |
| `DDD`, `ddd`               | `%j`       | 补零的一年中的第几天 (001–366)  |
| `HH24`, `hh24`             | `%H`       | 补零的 24 小时制小时 (00–23)  |
| `HH`, `hh`, `HH12`, `hh12` | `%I`       | 补零的 12 小时制小时 (01–12)  |
| `MI`, `mi`                 | `%i`       | 补零的分钟 (00–59)         |
| `SS`, `ss`                 | `%S`       | 补零的秒 (00–59)          |
| `Q`, `q`                   | `%Q`       | 季度 (1–4)              |
| `Mon`                      | `%b`       | 月份简称，例如 `Oct`         |
| `Dy`                       | `%a`       | 星期简称，例如 `Mon`         |
| `AM`, `PM`                 | `%p`       | 上下午标记，始终为大写           |

#### 引用文本和字面量 \{#quoted-text-and-literals\}

用 `"..."` 包裹的文本会原样传递，其中任何字面的 `%`
都会写成 `%%`，以转义 ClickHouse 的说明符前缀。引号外的 `\"`
也会作为字面的 `"` 原样传递。在 `"..."` 内部，反斜杠
仅用于转义 `"`；其他反斜杠序列都会被视为字面文本。

## 作者 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## 版权 \{#copyright\}

版权所有 (c) 2025-2026，ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL 文档：编写 Foreign Data Wrapper"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub 上的最新版本"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "语义化版本控制 2.0.0"

[`pg_get_loaded_modules()`]: https://pgpedia.info/g/pg_get_loaded_modules.html "pgPedia：pg_get_loaded_modules()"

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

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "维基百科：数据操纵语言"

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

[shared library preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD "PostgreSQL 文档：共享库预加载"

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings "ClickHouse 文档：会话级设置"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING "PostgreSQL 文档：美元引用字符串常量"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES "PostgreSQL 文档：PREPARE 说明"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse "ClickHouse 文档：ClickHouse 中预处理语句的替代方案"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847 "ClickHouse/ClickHouse#85847 multipart 表单中的部分查询不会读取设置"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570 "ClickHouse/ClickHouse#85570 修复 HTTP multipart 支持"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html "PostgreSQL 文档：二进制数据类型"

[GRANT]: https://www.postgresql.org/docs/current/sql-grant.html "PostgreSQL 文档：GRANT"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string "ClickHouse 文档：String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html "PostgreSQL 文档：字符类型"

[window functions]: https://www.postgresql.org/docs/current/functions-window.html "PostgreSQL 文档：窗口函数"

[POSIX Regular Expressions]: https://www.postgresql.org/docs/18/functions-matching.html#FUNCTIONS-POSIX-REGEXP "PostgreSQL 文档：POSIX 正则表达式"

[Postgres flags]: https://www.postgresql.org/docs/18/functions-matching.html#POSIX-EMBEDDED-OPTIONS-TABLE "PostgreSQL 文档：ARE 嵌入式选项字母"

[RE2]: https://github.com/google/re2/wiki/Syntax "RE2 语法"

[re2 extension]: https://github.com/ClickHouse/pg_re2 "pg_re2：使用 RE2 的 ClickHouse 兼容正则函数"

[intarray]: https://www.postgresql.org/docs/current/intarray.html "PostgreSQL 文档：intarray"

[fuzzystrmatch]: https://www.postgresql.org/docs/current/fuzzystrmatch.html "PostgreSQL 文档：fuzzystrmatch"

[`to_char()`]: https://www.postgresql.org/docs/current/functions-formatting.html "PostgreSQL 文档：数据类型格式化函数"

[formatDateTime]: https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime "ClickHouse 文档：formatDateTime"