---
title: '存储效率 - 时序数据'
sidebar_label: '存储效率'
description: '提升时序数据的存储效率'
slug: /use-cases/time-series/storage-efficiency
keywords: ['time-series', 'storage efficiency', 'compression', 'data retention', 'TTL', 'storage optimization', 'disk usage']
show_related_blogs: true
doc_type: 'guide'
---



# 时序数据存储效率

在探索了如何查询我们的 Wikipedia 统计数据集之后，我们接下来关注如何在 ClickHouse 中优化其存储效率。
本节将演示一些实用技术，在保证查询性能的前提下尽量减少存储占用。



## 类型优化 {#time-series-type-optimization}

优化存储效率的通用方法是使用最优的数据类型。
以 `project` 和 `subproject` 列为例。这些列的类型为 String,但唯一值数量相对较少:

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

这意味着我们可以使用 LowCardinality() 数据类型,它采用基于字典的编码方式。这使得 ClickHouse 存储内部值 ID 而非原始字符串值,从而节省大量空间:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

我们还为 `hits` 列使用了 UInt64 类型,它占用 8 字节,但其最大值相对较小:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

鉴于此值,我们可以改用 UInt32,它仅占用 4 字节,并允许存储最大约 40 亿的值:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

这将使该列在内存中的大小至少减少一半。请注意,由于压缩的原因,磁盘上的大小将保持不变。但要注意,不要选择过小的数据类型!


## 专用编解码器 {#time-series-specialized-codecs}

在处理时间序列等顺序数据时,我们可以通过使用专用编解码器进一步提高存储效率。
其基本思想是存储值之间的变化量而非绝对值本身,这样在处理缓慢变化的数据时可以大幅减少所需空间:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

我们对 `time` 列使用了 Delta 编解码器,这非常适合时间序列数据。

正确的排序键也可以节省磁盘空间。
由于我们通常需要按路径进行过滤,因此将 `path` 添加到排序键中。
这需要重新创建表。

下面可以看到初始表和优化表的 `CREATE` 命令:

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

让我们看看每个表中数据占用的空间大小:

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

优化后的表在压缩形式下占用的空间减少了 4 倍以上。
