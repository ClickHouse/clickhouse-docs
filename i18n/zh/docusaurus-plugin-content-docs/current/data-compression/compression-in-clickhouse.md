---
slug: /data-compression/compression-in-clickhouse
title: 'ClickHouse 中的压缩'
description: '如何选择 ClickHouse 压缩算法'
keywords: ['compression', 'codec', 'encoding']
doc_type: 'reference'
---

ClickHouse 查询性能的一个关键因素就是压缩。 

磁盘上的数据越少，I/O 越少，查询和写入就越快。在大多数情况下，任意压缩算法在 CPU 方面引入的开销都会被 I/O 的减少所抵消。因此，在优化 ClickHouse 查询性能时，提高数据压缩率应当是首要关注点。

> 要了解 ClickHouse 为什么能把数据压缩得如此出色，我们推荐阅读 [这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。简而言之，作为一款列式数据库，数据是按列顺序写入的。如果这些值经过排序，相同的值会彼此相邻。压缩算法正是利用这种连续的数据模式。在此基础上，ClickHouse 还提供了多种 codec 和更细粒度的数据类型，使用户可以进一步调优压缩方式。

ClickHouse 中的压缩主要受三个因素影响：
- 排序键
- 数据类型
- 所使用的 codec

以上这些都通过表结构进行配置。



## 选择合适的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

以 Stack Overflow 数据集为例,我们来比较 `posts` 表以下几种模式的压缩统计信息:

- `posts` - 未进行类型优化且无排序键的模式。
- `posts_v3` - 经过类型优化的模式,每列都使用了合适的类型和位大小,排序键为 `(PostTypeId, toDate(CreationDate), CommentCount)`。

通过以下查询,我们可以测量每列当前的压缩和未压缩大小。下面我们来查看无排序键的初始模式 `posts` 的大小。

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
   
<summary>关于紧凑部分与宽部分的说明</summary>


如果您看到 `compressed_size` 或 `uncompressed_size` 的值为 `0`,这可能是因为数据分区的类型是 `compact` 而不是 `wide`(请参阅 [`system.parts`](/operations/system-tables/parts) 中关于 `part_type` 的说明)。
数据分区格式由设置 [`min_bytes_for_wide_part`](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) 和 [`min_rows_for_wide_part`](/operations/settings/merge-tree-settings#min_rows_for_wide_part) 控制,这意味着如果插入的数据生成的分区未超过上述设置的值,该分区将采用 compact 格式而非 wide 格式,您将看不到 `compressed_size` 或 `uncompressed_size` 的值。

演示如下:

```sql title="Query"
-- 创建一个使用 compact 分区的表
CREATE TABLE compact (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
AS SELECT * FROM numbers(100000); -- 数据量不足以超过 min_bytes_for_wide_part = 10485760 的默认值

-- 检查分区的类型
SELECT table, name, part_type from system.parts where table = 'compact';

-- 获取 compact 表的列压缩和未压缩大小
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'compact'
GROUP BY name;

-- 创建一个使用 wide 分区的表
CREATE TABLE wide (
  number UInt32
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part=0
AS SELECT * FROM numbers(100000);

-- 检查分区的类型
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

这里显示了压缩和未压缩两种大小,两者都很重要。压缩大小对应我们需要从磁盘读取的数据量——为了查询性能(和存储成本),我们希望将其最小化。这些数据在读取之前需要解压缩。未压缩大小取决于所使用的数据类型。最小化此大小将减少查询的内存开销以及查询需要处理的数据量,从而提高缓存利用率并最终缩短查询时间。

> 上述查询依赖于系统数据库中的 `columns` 表。该数据库由 ClickHouse 管理,包含大量有用信息,从查询性能指标到后台集群日志应有尽有。我们向有兴趣的读者推荐["系统表与 ClickHouse 内部机制窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)及其配套文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)。

要汇总表的总大小,我们可以简化上述查询:


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

在对类型和排序键都已优化的表 `posts_v3` 重新执行此查询后，我们可以看到未压缩和已压缩数据的大小都有显著减少。

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

完整的列明细显示，对于 `Body`、`Title`、`Tags` 和 `CreationDate` 列，通过在压缩前对数据进行排序并使用合适的数据类型，可以实现可观的存储节省。

```sql
SELECT
    name,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'
GROUP BY name
```


┌─name──────────────────┬─compressed&#95;size─┬─uncompressed&#95;size─┬───ratio─┐
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
```


## 选择合适的列压缩编解码器 {#choosing-the-right-column-compression-codec}

通过列压缩编解码器,我们可以更改用于编码和压缩每一列的算法(及其设置)。

编码和压缩的工作方式略有不同,但目标相同:减少数据大小。编码通过利用数据类型的特性,基于函数对数据应用映射来转换值。而压缩则使用通用算法在字节级别压缩数据。

通常,先应用编码,然后再使用压缩。由于不同的编码和压缩算法对不同的值分布效果不同,因此我们必须了解数据的特征。

ClickHouse 支持大量的编解码器和压缩算法。以下是按重要性排序的一些建议:

| 建议                                | 原因                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **全面使用 `ZSTD`**                        | `ZSTD` 压缩提供最佳的压缩率。`ZSTD(1)` 应该是大多数常见类型的默认选择。可以通过修改数值来尝试更高的压缩率。对于高于 3 的值,我们很少看到足够的收益来抵消增加的压缩成本(插入速度变慢)。                                                                                                                                      |
| **对日期和整数序列使用 `Delta`**    | 当存在单调序列或连续值之间的增量较小时,基于 `Delta` 的编解码器效果很好。更具体地说,只要导数产生较小的数字,Delta 编解码器就能很好地工作。如果不是这样,值得尝试 `DoubleDelta`(如果 `Delta` 的一阶导数已经很小,这通常不会带来太多额外收益)。单调增量均匀的序列将压缩得更好,例如 DateTime 字段。 |
| **`Delta` 改善 `ZSTD`**                   | `ZSTD` 是处理增量数据的有效编解码器 - 反过来,增量编码可以改善 `ZSTD` 压缩效果。在使用 `ZSTD` 的情况下,其他编解码器很少能提供进一步的改进。                                                                                                                                                                                                                                                 |
| **如果可能,优先使用 `LZ4` 而非 `ZSTD`**             | 如果 `LZ4` 和 `ZSTD` 的压缩效果相当,请优先选择前者,因为它提供更快的解压缩速度并且需要更少的 CPU 资源。然而,在大多数情况下,`ZSTD` 的性能将明显优于 `LZ4`。某些编解码器与 `LZ4` 结合使用时可能工作得更快,同时提供与不使用编解码器的 `ZSTD` 相似的压缩效果。但这取决于具体数据,需要进行测试。                              |
| **对稀疏数据或小范围使用 `T64`**          | `T64` 对稀疏数据或块中范围较小的情况很有效。避免对随机数使用 `T64`。                                                                                                                                                                                                                                                                                                                                      |
| **对未知模式使用 `Gorilla` 和 `T64`?** | 如果数据具有未知模式,可能值得尝试 `Gorilla` 和 `T64`。                                                                                                                                                                                                                                                                                                                                                                                   |
| **对仪表数据使用 `Gorilla`**                  | `Gorilla` 对浮点数据很有效,特别是表示仪表读数的数据,即随机峰值数据。                                                                                                                                                                                                                                                                                                                                         |

有关更多选项,请参见[此处](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器,假设这些字段将与排序键线性相关,因此应该能从 Delta 编码中受益。

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


这些列的压缩改进效果如下所示:

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

返回 6 行。耗时:0.008 秒
```

### ClickHouse Cloud 中的压缩 {#compression-in-clickhouse-cloud}

在 ClickHouse Cloud 中,我们默认使用 `ZSTD` 压缩算法(默认级别为 1)。虽然该算法的压缩速度会因压缩级别而异(级别越高速度越慢),但它的优势在于解压缩速度始终保持较快(波动约 20%),并且支持并行化处理。我们的历史测试表明,该算法通常具有足够的有效性,甚至可以超越 `LZ4` 与编解码器的组合。它对大多数数据类型和信息分布都表现良好,因此是一个合理的通用默认选择,这也解释了为什么即使不进行优化,我们的初始压缩效果就已经非常出色。
