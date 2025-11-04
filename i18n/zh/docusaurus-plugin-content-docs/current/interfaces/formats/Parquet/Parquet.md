---
'alias': []
'description': 'Parquet 格式的文档'
'input_format': true
'keywords':
- 'Parquet'
'output_format': true
'slug': '/interfaces/formats/Parquet'
'title': 'Parquet'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

[Apache Parquet](https://parquet.apache.org/) 是在 Hadoop 生态系统中广泛使用的列式存储格式。ClickHouse 支持对该格式的读写操作。

## Data types matching {#data-types-matching-parquet}

下表显示了支持的数据类型以及它们在 `INSERT` 和 `SELECT` 查询中与 ClickHouse [数据类型](/sql-reference/data-types/index.md) 的匹配关系。

| Parquet 数据类型（`INSERT`）                     | ClickHouse 数据类型                                                                                          | Parquet 数据类型（`SELECT`）   |
|------------------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------|
| `BOOL`                                        | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                        |
| `UINT8`, `BOOL`                               | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                       |
| `INT8`                                        | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                        |
| `UINT16`                                      | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                      |
| `INT16`                                       | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                       |
| `UINT32`                                      | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                      |
| `INT32`                                       | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                       |
| `UINT64`                                      | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                      |
| `INT64`                                       | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                       |
| `FLOAT`                                       | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT`                       |
| `DOUBLE`                                      | [Float64](/sql-reference/data-types/float.md)                                                      | `DOUBLE`                      |
| `DATE`                                        | [Date32](/sql-reference/data-types/date.md)                                                        | `DATE`                        |
| `TIME (ms)`                                   | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                  | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                   |
| `STRING`, `BINARY`                            | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                     | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                     |
| `LIST`                                        | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                        |
| `STRUCT`                                      | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                      |
| `MAP`                                         | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                         |
| `UINT32`                                      | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_LENGTH_BYTE_ARRAY`     |
| `JSON`                                        | [JSON](/sql-reference/data-types/newjson.md)                                                          | `JSON`                        |

数组可以嵌套，并且可以将 `Nullable` 类型作为参数。`Tuple` 和 `Map` 类型也可以嵌套。

不支持的 Parquet 数据类型包括：
- `FIXED_SIZE_BINARY`
- `UUID`
- `ENUM`。

ClickHouse 表列的数据类型可以与插入的 Parquet 数据的相应字段不同。在插入数据时，ClickHouse 根据上表解释数据类型，然后将数据 [转换](/sql-reference/functions/type-conversion-functions#cast) 为 ClickHouse 表列设置的数据类型。

## Example usage {#example-usage}

### Inserting data {#inserting-data}

使用包含以下数据的 Parquet 文件，命名为 `football.parquet`：

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
INSERT INTO football FROM INFILE 'football.parquet' FORMAT Parquet;
```

### Reading data {#reading-data}

使用 `Parquet` 格式读取数据：

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet 是一种二进制格式，在终端上不会以人类可读的形式显示。使用 `INTO OUTFILE` 输出 Parquet 文件。
:::

要与 Hadoop 交换数据，可以使用 [`HDFS table engine`](/engines/table-engines/integrations/hdfs.md)。

## Format settings {#format-settings}

| Setting                                                                        | Description                                                                                                                                                                                                                       | Default     |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                        | 匹配 Parquet 列与 CH 列时忽略大小写。                                                                                                                                                                                                     | `0`         |
| `input_format_parquet_preserve_order`                                          | 读取 Parquet 文件时避免重新排序行。通常会使速度变慢。                                                                                                                                                                                  | `0`         |
| `input_format_parquet_filter_push_down`                                        | 读取 Parquet 文件时，根据 WHERE/PREWHERE 表达式和 Parquet 元数据中的最小/最大统计信息跳过整个行组。                                                                                                                             | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                  | 读取 Parquet 文件时，根据 WHERE 表达式和 Parquet 元数据中的布隆过滤器跳过整个行组。                                                                                                                                                 | `0`         |
| `input_format_parquet_use_native_reader`                                       | 读取 Parquet 文件时使用原生读取器，而不是箭头读取器。                                                                                                                                                                               | `0`         |
| `input_format_parquet_allow_missing_columns`                                   | 读取 Parquet 输入格式时允许缺少列。                                                                                                                                                                                                   | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | 本地读取（文件）所需的最小字节数，以进行查找，而不是在 Parquet 输入格式中忽略读取。                                                                                                                                                | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                               | 在 parquet 解析期间启用行组预取。目前，只有单线程解析可以预取。                                                                                                                                                                 | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | 在 Parquet 格式的模式推断中跳过具有不受支持类型的列。                                                                                                                                                                            | `0`         |
| `input_format_parquet_max_block_size`                                          | Parquet 读取器的最大块大小。                                                                                                                                                                                                      | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet 读取器输出的平均块字节。                                                                                                                                                                                                    | `16744704`  |
| `input_format_parquet_enable_json_parsing`                                     | 读取 Parquet 文件时，将 JSON 列解析为 ClickHouse JSON 列。                                                                                                                                                                       | `1`         |
| `output_format_parquet_row_group_size`                                         | 目标行组大小（以行计）。                                                                                                                                                                                                            | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                   | 目标行组大小（以字节计），在压缩之前。                                                                                                                                                                                                  | `536870912` |
| `output_format_parquet_string_as_string`                                       | 对于字符串列使用 Parquet String 类型，而不是 Binary。                                                                                                                                                                             | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | 对于 FixedString 列使用 Parquet FIXED_LENGTH_BYTE_ARRAY 类型，而不是 Binary。                                                                                                                                                       | `1`         |
| `output_format_parquet_version`                                                | 输出格式的 Parquet 格式版本。支持的版本： 1.0, 2.4, 2.6 和 2.latest（默认）。                                                                                                                                                        | `2.latest`  |
| `output_format_parquet_compression_method`                                     | Parquet 输出格式的压缩方法。支持的编码： snappy, lz4, brotli, zstd, gzip, none（未压缩）。                                                                                                                                  | `zstd`      |
| `output_format_parquet_compliant_nested_types`                                 | 在 parquet 文件模式中，为列表元素使用名称 'element' 而不是 'item'。这是 Arrow 库实现的历史遗留物。通常增加兼容性，除非与某些旧版本的 Arrow 兼容性。                                                                       | `1`         | 
| `output_format_parquet_use_custom_encoder`                                     | 使用更快的 Parquet 编码器实现。                                                                                                                                                                                                     | `1`         |
| `output_format_parquet_parallel_encoding`                                      | 在多个线程中进行 Parquet 编码。需要 output_format_parquet_use_custom_encoder。                                                                                                                                                   | `1`         |
| `output_format_parquet_data_page_size`                                         | 目标页面大小（以字节计），在压缩之前。                                                                                                                                                                                           | `1048576`   |
| `output_format_parquet_batch_size`                                             | 每这个多少行检查页面大小。如果您的列的平均值大小超过几 KB，请考虑减少此值。                                                                                                                                                          | `1024`      |
| `output_format_parquet_write_page_index`                                       | 添加将页面索引写入 Parquet 文件的可能性。                                                                                                                                                                                         | `1`         |
| `input_format_parquet_import_nested`                                           | 过时的设置，无任何作用。                                                                                                                                                                                                        | `0`         |
