---
description: 'LowCardinality 字符串列优化文档'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
doc_type: 'reference'
---



# LowCardinality(T) {#lowcardinalityt}

将其他数据类型的内部表示转换为字典编码。



## 语法 {#syntax}

```sql
LowCardinality(data_type)
```

**参数**

* `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)，以及除 [Decimal](../../sql-reference/data-types/decimal.md) 之外的其他数值类型。`LowCardinality` 对某些数据类型的效率较低，参见 [allow&#95;suspicious&#95;low&#95;cardinality&#95;types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 设置说明。


## 描述 {#description}

`LowCardinality` 是一种上层结构，用于改变数据的存储方式和处理规则。ClickHouse 会对 `LowCardinality` 列应用[字典编码](https://en.wikipedia.org/wiki/Dictionary_coder)。在许多应用场景下，基于字典编码数据进行 [SELECT](../../sql-reference/statements/select/index.md) 查询可以显著提升性能。

使用 `LowCardinality` 数据类型的效率取决于数据的多样性。如果字典包含少于 10,000 个不同取值，那么在大多数情况下，ClickHouse 在数据读取和存储方面会表现出更高的效率。如果字典包含超过 100,000 个不同取值，那么与使用普通数据类型相比，ClickHouse 的性能可能更差。

在处理字符串时，可以考虑使用 `LowCardinality` 来替代 [Enum](../../sql-reference/data-types/enum.md)。`LowCardinality` 在使用上提供了更高的灵活性，并且通常可以达到同等或更高的效率。



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

- 博客：[使用模式和编解码器优化 ClickHouse](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [字符串优化（俄语视频演讲）](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。[英文幻灯片](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)
