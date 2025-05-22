---
'slug': '/data-compression/compression-in-clickhouse'
'title': 'ClickHouse中的压缩'
'description': '选择ClickHouse压缩算法'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
---

One of the secrets to ClickHouse query performance is compression.

Less data on disk means less I/O and faster queries and inserts. The overhead of any compression algorithm with respect to CPU is in most cases outweighed by the reduction in IO. Improving the compression of the data should therefore be the first focus when working on ensuring ClickHouse queries are fast.

> For why ClickHouse compresses data so well, we recommended [this article](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). In summary, as a column-oriented database, values will be written in column order. If these values are sorted, the same values will be adjacent to each other. Compression algorithms exploit contiguous patterns of data. On top of this, ClickHouse has codecs and granular data types which allow users to tune the compression techniques further.

Compression in ClickHouse will be impacted by 3 principal factors:
- The ordering key
- The data types
- Which codecs are used

All of these are configured through the schema.

## Choose the right data type to optimize compression {#choose-the-right-data-type-to-optimize-compression}

Let's use the Stack Overflow dataset as an example. Let's compare compression statistics for the following schemas for the `posts` table:

- `posts` - A non type optimized schema with no ordering key.
- `posts_v3` -  A type optimized schema with the appropriate type and bit size for each column with ordering key `(PostTypeId, toDate(CreationDate), CommentCount)`.

Using the following queries, we can measure the current compressed and uncompressed size of each column. Let's examine the size of the initial optimized schema `posts` with no ordering key.

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

We show both a compressed and uncompressed size here. Both are important. The compressed size equates to what we will need to read off disk - something we want to minimize for query performance (and storage cost). This data will need to be decompressed prior to reading. The size of this uncompressed size will be dependent on the data type used in this case. Minimizing this size will reduce memory overhead of queries and the amount of data which has to be processed by the query, improving utilization of caches and ultimately query times.

> The above query relies on the table `columns` in the system database. This database is managed by ClickHouse and is a treasure trove of useful information, from query performance metrics to background cluster logs. We recommend ["System Tables and a Window into the Internals of ClickHouse"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables) and accompanying articles[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse) for the curious reader.

To summarize the total size of the table, we can simplify the above query:

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

Repeating this query for the `posts_v3`, the table with an optimized type and ordering key, we can see a significant reduction in uncompressed and compressed sizes.

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

The full column breakdown shows considerable savings for the `Body`, `Title`, `Tags` and `CreationDate` columns achieved by ordering the data prior to compression and using the appropriate types.

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

## Choosing the right column compression codec {#choosing-the-right-column-compression-codec}

With column compression codecs, we can change the algorithm (and its settings) used to encode and compress each column.

Encodings and compression work slightly differently with the same objective: to reduce our data size. Encodings apply a mapping to our data, transforming the values based on a function by exploiting properties of the data type. Conversely, compression uses a generic algorithm to compress data at a byte level.

Typically, encodings are applied first before compression is used. Since different encodings and compression algorithms are effective on different value distributions, we must understand our data.

ClickHouse supports a large number of codecs and compression algorithms. The following are some recommendations in order of importance:

Recommendation                                     | Reasoning
---                                                |    ---
**`ZSTD` all the way**                             | `ZSTD` compression offers the best rates of compression. `ZSTD(1)` should be the default for most common types. Higher rates of compression can be tried by modifying the numeric value. We rarely see sufficient benefits on values higher than 3 for the increased cost of compression (slower insertion).
**`Delta` for date and integer sequences**         | `Delta`-based codecs work well whenever you have monotonic sequences or small deltas in consecutive values. More specifically, the Delta codec works well, provided the derivatives yield small numbers. If not, `DoubleDelta` is worth trying (this typically adds little if the first-level derivative from `Delta` is already very small). Sequences where the monotonic increment is uniform, will compress even better  e.g. DateTime fields.
**`Delta` improves `ZSTD`**                        | `ZSTD` is an effective codec on delta data - conversely, delta encoding can improve `ZSTD` compression. In the presence of `ZSTD`, other codecs rarely offer further improvement.
**`LZ4` over `ZSTD` if possible**                  | if you get comparable compression between `LZ4` and `ZSTD`, favor the former since it offers faster decompression and needs less CPU. However, `ZSTD` will outperform `LZ4` by a significant margin in most cases. Some of these codecs may work faster in combination with `LZ4` while providing similar compression compared to `ZSTD` without a codec. This will be data specific, however, and requires testing.
**`T64` for sparse or small ranges**               | `T64` can be effective on sparse data or when the range in a block is small. Avoid `T64` for random numbers.
**`Gorilla` and `T64` for unknown patterns?**      | If the data has an unknown pattern, it may be worth trying `Gorilla` and `T64`.
**`Gorilla` for gauge data**                       | `Gorilla` can be effective on floating point data, specifically that which represents gauge readings, i.e. random spikes.

See [here](/sql-reference/statements/create/table#column_compression_codec) for further options.

Below we specify the `Delta` codec for the `Id`, `ViewCount` and `AnswerCount`, hypothesizing these will be linearly correlated with the ordering key and thus should benefit from Delta encoding.

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

The compression improvements for these columns is shown below:

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

### Compression in ClickHouse Cloud {#compression-in-clickhouse-cloud}

In ClickHouse Cloud, we utilize the `ZSTD` compression algorithm (with a default value of 1) by default. While compression speeds can vary for this algorithm, depending on the compression level (higher = slower), it has the advantage of being consistently fast on decompression (around 20% variance) and also benefiting from the ability to be parallelized. Our historical tests also suggest that this algorithm is often sufficiently effective and can even outperform `LZ4` combined with a codec. It is effective on most data types and information distributions, and is thus a sensible general-purpose default and why our initial earlier compression is already excellent even without optimization.

---

ClickHouse查询性能的秘密之一是压缩。

磁盘上的数据越少，I/O就越少，查询和插入就越快。在大多数情况下，任何压缩算法对CPU的开销都被I/O的减少所抵消。因此，改进数据的压缩应该是确保ClickHouse查询快速的首要任务。

> 关于ClickHouse为何能够如此有效地压缩数据，我们推荐[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一个列式数据库，值将按列顺序写入。如果这些值是排序的，相同的值将相互相邻。压缩算法利用相邻的数据模式。除此之外，ClickHouse还具有编解码器和细粒度的数据类型，允许用户进一步调整压缩技术。

ClickHouse中的压缩将受到3个主要因素的影响：
- 排序键
- 数据类型
- 使用的编码器

所有这些都通过模式进行配置。

## 选择正确的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

让我们使用Stack Overflow数据集作为示例。我们来比较`posts`表以下模式的压缩统计信息：

- `posts` - 一种没有排序键的非类型优化模式。
- `posts_v3` - 一种类型优化模式，针对每一列使用适当的类型和比特大小，排序键为`(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以测量每列当前压缩和未压缩的大小。让我们检查初始优化模式`posts`（没有排序键）的大小。

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

我们在这里显示了压缩和未压缩的大小。两者都很重要。压缩的大小等于我们需要从磁盘读取的内容——这是我们希望尽量减少以提高查询性能（和存储成本）的内容。此数据需要在读取之前进行解压缩。未压缩的大小将取决于这种情况下使用的数据类型。最小化这个大小将减少查询的内存开销和查询必须处理的数据量，从而提高缓存的利用率，最终改善查询时间。

> 上述查询依赖于系统数据库中的`columns`表。该数据库由ClickHouse管理，是关于查询性能指标到后台群集日志的宝贵信息来源。我们推荐["系统表和ClickHouse内部的窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)和相关的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)供感兴趣的读者参考。

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

对`posts_v3`重复此查询，该表具有优化类型和排序键，我们可以看到未压缩和压缩大小的显著减少。

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

完整的列细分显示通过在压缩之前对数据进行排序并使用适当类型`Body`、`Title`、`Tags`和`CreationDate`列所取得的显著节省。

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

## 选择正确的列压缩编码器 {#choosing-the-right-column-compression-codec}

使用列压缩编码器，我们可以更改用于编码和压缩每一列的算法（及其设置）。

编码和压缩的工作原理略有不同，但目的相同：减少我们的数据大小。编码对我们的数据应用映射，通过利用数据类型的属性，根据函数转换值。相反，压缩使用通用算法在字节级别上压缩数据。

通常，编码被首先应用，然后才使用压缩。由于不同的编码和压缩算法在不同的值分布中效果不同，我们必须理解我们的数据。

ClickHouse支持大量的编码器和压缩算法。以下是一些重要性排序的推荐：

推荐                                         | 理由
---                                          |    ---
**`ZSTD` 全面使用**                          | `ZSTD` 压缩提供了最佳的压缩率。`ZSTD(1)` 应该是大多数常用类型的默认值。通过修改数字值，可以尝试更高的压缩率。我们很少在压缩成本增加（插入速度较慢）的情况下看到高于3的值有足够的益处。
**`Delta` 用于日期和整数序列**              | 每当您拥有单调序列或连续值中的小增量时，基于`Delta` 的编码器效果很好。更具体地说，Delta编码器效果很好，只要其导数产生小数字。如果不是，则值得尝试`DoubleDelta`（如果来自`Delta`的第一阶导数已经很小，这通常增加不多）。在单调增量均匀的序列中，例如DateTime字段，将获得更好的压缩效果。
**`Delta` 改善 `ZSTD`**                      | `ZSTD` 是在增量数据上的有效编码器 - 反之，增量编码可以改善 `ZSTD` 压缩。在存在 `ZSTD` 的情况下，其他编码器很少提供进一步改进。
**如果可能，使用 `LZ4` 超过 `ZSTD`**        | 如果`LZ4`和`ZSTD`之间的压缩相当，请优先使用前者，因为其解压速度更快且CPU占用更少。但是，在大多数情况下，`ZSTD`将显著超越`LZ4`。这些编码器中的一些可能在与`LZ4`结合使用时速度更快，同时提供与没有编码器的`ZSTD`相似的压缩。然而，这将是特定于数据的，需要测试。
**`T64` 适用于稀疏或小范围数据**           | `T64` 可以在稀疏数据上或当一个块中的范围较小的情况下发挥有效作用。避免在随机数字中使用 `T64`。
**对于未知模式使用 `Gorilla` 和 `T64` ?**   | 如果数据具有未知模式，尝试 `Gorilla` 和 `T64` 可能是值得的。
**`Gorilla` 适用于衡量数据**                | `Gorilla` 在浮点数据上可能有效，特别是那些代表测量读数，即随机峰值的数据。

有关更多选项，请参见[这里](/sql-reference/statements/create/table#column_compression_codec)。

下面我们为`Id`、`ViewCount`和`AnswerCount`指定`Delta`编码器，假设它们将与排序键线性相关，因此应该受益于Delta编码。

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

### ClickHouse Cloud中的压缩 {#compression-in-clickhouse-cloud}

在ClickHouse Cloud中，我们默认使用`ZSTD`压缩算法（默认值为1）。虽然这种算法的压缩速度可能因压缩级别（更高=更慢）而不同，但它具有解压速度一致快速（波动约20%）的优势，并且还受益于能够并行化。我们的历史测试也表明，这种算法通常足够有效，甚至可以超过与编码器结合的`LZ4`。它对大多数数据类型和信息分布有效，因此是一个明智的通用默认值，这也是我们最初的压缩即使没有优化也已经出色的原因。
