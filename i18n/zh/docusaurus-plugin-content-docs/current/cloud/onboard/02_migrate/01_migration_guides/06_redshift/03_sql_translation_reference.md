---
sidebar_label: 'SQL 转换参考'
slug: /migrations/redshift/sql-translation-reference
description: '从 Amazon Redshift 迁移到 ClickHouse 的 SQL 转换参考'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 转换指南'
doc_type: 'reference'
---



# Amazon Redshift SQL 语法转换指南



## 数据类型 {#data-types}

从 Redshift 迁移数据到 ClickHouse 的用户会立即发现，ClickHouse 提供了更丰富的数据类型，且限制更少。Redshift 要求用户指定字符串的可能长度（即使是可变长度），而 ClickHouse 通过以字节形式存储字符串（无需编码），消除了这一限制和负担。因此，ClickHouse 的 String 类型没有长度限制或长度规范要求。

此外，用户可以使用 Arrays、Tuples 和 Enums——这些在 Redshift 中并非一等公民的类型（虽然可以通过 `SUPER` 模拟 Arrays/Structs），这一直是用户的痛点。ClickHouse 还支持在查询时或表中持久化聚合状态。这使得数据可以预先聚合（通常通过物化视图实现），从而显著提升常见查询的性能。

下面列出了每个 Redshift 类型对应的 ClickHouse 类型：


| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                                   |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                                  |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint)-                                                                                                                                                                                                  |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`、`UInt256`、`Int128`、`Int256`](/sql-reference/data-types/int-uint)，[`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal)- （支持高精度和大范围）                                 |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                    |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                    |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                     |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string),[`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                             |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying)**  | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                    |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                    |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [地理数据类型](/sql-reference/data-types/geo)                                                                                                                                                                                                         |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [地理空间数据类型](/sql-reference/data-types/geo)（功能相对不够完善，例如不支持坐标系——可以通过函数（参见 SQL 函数文档）进行模拟）[使用函数](/sql-reference/functions/geo/)（功能相对不完善，例如不支持坐标系 —— 可以借助函数加以模拟）                                                                                      |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple)，[`Nested`](/sql-reference/data-types/nested-data-structures/nested)，[`Array` 数组](/sql-reference/data-types/array),[`JSON`](/sql-reference/data-types/newjson),[`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime),[`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html)**                                                    | [`String`](/sql-reference/data-types/string)与……结合使用[`Bit`](/sql-reference/functions/bit-functions)和[编码](/sql-reference/functions/encoding-functions/#hex)函数                                                                                     |



<sub><span>*</span> ClickHouse 还支持范围更大的无符号整数类型，即 <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt32`、`UInt32` 和 `UInt64`</a>。</sub><br />
<sub><span>**</span>ClickHouse 的 String 类型默认没有长度上限，但可以通过使用 <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>约束（Constraints）</a> 将其限定为特定长度。</sub>



## DDL 语法 {#compression}

### 排序键 {#sorting-keys}

ClickHouse 和 Redshift 都有"排序键"的概念,用于定义数据存储时的排序方式。Redshift 使用 `SORTKEY` 子句定义排序键:

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

相比之下,ClickHouse 使用 `ORDER BY` 子句指定排序顺序:

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

在大多数情况下,假设您使用的是默认的 `COMPOUND` 类型,可以在 ClickHouse 中使用与 Redshift 相同的排序键列和顺序。向 Redshift 添加数据时,您需要运行 `VACUUM` 和 `ANALYZE` 命令来重新排序新添加的数据并更新查询规划器的统计信息 - 否则未排序空间会不断增长。而 ClickHouse 无需执行此类操作。

Redshift 为排序键提供了几个便捷特性。第一个是自动排序键(使用 `SORTKEY AUTO`)。虽然这适合快速入门,但当排序键配置最优时,显式排序键能够确保最佳性能和存储效率。第二个是 `INTERLEAVED` 排序键,它为排序键中的列子集赋予相同的权重,以便在查询使用一个或多个辅助排序列时提升性能。ClickHouse 支持显式[投影](/data-modeling/projections),通过略有不同的配置方式实现相同的效果。

用户需要注意,"主键"概念在 ClickHouse 和 Redshift 中含义不同。在 Redshift 中,主键类似于传统 RDBMS 中用于强制约束的概念。但它们在 Redshift 中并未被严格强制执行,而是作为查询规划器和节点间数据分布的提示信息。在 ClickHouse 中,主键表示用于构建稀疏主索引的列,用于确保数据在磁盘上有序存储,在最大化压缩效率的同时避免主索引污染和内存浪费。
