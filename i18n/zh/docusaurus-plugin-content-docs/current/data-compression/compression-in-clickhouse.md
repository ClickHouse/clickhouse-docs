---
'slug': '/data-compression/compression-in-clickhouse'
'title': 'ClickHouse 中的压缩'
'description': '选择 ClickHouse 压缩算法'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
'doc_type': 'reference'
---

ClickHouse 查询性能的秘密之一是压缩。

磁盘上的数据越少，I/O 就越少，查询和插入的速度也就越快。与 CPU 相关的任何压缩算法的开销在大多数情况下被 I/O 的减少所抵消。因此，改进数据的压缩应是确保 ClickHouse 查询快速的首要任务。

> 关于为什么 ClickHouse 可以如此有效地压缩数据，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一种列式数据库，值将按列顺序写入。如果这些值经过排序，相同的值将彼此相邻。压缩算法利用连续的数据模式。在此基础上，ClickHouse 具有编解码器和细粒度数据类型，使用户能够进一步调整压缩技术。

ClickHouse 中的压缩将受到 3 个主要因素的影响：
- 排序键
- 数据类型
- 使用的编解码器

所有这些都通过架构进行配置。

## 选择正确的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

我们以 Stack Overflow 数据集为例。我们将比较 `posts` 表的以下架构的压缩统计数据：

- `posts` - 无类型优化架构，没有排序键。
- `posts_v3` - 针对每列选择适当类型和位大小的类型优化架构，排序键为 `(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以测量每一列当前的压缩和未压缩大小。让我们检查初始优化架构 `posts`（没有排序键）的大小。

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body                  │ 46.14 GiB       │ 127.31 GiB        │ 2.76       │
│ Title                 │ 1.20 GiB        │ 2.63 GiB          │ 2.19       │
│ Score                 │ 84.77 MiB       │ 736.45 MiB        │ 8.69       │
│ Tags                  │ 475.56 MiB      │ 1.40 GiB          │ 3.02       │
│ ParentId              │ 210.91 MiB      │ 696.20 MiB        │ 3.3        │
│ Id                    │ 111.17 MiB      │ 736.45 MiB        │ 6.62       │
│ AcceptedAnswerId      │ 81.55 MiB       │ 736.45 MiB        │ 9.03       │
│ ClosedDate            │ 13.99 MiB       │ 517.82 MiB        │ 37.02      │
│ LastActivityDate      │ 489.84 MiB      │ 964.64 MiB        │ 1.97       │
│ CommentCount          │ 37.62 MiB       │ 565.30 MiB        │ 15.03      │
│ OwnerUserId           │ 368.98 MiB      │ 736.45 MiB        │ 2          │
│ AnswerCount           │ 21.82 MiB       │ 622.35 MiB        │ 28.53      │
│ FavoriteCount         │ 280.95 KiB      │ 508.40 MiB        │ 1853.02    │
│ ViewCount             │ 95.77 MiB       │ 736.45 MiB        │ 7.69       │
│ LastEditorUserId      │ 179.47 MiB      │ 736.45 MiB        │ 4.1        │
│ ContentLicense        │ 5.45 MiB        │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName      │ 14.30 MiB       │ 142.58 MiB        │ 9.97       │
│ PostTypeId            │ 20.93 MiB       │ 565.30 MiB        │ 27         │
│ CreationDate          │ 314.17 MiB      │ 964.64 MiB        │ 3.07       │
│ LastEditDate          │ 346.32 MiB      │ 964.64 MiB        │ 2.79       │
│ LastEditorDisplayName │ 5.46 MiB        │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate    │ 2.21 MiB        │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

<details>
   
<summary>有关紧凑与宽分片的说明</summary>

如果您看到的 `compressed_size` 或 `uncompressed_size` 值等于 `0`，这可能是因为片段的类型是 `compact` 而不是 `wide`（请参阅 [`system.parts`](/operations/system-tables/parts) 中 `part_type` 的描述）。部分格式由设置 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) 和 [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) 控制，这意味着如果插入的数据导致一个部分没有超过上述设置的值，该部分将是紧凑的，而不是宽的，并且您将无法看到 `compressed_size` 或 `uncompressed_size` 的值。

为了演示：

```sql title="Query"
-- Create a table with compact parts
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- Not big enough to exceed default of min_bytes_for_wide_part = 10485760

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'compact';

-- Get the compressed and uncompressed column sizes for the compact table
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- Create a table with wide parts 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- Check the type of the parts
SELECT table, name, part_type from system.parts where table = 'wide';

-- Get the compressed and uncompressed sizes for the wide table
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="Response"
   ┌─table───┬─name──────┬─part_type─┐
1. │ compact │ all_1_1_0 │ Compact   │
   └─────────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 0.00 B          │ 0.00 B            │   nan │
   └────────┴─────────────────┴───────────────────┴───────┘
   ┌─table─┬─name──────┬─part_type─┐
1. │ wide  │ all_1_1_0 │ Wide      │
   └───────┴───────────┴───────────┘
   ┌─name───┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
1. │ number │ 392.31 KiB      │ 390.63 KiB        │     1 │
   └────────┴─────────────────┴───────────────────┴───────┘
```

</details>

我们在这里展示了压缩和未压缩的大小。两者都很重要。压缩大小表示我们需要从磁盘读取的内容 - 我们希望尽量减少这一点以提高查询性能（和存储成本）。这部分数据在读取之前需要解压。这个未压缩大小的大小将取决于使用的数据类型。最小化这个大小将减少查询的内存开销，以及必须由查询处理的数据量，从而提高缓存的利用率，最终改善查询时间。

> 上述查询依赖于系统数据库中的 `columns` 表。这个数据库由 ClickHouse 管理，是有用信息的宝库，从查询性能指标到后台集群日志。我们推荐给好奇的读者 ["系统表和 ClickHouse 内部的窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 和附随的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)。

为了总结表的总大小，我们可以简化上述查询：

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB       │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

针对 `posts_v3` 的重复查询，此表具有优化的数据类型和排序键，我们可以看到未压缩和压缩大小显著减少。

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB       │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

完整的列细分显示通过在压缩之前对数据进行排序并使用适当的类型，`Body`、`Title`、`Tags` 和 `CreationDate` 列获得了可观的节省。

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
│ Body                  │ 23.10 GiB       │ 63.63 GiB         │    2.75 │
│ Title                 │ 614.65 MiB      │ 1.28 GiB          │    2.14 │
│ Score                 │ 40.28 MiB       │ 227.38 MiB        │    5.65 │
│ Tags                  │ 234.05 MiB      │ 688.49 MiB        │    2.94 │
│ ParentId              │ 107.78 MiB      │ 321.33 MiB        │    2.98 │
│ Id                    │ 159.70 MiB      │ 227.38 MiB        │    1.42 │
│ AcceptedAnswerId      │ 40.34 MiB       │ 227.38 MiB        │    5.64 │
│ ClosedDate            │ 5.93 MiB        │ 9.49 MiB          │     1.6 │
│ LastActivityDate      │ 246.55 MiB      │ 454.76 MiB        │    1.84 │
│ CommentCount          │ 635.78 KiB      │ 56.84 MiB         │   91.55 │
│ OwnerUserId           │ 183.86 MiB      │ 227.38 MiB        │    1.24 │
│ AnswerCount           │ 9.67 MiB        │ 113.69 MiB        │   11.76 │
│ FavoriteCount         │ 19.77 KiB       │ 147.32 KiB        │    7.45 │
│ ViewCount             │ 45.04 MiB       │ 227.38 MiB        │    5.05 │
│ LastEditorUserId      │ 86.25 MiB       │ 227.38 MiB        │    2.64 │
│ ContentLicense        │ 2.17 MiB        │ 57.10 MiB         │   26.37 │
│ OwnerDisplayName      │ 5.95 MiB        │ 16.19 MiB         │    2.72 │
│ PostTypeId            │ 39.49 KiB       │ 56.84 MiB         │ 1474.01 │
│ CreationDate          │ 181.23 MiB      │ 454.76 MiB        │    2.51 │
│ LastEditDate          │ 134.07 MiB      │ 454.76 MiB        │    3.39 │
│ LastEditorDisplayName │ 2.15 MiB        │ 6.25 MiB          │    2.91 │
│ CommunityOwnedDate    │ 824.60 KiB      │ 1.34 MiB          │    1.66 │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘
```

## 选择正确的列压缩编解码器 {#choosing-the-right-column-compression-codec}

使用列压缩编解码器，我们可以更改用于编码和压缩每列的算法（及其设置）。

编码和压缩的工作原理略有不同，但目标都是减少我们的数据大小。编码对数据应用映射，利用数据类型的属性根据函数转变值。相反，压缩使用通用算法在字节级别压缩数据。

通常，编码先应用，然后再使用压缩。由于不同的编码和压缩算法对不同值分布的有效性不同，因此我们必须了解我们的数据。

ClickHouse 支持大量编解码器和压缩算法。以下是一些按重要性排序的推荐：

推荐                                           | 理由
---                                            | ---
**`ZSTD` 一路支持**                            | `ZSTD` 压缩提供最佳的压缩率。`ZSTD(1)` 应是大多数常见类型的默认值。可以通过修改数字值尝试更高的压缩率。对于压缩增益，我们很少看到超过 3 的值在增加压缩成本（插入速度较慢）时有足够的获益。
**日期和整数序列使用 `Delta`**              | 当您拥有单调序列或连续值的小增量时，基于 `Delta` 的编解码器效果很好。更具体地说，Delta 编解码器在其导数生成小数字时效果良好。如果没有，值得尝试 `DoubleDelta`（如果 `Delta` 的一级导数已经非常小，这通常不会增加太多）。单调增量均匀的序列将得到更好的压缩，例如 DateTime 字段。
**`Delta` 改善 `ZSTD`**                       | `ZSTD` 是 Delta 数据上有效的编解码器 - 相反，delta 编码可以改善 `ZSTD` 压缩。在存在 `ZSTD` 的情况下，其他编解码器很少提供进一步的改善。
**如果可能，优先使用 `LZ4` 而不是 `ZSTD`** | 如果您在 `LZ4` 和 `ZSTD` 之间获得可比的压缩，优先选择前者，因为它提供更快的解压缩并需要更少的 CPU。但是，在大多数情况下，`ZSTD` 将显著超越 `LZ4`。其中一些编解码器可能与 `LZ4` 组合使用时运行更快，同时在没有编解码器的情况下提供与 `ZSTD` 相似的压缩。但这将是特定于数据的，并需要测试。
**对稀疏或小范围数据使用 `T64`**        | `T64` 在稀疏数据或块中的范围较小时可能非常有效。避免在随机数上使用 `T64`。
**不确定模式使用 `Gorilla` 和 `T64`？**     | 如果数据具有不确定模式，尝试使用 `Gorilla` 和 `T64` 可能是值得的。
**对测量数据使用 `Gorilla`**                | `Gorilla` 对浮点数据是有效的，特别是代表测量读数的数据，即随机峰值。

有关更多选项，请参见 [此处](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器，假设这些会与排序键线性相关，从而应从 Delta 编码中受益。

```sql
CREATE TABLE posts_v4
(
        `Id` Int32 CODEC(Delta, ZSTD),
        `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta, ZSTD),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC'),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta, ZSTD),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

这些列的压缩改进如下所示：

```sql
SELECT
    `table`,
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE (name IN ('Id', 'ViewCount', 'AnswerCount')) AND (`table` IN ('posts_v3', 'posts_v4'))
GROUP BY
    `table`,
    name
ORDER BY
    name ASC,
    `table` ASC

┌─table────┬─name────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ posts_v3 │ AnswerCount │ 9.67 MiB        │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB       │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id          │ 159.70 MiB      │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id          │ 64.91 MiB       │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB       │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB       │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### ClickHouse Cloud 中的压缩 {#compression-in-clickhouse-cloud}

在 ClickHouse Cloud 中，我们默认使用 `ZSTD` 压缩算法（默认值为 1）。虽然压缩速度可能会因压缩级别而异（更高 = 更慢），但它的优点在于解压缩速度始终较快（约 20% 的波动）且具有并行化的能力。我们的历史测试还表明，这种算法通常效果足够好，甚至可以优于与编解码器结合使用的 `LZ4`。它对大多数数据类型和信息分布有效，因此是一个合理的通用默认选项，这也是我们早期压缩在没有优化的情况下已经非常出色的原因。
