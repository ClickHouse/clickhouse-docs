---
'title': '存储效率 - 时间序列'
'sidebar_label': '存储效率'
'description': '提高时间序列存储效率'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
---


# 时间序列存储效率

在探索如何查询我们的 Wikipedia 统计数据集之后，让我们集中精力优化其在 ClickHouse 中的存储效率。 
本节演示了在保持查询性能的同时减少存储需求的实用技巧。

## 类型优化 {#time-series-type-optimization}

优化存储效率的一般方法是使用最佳数据类型。 
让我们看看 `project` 和 `subproject` 列。这些列是字符串类型，但具有相对少量的唯一值：

```sql
SELECT
    uniq(project),
    uniq(subproject)
FROM wikistat;
```

```text
┌─uniq(project)─┬─uniq(subproject)─┐
│          1332 │              130 │
└───────────────┴──────────────────┘
```

这意味着我们可以使用 LowCardinality() 数据类型，它使用基于字典的编码。这使得 ClickHouse 存储内部值 ID 而不是原始字符串值，从而节省大量空间：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

我们还使用了 UInt64 类型来表示 hits 列，占用 8 个字节，但具有相对较小的最大值：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

考虑到这个值，我们可以改用 UInt32，它只占用 4 个字节，并且允许我们存储最大约 ~4b 的值：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

这将使该列在内存中的大小至少减少 2 倍。 请注意，由于压缩，磁盘上的大小将保持不变。但是要小心，选择合适大小的数据类型！

## 专用编解码器 {#time-series-specialized-codecs}

当我们处理顺序数据，如时间序列时，我们可以通过使用特殊编解码器进一步提高存储效率。 
一般思想是存储值之间的变化，而不是绝对值，这样在处理缓慢变化的数据时所需的空间会减少很多：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

我们使用了时间列的 Delta 编解码器，它非常适合时间序列数据。

正确的排序键也可以节省磁盘空间。 
由于我们通常希望按路径进行过滤，我们将 `path` 添加到排序键中。
这需要重新创建表。

下面我们可以看到初始表和优化表的 `CREATE` 命令：

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

```sql
CREATE TABLE optimized_wikistat
(
    `time` DateTime CODEC(Delta(4), ZSTD(1)),
    `project` LowCardinality(String),
    `subproject` LowCardinality(String),
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (path, time);
```

让我们看看每个表中数据所占用的空间量：

```sql
SELECT
    table,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed,
    count() AS parts
FROM system.parts
WHERE table LIKE '%wikistat%'
GROUP BY ALL;
```

```text
┌─table──────────────┬─uncompressed─┬─compressed─┬─parts─┐
│ wikistat           │ 35.28 GiB    │ 12.03 GiB  │     1 │
│ optimized_wikistat │ 30.31 GiB    │ 2.84 GiB   │     1 │
└────────────────────┴──────────────┴────────────┴───────┘
```

优化后的表在其压缩形式中占用的空间仅超过原来的 4 倍。
