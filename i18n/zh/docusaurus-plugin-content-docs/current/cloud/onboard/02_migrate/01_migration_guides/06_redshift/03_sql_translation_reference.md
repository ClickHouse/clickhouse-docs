---
sidebar_label: 'SQL 语法对照参考'
slug: /migrations/redshift/sql-translation-reference
description: 'Amazon Redshift 到 ClickHouse 的 SQL 语法对照参考'
keywords: ['Redshift']
title: 'Amazon Redshift SQL 语法对照指南'
doc_type: 'reference'
---



# Amazon Redshift SQL 转换指南 {#amazon-redshift-sql-translation-guide}



## 数据类型 {#data-types}

在 ClickHouse 与 Redshift 之间迁移数据的用户会立刻注意到，ClickHouse 提供的类型范围更广，而且限制更少。Redshift 要求用户指定字符串的可能长度，即使是可变长度；而 ClickHouse 通过以原始字节的形式存储字符串，取消了这一限制和负担。因此，ClickHouse 的 `String` 类型没有长度限制或长度声明要求。

此外，用户可以利用 `Array`、`Tuple` 和 `Enum`——这些在 Redshift 中并不存在为一等公民（尽管可以通过 `SUPER` 模拟 Array/Struct），这也是用户常见的痛点。ClickHouse 还允许在查询时，甚至在表中，将聚合状态持久化保存。这样可以对数据进行预聚合，通常使用物化视图，从而显著提升常见查询的性能。

下面我们为每种 Redshift 类型给出对应的 ClickHouse 类型映射：



| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                   |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                  |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - （支持高精度和大取值范围）                           |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                     |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                      |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                             |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                     |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                     |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [地理数据类型](/sql-reference/data-types/geo)                                                                                                                                                                                                          |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [地理数据类型](/sql-reference/data-types/geo)（目前功能相对不完善，例如尚不支持坐标系——可以借助[函数](/sql-reference/functions/geo/)进行模拟）                                                                                                                                        |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                 |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                           |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | 将 [`String`](/sql-reference/data-types/string) 与 [`Bit`](/sql-reference/functions/bit-functions) 和 [Encoding](/sql-reference/functions/encoding-functions/#hex) 函数组合使用                                                                           |



<sub><span>*</span> ClickHouse 此外还支持具有扩展取值范围的无符号整数类型，即 <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`、`UInt32`、`UInt32` 和 `UInt64`</a>。</sub><br />
<sub><span>**</span>ClickHouse 的 String 类型默认不受长度限制，但可以通过使用 <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>约束（Constraints）</a> 将其限定为特定长度。</sub>



## DDL 语法 {#compression}

### 排序键 {#sorting-keys}

ClickHouse 和 Redshift 都有“排序键”的概念，用于定义数据在存储时的排序方式。Redshift 使用 `SORTKEY` 子句来定义排序键：

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

相比之下，ClickHouse 使用 `ORDER BY` 子句来指定排序顺序：

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

在大多数情况下，只要你使用默认的 `COMPOUND` 类型，就可以在 ClickHouse 中使用与 Redshift 相同的排序键列及其顺序。向 Redshift 添加数据后，应当运行 `VACUUM` 和 `ANALYZE` 命令，对新添加的数据重新排序并更新供查询规划器使用的统计信息——否则，未排序空间会不断增长。ClickHouse 无需执行这样的过程。

Redshift 为排序键提供了几个便捷功能。其一是自动排序键（使用 `SORTKEY AUTO`）。虽然这在入门阶段可能比较合适，但当排序键设计合理时，显式指定排序键可以确保获得最佳的性能和存储效率。第二个是 `INTERLEAVED` 排序键，它对排序键中某个列子集赋予相同权重，以在查询使用一个或多个次级排序列时提升性能。ClickHouse 支持显式的 [projections](/data-modeling/projections)，通过略有不同的配置方式达到相同的效果。

用户应当注意，“primary key” 概念在 ClickHouse 和 Redshift 中代表的含义不同。在 Redshift 中，primary key 类似传统关系型数据库（RDBMS）中用于强制约束的主键概念。不过，这些约束在 Redshift 中并不会被严格强制执行，而是作为查询规划器以及节点间数据分布的提示。在 ClickHouse 中，primary key 表示用于构建稀疏主索引的列，用来确保数据在磁盘上的有序性，在避免主索引被“污染”和浪费内存的同时最大化压缩率。
