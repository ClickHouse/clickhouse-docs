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

## SQL 参考 {#sql-reference}

以下 SQL 表达式使用 pg_clickhouse。

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


### CREATE FOREIGN TABLE {#create-foreign-table}

使用 [IMPORT FOREIGN SCHEMA] 创建一个外部表（foreign table），用于从 ClickHouse 数据库查询数据：

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


## 函数和运算符参考 {#function-and-operator-reference}

### 数据类型 {#data-types}

pg_clickhouse 将下列 ClickHouse 数据类型映射到 PostgreSQL 数据类型：

| ClickHouse |    PostgreSQL    |             备注              |
| -----------|------------------|-------------------------------|
| Bool       | boolean          |                               |
| Date       | date             |                               |
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

#### `clickhouse_raw_query` {#clickhouse_raw_query}

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

* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)

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


### 会话设置 {#session-settings}

将运行时参数 `pg_clickhouse.session_settings` 设置为用于配置后续查询中要应用的
[ClickHouse settings]。示例：

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

默认值为 `join_use_nulls 1`。将其设为空字符串以使用 ClickHouse 服务器上的设置。

```sql
SET pg_clickhouse.session_settings = '';
```

该语法为用逗号分隔的键/值对列表，各键/值对之间再以一个或多个空格分隔。键必须对应于 [ClickHouse settings]。在值中使用反斜杠来转义空格、逗号以及反斜杠本身：

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

请注意，必须在设置 `pg_clickhouse.session_settings` 之前加载 pg&#95;clickhouse；可以使用 [库预加载]，或者直接使用该扩展中的任意对象以确保其被加载。


## 作者 {#authors}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## 版权 {#copyright}

* 版权 (c) 2025，ClickHouse
* 部分版权 (c) 2023-2025，Ildus Kurbangaliev
* 部分版权 (c) 2019-2023，Adjust GmbH
* 部分版权 (c) 2012-2019，PostgreSQL Global Development Group

  [foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html
    "PostgreSQL 文档：编写外部数据封装器（Foreign Data Wrapper）"
  [Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "Docker Hub 上的最新版本"
  [ClickHouse]: https://clickhouse.com/clickhouse
  [Semantic Versioning]: https://semver.org/spec/v2.0.0.html
    "语义化版本规范 2.0.0"
  [CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html
    "PostgreSQL 文档：CREATE EXTENSION"
  [ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html
    "PostgreSQL 文档：ALTER EXTENSION"
  [DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html
    "PostgreSQL 文档：DROP EXTENSION"
  [CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html
    "PostgreSQL 文档：CREATE SERVER"
  [ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html
    "PostgreSQL 文档：ALTER SERVER"
  [DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html
    "PostgreSQL 文档：DROP SERVER"
  [CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html
    "PostgreSQL 文档：CREATE USER MAPPING"
  [ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html
    "PostgreSQL 文档：ALTER USER MAPPING"
  [DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html
    "PostgreSQL 文档：DROP USER MAPPING"
  [IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html
    "PostgreSQL 文档：IMPORT FOREIGN SCHEMA"
  [table engine]: https://clickhouse.com/docs/engines/table-engines
    "ClickHouse 文档：表引擎"
  [AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction
    "ClickHouse 文档：AggregateFunction 类型"
  [SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction
    "ClickHouse 文档：SimpleAggregateFunction 类型"
  [ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE
  [Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions
  [ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse 文档：会话设置"
  [dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL 文档：以美元符号定界的字符串常量"
  [library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "PostgreSQL 文档：共享库预加载"