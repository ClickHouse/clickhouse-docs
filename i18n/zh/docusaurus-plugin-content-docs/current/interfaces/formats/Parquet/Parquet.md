---
'alias': []
'description': 'Parquet 格式的 Documentation'
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

[Apache Parquet](https://parquet.apache.org/) 是一种在 Hadoop 生态系统中广泛使用的列式存储格式。ClickHouse 支持这种格式的读写操作。

## 数据类型匹配 {#data-types-matching-parquet}

下表显示了支持的数据类型以及它们在 `INSERT` 和 `SELECT` 查询中与 ClickHouse [数据类型](/sql-reference/data-types/index.md) 的对应关系。

| Parquet 数据类型 (`INSERT`)                  | ClickHouse 数据类型                                                                                       | Parquet 数据类型 (`SELECT`)  |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------|
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

数组可以是嵌套的，并且可以作为参数具有 `Nullable` 类型的值。`Tuple` 和 `Map` 类型也可以嵌套。

不支持的 Parquet 数据类型为： 
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`。

ClickHouse 表列的数据类型可以与插入的 Parquet 数据对应字段不同。在插入数据时，ClickHouse 根据上表解释数据类型，然后 [转换](/sql-reference/functions/type-conversion-functions#cast) 为 ClickHouse 表列所设置的数据类型。

## 示例用法 {#example-usage}

### 插入与选择数据 {#inserting-and-selecting-data-parquet}

您可以使用以下命令将 Parquet 数据从文件插入 ClickHouse 表中：

```bash
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT Parquet"
```

您可以使用以下命令从 ClickHouse 表中选择数据并将其保存为 Parquet 格式的某个文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Parquet" > {some_file.pq}
```

要与 Hadoop 交换数据，您可以使用 [`HDFS 表引擎`](/engines/table-engines/integrations/hdfs.md)。

## 格式设置 {#format-settings}

| 设置                                                                        | 描述                                                                                                                                                                                                                       | 默认值     |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `input_format_parquet_case_insensitive_column_matching`                        | 在将 Parquet 列与 CH 列匹配时忽略大小写。                                                                                                                                                                          | `0`         |
| `input_format_parquet_preserve_order`                                          | 从 Parquet 文件读取时避免重新排序行。通常会使速度更慢。                                                                                                                                              | `0`         |
| `input_format_parquet_filter_push_down`                                        | 在读取 Parquet 文件时，根据 WHERE/PREWHERE 表达式和 Parquet 元数据中的最小/最大统计信息跳过整个行组。                                                                                          | `1`         |
| `input_format_parquet_bloom_filter_push_down`                                  | 在读取 Parquet 文件时，根据 WHERE 表达式和 Parquet 元数据中的布隆过滤器跳过整个行组。                                                                                                          | `0`         |
| `input_format_parquet_use_native_reader`                                       | 在读取 Parquet 文件时，使用本机读取器而非 arrow 读取器。                                                                                                                                                          | `0`         |
| `input_format_parquet_allow_missing_columns`                                   | 在读取 Parquet 输入格式时允许缺少列。                                                                                                                                                                          | `1`         |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | 对于本地读取（文件），进行查找所需的最小字节，而非在 Parquet 输入格式中以忽略方式读取。                                                                                                                          | `8192`      |
| `input_format_parquet_enable_row_group_prefetch`                               | 在 Parquet 解析期间启用行组预取。目前，只有单线程解析可以进行预取。                                                                                                                          | `1`         |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | 在对 Parquet 格式进行模式推断时，跳过具有不支持类型的列。                                                                                                                                                      | `0`         |
| `input_format_parquet_max_block_size`                                          | Parquet 读取器的最大块大小。                                                                                                                                                                                                | `65409`     |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet 读取器输出的平均块字节数。                                                                                                                                                                                      | `16744704`  |
| `output_format_parquet_row_group_size`                                         | 行组中目标行数。                                                                                                                                                                                                      | `1000000`   |
| `output_format_parquet_row_group_size_bytes`                                   | 压缩前目标行组字节数。                                                                                                                                                                                  | `536870912` |
| `output_format_parquet_string_as_string`                                       | 对于字符串列，使用 Parquet 字符串类型而非二进制类型。                                                                                                                                                                      | `1`         |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | 对于 FixedString 列，使用 Parquet FIXED_LENGTH_BYTE_ARRAY 类型而非二进制类型。                                                                                                                                                  | `1`         |
| `output_format_parquet_version`                                                | 输出格式的 Parquet 格式版本。支持的版本：1.0、2.4、2.6 和 2.latest（默认）。                                                                                                                                  | `2.latest`  |
| `output_format_parquet_compression_method`                                     | Parquet 输出格式的压缩方法。支持的编解码器：snappy、lz4、brotli、zstd、gzip、none（未压缩）。                                                                                                              | `zstd`      |
| `output_format_parquet_compliant_nested_types`                                 | 在 Parquet 文件模式中，对于列表元素，使用名称 'element' 而非 'item'。这是 Arrow 库实现的历史遗留物。通常会增加兼容性，但可能与一些旧版本的 Arrow 不兼容。 | `1`         | 
| `output_format_parquet_use_custom_encoder`                                     | 使用更快的 Parquet 编码实现。                                                                                                                                                                                      | `1`         |
| `output_format_parquet_parallel_encoding`                                      | 在多个线程中进行 Parquet 编码。需要 `output_format_parquet_use_custom_encoder`。                                                                                                                                          | `1`         |
| `output_format_parquet_data_page_size`                                         | 压缩前的目标页面大小（以字节为单位）。                                                                                                                                                                                      | `1048576`   |
| `output_format_parquet_batch_size`                                             | 每个多少行检查页面大小。如果有平均值大小超过几 KB 的列，考虑减少此值。                                                                                                              | `1024`      |
| `output_format_parquet_write_page_index`                                       | 添加将页面索引写入 Parquet 文件的可能性。                                                                                                                                                                          | `1`         |
| `input_format_parquet_import_nested`                                           | 廖废设置，不做任何事情。                                                                                                                                                                                                   | `0`         |
