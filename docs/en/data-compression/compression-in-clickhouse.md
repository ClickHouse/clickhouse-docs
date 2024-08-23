---
slug: /en/data-compression/compression-in-clickhouse
title: Compression in ClickHouse
description: Choosing ClickHouse compression algorithms
keywords: [compression, codec, encoding]
displayed_sidebar: dataCompression
---

One of the secrets to ClickHouse query performance is compression. 

Less data on disk means less I/O and faster queries and inserts. The overhead of any compression algorithm with respect to CPU will in most cases be out weighted by the reduction in IO. Improving the compression of the data should therefore be the first focus when working on ensuring ClickHouse queries are fast.

> For why ClickHouse compresses data so well, we recommended [this article](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema). In summary, as a column-oriented database, values will be written in column order. If these values are sorted, the same values will be adjacent to each other. Compression algorithms exploit contiguous patterns of data. On top of this, ClickHouse has codecs and granular data types which allow users to tune the compression techniques further.

Compression in ClickHouse will be impacted by 3 principal factors:
- The ordering key
- The data types
- Which codecs are used

All of these are configured through the schema.

## Choose the right data type to optimize compression

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

┌─name──────────────────┬─compressed_size─┬─uncompressed_size─┬───ratio─┐
│ Body              	│ 46.14 GiB   	│ 127.31 GiB    	│	2.76 │
│ Title             	│ 1.20 GiB    	│ 2.63 GiB      	│	2.19 │
│ Score             	│ 84.77 MiB   	│ 736.45 MiB    	│	8.69 │
│ Tags              	│ 475.56 MiB  	│ 1.40 GiB      	│	3.02 │
│ ParentId          	│ 210.91 MiB  	│ 696.20 MiB    	│ 	3.3 │
│ Id                	│ 111.17 MiB  	│ 736.45 MiB    	│	6.62 │
│ AcceptedAnswerId  	│ 81.55 MiB   	│ 736.45 MiB    	│	9.03 │
│ ClosedDate        	│ 13.99 MiB   	│ 517.82 MiB    	│   37.02 │
│ LastActivityDate  	│ 489.84 MiB  	│ 964.64 MiB    	│	1.97 │
│ CommentCount      	│ 37.62 MiB   	│ 565.30 MiB    	│   15.03 │
│ OwnerUserId       	│ 368.98 MiB  	│ 736.45 MiB    	│   	2 │
│ AnswerCount       	│ 21.82 MiB   	│ 622.35 MiB    	│   28.53 │
│ FavoriteCount     	│ 280.95 KiB  	│ 508.40 MiB    	│ 1853.02 │
│ ViewCount         	│ 95.77 MiB   	│ 736.45 MiB    	│	7.69 │
│ LastEditorUserId  	│ 179.47 MiB  	│ 736.45 MiB    	│ 	4.1 │
│ ContentLicense    	│ 5.45 MiB    	│ 847.92 MiB    	│   155.5 │
│ OwnerDisplayName  	│ 14.30 MiB   	│ 142.58 MiB    	│	9.97 │
│ PostTypeId        	│ 20.93 MiB   	│ 565.30 MiB    	│  	27 │
│ CreationDate      	│ 314.17 MiB  	│ 964.64 MiB    	│	3.07 │
│ LastEditDate      	│ 346.32 MiB  	│ 964.64 MiB    	│	2.79 │
│ LastEditorDisplayName │ 5.46 MiB    	│ 124.25 MiB    	│   22.75 │
│ CommunityOwnedDate	│ 2.21 MiB    	│ 509.60 MiB    	│  230.94 │
└───────────────────────┴─────────────────┴───────────────────┴─────────┘
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
│ 50.16 GiB   	│ 143.47 GiB    	│  2.86 │
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
│ 25.15 GiB   	│ 68.87 GiB     	│  2.74 │
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

## Choosing the right column compression codec

With column compression codecs, we can change the algorithm (and its settings) used to encode and compress each column.

Encodings and compression work slightly differently with the same objective: to reduce our data size. Encodings apply a mapping to our data, transforming the values based on a function by exploiting properties of the data type. Conversely, compression uses a generic algorithm to compress data at a byte level.

Typically, encodings are applied first before compression is used. Since different encodings and compression algorithms are effective on different value distributions, we must understand our data.

ClickHouse supports a large number of codecs and compression algorithms. The following are some recommendations in order of importance:

- **`ZSTD` all the way** - `ZSTD`compression offers the best rates of compression. `ZSTD(1)` should be the default for most common types. Higher rates of compression can be tried by modifying the numeric value. We rarely see sufficient benefits on values higher than 3 for the increased cost of compression (slower insertion).
- **`Delta` for date and integer sequences** - `Delta`-based codecs work well whenever you have monotonic sequences or small deltas in consecutive values. More specifically, the Delta codec works well, provided the derivatives yield small numbers. If not, `DoubleDelta` is worth trying (this typically adds little if the first-level derivative from `Delta` is already very small). Sequences where the monotonic increment is uniform, will compress even better  e.g. date time fields.
- **Delta improves `ZSTD`** - `ZSTD` is an effective codec on delta data - conversely, delta encoding can improve `ZSTD` compression. In the presence of `ZSTD`, other codecs rarely offer further improvement.
- **`LZ4` over `ZSTD` if possible** - if you get comparable compression between `LZ4` and `ZSTD`, favor the former since it offers faster decompression and needs less CPU. However, `ZSTD` will outperform `LZ4` by a significant margin in most cases. Some of these codecs may work faster in combination with `LZ4` while providing similar compression compared to `ZSTD` without a codec. This will be data specific, however, and requires testing.
- **`T64` for sparse or small ranges** - `T64` can be effective on sparse data or when the range in a block is small. Avoid `T64` for random numbers.
- **Maybe `Gorilla` and `T64` for unknown patterns** - If the data has an unknown pattern, it may be worth trying `Gorilla` and `T64`.
- **`Gorilla` for gauge data** - `Gorilla`'s can be effective on floating point data, specifically that which represents gauge readings, i.e., random spikes

See [here](/en/sql-reference/statements/create/table#column_compression_codec) for further options.

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
│ posts_v3 │ AnswerCount │ 9.67 MiB    	│ 113.69 MiB    	│ 11.76 │
│ posts_v4 │ AnswerCount │ 10.39 MiB   	│ 111.31 MiB    	│ 10.71 │
│ posts_v3 │ Id      	│ 159.70 MiB  	│ 227.38 MiB    	│  1.42 │
│ posts_v4 │ Id      	│ 64.91 MiB   	│ 222.63 MiB    	│  3.43 │
│ posts_v3 │ ViewCount   │ 45.04 MiB   	│ 227.38 MiB    	│  5.05 │
│ posts_v4 │ ViewCount   │ 52.72 MiB   	│ 222.63 MiB    	│  4.22 │
└──────────┴─────────────┴─────────────────┴───────────────────┴───────┘

6 rows in set. Elapsed: 0.008 sec
```

### Compression in ClickHouse Cloud

In ClickHouse Cloud, we utilize the `ZSTD` compression algorithm (with a default value of 1) by default. While compression speeds can vary for this algorithm, depending on the compression level (higher = slower), it has the advantage of being consistently fast on decompression (around 20% variance) and also benefiting from the ability to be parallelized. Our historical tests also suggest that this algorithm is often sufficiently effective and can even outperform `LZ4` combined with a codec. It is effective on most data types and information distributions, and is thus a sensible general-purpose default and why our initial earlier compression is already excellent even without optimization.
