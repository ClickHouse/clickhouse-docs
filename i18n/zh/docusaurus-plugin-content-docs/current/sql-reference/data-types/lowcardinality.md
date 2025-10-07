---
'description': 'LowCardinality 优化用于字符串列的文档'
'sidebar_label': 'LowCardinality(T)'
'sidebar_position': 42
'slug': '/sql-reference/data-types/lowcardinality'
'title': 'LowCardinality(T)'
'doc_type': 'reference'
---


# LowCardinality(T)

将其他数据类型的内部表示更改为字典编码。

## Syntax {#syntax}

```sql
LowCardinality(data_type)
```

**参数**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md) 和除 [Decimal](../../sql-reference/data-types/decimal.md) 之外的数字。对某些数据类型，`LowCardinality` 并不高效，请参阅 [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 设置的说明。

## 描述 {#description}

`LowCardinality` 是一种超级结构，改变了数据存储方法和数据处理规则。ClickHouse 在 `LowCardinality` 列上应用 [字典编码](https://en.wikipedia.org/wiki/Dictionary_coder)。使用字典编码的数据进行操作显著提高了许多应用程序的 [SELECT](../../sql-reference/statements/select/index.md) 查询性能。

使用 `LowCardinality` 数据类型的效率依赖于数据的多样性。如果字典中包含少于 10,000 个不同值，则 ClickHouse 在数据读取和存储方面通常显示出更高的效率。如果字典中包含超过 100,000 个不同值，则 ClickHouse 在使用普通数据类型时表现可能会更差。

在处理字符串时，考虑使用 `LowCardinality` 代替 [Enum](../../sql-reference/data-types/enum.md)。`LowCardinality` 提供了更多的使用灵活性，并且通常表现出相同或更高的效率。

## 示例 {#example}

创建一个包含 `LowCardinality` 列的表：

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## 相关设置和函数 {#related-settings-and-functions}

设置：

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

函数：

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## 相关内容 {#related-content}

- 博客：[使用模式和编解码优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [字符串优化（俄语视频演示）](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。 [英文幻灯片](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)
