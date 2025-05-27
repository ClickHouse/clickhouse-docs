---
'description': '估算给定列的压缩比，而不进行压缩。'
'sidebar_position': 132
'slug': '/sql-reference/aggregate-functions/reference/estimateCompressionRatio'
'title': 'estimateCompressionRatio'
---

## estimateCompressionRatio {#estimatecompressionration}

估算给定列的压缩比，而无需实际压缩。

**语法**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**参数**

- `column` - 任何类型的列

**参数**

- `codec` - 包含 [压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 的 [字符串](../../../sql-reference/data-types/string.md) 或多个以逗号分隔的编解码器的单个字符串。
- `block_size_bytes` - 压缩数据的块大小。这类似于同时设置 [`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size) 和 [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size)。默认值为 1 MiB (1048576 字节)。

这两个参数都是可选的。

**返回值**

- 返回给定列的估算压缩比。

类型: [Float64](/sql-reference/data-types/float)。

**示例**

```sql title="Input table"
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

```sql title="Query"
SELECT estimateCompressionRatio(number) AS estimate FROM compression_estimate_example;
```

```text title="Response"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
上面的结果将根据服务器的默认压缩编解码器而有所不同。请参见 [列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)。
:::

```sql title="Query"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="Response"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

该函数还可以指定多个编解码器：

```sql title="Query"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="Response"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
