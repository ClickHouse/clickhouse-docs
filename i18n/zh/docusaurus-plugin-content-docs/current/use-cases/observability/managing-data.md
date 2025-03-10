---
title: 数据管理
description: 观察性的 数据管理
slug: /observability/managing-data
keywords: [observability, logs, traces, metrics, OpenTelemetry, Grafana, OTel]
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';


# 数据管理

用于观察性的 ClickHouse 部署通常涉及大型数据集，需要进行管理。ClickHouse 提供多种功能来帮助数据管理。

## 分区 {#partitions}

ClickHouse 的分区允许根据列或 SQL 表达式将数据在磁盘上逻辑分开。通过逻辑上分开数据，每个分区可以独立操作，例如被删除。这使得用户能够高效地在存储层之间移动分区，从而对时间或 [过期数据/从集群高效删除](/sql-reference/statements/alter/partition) 的子集进行操作。

在表首次定义时，通过 `PARTITION BY` 子句指定分区。该子句可以包含针对任何列的 SQL 表达式，其结果将定义将行发送到哪个分区。

<img src={observability_14}    
  class="image"
  alt="需要ALT"
  style={{width: '800px'}} />

<br />

数据片段与磁盘上的每个分区通过共享的文件夹名称前缀逻辑关联，并可以单独查询。以下示例中，默认的 `otel_logs` 模式按天分区，使用表达式 `toDate(Timestamp)`。当行被插入到 ClickHouse 中时，将针对每一行评估该表达式，并在存在时被路由到结果分区（如果该行是某一天的第一行，将创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行 [多种操作](/sql-reference/statements/alter/partition)，包括 [备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、[改变](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition) 行数据的突变，以及 [索引清理（例如，二级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

例如，假设我们的 `otel_logs` 表按天分区。如果用结构化日志数据填充，这将包含几天的数据：

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

当前分区可以通过简单的系统表查询找到：

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

我们可能有另一个表 `otel_logs_archive`，用于存储较旧的数据。 可以通过分区高效地将数据移动到该表（这只是元数据更改）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--移动数据到归档表
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
```

这与其他技术形成对比，后者将需要使用 `INSERT INTO SELECT` 并将数据重写到新的目标表中。

:::note 迁移分区
[在表之间迁移分区](/sql-reference/statements/alter/partition#move-partition-to-table) 需要满足几个条件，最重要的是表必须具有相同的结构、分区键、主键和索引/投影。有关如何在 `ALTER` DDL 中指定分区的详细说明，请参见 [这里](/sql-reference/statements/alter/partition#how-to-set-partition-expression)。
:::

此外，可以根据分区高效地删除数据。这比使用替代技术（突变或轻量级删除）更具资源效率，应优先考虑。

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
```

:::note
当设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，此功能被 TTL 利用。有关详细信息，请参阅 [具有 TTL 的数据管理](#data-management-with-ttl-time-to-live)。
:::


### 应用 {#applications}

上述示例说明了如何根据分区高效移动和操作数据。在现实中，用户很可能在观察性用例中最常利用分区操作的两个场景：

- **分层架构** - 在存储层之间移动数据（见 [存储层](#storage-tiers)），从而允许构建冷热架构。
- **高效删除** - 当数据达到指定的 TTL 时（见 [具有 TTL 的数据管理](#data-management-with-ttl-time-to-live)）

我们将在下面详细探讨这两点。

### 查询性能 {#query-performance}

尽管分区可以协助查询性能，但这在很大程度上依赖于访问模式。如果查询只针对少数几个分区（理想情况下是一个），则性能可能会提高。这通常只有在分区键不在主键中且您正在按它过滤的情况下才有用。但是，查询需要覆盖多个分区的情况可能会比不使用分区时性能更差（因为可能存在更多的部分）。如果分区键已经是主键中的早期项，则针对单个分区的好处会显得更微弱或不存在。如果每个分区中的值是唯一的，分区还可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但是，通常情况下，用户应确保主键得到优化，并仅在访问模式访问特定可预测的数据子集的特殊情况下考虑分区作为查询优化技术，例如按天进行分区，其中大多数查询在最后一天。有关这种行为的示例，请参见 [这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。

## 使用 TTL（生存时间）的数据管理 {#data-management-with-ttl-time-to-live}

生存时间（TTL）是由 ClickHouse 提供的一项关键特性，用于高效的数据保留和管理，特别是在不断生成大量数据的观察性解决方案中。在 ClickHouse 中实施 TTL 可实现旧数据的自动过期和删除，确保最佳利用存储并维持性能，无需人工干预。此功能对于保持数据库精简、降低存储成本以及确保查询高效快速，专注于最相关和最新的数据至关重要。此外，它有助于遵守数据保留政策，通过系统管理数据生命周期，从而提高观察性解决方案的整体可持续性和可扩展性。

TTL 可以在 ClickHouse 中的表级或列级指定。

### 表级 TTL {#table-level-ttl}

日志和跟踪的默认模式包括一个 TTL，以在指定时间段后过期数据。这在 ClickHouse 导出器下通过 `ttl` 键指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

此语法当前支持 [Golang Duration syntax](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h` 并确保与分区时间段对齐。例如，如果您按天进行分区，请确保它是天数的倍数，例如 24h、48h、72h。** 这将自动确保 TTL 子句被添加到表中，例如，如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

默认情况下，当 ClickHouse [合并数据部分](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，带有过期 TTL 的数据会被移除。当 ClickHouse 检测到数据已过期时，它会执行一次非计划的合并。

:::note 定时 TTL
TTL 不是立即应用的，而是按计划的，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置在重复进行带有删除 TTL 的合并之前的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，触发 TTL 合并可能需要更长时间。如果该值过低，则会执行许多非计划的合并，这可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制 TTL 到期。
:::

**重要：我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**（由默认模式应用）。启用此设置后，ClickHouse 将在其中所有行均已过期时删除整个部分。与部分清理 TTL 行（在 `ttl_only_drop_parts=0` 时通过资源密集型突变实现）相比，删除整个部分可以缩短 `merge_with_ttl_timeout` 的时间并减少对系统性能的影响。如果根据您执行 TTL 过期的相同单位对数据进行分区，例如按天，则部分将自然仅包含来自定义间隔的数据。这将确保 `ttl_only_drop_parts=1` 可以有效应用。

### 列级 TTL {#column-level-ttl}

上述示例在表级过期数据。用户还可以在列级别过期数据。随着数据的老化，这可以用来删除在调查中其值不再 justify 其维持资源开销的列。例如，我们建议保留 `Body` 列，以防添加新动态元数据，而这些元数据未在插入时提取，例如新的 Kubernetes 标签。经过一段时间，例如 1 个月后，可能很明显这一额外的元数据没有用处，因此限制作有价值的 `Body` 列的保留。

下面我们展示如何在 30 天后删除 `Body` 列。

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
指定列级 TTL 要求用户指定自己的模式。这无法在 OTel 收集器中指定。
:::

## 数据重压缩 {#recompressing-data}

虽然我们通常推荐将 `ZSTD(1)` 用于观察性数据集，但用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。除了在模式创建时能够指定外，压缩还可以配置为在设定期间后更改。这在某些情况下可能是合适的，如果编解码器或压缩算法改善了压缩，但导致查询性能下降。这种权衡可能对较旧的数据是可接受的，因为这些数据的查询频率较低，但对于更近期的数据则不适用，因为这些数据在调查中使用频率更高。

下面是此示例，我们在 4 天后使用 `ZSTD(3)` 压缩数据，而不是删除它。

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
我们建议用户始终评估不同压缩级别和算法对插入和查询性能的影响。例如，增量编解码器可以在时间戳的压缩中有所帮助。然而，如果这些是主键的一部分，则过滤性能可能会受到影响。
:::

有关配置 TTL 的更多详细信息和示例可以在 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 找到。有关如何为表和列添加和修改 TTL 的示例，可以在 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 找到。有关 TTL 如何支持存储层次结构（例如冷热架构）的信息，请参见 [存储层](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如，将热/最近的数据放在 SSD 上，而将较旧的数据放在 S3 后备。这种架构允许为较旧的数据使用成本较低的存储，由于其在调查中的使用频率低，因此具有更高的查询服务水平协议。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用 S3 上备份的数据的单一副本，并带有 SSD 后备节点缓存。因此，ClickHouse Cloud 中的存储层是不必要的。
:::

创建存储层需要用户创建磁盘，然后用于制定存储策略，体积可以在表创建时指定。数据可以根据填充率、部分大小和体积优先级在磁盘之间自动移动。有关更多详细信息，请参见 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令手动在磁盘之间移动数据，但也可以使用 TTL 控制在体积之间移动数据。完整示例可以在 [这里](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) 找到。

## 管理模式更改 {#managing-schema-changes}

日志和跟踪模式在系统的生命周期中不可避免地会改变，例如，当用户监视具有不同元数据或 pod 标签的新系统时。通过使用 OTel 模式生成数据并以结构化格式捕获原始事件数据，ClickHouse 模式将对这些变化具有较强的适应性。然而，由于新的元数据可用并且查询访问模式发生变化，用户希望更新模式以反映这些变化。

为了避免在模式更改期间出现停机，用户有几个选项，我们下面介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 将列添加到模式中。如果在 INSERT 期间未指定指定的默认值，则将使用该值。

在修改任何物化视图转换逻辑或 OTel 收集器配置之前，可以进行模式更改，这将导致这些新列被发送。

一旦模式被更改，用户可以重新配置 OTel 收集器。假设用户正在使用在 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中概述的推荐流程，在该流程中 OTel 收集器将其数据发送到一个空表引擎，物化视图负责提取目标模式并将结果发送到一个用于存储的目标表，视图可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 进行修改。假设我们有以下目标表及其相应的物化视图（类似于在 "使用 SQL 提取结构" 中使用的视图），用于从 OTel 结构化日志中提取目标模式：

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

假设我们希望从 `LogAttributes` 中提取新的列 `Size`。我们可以使用 `ALTER TABLE` 将其添加到我们的模式，并指定默认值：

```sql
ALTER TABLE otel_logs_v2
	(ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上述示例中，我们将默认值指定为 `LogAttributes` 中的 `size` 键（如果不存在，则为 0）。这意味着访问插入时未填充值的行的此列的查询必须访问 Map，因此会更慢。我们也可以将其简单地指定为常量，例如 0，从而降低对未填充值的行的后续查询成本。查询该表显示值如预期从 Map 中已填充：

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

为了确保将来所有新数据都会插入此值，我们可以使用 `ALTER TABLE` 语法修改我们的物化视图，如下所示：

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
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

后续行将在插入时填充 `Size` 列。

### 创建新表 {#create-new-tables}

作为上述过程的替代方案，用户可以简单地创建一个带有新模式的目标表。然后，可以使用上述 `ALTER TABLE MODIFY QUERY` 修改任何物化视图以使用新表。通过这种方式，用户可以对表进行版本控制，例如 `otel_logs_v3`。

这种方法使用户可以查询多个表。要跨表查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数接受表名称的通配符模式。我们下面演示通过查询 `otel_logs` 表的 v2 和 v3：

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

如果用户希望避免使用 `merge` 函数并向最终用户展示一个合并多个表的表，则可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。我们在下面演示此操作：

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

每当添加新表时，可以使用 `EXCHANGE` 表语法进行更新。例如，可以创建新表 v4 并与先前版本进行原子交换。

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 39259996 │
│	304  │  1378564 │
│	302  │   820118 │
│	404  │   429220 │
│	301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
