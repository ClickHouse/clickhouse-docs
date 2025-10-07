---
'title': '存储效率 - 时间序列'
'sidebar_label': '存储效率'
'description': '提高时间序列存储效率'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'guide'
---


# 时间序列存储效率

在探索如何查询我们的维基百科统计数据集后，让我们专注于优化其在 ClickHouse 中的存储效率。  
本节演示了在维护查询性能的同时减少存储需求的实际技术。

## 类型优化 {#time-series-type-optimization}

优化存储效率的一般方法是使用最佳数据类型。  
让我们看一下 `project` 和 `subproject` 列。这些列的数据类型是 String，但具有相对较少的唯一值：

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

这意味着我们可以使用 LowCardinality() 数据类型，它使用基于字典的编码。这使得 ClickHouse 存储内部值 ID，而不是原始字符串值，从而节省了大量空间：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

我们还使用了 UInt64 类型的 hits 列，它占用 8 字节，但最大值相对较小：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

考虑到这个值，我们可以改用 UInt32，它只占用 4 字节，并允许我们存储最多 ~4b 的最大值：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

这将使此列在内存中的大小减少至少 2 倍。请注意，由于压缩，磁盘上的大小将保持不变。但要小心，选择不要太小的数据类型！

## 专用编码器 {#time-series-specialized-codecs}

当我们处理顺序数据时，例如时间序列，我们可以通过使用专用编码器进一步提高存储效率。  
一般的想法是存储值之间的变化，而不是绝对值，这在处理缓慢变化的数据时所需的空间会减少很多：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

我们对时间列使用了 Delta 编码，这是时间序列数据的良好选择。

正确的排序键也可以节省磁盘空间。  
由于我们通常希望按路径进行过滤，我们将 `path` 添加到排序键中。这需要重新创建表。

下面我们可以看到我们初始表和优化表的 `CREATE` 命令：

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

优化表在压缩形式下所占的空间仅为原来的四分之一多一点。
