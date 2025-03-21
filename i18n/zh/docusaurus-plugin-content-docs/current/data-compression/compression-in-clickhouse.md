---
slug: /data-compression/compression-in-clickhouse
title: ClickHouse中的压缩
description: 选择ClickHouse压缩算法
keywords: ['压缩', '编解码', '编码']
---

ClickHouse查询性能的秘密之一就是压缩。

磁盘上的数据越少，I/O就越少，查询和插入的速度也越快。在大多数情况下，任何压缩算法在CPU方面的开销都将被I/O减少所抵消。因此，确保ClickHouse查询快速时，首先应关注数据压缩的改进。

> 关于ClickHouse为何能如此有效地压缩数据，我们推荐[这篇文章](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)。总之，作为一款面向列的数据库，值将按列顺序写入。如果这些值是有序的，相同的值将相邻存放。压缩算法利用数据的连续模式。在此基础上，ClickHouse具有编解码器和粒度数据类型，允许用户进一步调整压缩技术。

ClickHouse中的压缩将受到三个主要因素的影响：
- 排序键
- 数据类型
- 使用的编解码器

所有这些都通过模式进行配置。

## 选择正确的数据类型以优化压缩 {#choose-the-right-data-type-to-optimize-compression}

让我们以Stack Overflow数据集为例。比较`posts`表的以下模式的压缩统计数据：

- `posts` - 一种未优化类型的模式，没有排序键。
- `posts_v3` - 一种类型优化的模式，为每一列选择了适当的类型和位数，而排序键为`(PostTypeId, toDate(CreationDate), CommentCount)`。

使用以下查询，我们可以测量每一列当前的压缩和未压缩大小。让我们检查最初优化模式`posts`的大小，并且没有排序键。

```sql
SELECT name,
   formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
   formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
   round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'
GROUP BY name

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio────┐
│ Body              	│ 46.14 GiB   	  │ 127.31 GiB        │	2.76       │
│ Title             	│ 1.20 GiB    	  │ 2.63 GiB          │	2.19       │
│ Score             	│ 84.77 MiB   	  │ 736.45 MiB        │	8.69       │
│ Tags              	│ 475.56 MiB  	  │ 1.40 GiB          │	3.02       │
│ ParentId          	│ 210.91 MiB  	  │ 696.20 MiB        │ 3.3        │
│ Id                	│ 111.17 MiB  	  │ 736.45 MiB        │	6.62       │
│ AcceptedAnswerId  	│ 81.55 MiB   	  │ 736.45 MiB        │	9.03       │
│ ClosedDate        	│ 13.99 MiB   	  │ 517.82 MiB        │ 37.02      │
│ LastActivityDate  	│ 489.84 MiB  	  │ 964.64 MiB        │	1.97       │
│ CommentCount      	│ 37.62 MiB   	  │ 565.30 MiB        │ 15.03      │
│ OwnerUserId       	│ 368.98 MiB  	  │ 736.45 MiB        │ 2          │
│ AnswerCount       	│ 21.82 MiB   	  │ 622.35 MiB        │ 28.53      │
│ FavoriteCount     	│ 280.95 KiB  	  │ 508.40 MiB        │ 1853.02    │
│ ViewCount         	│ 95.77 MiB   	  │ 736.45 MiB        │	7.69       │
│ LastEditorUserId  	│ 179.47 MiB  	  │ 736.45 MiB        │ 4.1        │
│ ContentLicense    	│ 5.45 MiB    	  │ 847.92 MiB        │ 155.5      │
│ OwnerDisplayName  	│ 14.30 MiB   	  │ 142.58 MiB        │	9.97       │
│ PostTypeId        	│ 20.93 MiB   	  │ 565.30 MiB        │ 27         │
│ CreationDate      	│ 314.17 MiB  	  │ 964.64 MiB        │	3.07       │
│ LastEditDate      	│ 346.32 MiB  	  │ 964.64 MiB        │	2.79       │
│ LastEditorDisplayName │ 5.46 MiB    	  │ 124.25 MiB        │ 22.75      │
│ CommunityOwnedDate	│ 2.21 MiB    	  │ 509.60 MiB        │ 230.94     │
└───────────────────────┴─────────────────┴───────────────────┴────────────┘
```

我们在这里展示了压缩和未压缩大小。两者都很重要。压缩大小相当于我们需要从磁盘读取的内容——这方面我们希望尽量减少，以提升查询性能（和存储成本）。在读取之前，这些数据需要被解压缩。未压缩大小将依赖于所使用的数据类型。最小化这个大小将减少查询的内存开销，以及查询中必须处理的数据量，提高缓存的利用率，最终改善查询时间。

> 以上查询依赖于系统数据库中的`columns`表。这个数据库由ClickHouse进行管理，包含了有用的信息，从查询性能指标到后台集群日志。我们推荐["系统表和ClickHouse内部的窗口"](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)及相关的文章[[1]](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)[[2]](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)供感兴趣的读者参考。

为了总结表的总大小，我们可以简化以上查询：

```sql
SELECT formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table = 'posts'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 50.16 GiB   	  │ 143.47 GiB        │  2.86 │
└─────────────────┴───────────────────┴───────┘
```

对`posts_v3`重复此查询，即拥有优化类型和排序键的表，我们可以看到未压缩和压缩大小的显著减少。

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE `table` = 'posts_v3'

┌─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ 25.15 GiB   	  │ 68.87 GiB         │  2.74 │
└─────────────────┴───────────────────┴───────┘
```

完整的列细分显示通过在压缩前对数据进行排序，并使用适当的类型，`Body`、`Title`、`Tags`和`CreationDate`列取得了可观的节省。

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

通过列压缩编解码器，我们可以更改用于编码和压缩每一列的算法（及其设置）。

编码和压缩在目标上稍有不同：减小我们的数据大小。编码通过利用数据类型的性质，对我们的数据进行映射变换。相反，压缩使用通用算法在字节级别上压缩数据。

通常，编码会先应用，然后再使用压缩。由于不同的编码和压缩算法在不同值分布上有效，我们必须了解我们的数据。

ClickHouse支持大量编解码器和压缩算法。以下是按重要性排序的一些建议：

推荐                                         | 原因
---                                          |    ---
**`ZSTD`一直是最佳选择**                  | `ZSTD`压缩提供最佳的压缩率。`ZSTD(1)`应是大多数常见类型的默认设置。通过修改数字值可以尝试更高的压缩率。我们很少看到在压缩成本（插入速度较慢）上高于3的值能带来足够的好处。
**`Delta`适用于日期和整数序列**         | 每当你拥有单调序列或连续值的小增量时，基于`Delta`的编解码器表现良好。更具体地说，Delta编解码器在导数很小的情况下表现良好。如果不是，`DoubleDelta`值得一试（如果`Delta`的第一层导数已经非常小，通常增加不多）。单调增量均匀的序列将压缩得更好，例如DateTime字段。
**`Delta`可以改善`ZSTD`**                | `ZSTD`在数据增量上是有效的——反之增量编码可以改善`ZSTD`的压缩。在`ZSTD`的情况下，其他编解码器很少进一步改善效果。
**如果可能，优先选择`LZ4`而非`ZSTD`** | 如果你在`LZ4`和`ZSTD`之间得到可比的压缩，倾向于选择前者，因为它提供更快的解压和更少的CPU需求。然而，在大多数情况下，`ZSTD`的性能将比`LZ4`卓越。这些编解码器中的某些在与`LZ4`结合使用时可能工作得更快，同时与没有编解码器的`ZSTD`相比提供类似的压缩。不过，这将取决于具体数据，因此需要进行测试。
**`T64`适用于稀疏或小范围数据**      | `T64`在稀疏数据或块中范围较小时可能有效。避免对随机数使用`T64`。
**未知模式的数据使用`Gorilla`和`T64`** | 如果数据具有未知模式，尝试`Gorilla`和`T64`可能是值得的。
**`Gorilla`适用于测量数据**             | `Gorilla`在浮点数据上可能有效，特别是表示测量读数的数据，即随机波动。

见[此处](/sql-reference/statements/create/table#column_compression_codec)以获取更多选项。

下面我们为`Id`、`ViewCount`和`AnswerCount`指定`Delta`编解码器，假设这些与排序键线性相关，因此应该受益于Delta编码。

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
│ posts_v3 │ AnswerCount │ 9.67 MiB    	   │ 113.69 MiB        │ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB   	   │ 111.31 MiB        │ 10.71 │
│ posts_v3 │ Id      	 │ 159.70 MiB  	   │ 227.38 MiB        │  1.42 │
│ posts_v4 │ Id      	 │ 64.91 MiB   	   │ 222.63 MiB        │  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB   	   │ 227.38 MiB        │  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB   	   │ 222.63 MiB        │  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### ClickHouse云中的压缩 {#compression-in-clickhouse-cloud}

在ClickHouse云中，我们默认使用`ZSTD`压缩算法（默认值为1）。尽管此算法的压缩速度可能因压缩等级（等级越高=越慢）而异，但它具有在解压缩时始终保持较快速度的优点（大约20%的变动），并且还受益于可并行化的能力。我们的历史测试还表明，这种算法通常是足够有效的，甚至可以超越与编解码器结合的`LZ4`。它对大多数数据类型和信息分布都有效，因此是一种明智的通用默认选择，这也是为什么我们最初的压缩在没有优化的情况下已经表现出色。
