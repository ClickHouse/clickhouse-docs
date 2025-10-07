---
'sidebar_label': 'SQL 翻译参考'
'slug': '/migrations/redshift/sql-translation-reference'
'description': 'Amazon Redshift 到 ClickHouse 的 SQL 翻译参考'
'keywords':
- 'Redshift'
'title': 'Amazon Redshift SQL 翻译指南'
'doc_type': 'reference'
---


# Amazon Redshift SQL 翻译指南

## 数据类型 {#data-types}

在 ClickHouse 和 Redshift 之间移动数据的用户会立即注意到，ClickHouse 提供了更广泛的类型范围，并且限制更少。虽然 Redshift 要求用户指定可能的字符串长度，即使是可变的，ClickHouse 通过以字节形式存储字符串来消除这种限制和负担。因此，ClickHouse 的 String 类型没有限制或长度规范要求。

此外，用户可以利用数组、元组和枚举——这些在 Redshift 中不存在作为一流公民（尽管可以用 `SUPER` 模拟数组/结构）并且是用户的常见挫折。ClickHouse 还允许在查询时或甚至在表中持久化聚合状态。这将使数据能够进行预聚合，通常使用物化视图，并且可以显著提高常见查询的性能。

下面我们将每个 Redshift 类型映射到相应的 ClickHouse 类型：

| Redshift                                                                                                                           | ClickHouse                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                       |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                      |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                                                                                                                                                                      |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - (支持高精度和范围)                                                                                                                                                                       |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                                                                                                                                                                                         |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                                                                                                                                                                                         |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                                                                                                                                                                                          |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                                                                                                                                                                     |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                                                                                                                                                                                         |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                                                                                                                                                                                         |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [地理数据类型](/sql-reference/data-types/geo)                                                                                                                                                                                                                                                                                                                                                                    |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [地理数据类型](/sql-reference/data-types/geo) (发展较少，例如没有坐标系统 - 可以通过 [函数](/sql-reference/functions/geo/) 模拟)                                                                                                                                                                                                                        |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                                                                                                                                                                                     |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map) |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                                                                                                                                   |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | [`String`](/sql-reference/data-types/string) 结合 [`Bit`](/sql-reference/functions/bit-functions) 和 [Encoding](/sql-reference/functions/encoding-functions/#hex) 函数                                                                                                                                                                      |

<sub><span>*</span> ClickHouse 还支持具有扩展范围的无符号整数，即 <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`, `UInt32`, `UInt32` 和 `UInt64`</a>。</sub><br />
<sub><span>**</span> ClickHouse 的 String 类型默认没有长度限制，但可以通过使用 <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>约束</a> 来限制特定长度。</sub>

## DDL 语法 {#compression}

### 排序键 {#sorting-keys}

ClickHouse 和 Redshift 都有“排序键”的概念，它定义了数据在存储时如何排序。Redshift 使用 `SORTKEY` 子句定义排序键：

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

相对而言，ClickHouse 使用 `ORDER BY` 子句来指定排序顺序：

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

在大多数情况下，您可以在 ClickHouse 中使用与 Redshift 相同的排序键列和顺序，假设您使用的是默认的 `COMPOUND` 类型。当数据添加到 Redshift 时，您应该运行 `VACUUM` 和 `ANALYZE` 命令来重新排序新添加的数据并更新查询计划器的统计信息——否则，未排序的空间会增加。ClickHouse 不需要此类过程。

Redshift 支持一些方便的排序键功能。第一个是自动排序键（使用 `SORTKEY AUTO`）。虽然这可能适合入门，但显式排序键确保最佳性能和存储效率。第二个是 `INTERLEAVED` 排序键，它对排序键中的一组列赋予相等的权重，从而在查询使用一个或多个备用排序列时提高性能。ClickHouse 支持显式的 [投影](/data-modeling/projections)，可以通过略微不同的设置实现相同的效果。

用户应注意，“主键”概念在 ClickHouse 和 Redshift 中代表不同的事物。在 Redshift 中，主键类似于传统的关系数据库管理系统中的概念，旨在实施约束。然而，它们在 Redshift 中并不严格执行，而是作为查询计划器和节点之间数据分布的提示。在 ClickHouse 中，主键表示用于构建稀疏主索引的列，该索引用于确保数据在磁盘上排序，从而最大化压缩，同时避免主索引的污染和浪费内存。
