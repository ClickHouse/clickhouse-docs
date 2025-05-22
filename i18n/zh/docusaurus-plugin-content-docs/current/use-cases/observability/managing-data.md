import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

# 管理数据

用于可观察性的 ClickHouse 部署通常涉及到大量数据集，这些数据需要进行管理。ClickHouse 提供了一些功能来协助数据管理。

## 分区 {#partitions}

ClickHouse 中的分区允许根据列或 SQL 表达式在磁盘上逻辑上分离数据。通过逻辑分离数据，每个分区可以独立操作，例如删除。这使得用户能够高效地在存储层之间移动分区，从而实现按时间 [过期数据/高效删除](../../sql-reference/statements/alter/partition.md) 的能力。

在通过 `PARTITION BY` 子句初始定义表时，会指定分区。该子句可以包含任何列的 SQL 表达式，其结果将定义行被发送到哪个分区。

<Image img={observability_14} alt="Partitions" size="md"/>

数据部分在磁盘上以公用文件夹名称前缀逻辑地与每个分区关联，并可以单独查询。对于下面的例子，默认的 `otel_logs` 模式按天分区，使用表达式 `toDate(Timestamp)`。当行插入到 ClickHouse 时，该表达式将对每一行进行评估，如果结果分区存在，则将行路由至该分区（如果该行是某天的第一行为，则会创建该分区）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

可以对分区执行多种操作，包括 [备份](../../sql-reference/statements/alter/partition#freeze-partition)、[列操作](../../sql-reference/statements/alter/partition#clear-column-in-partition)、变更 [基于行的数据修改](../../sql-reference/statements/alter/partition#update-in-partition)/[删除](../../sql-reference/statements/alter/partition#delete-in-partition) 数据，以及 [索引清理（例如，二级索引）](../../sql-reference/statements/alter/partition#clear-index-in-partition)。

例如，假设我们的 `otel_logs` 表按天分区。如果填充了结构化日志数据集，它将包含好几天的数据：

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

我们可能还有另一个表，`otel_logs_archive`，用来存储旧数据。可以高效地通过分区将数据移动到此表中（这只是一个元数据更改）。

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

这与其他技术形成对比，后者需要使用 `INSERT INTO SELECT` 并将数据重写到目标新表中。

:::note 移动分区
[在表之间移动分区](../../sql-reference/statements/alter/partition#move-partition-to-table) 需要满足多个条件，最重要的是表必须具有相同的结构、分区键、主键和索引/投影。在此处可以找到有关如何在 `ALTER` DDL 中指定分区的详细说明 [here](../../sql-reference/statements/alter/partition#how-to-set-partition-expression)。
:::

此外，可以按分区有效地删除数据。这比替代技术（变更或轻量级删除）要更节省资源，应该作为首选。

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
当使用设置 [`ttl_only_drop_parts=1`](../../operations/settings/merge-tree-settings#ttl_only_drop_parts) 时，此功能被 TTL 利用。有关详细信息，请参见 [使用 TTL 管理数据](#data-management-with-ttl-time-to-live)。
:::


### 应用 {#applications}

上述说明了如何高效移动和操作数据。实际上，用户可能在可观察性用例中最频繁地利用分区操作的两个场景是：

- **分层架构** - 在存储层之间移动数据（请参见 [存储层](#storage-tiers)），从而可以构建热冷架构。
- **高效删除** - 当数据达到指定的 TTL 时（请参见 [使用 TTL 管理数据](#data-management-with-ttl-time-to-live)）

我们将在下面详细探讨这两个场景。

### 查询性能 {#query-performance}

虽然分区可以帮助提高查询性能，但这主要依赖于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），性能可能会有所提升。仅在分区键不在主键中且您正在按其过滤的情况下，这种情况通常是有用的。然而，需要覆盖多个分区的查询可能比不使用分区的情况表现更差（因为可能有更多的部分）。如果分区键已经是主键中的一个早期条目，则瞄准单个分区的好处将会更不明显或不存在。如果每个分区中的值是唯一的，分区还可以被用于 [优化 GROUP BY 查询](../../engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而，通常情况下，用户应该确保主键是经过优化的，只有在访问模式确实访问特定的可预测数据子集的例外情况下，才考虑将分区作为查询优化技术，例如按天分区，大多数查询发生在最近的一天。可以在 [这里](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4) 查看此行为的示例。

## 使用 TTL（生存时间）管理数据 {#data-management-with-ttl-time-to-live}

生存时间（TTL）是 ClickHouse 提供的可观察性解决方案中的一项关键特性，用于高效的数据保留和管理，尤其是因为不断生成大量数据。在 ClickHouse 中实现 TTL 允许自动过期和删除旧数据，确保存储得到最佳利用，并在无需人工干预的情况下保持性能。这一能力对于保持数据库精简、降低存储成本至关重要，并确保查询能够快速高效地关注最相关和最新的数据。此外，它有助于遵守数据保留政策，通过系统地管理数据生命周期，从而增强可观察性解决方案的整体可持续性和可扩展性。

TTL 可以在 ClickHouse 中在表级或列级进行指定。

### 表级 TTL {#table-level-ttl}

日志和追踪的默认模式都包括一个 TTL，用于在指定时间段后过期数据。此项在 ClickHouse 导出器中通过 `ttl` 键进行指定，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

该语法当前支持 [Golang 持续时间语法](https://pkg.go.dev/time#ParseDuration)。**我们建议用户使用 `h` 并确保与分区周期一致。例如，如果按天分区，请确保它是天数的倍数，例如，24h，48h，72h。** 这将确保自动将 TTL 子句添加到表中，例如，如果 `ttl: 96h`。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

默认情况下，当 ClickHouse [合并数据部分](../../engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，会删除过期 TTL 的数据。当 ClickHouse 检测到数据过期时，会进行超调合并。

:::note 定时 TTL
TTL 不会立即应用，而是按照计划执行，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置在重复进行带删除 TTL 合并前的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，可能需要更长时间才能触发 TTL 合并。如果值过低，它会执行多次超调合并，可能会消耗大量资源。可以通过命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制过期 TTL。
:::

**重要提示：我们建议使用设置 [`ttl_only_drop_parts=1`](../../operations/settings/merge-tree-settings#ttl_only_drop_parts)。**（在默认模式下应用）启用此设置后，当其所有行到期时，ClickHouse 会删除整个部分。删除整个部分而不是部分清理过期的 TTL 行（在 `ttl_only_drop_parts=0` 时通过资源密集型变更实现）可以缩短 `merge_with_ttl_timeout` 时间并降低对系统性能的影响。如果数据按您执行 TTL 过期的相同单位进行分区，例如按天，则部分自然只包含来自定义时间段的数据。这将确保有效地应用 `ttl_only_drop_parts=1`。

### 列级 TTL {#column-level-ttl}

上述示例是在表级过期数据。用户还可以在列级过期数据。随着数据的老化，可以用来丢弃调查中不值得保留的资源开销的列。例如，我们建议保留 `Body` 列，以防添加新的动态元数据，而在插入时没有提取出来，例如，新 Kubernetes 标签。在一段时间后，例如 1 个月后，可能会明显发现这额外的元数据并没有用，因此限制保留 `Body` 列的价值。

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

## 数据重新压缩 {#recompressing-data}

虽然我们通常推荐在可观察性数据集上使用 `ZSTD(1)`，用户可以尝试不同的压缩算法或更高的压缩等级，例如 `ZSTD(3)`。除了能够在创建模式时指定这一点外，压缩还可以在设定时间后配置更改。如果编解码器或压缩算法改善了压缩，但导致较差的查询性能，则可能适用这一做法。这种权衡在查询频率较低的旧数据上可能是可以接受的，但对于最近的数据则不然，这些数据在调查中更频繁使用。

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
我们建议用户始终评估不同压缩等级和算法对插入及查询性能的影响。例如，增量编解码器可以在时间戳压缩上有所帮助。然而，如果这些成为主键的一部分，过滤性能可能会受到影响。
:::

有关配置 TTL 的进一步细节和示例可以在 [这里](../../engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 找到。有关如何为表和列添加和修改 TTL 的示例，可以在 [这里](../../engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 找到。有关 TTL 如何实现存储层次结构（例如热-温架构），请参见 [存储层](#storage-tiers)。

## 存储层 {#storage-tiers}

在 ClickHouse 中，用户可以在不同的磁盘上创建存储层，例如，将热/近期数据存储在 SSD 中，将旧数据存储在 S3 中。这种架构允许在较老的数据上使用成本较低的存储，因为其在调查中的使用频率较低，因此对查询的 SLA 较高。

:::note 不适用于 ClickHouse Cloud
ClickHouse Cloud 使用单独的数据副本，数据由 S3 进行备份，并具有基于 SSD 的节点缓存。因此，ClickHouse Cloud 中不需要存储层。
:::

创建存储层需要用户创建磁盘，然后使用这些磁盘制定存储策略，在创建表时可以指定卷。数据可以根据填充率、部分大小和卷优先级在磁盘之间自动移动。更多细节可在 [这里](../../engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 找到。

虽然数据可以使用 `ALTER TABLE MOVE PARTITION` 命令在磁盘之间手动移动，但数据在卷之间的移动也可以通过 TTL 来控制。完整示例可以在 [这里](../../guides/developer/ttl#implementing-a-hotwarmcold-architecture) 找到。

## 管理模式更改 {#managing-schema-changes}

日志和追踪模式在系统的生命周期内通常会发生变化，例如，用户监控具有不同元数据或 pod 标签的新系统。通过使用 OTel 模式生成数据，并以结构化格式捕获原始事件数据，ClickHouse 模式在这些变化中将是稳健的。然而，随着新元数据的可用性提升和查询访问模式的变化，用户将希望更新模式以反映这些发展。

为了在模式更改期间避免停机，用户有几种选择，以下是我们的建议。

### 使用默认值 {#use-default-values}

可以使用 [`DEFAULT` 值](../../sql-reference/statements/create/table#default) 将列添加到模式中。如果插入期间未指定，指定的默认值将被使用。

可以在修改任何物化视图转换逻辑或 OTel 收集器配置之前进行模式更改，以确保这些新列被发送。

一旦修改了模式，用户可以重新配置 OTel 收集器。假设用户按照 ["使用 SQL 提取结构"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) 中概述的推荐过程进行操作，其中 OTel 收集器将其数据发送到一个 Null 表引擎，物化视图负责提取目标模式并将结果发送到目标表以进行存储，可以使用 [`ALTER TABLE ... MODIFY QUERY` 语法](../../sql-reference/statements/alter/view) 修改视图。假设我们有以下目标表及其对应的物化视图（与在 "使用 SQL 提取结构" 中使用的类似）来从 OTel 结构化日志中提取目标模式：

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

假设我们希望从 `LogAttributes` 中提取一个新列 `Size`。我们可以通过使用 `ALTER TABLE` 将其添加到我们的模式中，并指定默认值：

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

在上述示例中，我们指定默认值为 `LogAttributes` 中的 `size` 键（如果不存在，则为 0）。这意味着访问此列而没有插入值的行的查询必须访问映射，因此会更慢。我们也可以轻松指定为常量，例如 0，从而降低后续查询的成本。查询此表显示该值按照预期从映射中填充：

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

为了确保未来所有数据都会插入此值，我们可以使用以下 `ALTER TABLE` 语法修改我们的物化视图：

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

作为上面过程的替代，用户可以简单地创建一个新的目标表，使用新模式。然后，任何物化视图可以使用上述 `ALTER TABLE MODIFY QUERY` 进行修改以使用新表。通过这种方式，用户可以为表版本化，例如 `otel_logs_v3`。

这种方法让用户查询多个表。要跨表查询，用户可以使用 [`merge` 函数](../../sql-reference/table-functions/merge) ，该函数接受表名称的通配符模式。我们在下面演示通过查询 `otel_logs` 表的 v2 和 v3：

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

如果用户希望避免使用 `merge` 函数，并向最终用户暴露一个结合多个表的表，可以使用 [Merge 表引擎](../../engines/table-engines/special/merge)。我们在下面演示这一点：

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

每当添加新表时，可以使用 `EXCHANGE` 表语法进行更新。例如，要添加 v4 表，我们可以创建一个新表，并与以前的版本原子交换。

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
