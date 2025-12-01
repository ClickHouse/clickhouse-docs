---
alias: []
description: 'ORC 格式说明'
input_format: true
keywords: ['ORC']
output_format: true
slug: /interfaces/formats/ORC
title: 'ORC'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

[Apache ORC](https://orc.apache.org/) 是一种列式存储格式，在 [Hadoop](https://hadoop.apache.org/) 生态系统中被广泛使用。



## 数据类型匹配 {#data-types-matching-orc}

下表比较了在 `INSERT` 和 `SELECT` 查询中支持的 ORC 数据类型及其对应的 ClickHouse [数据类型](/sql-reference/data-types/index.md)。

| ORC data type (`INSERT`)              | ClickHouse data type                                                                                              | ORC data type (`SELECT`) |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------|
| `Boolean`                             | [UInt8](/sql-reference/data-types/int-uint.md)                                                            | `Boolean`                |
| `Tinyint`                             | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)    | `Tinyint`                |
| `Smallint`                            | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `Smallint`               |
| `Int`                                 | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Int`                    |
| `Bigint`                              | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Bigint`                 |
| `Float`                               | [Float32](/sql-reference/data-types/float.md)                                                             | `Float`                  |
| `Double`                              | [Float64](/sql-reference/data-types/float.md)                                                             | `Double`                 |
| `Decimal`                             | [Decimal](/sql-reference/data-types/decimal.md)                                                           | `Decimal`                |
| `Date`                                | [Date32](/sql-reference/data-types/date32.md)                                                             | `Date`                   |
| `Timestamp`                           | [DateTime64](/sql-reference/data-types/datetime64.md)                                                     | `Timestamp`              |
| `String`, `Char`, `Varchar`, `Binary` | [String](/sql-reference/data-types/string.md)                                                             | `Binary`                 |
| `List`                                | [Array](/sql-reference/data-types/array.md)                                                               | `List`                   |
| `Struct`                              | [Tuple](/sql-reference/data-types/tuple.md)                                                               | `Struct`                 |
| `Map`                                 | [Map](/sql-reference/data-types/map.md)                                                                   | `Map`                    |
| `Int`                                 | [IPv4](/sql-reference/data-types/int-uint.md)                                                             | `Int`                    |
| `Binary`                              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                 | `Binary`                 |
| `Binary`                              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                    | `Binary`                 |
| `Binary`                              | [Decimal256](/sql-reference/data-types/decimal.md)                                                        | `Binary`                 |

- 其他类型不受支持。
- 数组可以嵌套，并且其参数可以是 `Nullable` 类型。`Tuple` 和 `Map` 类型也可以嵌套。
- ClickHouse 表列的数据类型不必与对应的 ORC 数据字段完全一致。在插入数据时，ClickHouse 会根据上表解析数据类型，然后将数据[转换](/sql-reference/functions/type-conversion-functions#cast)为为 ClickHouse 表列设置的数据类型。



## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用名为 `football.orc` 的 ORC 文件，其内容如下：

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.orc' FORMAT ORC;
```

### 读取数据 {#reading-data}

使用 `ORC` 格式来读取数据：

```sql
SELECT *
FROM football
INTO OUTFILE 'football.orc'
FORMAT ORC
```

:::tip
ORC 是一种二进制格式，无法在终端中以人类可读的形式查看。请使用 `INTO OUTFILE` 来输出 ORC 文件。
:::


## 格式设置 {#format-settings}

| 设置                                                                                                                                                                                                       | 描述                                                                                   | 默认值  |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                             | 对 String 列使用 Arrow String 类型而不是 Binary 类型。                                 | `false` |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                             | 输出 ORC 格式时使用的压缩方法。                                                        | `none`  |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                               | 在将 Arrow 列与 ClickHouse 列进行匹配时忽略大小写。                                   | `false` |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                     | 读取 Arrow 数据时允许缺失列。                                                          | `false` |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | 在对 Arrow 格式进行 schema 推断时，允许跳过包含不受支持类型的列。                     | `false` |

要与 Hadoop 进行数据交换，可以使用 [HDFS 表引擎](/engines/table-engines/integrations/hdfs.md)。
