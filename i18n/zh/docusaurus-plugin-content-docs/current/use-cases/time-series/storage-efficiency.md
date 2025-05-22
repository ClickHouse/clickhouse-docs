
# 时间序列存储效率

在探索如何查询我们的维基百科统计数据集后，让我们专注于优化其在 ClickHouse 中的存储效率。 
本节展示了在保持查询性能的同时，减少存储需求的实用技术。

## 类型优化 {#time-series-type-optimization}

优化存储效率的一般方法是使用最佳数据类型。 
让我们来看一下 `project` 和 `subproject` 列。这些列的类型为 String，但具有相对较少的唯一值：

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

我们还对点击次数列使用了 UInt64 类型，占用 8 个字节，但最大值相对较小：

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

鉴于这个值，我们可以改用 UInt32，它仅占用 4 个字节，并允许我们存储最高约 4b 的最大值：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

这将至少将此列在内存中的大小减少 2 倍。请注意，由于压缩，磁盘上的大小将保持不变。但要小心，选择不太小的数据类型！

## 专用编解码器 {#time-series-specialized-codecs}

当我们处理顺序数据时，例如时间序列，我们可以通过使用专用编解码器进一步改善存储效率。 
一般来说，存储值之间的变化而不是它们的绝对值，这会在处理缓慢变化的数据时所需的空间大大减少：

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

我们对时间列使用了 Delta 编解码器，这非常适合时间序列数据。

正确的排序键也可以节省磁盘空间。 
由于我们通常希望按路径进行过滤，因此我们会将 `path` 添加到排序键中。
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

让我们看看每个表中数据所占的空间：

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

优化后的表在其压缩形式中占用的空间仅为原来的 1/4 多一点。
