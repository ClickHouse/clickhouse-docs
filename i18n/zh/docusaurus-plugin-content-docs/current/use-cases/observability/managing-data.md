---
'title': 'Managing Data'
'description': '为可观测性管理数据'
'slug': '/observability/managing-data'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# 管理数据

用于可观察性的 ClickHouse 部署通常涉及大量数据集，这些数据集需要进行管理。 ClickHouse 提供多个功能以协助数据管理。

## 分区 {#partitions}

在 ClickHouse 中，分区允许根据列或 SQL 表达式在磁盘上逻辑上分隔数据。通过逻辑上分隔数据，每个分区可以独立进行操作，例如删除。这使用户可以高效地在存储层之间移动分区，从而高效地 [过期数据/从集群中有效地删除](/sql-reference/statements/alter/partition)。

在首次通过 `PARTITION BY` 子句定义表时，必须指定分区。该子句可以包含任何列的 SQL 表达式，表达式的结果将定义行被发送到哪个分区。

<Image img={observability_14} alt="分区" size="md"/>

数据片段在逻辑上与磁盘上的每个分区相关联（通过通用文件夹名称前缀），并可以独立查询。以下示例中，默认的 `otel_logs` 模式按天使用 `toDate(Timestamp)` 表达式进行分区。当行被插入到 ClickHouse 时，该表达式将针对每行进行评估，并路由到结果分区（如果该分区不存在且该行为某一天的第一条数据，则会创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以在分区上执行 [若干操作](/sql-reference/statements/alter/partition)，包括 [备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、改变行数据的突变 [更新](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition)，以及 [索引清除（例如，二级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

举个例子，假设我们的 `otel_logs` 表按天分区。如果填充结构化日志数据集，则将包含数天的数据：

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

可以使用简单的系统表查询查找当前分区：

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

我们可能还有另一个表 `otel_logs_archive`，用于存储旧数据。可以通过分区有效地将数据移动到此表（这只是元数据更改）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--move data to archive table
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--confirm data has been moved
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

与其他技术相比，这意味着不需要使用 `INSERT INTO SELECT` 和将数据重写到新的目标表。

:::note 移动分区
[在表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table) 需要满足多个条件，最重要的是表必须具有相同的结构、分区键、主键和索引/投影。有关如何在 `ALTER` DDL 中指定分区的详细说明，请参见 [此处](/sql-reference/statements/alter/partition#how-to-set-partition-expression)。
:::

此外，可以按分区有效地删除数据。这比其他技术（突变或轻量级删除）更节省资源，应该优先使用。

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
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，该功能被 TTL 利用。有关更多详细信息，请参见 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::

### 应用 {#applications}

上述示例说明了如何通过分区有效移动和操作数据。实际上，用户大概率会在可观察性用例中为两种场景频繁利用分区操作：

- **分层架构** - 在存储层之间移动数据（见 [存储层](#storage-tiers)），从而构建冷热架构。
- **高效删除** - 当数据达到指定的 TTL 时（见 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)）

下面我们详细探讨这两种情况。

### 查询性能 {#query-performance}

虽然分区可以帮助提高查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），则性能可能会有所提升。这通常仅在分区键不在主键中时，以及按其进行过滤时才有用。然而，需要覆盖许多分区的查询可能会表现得比不使用分区时更差（因为可能会有更多的片段）。如果分区键已是主键的早期条目，则定位单个分区的好处将显得微乎其微。分区也可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值都是唯一的。但是，一般来说，用户应该确保主键已优化，并且仅在访问模式访问特定可预测的数据子集的特殊情况下考虑分区作为查询优化技术，例如，按天分区，大多数查询集中在最后一天。有关此行为的示例，请参见 [此处](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。

## 使用 TTL（生存时间）进行数据管理 {#data-management-with-ttl-time-to-live}

生存时间 (TTL) 是可观察性解决方案中一个重要特性，由 ClickHouse 提供，以支持高效的数据保留和管理，尤其是在大量数据被不断生成的情况下。在 ClickHouse 中实现 TTL 允许自动过期和删除旧数据，确保存储被优化使用，且在不需人工干预的情况下保持性能。此功能对于保持数据库简洁、降低存储成本以及确保查询保持快速和高效，专注于最相关和最新的数据至关重要。此外，它还通过系统地管理数据生命周期，有助于遵从数据保留政策，从而增强可观察性解决方案的整体可持续性和可扩展性。

在 ClickHouse 中，TTL 可以在表级或列级指定。

### 表级 TTL {#table-level-ttl}

日志和跟踪的默认模式包括一个 TTL，用于在指定时间后过期数据。此项在 ClickHouse 导出器中以 `ttl` 键指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

该语法当前支持 [Golang Duration 语法](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h`，并确保这与分区周期一致。例如，如果按天分区，确保是天数的倍数，例如 24h、48h、72h。** 这将自动确保将 TTL 子句添加到表中，例如，如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，过期 TTL 的数据在 ClickHouse [合并数据片段](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时被删除。当 ClickHouse 检测到数据已过期时，会执行非计划合并。

:::note 定时 TTL
TTL 不会立即应用，而是根据上文所述进行定时。如上所述，MergeTree 表设置 `merge_with_ttl_timeout` 定义在使用删除 TTL 重复合并之前的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，可能会花费更长时间才触发 TTL 合并。如果值设置得过低，可能会执行许多非计划合并，从而消耗大量资源。使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 可以强制执行 TTL 到期。
:::

**重要提示：我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) **（由默认模式应用）。启用此设置时，ClickHouse 在其中所有行都过期时丢弃整个部分。与对 TTL-d 行进行部分清理（在 `ttl_only_drop_parts=0` 时通过高资源消耗的突变实现）相比，丢弃整个部分有助于缩短 `merge_with_ttl_timeout` 的时间并降低对系统性能的影响。如果数据按执行 TTL 过期的相同单位分区，例如按天，部分自然将仅包含来自定义时间段的数据。这将确保 `ttl_only_drop_parts=1` 能够高效应用。

### 列级 TTL {#column-level-ttl}

上述示例在表级别过期数据。用户还可以在列级别过期数据。随着数据的老化，这可以用来丢弃在调查中其值不值得保留开销的列。例如，我们建议保留 `Body` 列，以防新动态元数据在插入时未提取，例如，新的 Kubernetes 标签。在一段时间后，例如 1 个月后，可能显而易见这些额外的元数据没有用处，因此限制了保留 `Body` 列的价值。

以下示例展示了如何在 30 天后丢弃 `Body` 列。

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
指定列级 TTL 需要用户自定义模式。这不能在 OTel 收集器中指定。
:::

## 重新压缩数据 {#recompressing-data}

虽然我们通常推荐在可观察性数据集上使用 `ZSTD(1)`，但用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。除了在模式创建时指定之外，压缩配置还可以在设定的时间段后进行更改。如果某个编解码器或压缩算法可以改善压缩效果，但导致查询性能下降，这可能是合适的。在旧数据上，这种权衡可能是可以接受的，因为查询频率较低，但对最近数据（在调查中更频繁使用）则不可接受。

在下面的示例中，我们在 4 天后使用 `ZSTD(3)` 压缩数据，而不是删除它。

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
我们建议用户始终评估不同压缩级别和算法对插入和查询性能的影响。例如，增量编解码器在时间戳的压缩中可能非常有用。但是，如果这些在主键中，过滤性能可能会受到影响。
:::

有关配置 TTL 的进一步细节和示例，请参见 [此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。可以在 [此处](https://engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 找到有关如何为表和列添加和修改 TTL 的示例。有关 TTL 如何启用存储层次结构，例如热-温暖架构，请参见 [存储层](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如，在 SSD 上存储热/新数据，而在 S3 上存储较旧的数据。这种架构允许在调查中使用频率较低的数据上使用成本更低的存储。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用单一副本的数据，支持 S3 和 SSD 支持的节点缓存。因此 ClickHouse Cloud 中不需要存储层。
:::

创建存储层需要用户创建磁盘，然后使用这些磁盘制定存储策略，表中可以在创建期间指定卷。可以根据填充率、片段大小和卷优先级自动在磁盘之间移动数据。有关更多详细信息，请参见 [此处](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令手动在磁盘之间移动数据，但还可以使用 TTL 控制在卷之间的数据移动。完整示例可以在 [此处](https://guides/developer/ttl#implementing-a-hotwarmcold-architecture) 找到。

## 管理架构更改 {#managing-schema-changes}

日志和跟踪模式在系统生命周期中必然会发生变化，例如，当用户监控具有不同元数据或 pod 标签的新系统时。通过使用 OTel 模式生成数据并以结构化格式捕获原始事件数据，ClickHouse 模式将对这些变化具有鲁棒性。然而，随着新元数据的可用性和查询访问模式的变化，用户将希望更新模式以反映这些变化。

为了避免在架构更改期间停机，用户有几个选项，我们将在下文中介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 将列添加到模式中。如果在 INSERT 时未指定，则将使用指定的默认值。

在修改任何物化视图转换逻辑或 OTel 收集器配置之前，可以进行模式更改，以引发这些新列的发送。

一旦模式改变，用户可以重新配置 OTel 收集器。假设用户正在使用 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中概述的推荐过程，其中 OTel 收集器将其数据发送到 Null 表引擎，物化视图负责提取目标模式并将结果发送到目标表进行存储，可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 修改视图。假设我们下面有一个目标表及其对应的物化视图（与 "使用 SQL 提取结构" 中使用的相似），用于从 OTel 结构化日志中提取目标架构：

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

假设我们希望从 `LogAttributes` 中提取新列 `Size`。我们可以通过 `ALTER TABLE` 将其添加到我们的模式中，指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上述示例中，我们将默认值指定为 `LogAttributes` 中的 `size` 键（如果不存在，则为 0）。这意味着访问此列的查询对于未插入值的行必须访问 Map，因此速度会较慢。我们也可以很容易地将其指定为常量，例如 0，从而降低对未插入值的行的后续查询成本。查询此表显示值如预期从 Map 中填充：

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

为了确保将该值插入到所有未来数据中，我们可以使用 `ALTER TABLE` 语法如下面所示来修改我们的物化视图：

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

后续行将在插入时填充 `Size` 列。

### 创建新表 {#create-new-tables}

作为上述过程的替代，用户可以简单地创建具有新模式的新目标表。然后可以修改任何物化视图以使用新表，使用上述 `ALTER TABLE MODIFY QUERY`。在此方法中，用户可以对其表进行版本管理，例如 `otel_logs_v3`。

这种方法使用户有多个表可查询。要跨表查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数接受通配符模式作为表名。我们下面演示了如何查询 `otel_logs` 表的 v2 和 v3：

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

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

如果用户希望避免使用 `merge` 函数并向最终用户提供一个合并多个表的表，则可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。我们在下面演示了这一点：

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

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

每当添加新表时，这可以通过 `EXCHANGE` 表语法进行更新。例如，要添加 v4 表，可以创建一个新表并将其与之前的版本原子交换。

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
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
