---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse 中的压缩'
description: '选择 ClickHouse 压缩算法'
keywords: ['压缩', '编解码器', '编码']
doc_type: 'reference'
---

ClickHouse 查询性能的秘诀之一就是压缩。

磁盘上的数据越少，I/O 就越少，查询和插入就越快。大多数情况下，任何压缩算法在 CPU 上的开销都会被 I/O 减少所抵消。因此，在确保 ClickHouse 查询足够快时，提高数据压缩率应当是首要关注点。

> 关于 ClickHouse 为何能如此高效地压缩数据，推荐阅读[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简而言之，我们的列式数据库按列顺序写入值。当这些值被排序后，相同的值会彼此相邻，而压缩算法会利用数据中的连续模式。在此基础之上，ClickHouse 提供了编解码器和更细粒度的数据类型，使你可以更轻松地进一步调优压缩效果。

ClickHouse 中的压缩将受到三个主要因素的影响：

- 排序键
- 数据类型
- 所使用的编解码器

所有这些都通过 schema 进行配置。

## 选择合适的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

我们以 Stack Overflow 数据集为例，对比 `posts` 表在以下 schema（表结构）下的压缩统计信息：

* `posts` - 一个未进行类型优化且没有排序键的 schema。
* `posts_v3` - 一个经过类型优化的 schema，为每一列选择了合适的数据类型和位宽，并使用排序键 `(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以衡量每一列当前压缩和未压缩后的大小。我们先来看一下最初未使用排序键的 schema `posts` 的大小。

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
   
<summary>关于紧凑分区片段与宽分区片段的说明</summary>

如果你看到 `compressed_size` 或 `uncompressed_size` 的值为 `0`，这可能是因为分区片段（parts）的类型是 `compact` 而不是 `wide`（参见 [`system.parts`](/operations/system-tables/parts) 中 `part_type` 的描述）。
分区片段格式由 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)
和 [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) 这两个设置项控制，
这意味着如果插入数据生成的分区片段未超过上述设置项的取值，该分区片段将是紧凑（compact）而不是宽（wide），
此时你将不会看到 `compressed_size` 或 `uncompressed_size` 的非零值。

演示如下：

```sql title="查询"
-- 创建一个使用紧凑分区片段的表
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- 不足以超过 min_bytes_for_wide_part = 10485760 的默认值

-- 检查分区片段的类型
SELECT table, name, part_type from system.parts where table = 'compact';

-- 获取 compact 表的压缩和未压缩列大小
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- 创建一个使用宽分区片段的表 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- 检查分区片段的类型
SELECT table, name, part_type from system.parts where table = 'wide';

-- 获取 wide 表的压缩和未压缩大小
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'wide'
GROUP BY name;
```

```response title="响应"
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

这里我们同时展示压缩和未压缩大小，两者都很重要。压缩大小对应于我们需要从磁盘读取的数据量——这是我们希望尽量减小的，以获得更好的查询性能（以及更低的存储成本）。这些数据在读取之前需要先解压缩。在这种情况下，未压缩大小取决于所使用的数据类型。尽量减小该大小将减少查询的内存开销以及查询需要处理的数据量，从而提高缓存利用率并最终缩短查询时间。

> 上述查询依赖于 system 数据库中的 `columns` 表。该数据库由 ClickHouse 管理，是有用信息的宝库，从查询性能指标到后台集群日志应有尽有。我们推荐好奇的读者阅读 ["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 及其配套文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)。 

为了统计整张表的大小，我们可以将上述查询简化为：

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

对 `posts_v3` 表（即已优化类型和排序键的表）重复执行该查询，可以看到未压缩和已压缩的数据大小都有显著降低。

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

完整的各列明细显示，通过在压缩前对数据进行排序并使用合适的数据类型，在 `Body`、`Title`、`Tags` 和 `CreationDate` 列上实现了显著的节省效果。


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


## 为列选择合适的压缩编解码器 {#choosing-the-right-column-compression-codec}

通过列压缩编解码器，我们可以更改用于编码和压缩每一列的算法（及其设置）。

编码和压缩的工作方式略有不同，但目标相同：减小数据大小。编码会对数据应用映射，利用数据类型的特性，根据某个函数转换数值。相反，压缩使用通用算法在字节级别压缩数据。

通常会先应用编码，然后再进行压缩。由于不同的编码和压缩算法在不同的取值分布上效果不同，我们必须理解自己的数据。

ClickHouse 支持大量编解码器和压缩算法。以下是按重要性排序的一些建议：

| 建议                             | 说明                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` 优先**                  | `ZSTD` 压缩提供最佳压缩率。`ZSTD(1)` 应作为大多数常见类型的默认设置。可以通过修改数值来尝试更高的压缩率。我们很少在大于 3 的数值上看到足够的收益，来抵消其增加的压缩开销（插入更慢）。                                                                  |
| **日期和整数序列使用 `Delta`**          | 只要存在单调序列或相邻值的增量较小，`Delta` 类编解码器表现良好。更具体地说，只要导数结果为较小的数值，Delta 编解码器就能很好地工作。如果不是，值得尝试 `DoubleDelta`（如果 `Delta` 的一级导数已经非常小，则通常收益有限）。对于单调递增且步长固定的序列，压缩效果会更好，例如 DateTime 字段。 |
| **`Delta` 可提升 `ZSTD` 效果**      | `ZSTD` 在增量（delta）数据上是一个高效的编解码器——反过来说，delta 编码可以提升 `ZSTD` 的压缩效果。在使用 `ZSTD` 的情况下，其他编解码器很少能带来进一步的改进。                                                                      |
| **若可行，优先选择 `LZ4` 而不是 `ZSTD`**  | 如果在 `LZ4` 与 `ZSTD` 之间获得类似的压缩率，则优先选择前者，因为它解压速度更快且所需 CPU 更少。不过，在大多数情况下，`ZSTD` 的表现会明显优于 `LZ4`。某些编解码器与 `LZ4` 组合时，在提供与不带编解码器的 `ZSTD` 相似压缩率的同时，可能运行速度更快。然而这高度依赖具体数据，需要进行测试。  |
| **稀疏或小范围数据使用 `T64`**           | 对于稀疏数据或一个块内取值范围较小的情况，`T64` 可能有效。应避免在随机数上使用 `T64`。                                                                                                                      |
| **未知模式时尝试 `Gorilla` 和 `T64`？** | 如果数据模式未知，值得尝试 `Gorilla` 和 `T64`。                                                                                                                                       |
| **`Gorilla` 适用于 gauge 数据**     | `Gorilla` 对浮点数据可能有效，尤其是表示仪表（gauge）读数的数据，即存在随机尖峰的情况。                                                                                                                    |

更多可选项见[此处](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器，假设它们与排序键线性关联，因此应能从 Delta 编码中获益。

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

这些列在压缩方面的改进如下所示：


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

在 ClickHouse Cloud 中，我们默认使用 `ZSTD` 压缩算法（默认级别为 1）。该算法的压缩速度会随压缩级别变化（级别越高，压缩越慢），但其优点是解压速度始终较快（波动约为 20%），并且可以进行并行化处理。我们的历史测试结果也表明，该算法通常已经足够高效，甚至可以优于与 codec 组合使用的 `LZ4`。它对于大多数数据类型和数据分布都十分有效，因此是一个合理的通用默认选项，这也解释了为什么即使在尚未进行优化时，我们默认的压缩效果就已经相当出色。