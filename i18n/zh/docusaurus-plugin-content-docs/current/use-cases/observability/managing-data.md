---
'title': '管理数据'
'description': '用于可观察性的管理数据'
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

用于可观察性的 ClickHouse 部署通常涉及大规模数据集，这些数据集需要管理。ClickHouse 提供了许多数据管理的功能。

## 分区 {#partitions}

ClickHouse 中的分区允许根据列或 SQL 表达式在磁盘上逻辑上分离数据。通过逻辑上分离数据，可以独立操作每个分区，例如删除。这允许用户高效地在存储层之间移动分区，从而有效地 [过期数据/从集群中高效删除](/sql-reference/statements/alter/partition)。

在最初通过 `PARTITION BY` 子句定义表时就会指定分区。该子句可以包含任何列的 SQL 表达式，查询结果将定义某行发送到哪个分区。

<Image img={observability_14} alt="分区" size="md"/>

数据片段在磁盘上通过公用文件夹名称前缀与每个分区逻辑关联，可以独立查询。例如，默认的 `otel_logs` 模式使用表达式 `toDate(Timestamp)` 按天进行分区。当行插入 ClickHouse 时，针对每行将评估此表达式，如果存在，则路由到相应的分区（如果该行是一天中的第一行，将创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行[多种操作](/sql-reference/statements/alter/partition)，包括[备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、变更[修改](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition)数据（按行）和[索引清理（如二级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

例如，假设我们的 `otel_logs` 表按天分区。如果填充结构化日志数据集，将包含若干天的数据：

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

当前分区可以使用简单的系统表查询找到：

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

我们可能还有另一个表 `otel_logs_archive`，用于存储较旧的数据。可以通过分区高效地将数据移动到此表（这只是一个元数据更改）。

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

这与其他技术形成对比，后者需要使用 `INSERT INTO SELECT` 并将数据重写到新目标表中。

:::note 移动分区
[在表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table)需要满足几个条件，特别是表必须具有相同的结构、分区键、主键和索引/投影。关于如何在 `ALTER` DDL 中指定分区的详细信息可以在[这里](/sql-reference/statements/alter/partition#how-to-set-partition-expression)找到。
:::

此外，可以通过分区高效删除数据。这比其他技术（变更或轻量级删除）更节省资源，应优先考虑。

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
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，这一功能由 TTL 利用。有关详细信息，请参见[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::


### 应用 {#applications}

上面的内容说明了如何通过分区高效地移动和操作数据。在实际情况下，用户在可观察性用例中可能最频繁地利用分区操作的两个场景是：

- **分层架构** - 在存储层之间移动数据（见[存储层](#storage-tiers)），从而允许构建热冷架构。
- **高效删除** - 当数据达到指定的 TTL 时（见[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)）

我们将在下面详细探讨这两个问题。

### 查询性能 {#query-performance}

虽然分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数分区（理想情况下是一个），性能可能会提高。通常这只有在分区键不在主键中并且您按其过滤时才有用。然而，需要覆盖多个分区的查询可能比不使用分区的情况性能更差（因为可能还有更多的片段）。如果分区键已经是主键中的前几个条目，则针对单个分区的好处将更不明显甚至不存在。如果每个分区中的值是唯一的，分区还可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而，通常情况下，用户应该确保优化主键，并仅在访问模式访问特定可预测数据子集的特殊情况下考虑分区作为查询优化技术，例如：按天分区，大多数查询集中在前一天。有关此行为的示例，请参见[这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。

## 使用 TTL（生存时间）进行数据管理 {#data-management-with-ttl-time-to-live}

生存时间（TTL）是 ClickHouse 提供的可观察解决方案中的一个关键特性，旨在高效管理和保留数据，特别是因为大量数据持续生成。 在 ClickHouse 中实现 TTL 允许自动过期和删除旧数据，确保存储被最优使用，性能得以保持，而无需手动干预。此功能对保持数据库精简、降低存储成本、确保查询快速高效地聚焦于最相关和最新的数据至关重要。此外，它还通过系统地管理数据生命周期，有助于遵守数据保留政策，从而提升可观察解决方案的整体可持续性和可扩展性。

TTL 可以在 ClickHouse 的表级或列级上指定。

### 表级 TTL {#table-level-ttl}

日志和跟踪的默认模式包含在指定期间后过期数据的 TTL。这在 ClickHouse 导出器中通过 `ttl` 键指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

此语法目前支持 [Golang Duration syntax](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h`，并确保与分区周期一致。例如，如果按天分区，则确保它是天数的倍数，例如 24h、48h、72h。** 这将自动确保添加 TTL 子句到表中，例如，如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，当 ClickHouse [合并数据片段](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，会删除过期的 TTL 数据。当 ClickHouse 检测到数据已过期时，它会执行计划外的合并。

:::note 计划 TTL
TTL 并非立即应用，而是按照计划，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置重复合并具有删除 TTL 的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，直到触发 TTL 合并可能需要更长时间。如果值过低，它将在许多非计划合并中消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制触发 TTL 到期。
:::

**重要提示：我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**（应用于默认模式）。启用此设置后，当其中所有行均过期时，ClickHouse 会删除整个部分。这样，删除整个部分而不是部分清理 TTL 已删除的行（当 `ttl_only_drop_parts=0` 时通过资源密集型的变更实现）可以缩短 `merge_with_ttl_timeout` 时间，并降低对系统性能的影响。如果数据按您执行 TTL 过期的相同单位进行分区，例如：按天，部分将自然只包含定义的时间段中的数据。这将确保 `ttl_only_drop_parts=1` 可以高效应用。

### 列级 TTL {#column-level-ttl}

上述示例在表级别过期数据。用户还可以在列级别过期数据。随着数据的老化，这可以用来删除那些在调查中其值不值得保留其资源开销的列。例如，我们建议保留 `Body` 列，以防有新的动态元数据在插入时未被提取，例如新的 Kubernetes 标签。在一段时间后，例如 1 个月，可能会明显意识到此附加元数据没有用，因此限制保留 `Body` 列的价值。

下面，我们展示了如何在 30 天后删除 `Body` 列。

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
指定列级 TTL 需要用户自行指定模式。这不能在 OTel 收集器中指定。
:::

## 数据重新压缩 {#recompressing-data}

虽然我们通常建议观察性数据集使用 `ZSTD(1)`，用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。在模式创建时可以指定此设置，压缩配置也可以在设定的时间后更改。这在编解码器或压缩算法改善压缩但导致查询性能较差时可能是合适的。对于查询较少的旧数据，这种权衡可能是可以接受的，但对于更频繁使用的近期数据，则不宜如此。

下面是一个示例，我们在 4 天后使用 `ZSTD(3)` 压缩数据，而不是删除它。

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
我们建议用户始终评估不同压缩级别和算法对插入和查询性能的影响。例如，增量编码在压缩时间戳时可能很有帮助。然而，如果这些是主键的一部分，则过滤性能可能会受到影响。
:::

有关配置 TTL 的进一步详细信息和示例，请参见[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。有关如何为表和列添加和修改 TTL 的示例，请参见[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。有关 TTL 如何启用热-温架构等存储层次的，请参见[存储层级](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如将热/最近的数据放在 SSD 上，将较旧的数据放在 S3 后备以供使用。这种架构允许为老数据使用成本更低的存储，由于其在调查中使用频率较低，因此具有更高的查询服务级别。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用单一的数据副本，后备于 S3，并配有 SSD 支持的节点缓存。因此，ClickHouse Cloud 中不需要存储层。
:::

创建存储层需要用户创建磁盘，随后用于制定存储策略，并且在表创建期间可以指定卷。可以根据填充率、部分大小和卷优先级在磁盘之间自动移动数据。有关详细信息，请参见[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令手动在磁盘之间移动数据，但也可以使用 TTL 控制在卷之间的数据移动。完整示例可以在[这里](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)找到。

## 管理模式更改 {#managing-schema-changes}

日志和跟踪模式在系统的生命周期中不可避免地会发生变化，例如，用户监控不同元数据或 pod 标签的新系统。通过使用 OTel 模式生成数据并以结构化格式捕获原始事件数据，ClickHouse 模式将对这些变化具有良好的适应性。然而，随着新的元数据可用，查询访问模式也发生变化，用户希望更新模式以反映这些变化。

为了避免在模式更改期间出现停机，用户有多种选择，我们在下面介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 向模式添加列。如果在插入期间未指定默认值，则会使用指定的默认值。

在修改任何物化视图变换逻辑或 OTel 收集器配置之前，可以进行模式更改，这会导致这些新列被发送。

模式更改后，用户可以重新配置 OTel 收集器。假设用户正在使用 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中概述的推荐流程，在该流程中，OTel 收集器将其数据发送到一个空表引擎，物化视图负责提取目标模式并将结果发送到目标表以进行存储，则可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 修改视图。假设我们有下面的目标表及其对应的物化视图（类似于在 "使用 SQL 提取结构" 中使用的视图），从 OTel 结构化日志中提取目标模式：

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

假设我们希望从 `LogAttributes` 中提取一个新列 `Size`。我们可以通过 `ALTER TABLE` 将其添加到我们的模式中，并指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上述示例中，我们指定 `LogAttributes` 中的 `size` 键作为默认值（如果不存在则为 0）。这意味着访问该列的查询必须访问 Map，因此会变得更慢。我们也可以轻松地将其指定为常量，例如 0，从而减少对没有该值的行后续查询的成本。查询该表显示该值按预期从 Map 填充：

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

为了确保此值插入所有未来数据，我们可以使用如下所示的 `ALTER TABLE` 语法修改我们的物化视图：

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

随后的行将在插入时填充 `Size` 列。

### 创建新表 {#create-new-tables}

作为上述过程的替代方案，用户可以简单地创建一个具有新模式的目标表。然后可以使用上述 `ALTER TABLE MODIFY QUERY` 修改任何物化视图以使用新表。通过这种方式，用户可以为他们的表版本化，例如：`otel_logs_v3`。

这种方法使用户有多个表可供查询。要跨表查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数接受表名的通配符模式。我们在下面演示了如何查询 `otel_logs` 表的 v2 和 v3：

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

如果用户希望避免使用 `merge` 函数并向最终用户暴露一个组合多个表的表，可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。我们在下面演示了这一点：

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

每当添加新表时，可以使用 `EXCHANGE` 表语法进行更新。例如，要添加 v4 表，我们可以创建一个新表并以原子方式与先前版本进行交换。

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
