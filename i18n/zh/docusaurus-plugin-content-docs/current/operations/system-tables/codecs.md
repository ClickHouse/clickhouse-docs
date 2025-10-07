---
'description': '系统表包含有关队列中编解码器的信息。'
'keywords':
- 'system table'
- 'codecs'
- 'compression'
'slug': '/operations/system-tables/codecs'
'title': 'system.codecs'
'doc_type': 'reference'
---

包含有关压缩和加密编解码器的信息。

您可以使用此表获取有关可用压缩和加密编解码器的信息。

`system.codecs` 表包含以下列（列类型以括号显示）：

- `name` ([String](../../sql-reference/data-types/string.md)) — 编解码器名称。
- `method_byte` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 表示压缩文件中的编解码器的字节。
- `is_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 如果此编解码器压缩某些内容，则为真。否则它可能只是有助于压缩的变换。
- `is_generic_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 编解码器是像 lz4，zstd 等通用压缩算法。
- `is_encryption` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 编解码器对数据进行加密。
- `is_timeseries_codec` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 编解码器用于浮点时间序列数据。
- `is_experimental` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 编解码器为实验性。
- `description` ([String](../../sql-reference/data-types/string.md)) — 对编解码器的高级描述。

**示例**

查询：

```sql
SELECT * FROM system.codecs WHERE name='LZ4'
```

结果：

```text
Row 1:
──────
name:                   LZ4
method_byte:            130
is_compression:         1
is_generic_compression: 1
is_encryption:          0
is_timeseries_codec:    0
is_experimental:        0
description:            Extremely fast; good compression; balanced speed and efficiency.
```
