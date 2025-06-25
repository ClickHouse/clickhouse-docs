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
'show_related_blogs': true
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';



# 数据管理

用于可观察性的 ClickHouse 部署不可避免地涉及大量数据集，这些数据集需要进行管理。ClickHouse 提供多种功能以协助数据管理。

## 分区 {#partitions}

ClickHouse 中的分区允许根据列或 SQL 表达式在磁盘上逻辑上分隔数据。通过逻辑上分隔数据，每个分区可以独立操作，例如删除。这使得用户能够有效地在存储层之间移动分区，从而有效地过期数据或从集群中删除数据 [expire data/efficiently delete from a cluster](/sql-reference/statements/alter/partition)。

分区在表最初定义时通过 `PARTITION BY` 子句指定。该子句可以包含任何列的 SQL 表达式，其结果将定义一行被发送到的分区。

<Image img={observability_14} alt="Partitions" size="md"/>

数据片段在磁盘上与每个分区逻辑上相关联（通过共同的文件夹名称前缀），可以单独查询。下面的示例中，默认的 `otel_logs` 模式按天分区，使用表达式 `toDate(Timestamp)`。随着行被插入到 ClickHouse 中，该表达式将针对每一行进行评估，并在存在时路由到结果分区（如果该行是一天中的第一行，则会创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以在分区上执行 [多种操作](/sql-reference/statements/alter/partition)，包括 [备份](/sql-reference/statements/alter/partition#freeze-partition)、[列操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、突变 [更改](/sql-reference/statements/alter/partition#update-in-partition)/[删除](/sql-reference/statements/alter/partition#delete-in-partition) 行的数据以及 [索引清除（例如，二级索引）](/sql-reference/statements/alter/partition#clear-index-in-partition)。

例如，假设我们的 `otel_logs` 表按天分区。如果填充结构化日志数据集，它将包含几天的数据：

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

可以使用简单的系统表查询来查找当前分区：

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

我们可能还有另一个表 `otel_logs_archive`，用于存储较旧的数据。数据可以按照分区有效地移动到此表（这仅是元数据的变化）。

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

这与其他技术形成对比，这些技术需要使用 `INSERT INTO SELECT` 并将数据重新写入新的目标表。

:::note 移动分区
[在表之间移动分区](/sql-reference/statements/alter/partition#move-partition-to-table) 需要满足多个条件，尤其是表必须具有相同的结构、分区键、主键以及索引/投影。在 `ALTER` DDL 中如何指定分区的详细说明可以在 [这里](/sql-reference/statements/alter/partition#how-to-set-partition-expression) 找到。
:::

此外，数据可以按分区有效地删除。这比替代技术（突变或轻量级删除）更具资源效率，应该优先考虑。

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
当使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，此功能被 TTL 利用。有关详细信息，请参见 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)。
:::


### 应用 {#applications}

上述示例说明了如何有效地按分区移动和操作数据。实际上，用户可能在可观察性用例中最频繁地利用分区操作的两种情况：

- **分层架构** - 在存储层之间移动数据（参考 [存储层](#storage-tiers)），从而构建热冷架构。
- **有效删除** - 当数据达到指定的 TTL（参考 [使用 TTL 进行数据管理](#data-management-with-ttl-time-to-live)）

以下我们将详细探讨这两种情况。

### 查询性能 {#query-performance}

虽然分区可以协助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），性能可能会有所提升。这通常只有在分区键不在主键中且您正在按其过滤时才有用。但是，需要覆盖许多分区的查询性能可能比不使用分区的性能更差（因为可能存在更多的片段）。如果分区键已经是主键中的一个早期条目，针对单个分区的好处将更加微不足道。分区还可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值是唯一的。然而，通常用户应该确保主键已优化，仅在访问模式访问数据的特定可预测子集时考虑将分区作为查询优化技术，例如按日分区，并且大多数查询在过去的一天内。有关此行为的示例，请参见 [这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)。

## 使用 TTL（生存时间）进行数据管理 {#data-management-with-ttl-time-to-live}

生存时间（TTL）是 ClickHouse 支持的可观察性解决方案中有效数据保留和管理的重要特性，特别是考虑到大量数据持续生成。在 ClickHouse 中实施 TTL 允许自动过期和删除较旧数据，确保以最佳方式使用存储并在无需手动干预的情况下维护性能。此功能对于保持数据库精简、降低存储成本，并确保查询维持快速和高效至关重要，通过专注于最相关和最新的数据。此外，它有助于遵循数据保留政策，通过系统地管理数据生命周期，从而增强可观察性解决方案的整体可持续性和可扩展性。

TTL 可以在 ClickHouse 中指定在表级或列级。

### 表级 TTL {#table-level-ttl}

日志和跟踪的默认模式包括一个 TTL，以在指定时间段后使数据过期。这在 ClickHouse 导出程序中通过 `ttl` 键指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

此语法当前支持 [Golang Duration syntax](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h` 并确保这与分区周期保持一致。例如，如果您按天分区，请确保它是天数的倍数，例如 24h、48h、72h。** 这将自动确保将 TTL 子句添加到表中，例如：如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，当 ClickHouse [合并数据片段](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，将删除过期 TTL 的数据。当 ClickHouse 检测到数据已过期时，执行一个非计划的合并。

:::note 定期 TTL
TTL 不是立即应用的，而是按计划应用的，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置在带有删除 TTL 的合并重复之前的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最低延迟，可能需要更长时间才能触发 TTL 合并。如果该值过低，将执行许多非计划合并，这可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制执行 TTL 过期。
:::

**重要：我们建议使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)**（由默认模式应用）。启用此设置后，ClickHouse 会在所有行都过期时丢弃整个部分。丢弃整个部分而不是部分清理 TTL-d 行（通过资源密集型突变实现，当 `ttl_only_drop_parts=0`）允许更短的 `merge_with_ttl_timeout` 时间和对系统性能的较低影响。如果数据按您执行 TTL 过期的相同单元分区，例如天，则部分将自然仅包含定义区间内的数据。这将确保 `ttl_only_drop_parts=1` 可以被有效地应用。

### 列级 TTL {#column-level-ttl}

上述示例在表级过期数据。用户还可以在列级过期数据。随着数据老化，这可以用于删除在调查中其值无法 justify 的资源开销的列。例如，我们建议保留 `Body` 列，以防添加新动态元数据，而在插入时尚未提取，例如新的 Kubernetes 标签。在一段时间后，例如 1 个月，可能显然该附加元数据没有用处 - 从而限制了保留 `Body` 列的价值。

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
指定列级 TTL 要求用户指定自己的模式。这不能在 OTel 收集器中指定。
:::

## 重新压缩数据 {#recompressing-data}

虽然我们通常推荐在观察数据集上使用 `ZSTD(1)`，用户可以尝试不同的压缩算法或更高的压缩级别，例如 `ZSTD(3)`。除了可以在架构创建时指定此设置外，压缩设置还可以在设置的时间段后更改。如果编解码器或压缩算法改善了压缩但导致查询性能下降，这可能是合适的。这种权衡可能在较旧的数据上是不可接受的，因为这些数据的查询频率较低，而对于最近的数据，则更常用于调查。

以下是一个示例，我们在 4 天后使用 `ZSTD(3)` 压缩数据，而不是删除它。

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
我们建议用户始终评估不同压缩级别和算法的插入和查询性能影响。例如，增量编解码器对于时间戳的压缩可能非常有用。但是，如果这些是主键的一部分，则过滤性能可能会受到影响。
:::

有关配置 TTL 的进一步详细信息和示例可以在 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 找到。有关如何为表和列添加和修改 TTL 的示例，请参考 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。关于 TTL 如何使热-温-冷存储层次结构，详见 [存储层](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如：在 SSD 上存储热/最近的数据，而将较旧的数据放在 S3 上。这种架构允许对较旧的数据使用更便宜的存储，因为其查询 SLAs 较高，因为在调查中不常使用它。

:::note 与 ClickHouse Cloud 无关
ClickHouse Cloud 使用单个数据副本，该副本由 S3 支持，具有基于 SSD 的节点缓存。因此，在 ClickHouse Cloud 中不需要存储层。
:::

创建存储层需要用户创建磁盘，然后使用这些磁盘制定存储策略，在表创建时可以指定卷。数据可以根据填充率、部分大小和卷优先级在磁盘之间自动移动。进一步的详细信息可以在 [这里](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 找到。

虽然可以使用 `ALTER TABLE MOVE PARTITION` 命令手动在磁盘之间移动数据，但通过 TTL 也可以控制卷之间的数据移动。完好的示例可以在 [这里](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) 找到。

## 管理架构更改 {#managing-schema-changes}

日志和跟踪架构在系统生命周期内不可避免地会发生变化，例如：因为用户监视具有不同元数据或 pod 标签的新系统。通过使用 OTel 架构生成数据，并以结构化格式捕获原始事件数据，ClickHouse 架构将对这些变化具有稳健性。不过，随着新元数据的可用和查询访问模式的变化，用户希望更新架构以反映这些变化。

为了避免在架构更改期间停机，用户有几种选项，我们将在下面介绍。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](/sql-reference/statements/create/table#default) 添加列到架构中。如果在 INSERT 期间未指定，则使用指定的默认值。

在修改任何物化视图变换逻辑或 OTel 收集器配置之前，可以进行架构更改，这会导致这些新列被发送。

架构更改后，用户可以重新配置 OTel 收集器。假设用户使用 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中概述的推荐过程，其中 OTel 收集器将其数据发送到 Null 数据表引擎，具有负责提取目标架构并将结果发送到目标表以进行存储的物化视图，可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](/sql-reference/statements/alter/view) 修改视图。假设我们有如下目标表及其相应的物化视图（类似于在 "使用 SQL 提取结构" 中所用）从 OTel 结构化日志中提取目标架构：

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

假设我们希望从 `LogAttributes` 中提取一个新列 `Size`。我们可以使用 `ALTER TABLE` 将其添加到架构中，指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上述示例中，我们将默认值指定为 `LogAttributes` 中的 `size` 键（如果不存在则为 0）。这意味着访问此列的查询必须访问 Map，因此会变慢。我们也可以轻松地将此设置为常量，例如 0，从而降低后续对没有值的行的查询成本。查询该表显示值按预期从 Map 中填充：

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

为了确保此值对所有未来数据进行插入，我们可以使用如下的 `ALTER TABLE` 语法修改我们的物化视图：

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

随后的行将在插入时具有填充的 `Size` 列。

### 创建新表 {#create-new-tables}

作为上述过程的替代，用户可以简单地创建一个具有新架构的目标表。然后，任何物化视图可以修改为使用新表，使用上述的 `ALTER TABLE MODIFY QUERY`。通过这种方法，用户可以对其表进行版本控制，例如 `otel_logs_v3`。

这种方法使用户拥有多个表可供查询。为了在表之间进行查询，用户可以使用 [`merge` 函数](/sql-reference/table-functions/merge)，该函数接受通配符模式作为表名称。以下是我们通过查询 `otel_logs` 表的 v2 和 v3 进行演示：

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

如果用户希望避免使用 `merge` 函数并向最终用户提供一个结合了多个表的表，则可以使用 [Merge 表引擎](/engines/table-engines/special/merge)。我们在下面演示：

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

每当添加新表时，都可以使用 `EXCHANGE` 表语法进行更新。例如，要添加一个 v4 表，我们可以创建一个新表并与先前版本原子地交换。

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
