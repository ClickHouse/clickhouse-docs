---
alias: []
description: 'Arrow 格式文档'
input_format: true
keywords: ['Arrow']
output_format: true
slug: /interfaces/formats/Arrow
title: 'Arrow'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

[Apache Arrow](https://arrow.apache.org/) 提供两种内置的列式存储格式。ClickHouse 支持对这两种格式进行读写操作。
`Arrow` 是 Apache Arrow 的“文件模式（file mode）”格式，适用于内存中的随机访问。

## 数据类型匹配 {#data-types-matching}

下表列出了支持的数据类型，以及它们在 `INSERT` 和 `SELECT` 查询中与 ClickHouse [数据类型](/sql-reference/data-types/index.md) 的对应关系。

| Arrow data type (`INSERT`)              | ClickHouse data type                                                                                       | Arrow data type (`SELECT`) |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------|----------------------------|
| `BOOL`                                  | [Bool](/sql-reference/data-types/boolean.md)                                                               | `BOOL`                     |
| `UINT8`, `BOOL`                         | [UInt8](/sql-reference/data-types/int-uint.md)                                                             | `UINT8`                    |
| `INT8`                                  | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)                  | `INT8`                     |
| `UINT16`                                | [UInt16](/sql-reference/data-types/int-uint.md)                                                            | `UINT16`                   |
| `INT16`                                 | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)                | `INT16`                    |
| `UINT32`                                | [UInt32](/sql-reference/data-types/int-uint.md)                                                            | `UINT32`                   |
| `INT32`                                 | [Int32](/sql-reference/data-types/int-uint.md)                                                             | `INT32`                    |
| `UINT64`                                | [UInt64](/sql-reference/data-types/int-uint.md)                                                            | `UINT64`                   |
| `INT64`                                 | [Int64](/sql-reference/data-types/int-uint.md)                                                             | `INT64`                    |
| `FLOAT`, `HALF_FLOAT`                   | [Float32](/sql-reference/data-types/float.md)                                                              | `FLOAT32`                  |
| `DOUBLE`                                | [Float64](/sql-reference/data-types/float.md)                                                              | `FLOAT64`                  |
| `DATE32`                                | [Date32](/sql-reference/data-types/date32.md)                                                              | `UINT16`                   |
| `DATE64`                                | [DateTime](/sql-reference/data-types/datetime.md)                                                          | `UINT32`                   |
| `TIMESTAMP`, `TIME32`, `TIME64`         | [DateTime64](/sql-reference/data-types/datetime64.md)                                                      | `TIMESTAMP`                |
| `STRING`, `BINARY`                      | [String](/sql-reference/data-types/string.md)                                                              | `BINARY`                   |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                                    | `FIXED_SIZE_BINARY`        |
| `DECIMAL`                               | [Decimal](/sql-reference/data-types/decimal.md)                                                            | `DECIMAL`                  |
| `DECIMAL256`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                                         | `DECIMAL256`               |
| `LIST`                                  | [Array](/sql-reference/data-types/array.md)                                                                | `LIST`                     |
| `STRUCT`                                | [Tuple](/sql-reference/data-types/tuple.md)                                                                | `STRUCT`                   |
| `MAP`                                   | [Map](/sql-reference/data-types/map.md)                                                                    | `MAP`                      |
| `UINT32`                                | [IPv4](/sql-reference/data-types/ipv4.md)                                                                  | `UINT32`                   |
| `FIXED_SIZE_BINARY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                                  | `FIXED_SIZE_BINARY`        |
| `FIXED_SIZE_BINARY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                     | `FIXED_SIZE_BINARY`        |

Array 类型可以嵌套，并且可以将 `Nullable` 类型的值作为参数。`Tuple` 和 `Map` 类型同样可以嵌套。

在 `INSERT` 查询中支持使用 `DICTIONARY` 类型；对于 `SELECT` 查询，可以通过 [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary) 设置，将 [LowCardinality](/sql-reference/data-types/lowcardinality.md) 类型作为 `DICTIONARY` 类型输出。请注意，`LowCardinality` 字典中可能包含未使用的值，这会导致在输出 Arrow `DICTIONARY` 时同样包含未使用的值。

不支持的 Arrow 数据类型：

- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`

ClickHouse 表列的数据类型不必与对应的 Arrow 数据字段完全一致。插入数据时，ClickHouse 会根据上表解析数据类型，然后将数据[转换](/sql-reference/functions/type-conversion-functions#cast)为为 ClickHouse 表列所设置的数据类型。

## 使用示例 {#example-usage}

### 插入数据 {#inserting-data}

可以使用以下命令，将文件中的 Arrow 数据插入到 ClickHouse 表中：

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### 选择数据 {#selecting-data}

可以使用以下命令，从 ClickHouse 表中选择数据，并将其保存为 Arrow 格式的文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```

## 格式设置 {#format-settings}

| 设置                                                                                                                     | 描述                                                                                               | 默认值       |
|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_arrow_allow_missing_columns`                                                                               | 读取 Arrow 输入格式时允许列缺失                                                                    | `1`          |
| `input_format_arrow_case_insensitive_column_matching`                                                                    | 在将 Arrow 列与 CH 列匹配时忽略大小写                                                              | `0`          |
| `input_format_arrow_import_nested`                                                                                       | 已废弃的设置，不再产生任何效果。                                                                   | `0`          |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                             | 在推断 Arrow 格式的模式时，跳过类型不受支持的列                                                    | `0`          |
| `output_format_arrow_compression_method`                                                                                 | Arrow 输出格式的压缩方法。支持的编解码器：`lz4_frame`、`zstd`、`none`（不压缩）                    | `lz4_frame`  |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                   | 对 FixedString 列使用 Arrow 的 FIXED_SIZE_BINARY 类型而不是 Binary                                | `1`          |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                      | 启用将 LowCardinality 类型输出为 Arrow 的 Dictionary 类型                                         | `0`          |
| `output_format_arrow_string_as_string`                                                                                   | 对 String 列使用 Arrow 的 String 类型而不是 Binary                                                | `1`          |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                  | 在 Arrow 格式中始终对字典索引使用 64 位整数                                                       | `0`          |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                  | 在 Arrow 格式中对字典索引使用有符号整数                                                           | `1`          |