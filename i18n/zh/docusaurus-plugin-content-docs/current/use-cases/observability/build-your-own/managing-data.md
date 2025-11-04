---
'title': '管理数据'
'description': '用于可观测性的管理数据'
'slug': '/observability/managing-data'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# 管理数据

用于可观察性的 ClickHouse 部署不可避免地涉及大量数据集，这需要进行管理。ClickHouse 提供了一系列功能以协助进行数据管理。

## 分区 {#partitions}

在 ClickHouse 中，分区允许根据列或 SQL 表达式在磁盘上逻辑上分离数据。通过逻辑分离数据，每个分区可以独立操作，例如被删除。这使得用户可以在存储层之间高效地移动分区，从而高效地[过期数据/从集群中高效删除](/sql-reference/statements/alter/partition)。

分区在表初始定义时通过 `PARTITION BY` 子句指定。此子句可以包含对任意列的 SQL 表达式，其结果将定义一行被发送到哪个分区。

<Image img={observability_14} alt="分区" size="md"/>

数据部分在磁盘上与每个分区逻辑上关联（通过一个共同的文件夹名称前缀），并可以单独查询。以下示例中，默认的 `otel_logs` 模式通过使用表达式 `toDate(Timestamp)` 按天分区。当数据行插入到 ClickHouse 中时，此表达式将被评估针对每一行，并且如果存在，则路由到相应的分区（如果该行是某一天的第一行，则将创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行[多种操作](/sql-reference/statements/alter/partition)，包括[备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、变更[修改](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition)数据（按行）和[索引清除（例如，次级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

作为一个例子，假设我们的 `otel_logs` 表按天进行分区。如果填充了结构化日志数据集，则会包含几天的数据：

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

我们可能还有另一个表 `otel_logs_archive`，用于存储旧数据。可以通过分区高效地将数据移动到此表（这只是一个元数据更改）。

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

这与其他技术形成对比，后者需要使用 `INSERT INTO SELECT` 并将数据重新写入新目标表。

:::note 移动分区
[在表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table)需要满足多个条件，其中包括表必须具有相同的结构、分区键、主键和索引/投影。关于如何在 `ALTER` DDL 中指定分区的详细说明可以在[这里](/sql-reference/statements/alter/partition#how-to-set-partition-expression)找到。
:::

此外，可以按分区高效地删除数据。这比其他技术（变更或轻量级删除）更有效率，并且应该优先考虑。

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
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，该功能已被 TTL 利用。有关详细信息，请参见[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::

### 应用 {#applications}

上述内容说明了如何通过分区高效地移动和操作数据。在实际操作中，用户可能在可观察性用例中最频繁使用分区操作以用于两个场景：

- **分层架构** - 在存储层之间移动数据（见[存储层](#storage-tiers)），从而构建热-冷架构。
- **高效删除** - 当数据达到指定的 TTL 时（见[使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)）

我们将在下面详细探讨这两点。

### 查询性能 {#query-performance}

虽然分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询只针对少数几个分区（理想情况下为一个），性能可能会有所改善。仅当分区键不在主键中而且您按其过滤时，这通常是有用的。但是，覆盖许多分区的查询可能会比不使用分区的性能更差（因为可能有更多部分）。如果分区键已经是主键中的早期条目，则单个分区的目标优势将显得微不足道甚至不存在。如果每个分区中的值是唯一的，分区还可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但一般来说，用户应确保主键得到优化，并仅在访问模式访问特定可预测数据子集的特殊情况下考虑将分区作为查询优化技术，例如按天分区，而大多数查询集中在最后一天。有关此行为的示例，请参见[这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。

## 使用 TTL（生存时间）进行数据管理 {#data-management-with-ttl-time-to-live}

生存时间（TTL）是由 ClickHouse 提供的可观察性解决方案中的关键特性，用于高效的数据保留和管理，尤其是考虑到大量数据不断生成。 在 ClickHouse 中实施 TTL 使得旧数据的自动过期和删除成为可能，从而确保存储被最佳利用，且性能在没有人工干预的情况下维持。这一能力对保持数据库高效，减少存储成本，并确保查询专注于最相关和最新的数据，使其保持快速高效至关重要。此外，它通过系统地管理数据生命周期，帮助满足数据保留政策，从而提升可观察性解决方案的整体可持续性和可扩展性。

TTL 可以在 ClickHouse 中针对表或列级别指定。

### 表级 TTL {#table-level-ttl}

日志和跟踪的默认模式包括在指定时间段后过期数据的 TTL。这在 ClickHouse 导出器中通过 `ttl` 键指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

该语法当前支持 [Golang Duration 语法](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h` 并确保这与分区期对齐。例如，如果按天分区，确保它是天数的倍数，例如 24h、48h、72h。** 这将自动确保将 TTL 子句添加到表中，例如如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，过期 TTL 的数据在 ClickHouse [合并数据部分](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时被删除。当 ClickHouse 检测到数据过期时，它会执行非定期合并。

:::note 定期 TTL
TTL 不会立即应用，而是根据计划应用，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置重复合并带有删除 TTL 的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，它可能会花费更长时间才能触发 TTL 合并。如果值设置得过低，将会进行许多非定期合并，这可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制执行 TTL 到期。
:::

**重要：我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**（应用于默认模式）。启用此设置时，ClickHouse 在所有行均过期时会丢弃整个部分。丢弃整个部分而不是对 TTL 的行进行部分清理（通过资源密集型变更实现，当 `ttl_only_drop_parts=0` 时），可以缩短 `merge_with_ttl_timeout` 的时间并降低对系统性能的影响。如果数据按您进行 TTL 过期的相同单位（例如天）进行分区，则部分将自然仅包含来自定义间隔的数据。这将确保可以高效应用 `ttl_only_drop_parts=1`。

### 列级 TTL {#column-level-ttl}

上述示例在表级别过期数据。用户还可以在列级别过期数据。随着数据老化，可以用来删除在调查中其值不值得保留其资源开销的列。例如，我们建议保留 `Body` 列，以防在插入时未提取的新动态元数据，例如新的 Kubernetes 标签。在一段时间后，例如 1 个月，可能会明显发现这些额外的元数据没有用，从而限制了保留 `Body` 列的价值。

下面，我们展示如何在 30 天后删除 `Body` 列。

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
指定列级 TTL 需要用户自行指定模式。此设置不能在 OTel 收集器中指定。
:::

## 重新压缩数据 {#recompressing-data}

虽然我们通常建议对可观察性数据集使用 `ZSTD(1)`，但用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。除了可以在模式创建时指定此项外，还可以配置在设定的时间段后进行更改。如果编解码器或压缩算法能够改善压缩，但导致查询性能下降，这可能是合适的。这种权衡可能在旧数据的情况下是可接受的，因为其查询频率较低，但对于频繁在调查中使用的最近数据，则不适用。

下面的示例中，我们在 4 天后使用 `ZSTD(3)` 压缩数据，而不是删除它。

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
我们建议用户始终评估不同压缩级别和算法对插入和查询性能的影响。例如，增量编解码器在压缩时间戳时可能很有帮助。然而，如果这些是主键的一部分，则过滤性能可能会下降。
:::

有关配置 TTL 的进一步详情和示例可以在[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)找到。有关如何为表和列添加和修改 TTL 的示例，可以在[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)找到。有关 TTL 如何启用存储层次结构如热-温冷架构的信息，请参见[存储层](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如，在 SSD 上存储热/近期数据，而在 S3 上存储旧数据。这种架构允许对旧数据使用较便宜的存储，由于其在调查中使用频率较低，因此具有较高的查询 SLA。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用 S3 上的单一数据副本，并具有 SSD 支持的节点缓存。因此，在 ClickHouse Cloud 中不需要存储层。
:::

创建存储层要求用户创建磁盘，然后用于形成存储策略，在创建表时可以指定卷。数据可以根据填充率、部分大小和卷优先级自动在磁盘之间移动。有关进一步细节，请参见[这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令手动在磁盘之间移动数据，但也可以使用 TTL 控制数据在卷之间的移动。完整示例可以在[这里](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)找到。

## 管理模式变化 {#managing-schema-changes}

日志和追踪模式在系统的生命周期中不可避免地会发生变化，例如，用户监控具有不同元数据或 pod 标签的新系统。通过使用 OTel 模式生成数据，并以结构化格式捕获原始事件数据，ClickHouse 的模式在这些变化中将是稳健的。然而，随着新元数据的可用性增加和查询访问模式的变化，用户将希望更新模式以反映这些变化。

为了避免在模式变化期间出现停机，用户有几种选择，下面我们将介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 将列添加到模式中。如果在 INSERT 时未指定，则会使用指定的默认值。

在修改任何物化视图转换逻辑或 OTel 收集器配置之前，可以进行模式更改，这会导致将这些新列发送。

一旦模式发生变化，用户可以重新配置 OTel 收集器。假设用户使用的是 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中推荐的过程，其中 OTel 收集器将其数据发送到 Null 表引擎，具有负责提取目标模式并将结果发送到目标表进行存储的物化视图，可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 修改视图。假设我们有以下目标表及其对应的物化视图（类似于在 "使用 SQL 提取结构" 中使用的），用于从 OTel 结构化日志中提取目标模式：

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

假设我们希望从 `LogAttributes` 提取一个新列 `Size`。我们可以使用 `ALTER TABLE` 将其添加到我们的模式中，指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上面的示例中，我们将默认值指定为 `LogAttributes` 中的 `size` 键（如果不存在，则为 0）。这意味着对这种列访问但未插入值的行的查询必须访问 Map，因此会更慢。我们还可以轻松地将其指定为常量，例如 0，从而降低对未插入值的行后续查询的成本。查询此表显示该值按预期从 Map 中填充：

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

为了确保该值对所有未来数据进行插入，我们可以使用以下所示的 `ALTER TABLE` 语法修改我们的物化视图：

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

作为上述过程的替代，用户可以简单地创建一个带有新模式的新目标表。然后可以修改任何物化视图以使用新表，使用上述 `ALTER TABLE MODIFY QUERY`。通过这种方法，用户可以对表进行版本控制，例如 `otel_logs_v3`。

这种方法会让用户面临多个表的查询。要跨多个表查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数接受表名的通配符模式。我们在下面展示如何查询 `otel_logs` 表的 v2 和 v3：

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

如果用户希望避免使用 `merge` 函数并向最终用户展示一个结合多个表的表，可以使用 [合并表引擎](/engines/table-engines/special/merge)。我们在下面展示：

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

只要创建一个新表并以原子方式与前一个版本交换，即可在添加新表时进行更新。

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
