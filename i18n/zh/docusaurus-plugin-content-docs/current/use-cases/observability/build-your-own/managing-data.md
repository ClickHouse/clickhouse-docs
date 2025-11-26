---
title: '数据管理'
description: '可观测性数据管理'
slug: /observability/managing-data
keywords: ['可观测性', '日志', '链路追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# 管理数据

用于可观测性的 ClickHouse 部署通常会涉及大规模数据集，这些数据需要妥善管理。ClickHouse 提供了一系列功能来帮助进行数据管理。



## 分区

ClickHouse 中的分区允许根据某个列或 SQL 表达式在磁盘上对数据进行逻辑划分。通过在逻辑上分隔数据，每个分区都可以被独立操作，例如删除。这样用户就可以在不同存储层之间按时间高效地移动分区（也就是数据子集），或者[让数据过期/高效地从集群中删除数据](/sql-reference/statements/alter/partition)。

在首次定义表时通过 `PARTITION BY` 子句来指定分区方式。该子句可以包含针对任意列的 SQL 表达式，其计算结果将决定每一行会被发送到哪个分区。

<Image img={observability_14} alt="Partitions" size="md" />

数据片段在逻辑上（通过相同的文件夹名前缀）与磁盘上的每个分区关联，并且可以被独立查询。以下示例中，默认的 `otel_logs` schema 使用表达式 `toDate(Timestamp)` 按天进行分区。随着行被插入到 ClickHouse，这个表达式会针对每一行进行计算，并在相应的分区已存在时将其路由到该分区（如果该行是某一天的第一行，则会创建对应分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行[多种操作](/sql-reference/statements/alter/partition)，包括[备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、按行对数据进行变更（[修改](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition)），以及[索引清理（例如二级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

例如，假设我们的 `otel_logs` 表按天进行分区。如果使用结构化日志数据集进行填充，其中将包含多天的数据：

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

5 行记录。耗时：0.058 秒。已处理 1037 万行，82.92 MB（177.96 百万行/秒，1.42 GB/秒）。
峰值内存使用量：4.41 MiB。
```

可以通过对 system 表执行一个简单查询来查看当前分区：

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

共 5 行记录，耗时 0.005 秒。
```

我们可能还会有另一个表 `otel_logs_archive`，用于存储较旧的数据。可以按分区将数据高效迁移到这个表中（这只是一次元数据层面的变更）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--将数据移至归档表
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--确认数据已移动
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

共 4 行记录。耗时：0.051 秒。已处理 8.38 百万行，67.03 MB（163.52 百万行/秒，1.31 GB/秒）。
峰值内存使用：4.40 MiB。
```


SELECT Timestamp::Date AS day,
count() AS c
FROM otel&#95;logs&#95;archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 行结果。耗时：0.024 秒。已处理 1.99 百万行，15.89 MB（83.86 百万行/秒，670.87 MB/秒）。
峰值内存使用量：4.99 MiB。

````

这与其他方法不同，其他方法通常需要使用 `INSERT INTO SELECT` 并将数据重写到新的目标表中。

:::note 移动分区
在[表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table)时，需要满足若干条件，其中最重要的是各表必须具有相同的结构、分区键、主键以及索引/投影。关于如何在 `ALTER` DDL 中指定分区的详细说明见[此处](/sql-reference/statements/alter/partition#how-to-set-partition-expression)。
:::

此外，还可以按分区高效地删除数据。这比其他技术手段（如 mutation 或轻量级删除）在资源利用上高效得多，应当优先采用。

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
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，TTL 会利用这一特性。更多细节参见 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::

### 应用场景

上文展示了如何按分区高效地移动和操作数据。在实际场景中，用户在可观测性（Observability）场景下最常利用分区操作的两种情况是：

* **分层架构** - 在不同存储层之间移动数据（参见 [存储层](#storage-tiers)），从而构建冷热分层存储架构。
* **高效删除** - 当数据达到指定的 TTL 时（参见 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)）

我们将在下文详细探讨以上这两种情况。

### 查询性能

分区可以帮助提升查询性能，但这在很大程度上取决于访问模式。如果查询只针对少量分区（理想情况下为一个分区），则有可能提升性能。这通常只在分区键不在主键中且你按分区键进行过滤时才有用。然而，需要覆盖许多分区的查询，相比不使用分区时，性能可能更差（因为可能会有更多的数据分片（parts））。如果分区键已经是主键中靠前的列，那么只针对单个分区的收益会大幅降低甚至不存在。如果每个分区中的值都是唯一的，分区也可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但总体而言，用户应首先确保主键已经过优化，并且仅在少数特殊场景下（访问模式只访问数据的特定、可预测子集，例如按天分区且大部分查询集中在最近一天）将分区视为查询优化技术。关于这一行为的示例，请参见[此处](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。


## 使用 TTL（Time-to-live）进行数据管理

Time-to-Live（TTL）是在基于 ClickHouse 的可观测性解决方案中实现高效数据留存和管理的关键特性，尤其是在系统持续产出海量数据的情况下。在 ClickHouse 中实现 TTL，可以让旧数据自动过期并被删除，从而在无需人工干预的前提下，确保存储得到最优利用并保持良好性能。这一机制对于保持数据库精简、降低存储成本，并通过聚焦最相关、最新的数据来确保查询依然快速高效至关重要。此外，它通过系统化管理数据生命周期，有助于符合数据保留策略要求，从而提升可观测性解决方案的整体可持续性和可扩展性。

在 ClickHouse 中，TTL 可以在表级或列级进行指定。

### 表级 TTL

日志和跟踪（traces）的默认模式（schema）都包含 TTL，用于在指定时间后使数据过期。它是在 ClickHouse exporter 中通过 `ttl` 键来指定的，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

此语法目前支持 [Golang Duration 语法](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h`，并确保其与分区周期保持一致。例如，如果按天分区，请确保该值是天数的倍数，如 24h、48h、72h。** 这样会自动在表上添加 TTL 子句，例如 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，具有已过期 TTL 的数据会在 ClickHouse [合并数据分片](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时被移除。当 ClickHouse 检测到数据已过期时，会执行一次非计划内合并。

:::note Scheduled TTLs
如上所述，TTL 并不是立即生效，而是按计划执行。MergeTree 表设置 `merge_with_ttl_timeout` 用于设置带删除 TTL 的合并操作之间再次执行前的最小延迟时间（秒）。默认值为 14400 秒（4 小时）。但这只是最小延迟，真正触发 TTL 合并可能会更晚。如果该值过低，将会执行大量非计划内合并，从而消耗大量资源。可以通过命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制触发一次 TTL 过期处理。
:::

**Important: We recommend using the setting [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**（默认 schema 已应用）。启用该设置后，当某个分片中的所有行都已过期时，ClickHouse 会直接删除整个分片。相比之下，在 `ttl_only_drop_parts=0` 时，需要通过资源开销较大的 mutation 对分片内的过期行进行部分清理。删除整个分片可以允许使用更短的 `merge_with_ttl_timeout` 时间，并降低对系统性能的影响。如果数据的分区粒度与执行 TTL 过期的粒度一致（例如按天），则每个分片自然只包含该时间区间内的数据。这将确保可以高效地应用 `ttl_only_drop_parts=1`。

### 列级 TTL

上面的示例是在表级别让数据过期。用户也可以在列级别设置数据过期策略。随着数据老化，可以利用该功能删除在排障或分析中价值不足、但保留成本较高的列。例如，我们建议保留 `Body` 列，以便在后续新增尚未在写入时提取的动态元数据（例如新的 Kubernetes 标签）时使用。在一段时间之后，例如 1 个月后，如果很明显这些额外元数据并不有用，那么继续保留 `Body` 列的价值就有限了。

下面展示如何在 30 天后删除 `Body` 列。

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
在列级别指定 TTL 时，用户需要自行定义表结构（schema）。这一点无法在 OTel collector 中配置。
:::


## 重新压缩数据

虽然我们通常推荐在可观测性数据集中使用 `ZSTD(1)`，但用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。除了可以在创建表结构时指定压缩算法外，还可以配置在设定时间之后更改压缩方式。如果某种编解码器或压缩算法虽然能带来更好的压缩率，但会导致较差的查询性能，那么这种配置可能是合适的。对于较早的数据，由于查询频率较低，这种权衡可能是可以接受的；但对于近期数据而言，由于更频繁地用于排查和调查，这种权衡就不适用了。

下面展示了一个示例，我们在 4 天后使用 `ZSTD(3)` 对数据进行压缩，而不是将其删除。

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
我们建议用户始终同时评估不同压缩级别和算法对写入和查询性能的影响。例如，delta 编码在压缩时间戳方面可能非常有用。但如果这些时间戳是主键的一部分，则可能会影响过滤性能。
:::

有关配置 TTL 的更多详细信息和示例，请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。关于如何为表和列添加和修改 TTL 的示例，请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。有关 TTL 如何实现例如冷热分层架构在内的存储分层，请参见[存储层级](#storage-tiers)。


## 存储层级 {#storage-tiers}

在 ClickHouse 中，用户可以在不同磁盘上创建存储层级，例如将热/近期数据存放在 SSD 上，将较旧的数据存放在以 S3 为后端的存储上。这种架构允许对较旧数据使用成本更低的存储，因为这些数据在排查问题时访问频率较低，其查询 SLA 要求也相对较宽松。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用以 S3 为后端的单一数据副本，并在节点上通过 SSD 缓存加速访问。因此，在 ClickHouse Cloud 中无需配置存储层级。
:::

创建存储层级需要用户先创建磁盘，然后基于这些磁盘制定存储策略，并在其中定义可在建表时指定的卷。数据可以根据磁盘的占用率、数据分片大小以及卷的优先级在磁盘之间自动迁移。更多细节请参见[此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令在磁盘之间手动移动数据，但也可以使用 TTL 来控制数据在卷之间的迁移。完整示例请参见[此处](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)。



## 管理模式变更

在系统的整个生命周期中，日志和追踪的模式不可避免地会发生变化，例如，当用户开始监控具有不同元数据或 pod（容器组）标签的新系统时。通过使用 OTel 模式生成数据，并以结构化格式捕获原始事件数据，ClickHouse 的模式在面对这些变化时将具有良好的鲁棒性。然而，随着新的元数据出现以及查询访问模式发生变化，用户会希望更新模式以反映这些变化。

为了在进行模式变更时避免停机，用户有多种选择，我们将在下文介绍。

### 使用默认值

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 向模式中添加列。如果在 INSERT 时未指定该列，将使用指定的默认值。

可以在修改任何物化视图的转换逻辑或 OTel collector 配置（这些配置会导致新列被发送）之前先进行模式变更。

一旦模式已变更，用户就可以重新配置 OTel collectors。假设用户遵循 [&quot;使用 SQL 提取结构&quot;](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中推荐的流程，即由 OTel collectors 将数据发送到使用 Null 表引擎的表，再通过一个物化视图负责提取目标模式并将结果发送到用于存储的目标表，则可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 来修改该视图。假设我们有如下目标表及其对应的物化视图（类似于 &quot;使用 SQL 提取结构&quot; 中使用的视图），用于从 OTel 结构化日志中提取目标模式：

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
        multiIf(Status::UInt64 > 500, '致命', Status::UInt64 > 400, '错误', Status::UInt64 > 300, '警告', '信息') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

假设我们希望从 `LogAttributes` 中提取一个新列 `Size`。我们可以使用 `ALTER TABLE` 将其添加到我们的表结构中，并指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上面的示例中，我们将默认值指定为 `LogAttributes` 中的 `size` 键（如果该键不存在，则为 0）。这意味着，对该列的查询在访问那些未插入该值的行时，必须回退到访问 Map，因此会更慢。我们也可以很容易地将其指定为一个常量，例如 0，从而降低针对缺少该值的行进行后续查询的开销。对该表进行查询时可以看到，该值确实按预期从 Map 中填充：

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

结果包含 5 行。耗时 0.012 秒。
```


为了确保该值会被插入到所有后续数据中，我们可以使用 `ALTER TABLE` 语法来修改我们的物化视图，如下所示：

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

后续插入的行在写入时会自动填充 `Size` 列。

### 创建新表

作为上述流程的替代方案，用户可以直接使用新 schema 创建一个新的目标表。然后可以修改任意物化视图，使其使用新的表，并使用上述的 `ALTER TABLE MODIFY QUERY` 语句进行修改。通过这种方式，用户可以对其表进行版本管理，例如 `otel_logs_v3`。

这种方法会留下多个可供查询的表。要在多个表之间进行查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数支持在表名中使用通配符模式。下面通过对 `otel_logs` 表的 v2 和 v3 版本进行查询来进行演示：

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

5 行结果。耗时 0.137 秒。处理 41.46 百万行，82.92 MB（302.43 百万行/秒，604.85 MB/秒）。
```

如果用户希望避免使用 `merge` 函数，但又需要向终端用户提供一个将多个表合并起来的表，可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。示例如下：

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

5 行结果，耗时 0.073 秒。共处理 41.46 百万行数据，82.92 MB（565.43 百万行/秒，1.13 GB/秒）。
```

每当添加新表时，都可以使用 `EXCHANGE` 表语法进行更新。例如，要添加 v4 表，我们可以创建一个新表，并将其与上一版本原子性交换。

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


┌─状态─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

结果集中有 5 行。耗时：0.068 秒。已处理 4246 万行数据，84.92 MB（6.2045 亿行/秒，1.24 GB/秒）。

```
```
