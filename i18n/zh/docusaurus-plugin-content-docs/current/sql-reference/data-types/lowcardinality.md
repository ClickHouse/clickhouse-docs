---
slug: /sql-reference/data-types/lowcardinality
sidebar_position: 42
sidebar_label: LowCardinality(T)
---


# LowCardinality(T)

更改其他数据类型的内部表示为字典编码。

## Syntax {#syntax}

``` sql
LowCardinality(data_type)
```

**参数**

- `data_type` — [String](../../sql-reference/data-types/string.md), [FixedString](../../sql-reference/data-types/fixedstring.md), [Date](../../sql-reference/data-types/date.md), [DateTime](../../sql-reference/data-types/datetime.md) 和除 [Decimal](../../sql-reference/data-types/decimal.md) 之外的数字。对于某些数据类型，`LowCardinality` 的效率不高，见 [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 设置说明。

## Description {#description}

`LowCardinality` 是一种超结构，改变数据的存储方式和处理规则。ClickHouse 对 `LowCardinality` 列应用 [字典编码](https://en.wikipedia.org/wiki/Dictionary_coder)。使用字典编码数据进行操作能显著提高许多应用的 [SELECT](../../sql-reference/statements/select/index.md) 查询性能。

使用 `LowCardinality` 数据类型的效率取决于数据的多样性。如果字典包含少于 10,000 个不同值，则 ClickHouse 的数据读取和存储效率通常较高。如果字典包含超过 100,000 个不同值，则 ClickHouse 的性能可能会比使用普通数据类型差。

在处理字符串时，考虑使用 `LowCardinality` 代替 [Enum](../../sql-reference/data-types/enum.md)。`LowCardinality` 提供了更大的灵活性，通常显示出相同或更高的效率。

## Example {#example}

创建一个带有 `LowCardinality` 列的表：

``` sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## Related Settings and Functions {#related-settings-and-functions}

设置：

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

函数：

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## Related content {#related-content}

- 博客: [优化 ClickHouse 的模式和编码](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [字符串优化（俄语视频演示）](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。 [英文幻灯片](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)
