---
title: '数据管理'
description: '可观测性中的数据管理'
slug: /observability/managing-data
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# 管理数据

用于可观测性的 ClickHouse 部署通常都会涉及大规模数据集，这些数据集需要进行妥善管理。ClickHouse 提供了多种功能来帮助进行数据管理。



## 分区 {#partitions}

ClickHouse 中的分区功能允许根据列或 SQL 表达式在磁盘上对数据进行逻辑分离。通过逻辑分离数据,每个分区可以独立操作,例如删除。这使得用户能够高效地在存储层之间移动分区(以及数据子集),或者[使数据过期/从集群中高效删除](/sql-reference/statements/alter/partition)。

分区在表初始定义时通过 `PARTITION BY` 子句指定。该子句可以包含针对任意列的 SQL 表达式,表达式的结果将决定行被发送到哪个分区。

<Image img={observability_14} alt='分区' size='md' />

数据部分通过公共文件夹名称前缀在逻辑上与磁盘上的每个分区关联,并且可以单独查询。在下面的示例中,默认的 `otel_logs` 模式使用表达式 `toDate(Timestamp)` 按天分区。当行插入到 ClickHouse 时,该表达式将针对每一行进行计算,并路由到相应的分区(如果该分区存在);如果该行是当天的第一行,则会创建该分区。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行[多种操作](/sql-reference/statements/alter/partition),包括[备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、变更([按行修改](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition)数据)以及[索引清除(例如二级索引)](/sql-reference/statements/alter/partition#clear-index-in-partition)。

例如,假设我们的 `otel_logs` 表按天分区。如果填充了结构化日志数据集,它将包含几天的数据:

```sql
SELECT Timestamp::Date AS day,
         count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-26 │ 1986456 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

5 rows in set. Elapsed: 0.058 sec. Processed 10.37 million rows, 82.92 MB (177.96 million rows/s., 1.42 GB/s.)
Peak memory usage: 4.41 MiB.
```

可以使用简单的系统表查询找到当前分区:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'otel_logs'

┌─partition──┐
│ 2019-01-22 │
│ 2019-01-23 │
│ 2019-01-24 │
│ 2019-01-25 │
│ 2019-01-26 │
└────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

我们可能有另一个表 `otel_logs_archive`,用于存储较旧的数据。数据可以按分区高效地移动到该表(这只是元数据更改)。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--将数据移动到归档表
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--确认数据已被移动
SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

4 rows in set. Elapsed: 0.051 sec. Processed 8.38 million rows, 67.03 MB (163.52 million rows/s., 1.31 GB/s.)
Peak memory usage: 4.40 MiB.

```


SELECT Timestamp::Date AS day,
count() AS c
FROM otel_logs_archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 row in set. Elapsed: 0.024 sec. Processed 1.99 million rows, 15.89 MB (83.86 million rows/s., 670.87 MB/s.)
Peak memory usage: 4.99 MiB.

````

这与其他技术形成对比,其他技术需要使用 `INSERT INTO SELECT` 并将数据重写到新的目标表中。

:::note 移动分区
[在表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table)需要满足多个条件,尤其是表必须具有相同的结构、分区键、主键和索引/投影。关于如何在 `ALTER` DDL 中指定分区的详细说明可以在[这里](/sql-reference/statements/alter/partition#how-to-set-partition-expression)找到。
:::

此外,可以按分区高效地删除数据。这比其他替代技术(mutation 或轻量级删除)的资源效率高得多,应该优先使用。

```sql
ALTER TABLE otel_logs
        (DROP PARTITION tuple('2019-01-25'))

SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC
┌────────day─┬───────c─┐
│ 2019-01-22 │ 4667954 │
│ 2019-01-23 │ 4653388 │
│ 2019-01-24 │ 3792510 │
└────────────┴─────────┘
````

:::note
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时,TTL 会利用此功能。有关更多详细信息,请参阅[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::

### 应用场景 {#applications}

以上说明了如何通过分区高效地移动和操作数据。实际上,用户在可观测性用例中最常利用分区操作的两种场景是:

- **分层架构** - 在存储层之间移动数据(参见[存储层](#storage-tiers)),从而构建冷热架构。
- **高效删除** - 当数据达到指定的 TTL 时(参见[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live))

我们将在下面详细探讨这两种场景。

### 查询性能 {#query-performance}

虽然分区可以帮助提升查询性能,但这在很大程度上取决于访问模式。如果查询仅针对少数分区(理想情况下是一个),性能可能会有所提升。这通常仅在分区键不在主键中且您按其进行过滤时才有用。然而,需要覆盖多个分区的查询可能比不使用分区时性能更差(因为可能会有更多的数据部分)。如果分区键已经是主键中的早期条目,则针对单个分区的优势将更不明显甚至不存在。如果每个分区中的值是唯一的,分区也可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而,一般来说,用户应该确保主键已优化,并且仅在特殊情况下将分区作为查询优化技术来考虑,例如访问模式针对数据的特定可预测子集的情况,如按天分区且大多数查询针对最近一天的数据。有关此行为的示例,请参阅[这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。


## 使用 TTL(生存时间)管理数据 {#data-management-with-ttl-time-to-live}

生存时间(TTL)是基于 ClickHouse 的可观测性解决方案中用于高效数据保留和管理的关键特性,尤其是在持续生成海量数据的场景下。在 ClickHouse 中实现 TTL 可以自动过期和删除旧数据,确保存储得到最优利用,并在无需人工干预的情况下保持性能。此功能对于保持数据库精简、降低存储成本以及通过聚焦于最相关和最新的数据来确保查询保持快速高效至关重要。此外,它通过系统化地管理数据生命周期来帮助遵守数据保留策略,从而增强可观测性解决方案的整体可持续性和可扩展性。

在 ClickHouse 中,TTL 可以在表级别或列级别指定。

### 表级别 TTL {#table-level-ttl}

日志和追踪的默认模式都包含一个 TTL,用于在指定时间段后使数据过期。这在 ClickHouse 导出器中通过 `ttl` 键指定,例如:

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

此语法目前支持 [Golang Duration 语法](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h` 并确保其与分区周期对齐。例如,如果按天分区,请确保它是天数的倍数,例如 24h、48h、72h。** 这将自动确保向表中添加 TTL 子句,例如当 `ttl: 96h` 时。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下,当 ClickHouse [合并数据分区](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)时,会删除 TTL 已过期的数据。当 ClickHouse 检测到数据已过期时,它会执行计划外合并。

:::note 计划的 TTL
如上所述,TTL 不会立即应用,而是按计划应用。MergeTree 表设置 `merge_with_ttl_timeout` 设置在重复执行带有删除 TTL 的合并之前的最小延迟(以秒为单位)。默认值为 14400 秒(4 小时)。但这只是最小延迟,触发 TTL 合并可能需要更长时间。如果该值设置得太低,将执行许多计划外合并,可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制执行 TTL 过期。
:::

**重要提示:我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**(由默认模式应用)。启用此设置后,当分区中的所有行都过期时,ClickHouse 会删除整个分区。删除整个分区而不是部分清理 TTL 过期的行(当 `ttl_only_drop_parts=0` 时通过资源密集型变更实现)可以缩短 `merge_with_ttl_timeout` 时间并降低对系统性能的影响。如果数据按执行 TTL 过期的相同单位(例如天)进行分区,分区自然只会包含定义时间间隔内的数据。这将确保 `ttl_only_drop_parts=1` 能够高效应用。

### 列级别 TTL {#column-level-ttl}

上述示例在表级别使数据过期。用户也可以在列级别使数据过期。随着数据老化,这可用于删除那些在调查中的价值不足以证明保留其资源开销的列。例如,我们建议保留 `Body` 列,以防添加在插入时未提取的新动态元数据,例如新的 Kubernetes 标签。一段时间后(例如 1 个月),可能会明显看出这些额外的元数据并不有用——从而限制了保留 `Body` 列的价值。

下面展示了如何在 30 天后删除 `Body` 列。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String TTL Timestamp + INTERVAL 30 DAY,
        `Timestamp` DateTime,
        ...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note
指定列级别 TTL 需要用户指定自己的模式。这无法在 OTel 收集器中指定。
:::


## 重新压缩数据 {#recompressing-data}

虽然我们通常建议对可观测性数据集使用 `ZSTD(1)`，但用户可以尝试不同的压缩算法或更高的压缩级别,例如 `ZSTD(3)`。除了可以在创建表结构时指定压缩方式外,还可以配置在设定的时间段后自动更改压缩方式。如果某个编解码器或压缩算法能够提高压缩率但会导致查询性能下降,这种配置可能是合适的。这种权衡对于查询频率较低的历史数据可能是可以接受的,但对于在调查分析中频繁使用的近期数据则不适用。

下面展示了一个示例,我们在 4 天后使用 `ZSTD(3)` 压缩数据,而不是删除它。

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
TTL Timestamp + INTERVAL 4 DAY RECOMPRESS CODEC(ZSTD(3))
```

:::note 评估性能
我们建议用户始终评估不同压缩级别和算法对插入和查询性能的影响。例如,delta 编解码器在压缩时间戳时可能很有帮助。但是,如果这些时间戳是主键的一部分,则过滤性能可能会受到影响。
:::

有关配置 TTL 的更多详细信息和示例,请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。有关如何为表和列添加和修改 TTL 的示例,请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。有关 TTL 如何实现存储层次结构(例如热温架构)的信息,请参见[存储层级](#storage-tiers)。


## 存储层级 {#storage-tiers}

在 ClickHouse 中,用户可以在不同磁盘上创建存储层级,例如将热数据/近期数据存储在 SSD 上,将较旧的数据存储在 S3 上。这种架构允许对较旧的数据使用成本更低的存储,由于这些数据在调查分析中使用频率较低,因此可以接受较宽松的查询 SLA。

:::note 不适用于 ClickHouse Cloud
ClickHouse Cloud 使用存储在 S3 上的单一数据副本,并配备基于 SSD 的节点缓存。因此,ClickHouse Cloud 中不需要配置存储层级。
:::

创建存储层级需要用户先创建磁盘,然后使用这些磁盘制定存储策略,并在创建表时指定卷。数据可以根据填充率、分区大小和卷优先级在磁盘之间自动移动。更多详细信息请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令在磁盘之间手动移动数据,但也可以使用 TTL 来控制卷之间的数据移动。完整示例请参见[此处](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)。


## 管理模式变更 {#managing-schema-changes}

日志和追踪模式在系统的生命周期中不可避免地会发生变化,例如当用户监控具有不同元数据或 pod 标签的新系统时。通过使用 OTel 模式生成数据,并以结构化格式捕获原始事件数据,ClickHouse 模式能够稳健地应对这些变化。然而,随着新元数据的出现和查询访问模式的变化,用户会希望更新模式以反映这些变化。

为了避免模式变更期间的停机,用户有几种选择,我们将在下面介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default)向模式添加列。如果在 INSERT 时未指定该值,将使用指定的默认值。

可以在修改任何物化视图转换逻辑或 OTel 收集器配置之前进行模式变更,这样可以避免在发送新列时出现问题。

模式变更完成后,用户可以重新配置 OTel 收集器。假设用户使用["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql)中概述的推荐流程,其中 OTel 收集器将数据发送到 Null 表引擎,由物化视图负责提取目标模式并将结果发送到目标表进行存储,可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view)修改视图。假设我们有以下目标表及其对应的物化视图(类似于"使用 SQL 提取结构"中使用的视图)来从 OTel 结构化日志中提取目标模式:

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)

CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

假设我们希望从 `LogAttributes` 中提取一个新列 `Size`。我们可以使用 `ALTER TABLE` 将其添加到模式中,并指定默认值:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上面的示例中,我们将默认值指定为 `LogAttributes` 中的 `size` 键(如果不存在则为 0)。这意味着对于未插入该值的行,访问此列的查询必须访问 Map,因此速度会较慢。我们也可以将其指定为常量,例如 0,从而降低对没有该值的行进行后续查询的成本。查询此表显示该值按预期从 Map 中填充:

```sql
SELECT Size
FROM otel_logs_v2
LIMIT 5
┌──Size─┐
│ 30577 │
│  5667 │
│  5379 │
│  1696 │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.012 sec.
```


为确保所有未来数据都插入此值,我们可以使用 `ALTER TABLE` 语法修改物化视图,如下所示:

```sql
ALTER TABLE otel_logs_mv
        MODIFY QUERY
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300,                 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

后续插入的行将在插入时自动填充 `Size` 列。

### 创建新表 {#create-new-tables}

作为上述流程的替代方案,用户可以直接使用新模式创建一个新的目标表。然后可以使用上述 `ALTER TABLE MODIFY QUERY` 语法修改物化视图以使用新表。通过这种方法,用户可以对表进行版本管理,例如 `otel_logs_v3`。

这种方法会导致用户需要查询多个表。要跨表查询,用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge),该函数支持表名的通配符模式。下面我们通过查询 `otel_logs` 表的 v2 和 v3 版本来演示:

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

返回 5 行。耗时:0.137 秒。处理了 4146 万行,82.92 MB(每秒 3.0243 亿行,604.85 MB/s)。
```

如果用户希望避免使用 `merge` 函数,并向最终用户提供一个合并多个表的统一表,可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。下面我们进行演示:

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

返回 5 行。耗时:0.073 秒。处理了 4146 万行,82.92 MB(每秒 5.6543 亿行,1.13 GB/s)。
```

每当添加新表时,可以使用 `EXCHANGE` 表语法更新此表。例如,要添加 v4 表,我们可以创建一个新表并以原子方式将其与先前版本交换。

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

```


┌─Status─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 行结果。耗时：0.068 秒。已处理 4246 万行，84.92 MB（6.2045 亿行/秒，1.24 GB/秒）。

```
```
