One of the secrets to ClickHouse query performance is compression. 

Less data on disk means less I/O and faster queries and inserts. The overhead of any compression algorithm with respect to CPU is in most cases outweighed by the reduction in I/O. Improving the compression of the data should therefore be the first focus when working on ensuring ClickHouse queries are fast.

> For why ClickHouse compresses data so well, we recommended [this article](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). In summary, as a column-oriented database, values will be written in column order. If these values are sorted, the same values will be adjacent to each other. Compression algorithms exploit contiguous patterns of data. On top of this, ClickHouse has codecs and granular data types which allow users to tune the compression techniques further.

Compression in ClickHouse will be impacted by 3 principal factors:
- The ordering key
- The data types
- Which codecs are used

All of these are configured through the schema.

## 选择正确的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

让我们以 Stack Overflow 数据集为例。我们来比较 `posts` 表的以下架构的压缩统计信息：

- `posts` - 一个没有类型优化且没有排序键的架构。
- `posts_v3` - 一个具有适当类型和位大小的优化类型架构，排序键为 `(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以测量每列当前的压缩和未压缩大小。让我们检查初始优化架构 `posts` 的大小，不带排序键。

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

这里展示了压缩和未压缩的大小。两个都是重要的。压缩大小与我们需要从磁盘读取的大小相等 - 这是我们希望最小化以提高查询性能（和存储成本）。在读取之前，这些数据需要被解压。未压缩大小将依赖于使用的数据类型。在这种情况下，最小化此大小将减小查询的内存开销以及查询需要处理的数据量，从而提高缓存的利用率，最终改善查询时间。

> 上述查询依赖于系统数据库中的 `columns` 表。此数据库由 ClickHouse 管理，是有用信息的宝藏，从查询性能指标到后台集群日志。我们推荐阅读 ["系统表及其在 ClickHouse 内部的窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) 和伴随的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) 以满足好奇的读者。

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

对 `posts_v3` 进行此查询，即具有优化类型和排序键的表，我们可以看到未压缩和压缩大小的显著减少。

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

完整的列细分显示，通过在压缩之前对数据进行排序，`Body`、`Title`、`Tags` 和 `CreationDate` 列取得了可观的节省。

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

编码和压缩的工作方式略有不同，但目标相同：减少我们的数据大小。编码是对我们的数据应用映射，基于函数根据数据类型的特性转换值。相反，压缩使用通用算法在字节级压缩数据。

通常，编码首先应用，然后再使用压缩。由于不同的编码和压缩算法对不同的值分布效果不同，因此我们必须了解我们的数据。

ClickHouse 支持大量的编解码器和压缩算法。以下是一些按重要性排序的建议：

建议                                            | 理由
---                                             | ---
**`ZSTD` 一路走到底**                          | `ZSTD` 压缩提供最佳的压缩率。对于大多数常见类型，`ZSTD(1)` 应该是默认值。可以通过修改数值尝试更高的压缩率。我们很少看到在值高于 3 时，由于压缩（插入更慢）带来的收益。
**`Delta` 用于日期和整数序列**                | 只要存在单调序列或连续值中的小增量，`Delta` 基础的编解码器表现良好。更具体地说，Delta 编解码器表现良好，前提是导数产生小值。如果不是，值得尝试 `DoubleDelta`（通常在 `Delta` 的一阶导数已经很小时，增加的效果有限）。在单调增量均匀的序列上，压缩效果会更好，例如 DateTime 字段。
**`Delta` 改进 `ZSTD`**                         | `ZSTD` 是处理增量数据的有效编解码器 - 反之，增量编码可以改善 `ZSTD` 压缩。在存在 `ZSTD` 的情况下，其他编解码器很少提供进一步的改进。
**如有可能，`LZ4` 优先于 `ZSTD`**            | 如果 `LZ4` 和 `ZSTD` 之间获得了相当的压缩，则倾向于前者，因为它提供更快的解压，并需要更少的 CPU。然而，在大多数情况下，`ZSTD` 将显著超越 `LZ4`。某些编解码器可能与 `LZ4` 结合时速度更快，同时提供与不使用编解码器的 `ZSTD` 相似的压缩。然而，这将取决于具体数据，并需要测试。
**`T64` 用于稀疏数据或小范围**              | `T64` 对稀疏数据或块中的范围较小时可能有效。避免在随机数上使用 `T64`。
**对于未知模式使用 `Gorilla` 和 `T64`?**       | 如果数据具有未知模式，尝试 `Gorilla` 和 `T64` 可能是值得的。
**针对仪表数据使用 `Gorilla`**                  | `Gorilla` 对浮点数据（特别是表示仪表读数的数据）有效，即随机的峰值。

有关进一步选项，请参见 [这里](/sql-reference/statements/create/table#column_compression_codec)。

在此，我们为 `Id`、`ViewCount` 和 `AnswerCount` 指定 `Delta` 编解码器，假设这些与排序键将是线性相关的，因此应受益于增量编码。

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

在 ClickHouse Cloud 中，我们默认使用 `ZSTD` 压缩算法（默认值为 1）。虽然压缩速度可能会因压缩级别（越高 = 越慢）而有所不同，但该算法的优势在于其在解压时始终快速（约 20% 的变化），并且还有并行化的能力。我们的历史测试还表明，该算法通常效果足够好，甚至可能超过与编解码器结合使用的 `LZ4`。它对大多数数据类型和信息分布有效，因此是一个合理的通用默认值，这就是为何我们初步的压缩在没有优化的情况下已经表现得很好。
