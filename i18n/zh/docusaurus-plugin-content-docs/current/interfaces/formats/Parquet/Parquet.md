---
'alias': []
'description': 'Parquet格式的文档'
'input_format': true
'keywords':
- 'Parquet'
'output_format': true
'slug': '/interfaces/formats/Parquet'
'title': 'Parquet'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

[Apache Parquet](https://parquet.apache.org/) 是一种在 Hadoop 生态系统中广泛使用的列式存储格式。ClickHouse 支持此格式的读写操作。

## 数据类型匹配 {#data-types-matching-parquet}

下表展示了支持的数据类型及其在 `INSERT` 和 `SELECT` 查询中如何与 ClickHouse 的 [数据类型](/sql-reference/data-types/index.md) 匹配。

| Parquet 数据类型 (`INSERT`)                      | ClickHouse 数据类型                                                                                                      | Parquet 数据类型 (`SELECT`)  |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-------------------------------|
| `BOOL`                                           | [Bool](/sql-reference/data-types/boolean.md)                                                                              | `BOOL`                        |
| `UINT8`, `BOOL`                                  | [UInt8](/sql-reference/data-types/int-uint.md)                                                                          | `UINT8`                       |
| `INT8`                                           | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)                              | `INT8`                        |
| `UINT16`                                         | [UInt16](/sql-reference/data-types/int-uint.md)                                                                         | `UINT16`                      |
| `INT16`                                          | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)                            | `INT16`                       |
| `UINT32`                                         | [UInt32](/sql-reference/data-types/int-uint.md)                                                                         | `UINT32`                      |
| `INT32`                                          | [Int32](/sql-reference/data-types/int-uint.md)                                                                          | `INT32`                       |
| `UINT64`                                         | [UInt64](/sql-reference/data-types/int-uint.md)                                                                         | `UINT64`                      |
| `INT64`                                          | [Int64](/sql-reference/data-types/int-uint.md)                                                                          | `INT64`                       |
| `FLOAT`                                          | [Float32](/sql-reference/data-types/float.md)                                                                           | `FLOAT`                       |
| `DOUBLE`                                         | [Float64](/sql-reference/data-types/float.md)                                                                           | `DOUBLE`                      |
| `DATE`                                           | [Date32](/sql-reference/data-types/date.md)                                                                             | `DATE`                        |
| `TIME (ms)`                                      | [DateTime](/sql-reference/data-types/datetime.md)                                                                       | `UINT32`                      |
| `TIMESTAMP`, `TIME (us, ns)`                     | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                   | `TIMESTAMP`                   |
| `STRING`, `BINARY`                               | [String](/sql-reference/data-types/string.md)                                                                           | `BINARY`                      |
| `STRING`, `BINARY`, `FIXED_LENGTH_BYTE_ARRAY`    | [FixedString](/sql-reference/data-types/fixedstring.md)                                                                | `FIXED_LENGTH_BYTE_ARRAY`     |
| `DECIMAL`                                        | [Decimal](/sql-reference/data-types/decimal.md)                                                                        | `DECIMAL`                     |
| `LIST`                                           | [Array](/sql-reference/data-types/array.md)                                                                             | `LIST`                        |
| `STRUCT`                                         | [Tuple](/sql-reference/data-types/tuple.md)                                                                             | `STRUCT`                      |
| `MAP`                                            | [Map](/sql-reference/data-types/map.md)                                                                                 | `MAP`                         |
| `UINT32`                                         | [IPv4](/sql-reference/data-types/ipv4.md)                                                                               | `UINT32`                      |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                               | `FIXED_LENGTH_BYTE_ARRAY`     |
| `FIXED_LENGTH_BYTE_ARRAY`, `BINARY`              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                               | `FIXED_LENGTH_BYTE_ARRAY`     |

数组可以嵌套，并且可以有一个值为 `Nullable` 类型的参数。`Tuple` 和 `Map` 类型也可以嵌套。

不支持的 Parquet 数据类型有：
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`。

ClickHouse 表列的数据类型与插入的 Parquet 数据的相应字段可能不同。在插入数据时，ClickHouse 根据上述表格解释数据类型，然后将数据 [转换](/sql-reference/functions/type-conversion-functions#cast) 为设置的 ClickHouse 表列的数据类型。

## 示例用法 {#example-usage}

### 插入和选择数据 {#inserting-and-selecting-data-parquet}

您可以使用以下命令将 Parquet 数据从文件插入 ClickHouse 表中：

```bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

您可以使用以下命令从 ClickHouse 表中选择数据并将其保存为 Parquet 格式的文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

要与 Hadoop 交换数据，您可以使用 [`HDFS 表引擎`](/engines/table-engines/integrations/hdfs.md)。

## 格式设置 {#format-settings}

| 设置                                                                         | 描述                                                                                                                                                                                                                           | 默认值      |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                     | 在匹配 Parquet 列与 ClickHouse 列时忽略大小写。                                                                                                                                                                                   | `0`         |
| `input_format_parquet_preserve_order`                                       | 在从 Parquet 文件读取时避免重新排序行。通常会使速度变得慢得多。                                                                                                                                                                   | `0`         |
| `input_format_parquet_filter_push_down`                                     | 在读取 Parquet 文件时，根据 WHERE/PREWHERE 表达式和 Parquet 元数据中的最小/最大统计信息跳过整个行组。                                                                                                                       | `1`         |
| `input_format_parquet_bloom_filter_push_down`                               | 在读取 Parquet 文件时，根据 WHERE 表达式和 Parquet 元数据中的布隆过滤器跳过整个行组。                                                                                                                                              | `0`         |
| `input_format_parquet_use_native_reader`                                    | 在读取 Parquet 文件时，使用原生读取器而不是箭头读取器。                                                                                                                                                                             | `0`         |
| `input_format_parquet_allow_missing_columns`                                | 在读取 Parquet 输入格式时允许缺少列。                                                                                                                                                                                              | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                        | 本地读取（文件）时进行跳转所需的最小字节数，而不是在 Parquet 输入格式中使用忽略来读取。                                                                                                                                             | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                            | 启用 Parquet 解析期间的行组预取。目前，只有单线程解析可以进行预取。                                                                                                                                                                    | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | 在 Parquet 格式的模式推断中跳过具有不受支持类型的列。                                                                                                                                                                              | `0`         |
| `input_format_parquet_max_block_size`                                       | Parquet 读取器的最大块大小。                                                                                                                                                                                                    | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                   | Parquet 读取器输出的平均块字节数。                                                                                                                                                                                                 | `16744704`  |
| `output_format_parquet_row_group_size`                                      | 目标行组大小（以行数为单位）。                                                                                                                                                                                                       | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                | 目标行组大小（以字节为单位），在压缩前。                                                                                                                                                                                            | `536870912` |
| `output_format_parquet_string_as_string`                                    | 对于 String 列，使用 Parquet String 类型而不是 Binary。                                                                                                                                                                           | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                    | 对于 FixedString 列，使用 Parquet FIXED_LENGTH_BYTE_ARRAY 类型而不是 Binary。                                                                                                                                                          | `1`         |
| `output_format_parquet_version`                                             | 输出格式的 Parquet 格式版本。支持的版本：1.0、2.4、2.6 和 2.latest（默认）。                                                                                                                                                         | `2.latest`  |
| `output_format_parquet_compression_method`                                  | Parquet 输出格式的压缩方法。支持的编码：snappy、lz4、brotli、zstd、gzip、none（未压缩）。                                                                                                                                             | `zstd`      |
| `output_format_parquet_compliant_nested_types`                              | 在 Parquet 文件模式中，为列表元素使用名称 'element' 而不是 'item'。这是 Arrow 库实现的历史遗留物，通常增加了兼容性，除了某些旧版本的 Arrow 可能例外。                                                                                | `1`         | 
| `output_format_parquet_use_custom_encoder`                                  | 使用更快的 Parquet 编码器实现。                                                                                                                                                                                                     | `1`         |
| `output_format_parquet_parallel_encoding`                                     | 在多个线程中进行 Parquet 编码。需要 `output_format_parquet_use_custom_encoder`。                                                                                                                                                       | `1`         |
| `output_format_parquet_data_page_size`                                      | 目标页面大小（以字节为单位），在压缩前。                                                                                                                                                                                              | `1048576`   |
| `output_format_parquet_batch_size`                                          | 每这多少行检查页面大小。如果您的列具有平均值大小超过几 KB，考虑减小该值。                                                                                                                                                             | `1024`      |
| `output_format_parquet_write_page_index`                                    | 将页面索引写入 Parquet 文件的可能性。                                                                                                                                                                                              | `1`         |
| `input_format_parquet_import_nested`                                        | 已废弃的设置，不执行任何操作。                                                                                                                                                                                                 | `0`         |
