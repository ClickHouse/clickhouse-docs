---
'slug': '/data-compression/compression-in-clickhouse'
'title': 'ClickHouse中的数据压缩'
'description': '选择ClickHouse的数据压缩算法'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
---



ClickHouse 查询性能的秘密之一是压缩。

磁盘上的数据越少，I/O 就越少，查询和插入就越快。任何压缩算法的 CPU 开销在大多数情况下都被 I/O 的减少所抵消。因此，在确保 ClickHouse 查询快速的工作中，改善数据的压缩应该是首要关注点。

> 关于 ClickHouse 如何如此有效地压缩数据，我们推荐 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一个面向列的数据库，值会以列的顺序写入。如果这些值已排序，相同的值将彼此相邻。压缩算法利用数据的连续模式。在此之上，ClickHouse 具有编解码器和细粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse 中的压缩会受到三个主要因素的影响：
- 排序键
- 数据类型
- 使用的编解码器

所有这些都通过模式进行配置。

## 选择合适的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

我们以 Stack Overflow 数据集为例。让我们比较 `posts` 表的以下两个模式的压缩统计信息：

- `posts` - 没有排序键的非类型优化模式。
- `posts_v3` - 一个类型优化的模式，对每一列使用了合适的类型和位大小，排序键为 `(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以测量每一列的当前压缩和未压缩大小。让我们检查初始优化模式 `posts` 的大小，该模式没有排序键。

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

我们在这里展示了压缩和未压缩的大小。两者都很重要。压缩大小代表我们需要从磁盘读取的大小 - 这是我们希望减少的，以提高查询性能（和存储成本）。这些数据在读取之前需要被解压缩。未压缩大小将依赖于此情况中使用的数据类型。最小化此大小将减少查询的内存开销以及查询必须处理的数据量，提高缓存的利用率，最终改善查询时间。

> 上述查询依赖于系统数据库中的 `columns` 表。该数据库由 ClickHouse 管理，是有用信息的宝库，从查询性能指标到后台集群日志。我们推荐 ["系统表与 ClickHouse 内部的窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 和相关的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) 给好奇的读者。

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

对 `posts_v3` 重复此查询，即带有优化类型和排序键的表，我们可以看到未压缩和压缩大小的显著减少。

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

完整的列细分显示了通过在压缩之前排序数据并使用适当的类型，实现了 `Body`、`Title`、`Tags` 和 `CreationDate` 列的显著节省。

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

## 选择合适的列压缩编解码器 {#choosing-the-right-column-compression-codec}

通过列压缩编解码器，我们可以更改用于编码和压缩每一列的算法（及其设置）。

编码和压缩方式略有不同，其共同目标是减少数据大小。编码对数据应用映射，根据函数转换值，利用数据类型的属性。相反，压缩使用通用算法在字节级别压缩数据。

通常，编码首先应用，然后再使用压缩。由于不同的编码和压缩算法对不同的值分布有效，了解我们的数据至关重要。

ClickHouse 支持大量编解码器和压缩算法。以下是一些按重要性排序的建议：

推荐                                            | 理由
---                                             | ---
**`ZSTD` 一路领先**                           | `ZSTD` 压缩提供了最佳的压缩率。`ZSTD(1)` 应该是大多数常见类型的默认值。可以通过修改数值尝试更高的压缩率。我们很少看到超过 3 的值能带来足够的好处，同时增加压缩成本（插入速度变慢）。
**日期和整数序列使用 `Delta`**             | `Delta` 基础的编解码器在具有单调序列或连续值小增量的情况下效果很好。更具体地说，只要导数的值较小，Delta 编码就有效。如果不是，值得尝试 `DoubleDelta`（如果 `Delta` 的一阶导数已经非常小，通常不会增加太多）。单调递增均匀的序列，例如 DateTime 字段，将会压缩得更好。
**`Delta` 改善 `ZSTD`**                       | `ZSTD` 在 delta 数据上是一个有效的编解码器 - 反过来，delta 编码可以改善 `ZSTD` 的压缩。在 `ZSTD` 存在的情况下，其他编解码器很少能够提供进一步的改善。
**尽可能选择 `LZ4` 优于 `ZSTD`**            | 如果 `LZ4` 和 `ZSTD` 之间的压缩相当，优先选择前者，因为它提供更快的解压缩和更少的 CPU 使用。但在大多数情况下，`ZSTD` 的性能会显著优于 `LZ4`。这些编解码器中的一些可能与 `LZ4` 结合运行更快，同时相较于没有编解码器的 `ZSTD` 提供类似的压缩效果。但是，这将是数据特定的，需要测试。
**稀疏或小范围使用 `T64`**                | `T64` 在稀疏数据或块中范围较小时可能有效。避免对随机数使用 `T64`。
**未知模式使用 `Gorilla` 和 `T64`？**        | 如果数据具有未知模式，可能值得尝试 `Gorilla` 和 `T64`。
**`Gorilla` 适用于计量数据**                | `Gorilla` 对浮点数据（尤其是表示计量读数的随机峰值）可能有效。

有关更多选项，请参见 [此处](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器，假设它们将与排序键线性相关，因此应该受益于 Delta 编码。

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

在 ClickHouse Cloud 中，我们默认使用 `ZSTD` 压缩算法（默认值为 1）。虽然该算法的压缩速度可能因压缩级别（更高=更慢）而有所不同，但它的优点在于解压缩速度始终较快（约 20% 的波动），并且可以得到并行化的好处。我们的历史测试还表明，该算法通常有效且甚至可以超越结合编解码器的 `LZ4`。它对大多数数据类型和信息分布有效，因此是一个合理的通用默认选项，这也是我们最初的压缩即使在没有优化的情况下仍然很优秀的原因。
