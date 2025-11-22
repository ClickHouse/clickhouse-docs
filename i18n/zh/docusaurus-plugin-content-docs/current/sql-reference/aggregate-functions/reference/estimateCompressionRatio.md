---
description: '在不实际进行压缩的情况下估算指定列的压缩比。'
sidebar_position: 132
slug: /sql-reference/aggregate-functions/reference/estimateCompressionRatio
title: 'estimateCompressionRatio'
doc_type: 'reference'
---



## estimateCompressionRatio {#estimatecompressionration}

估算给定列的压缩比,无需实际压缩。

**语法**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**参数**

- `column` - 任意类型的列

**可选参数**

- `codec` - [String](../../../sql-reference/data-types/string.md) 类型,包含单个[压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)或在单个字符串中以逗号分隔的多个编解码器。
- `block_size_bytes` - 压缩数据的块大小。此参数的效果类似于同时设置 [`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size) 和 [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size)。默认值为 1 MiB(1048576 字节)。

以上两个参数均为可选。

**返回值**

- 返回给定列的估算压缩比。

类型:[Float64](/sql-reference/data-types/float)。

**示例**

```sql title="输入表"
CREATE TABLE compression_estimate_example
(
    `number` UInt64
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO compression_estimate_example
SELECT number FROM system.numbers LIMIT 100_000;
```

```sql title="查询"
SELECT estimateCompressionRatio(number) AS estimate FROM compression_estimate_example;
```

```text title="响应"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
上述结果会因服务器的默认压缩编解码器而异。请参阅[列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)。
:::

```sql title="查询"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="响应"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

该函数还可以指定多个编解码器:

```sql title="查询"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="响应"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
