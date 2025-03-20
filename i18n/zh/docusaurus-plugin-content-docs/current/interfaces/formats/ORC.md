---
title: ORC
slug: /interfaces/formats/ORC
keywords: ['ORC']
input_format: true
output_format: true
alias: []
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

[Apache ORC](https://orc.apache.org/) 是一种广泛用于 [Hadoop](https://hadoop.apache.org/) 生态系统的列式存储格式。

## 数据类型匹配 {#data-types-matching-orc}

下表比较了支持的 ORC 数据类型及其对应的 ClickHouse [数据类型](/sql-reference/data-types/index.md) 在 `INSERT` 和 `SELECT` 查询中的使用。

| ORC 数据类型 (`INSERT`)              | ClickHouse 数据类型                                                                                              | ORC 数据类型 (`SELECT`) |
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

- 不支持其他类型。
- 数组可以嵌套，并且可以作为参数使用 `Nullable` 类型的值。`Tuple` 和 `Map` 类型也可以嵌套。
- ClickHouse 表列的数据类型不必与对应的 ORC 数据字段匹配。在插入数据时，ClickHouse 根据上表解释数据类型，然后 [转换](/sql-reference/functions/type-conversion-functions#cast) 数据为 ClickHouse 表列设置的数据类型。

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data-orc}

您可以使用以下命令从文件插入 ORC 数据到 ClickHouse 表中：

```bash
$ cat filename.orc | clickhouse-client --query="INSERT INTO some_table FORMAT ORC"
```

### 选择数据 {#selecting-data-orc}

您可以从 ClickHouse 表中选择数据，并使用以下命令将其保存为 ORC 格式的文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT ORC" > {filename.orc}
```

## 格式设置 {#format-settings}

| 设置                                                                                                                                                                                                      | 描述                                                                                | 默认值 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                             | 对于字符串列使用箭头字符串类型而不是二进制。                                          | `false` |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                             | 输出 ORC 格式中使用的压缩方法。默认值                                                | `none`  |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                               | 忽略大小写以匹配 Arrow 列与 ClickHouse 列。                                           | `false` |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                     | 读取 Arrow 数据时允许缺少列。                                                        | `false` |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | 允许在进行 Arrow 格式的模式推断时跳过不支持的类型列。                              | `false` |

要与 Hadoop 交换数据，您可以使用 [HDFS 表引擎](/engines/table-engines/integrations/hdfs.md)。
