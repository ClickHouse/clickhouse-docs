---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse 中的压缩'
description: '选择 ClickHouse 压缩算法'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse 查询性能的秘诀之一是压缩。 

磁盘上的数据越少，所需的 I/O 就越少，查询和插入就越快。大多数情况下，任何压缩算法在 CPU 方面的开销都会被 I/O 减少所抵消。因此，在确保 ClickHouse 查询足够快速时，提高数据压缩率应该是首要关注点。

> 关于 ClickHouse 为何能够如此高效地压缩数据，我们建议阅读[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简单来说，我们的列式数据库按列顺序写入值。当这些值经过排序后，相同的值会彼此相邻，压缩算法可以利用数据中的连续模式。在此基础上，ClickHouse 还提供了 codec 和粒度更细的数据类型，便于你进一步轻松调优压缩效果。

ClickHouse 中的压缩效果主要会受到三个关键因素的影响：

- 排序键
- 数据类型
- 所使用的 codec

所有这些都通过 schema 进行配置。

## 选择合适的数据类型以优化压缩 \{#choose-the-right-data-type-to-optimize-compression\}

让我们以 Stack Overflow 数据集为例，对比 `posts` 表在以下表结构下的压缩统计信息：

* `posts` - 未针对数据类型进行优化、且没有排序键的表结构。
* `posts_v3` - 针对数据类型进行了优化的表结构，为每一列选择了合适的数据类型和位宽，并使用 `(PostTypeId, toDate(CreationDate), CommentCount)` 作为排序键。

使用以下查询，我们可以测量每一列当前压缩后和未压缩的大小。让我们先来看一下没有排序键的初始优化表结构 `posts` 的大小。

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
   
<summary>关于 compact 与 wide 分区片段的说明</summary>

如果你发现 `compressed_size` 或 `uncompressed_size` 的值为 `0`，这可能是因为分区片段的类型是 `compact` 而不是 `wide`（参见 [`system.parts`](/operations/system-tables/parts) 中 `part_type` 的描述）。
分区片段的格式由 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) 和 [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) 这两个设置项控制。这意味着，如果插入的数据生成的分区片段没有超过上述设置项的取值，那么该分区片段将是 compact 而不是 wide，因此你将不会看到 `compressed_size` 或 `uncompressed_size` 的非零值。

示例如下：

```sql title="Query"
-- 创建一个使用 compact 分区片段的表
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number 
AS SELECT * FROM numbers(100000); -- 不足以超过 min_bytes_for_wide_part = 10485760 的默认值

-- 检查分区片段的类型
SELECT table, name, part_type from system.parts where table = 'compact';

-- 获取 compact 表的压缩与未压缩列大小
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- 创建一个使用 wide 分区片段的表 
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- 检查分区片段的类型
SELECT table, name, part_type from system.parts where table = 'wide';

-- 获取 wide 表的压缩与未压缩大小
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

我们在这里展示了压缩和未压缩两种大小。二者都很重要。压缩后的大小等同于我们需要从磁盘读取的数据量——为了查询性能（以及存储成本），我们希望将其尽可能减小。这些数据在读取前需要被解压缩。在这种情况下，未压缩数据的大小将取决于所使用的数据类型。尽量减小这部分大小可以减少查询的内存开销以及查询需要处理的数据量，从而提升缓存利用率，并最终缩短查询时间。

> 上述查询依赖于 system 数据库中的 `columns` 表。该数据库由 ClickHouse 管理，是信息极其丰富的“宝库”，从查询性能指标到集群后台日志应有尽有。对于感兴趣的读者，我们推荐阅读 ["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 以及配套的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)。 

为了统计整张表的大小，我们可以将上面的查询简化为：

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

针对 `posts_v3` 这张采用了优化类型和排序键的表重复运行相同的查询，可以看到未压缩和已压缩的数据大小都有显著减少。

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

完整的列级明细显示，通过在压缩前对数据进行排序并使用合适的数据类型，在 `Body`、`Title`、`Tags` 和 `CreationDate` 列上实现了可观的空间节省。


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


## 选择合适的列压缩编解码器 \{#choosing-the-right-column-compression-codec\}

通过列压缩编解码器，我们可以更改用于对每一列进行编码和压缩的算法（及其设置）。

编码和压缩的工作方式略有不同，但目标相同：减少数据大小。编码通过对数据应用映射，利用数据类型的特性，基于某种函数来转换数值。相应地，压缩则是使用通用算法在字节级对数据进行压缩。

通常会先应用编码，然后再进行压缩。由于不同的编码和压缩算法在不同的值分布上效果不同，我们必须了解自己的数据特性。

ClickHouse 支持大量编解码器和压缩算法。以下是按重要性排序的一些推荐：

| Recommendation                                | Reasoning                                                                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ZSTD` all the way**                        | `ZSTD` 压缩提供最佳压缩率。`ZSTD(1)` 应作为大多数常见类型的默认选项。可以通过调整括号中的数值来尝试更高的压缩率。但在数值大于 3 时，我们很少看到在考虑更高压缩开销（插入变慢）后仍然足够显著的收益。                                                                    |
| **`Delta` for date and integer sequences**    | 基于 `Delta` 的编解码器在存在单调序列或相邻值差值较小的情况下效果很好。更具体地说，只要导数结果为较小数值，Delta 编解码器就能很好地工作。如果不是，值得尝试 `DoubleDelta`（如果 `Delta` 的一阶导数已经很小，这通常不会带来太多额外收益）。对于单调递增且步长固定的序列（例如 DateTime 字段），压缩效果会更好。 |
| **`Delta` improves `ZSTD`**                   | `ZSTD` 在 delta 数据上是一个高效的编解码器——反过来，delta 编码可以提升 `ZSTD` 的压缩效果。在使用 `ZSTD` 的情况下，其他编解码器很少能带来进一步的改进。                                                                                  |
| **`LZ4` over `ZSTD` if possible**             | 如果在 `LZ4` 与 `ZSTD` 之间得到相近的压缩率，应优先选择前者，因为其解压速度更快且需要更少的 CPU。然而在大多数场景中，`ZSTD` 的表现会显著优于 `LZ4`。某些编解码器在与 `LZ4` 组合使用时可能运行更快，同时在压缩率上与不带编解码器的 `ZSTD` 相近。不过这高度依赖具体数据，需要通过测试验证。            |
| **`T64` for sparse or small ranges**          | `T64` 在稀疏数据或块内取值范围较小时可能非常有效。避免在随机数上使用 `T64`。                                                                                                                                    |
| **`Gorilla` and `T64` for unknown patterns?** | 如果数据模式未知，可能值得尝试 `Gorilla` 和 `T64`。                                                                                                                                              |
| **`Gorilla` for gauge data**                  | `Gorilla` 对浮点型数据尤其有效，特别是那些表示仪表读数（例如随机尖峰）的数据。                                                                                                                                    |

更多选项参见[此处](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器，假设这些字段与排序键（ordering key）线性相关，因此应能从 Delta 编码中受益。

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

这些列的压缩优化效果如下：


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


### ClickHouse Cloud 中的压缩 \\{#compression-in-clickhouse-cloud\\}

在 ClickHouse Cloud 中，我们默认使用压缩级别为 1 的 `ZSTD` 压缩算法。该算法的压缩速度会随压缩级别变化（级别越高速度越慢），但其解压缩速度始终较快（波动约在 20% 以内），并且还支持良好的并行化。我们的历史测试结果表明，该算法通常已经足够高效，甚至在与其他 codec 搭配使用时也可以优于 `LZ4`。它对大多数数据类型和数据分布都有效，因此是一个合理的通用默认选择，也解释了为什么即便不做进一步优化，我们的初始压缩效果就已经非常出色。