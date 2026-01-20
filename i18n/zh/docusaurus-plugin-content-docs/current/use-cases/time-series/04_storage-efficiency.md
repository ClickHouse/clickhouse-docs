---
title: '存储效率 - 时间序列'
sidebar_label: '存储效率'
description: '提升时间序列数据的存储效率'
slug: /use-cases/time-series/storage-efficiency
keywords: ['time-series', 'storage efficiency', 'compression', 'data retention', 'TTL', 'storage optimization', 'disk usage']
show_related_blogs: true
doc_type: 'guide'
---

# 时序存储效率 \{#time-series-storage-efficiency\}

在前面学习了如何查询我们的 Wikipedia 统计数据集之后，接下来重点优化它在 ClickHouse 中的存储效率。
本节将演示一些实用技巧，在保持查询性能的同时减少存储需求。

## 类型优化 \{#time-series-type-optimization\}

提升存储效率的一般方法是使用最合适的数据类型。
以 `project` 和 `subproject` 列为例。这些列的数据类型为 String，但其不同取值的数量相对较少：

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

这意味着我们可以使用 `LowCardinality()` 数据类型，它采用基于字典的编码方式。这样 ClickHouse 会存储内部的 ID 值，而不是原始的字符串值，从而节省大量空间：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

我们还为 `hits` 列使用了 UInt64 类型，它占用 8 字节，但其最大可表示的值相对较小：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

鉴于这个取值范围，我们可以改用 UInt32，它只占用 4 字节，最大可存储约 40 亿的数值：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

这将使该列在内存中的大小至少减少一半。请注意，由于压缩的原因，磁盘上的大小将保持不变。但要注意，不要选择过小的数据类型！

## 专用编解码器 \{#time-series-specialized-codecs\}

在处理时间序列等序列型数据时，可以通过使用专用编解码器进一步提升存储效率。
总体思路是存储数值之间的差值，而不是数值本身的绝对值，这样在处理缓慢变化的数据时，可以显著减少所需的存储空间：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

我们为 `time` 列使用了 Delta 编解码器，这非常适合时序数据。

合适的排序键也可以节省磁盘空间。
由于我们通常会按路径进行过滤，我们会将 `path` 添加到排序键中。
这需要重新创建表。

下面可以看到用于创建初始表和优化后表的 `CREATE` 命令：

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

接下来我们来看一下每个表中的数据占用了多少空间：

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

经过优化的表在压缩后占用的空间减少了 4 倍多一点。
