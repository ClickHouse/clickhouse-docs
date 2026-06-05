---
alias: []
description: 'Parquet 格式文档'
input_format: true
keywords: ['Parquet']
output_format: true
slug: /interfaces/formats/Parquet
title: 'Parquet'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 \{#description\}

[Apache Parquet](https://parquet.apache.org/) 是 Hadoop 生态系统中广泛使用的列式存储格式。ClickHouse 支持对该格式进行读写操作。

## 数据类型匹配 \{#data-types-matching-parquet\}

下表展示了 Parquet 数据类型与 ClickHouse [数据类型](/sql-reference/data-types/index.md)之间的对应关系。

| Parquet 类型 (逻辑、转换或物理)                | ClickHouse 数据类型                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `BOOLEAN`                            | [Bool](/sql-reference/data-types/boolean.md)                                               |
| `UINT_8`                             | [UInt8](/sql-reference/data-types/int-uint.md)                                             |
| `INT_8`                              | [Int8](/sql-reference/data-types/int-uint.md)                                              |
| `UINT_16`                            | [UInt16](/sql-reference/data-types/int-uint.md)                                            |
| `INT_16`                             | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) |
| `UINT_32`                            | [UInt32](/sql-reference/data-types/int-uint.md)                                            |
| `INT_32`                             | [Int32](/sql-reference/data-types/int-uint.md)                                             |
| `UINT_64`                            | [UInt64](/sql-reference/data-types/int-uint.md)                                            |
| `INT_64`                             | [Int64](/sql-reference/data-types/int-uint.md)                                             |
| `DATE`                               | [Date32](/sql-reference/data-types/date.md)                                                |
| `TIMESTAMP`, `TIME`                  | [DateTime64](/sql-reference/data-types/datetime64.md)                                      |
| `FLOAT`                              | [Float32](/sql-reference/data-types/float.md)                                              |
| `DOUBLE`                             | [Float64](/sql-reference/data-types/float.md)                                              |
| `INT96`                              | [DateTime64(9, &#39;UTC&#39;)](/sql-reference/data-types/datetime64.md)                    |
| `BYTE_ARRAY`, `UTF8`, `ENUM`, `BSON` | [String](/sql-reference/data-types/string.md)                                              |
| `JSON`                               | [JSON](/sql-reference/data-types/newjson.md)                                               |
| `FIXED_LEN_BYTE_ARRAY`               | [FixedString](/sql-reference/data-types/fixedstring.md)                                    |
| `DECIMAL`                            | [Decimal](/sql-reference/data-types/decimal.md)                                            |
| `LIST`                               | [Array](/sql-reference/data-types/array.md)                                                |
| `MAP`                                | [Map](/sql-reference/data-types/map.md)                                                    |
| struct                               | [Tuple](/sql-reference/data-types/tuple.md)                                                |
| `FLOAT16`                            | [Float32](/sql-reference/data-types/float.md)                                              |
| `UUID`                               | [FixedString(16)](/sql-reference/data-types/fixedstring.md)                                |
| `INTERVAL`                           | [FixedString(12)](/sql-reference/data-types/fixedstring.md)                                |
| `Point` (GeoParquet)                 | [Point](/sql-reference/data-types/geo.md#point)                                            |
| `LineString` (GeoParquet)            | [LineString](/sql-reference/data-types/geo.md#linestring)                                  |
| `Polygon` (GeoParquet)               | [Polygon](/sql-reference/data-types/geo.md#polygon)                                        |
| `MultiLineString` (GeoParquet)       | [MultiLineString](/sql-reference/data-types/geo.md#multilinestring)                        |
| `MultiPolygon` (GeoParquet)          | [MultiPolygon](/sql-reference/data-types/geo.md#multipolygon)                              |
| mixed/unknown geometry (GeoParquet)  | [Geometry](/sql-reference/data-types/geo.md#geometry)                                      |

在写入 Parquet 文件时，没有对应 Parquet 类型的 ClickHouse 数据类型会被转换为最接近的可用类型：

| ClickHouse 数据类型                                                        | Parquet 类型                             |
| ---------------------------------------------------------------------- | -------------------------------------- |
| [IPv4](/sql-reference/data-types/ipv4.md)                              | `UINT_32`                              |
| [IPv6](/sql-reference/data-types/ipv6.md)                              | `FIXED_LEN_BYTE_ARRAY` (16 字节)         |
| [Date](/sql-reference/data-types/date.md) (16 位)                       | `DATE` (32 位)                          |
| [DateTime](/sql-reference/data-types/datetime.md) (32 位，秒)             | `TIMESTAMP` (64 位，毫秒)                  |
| [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md) | `FIXED_LEN_BYTE_ARRAY` (16/32 字节，小端序)  |
| [Point](/sql-reference/data-types/geo.md#point)                        | `BYTE_ARRAY` (WKB) + GeoParquet 元数据    |
| [LineString](/sql-reference/data-types/geo.md#linestring)              | `BYTE_ARRAY` (WKB) + GeoParquet 元数据    |
| [Polygon](/sql-reference/data-types/geo.md#polygon)                    | `BYTE_ARRAY` (WKB) + GeoParquet 元数据    |
| [MultiLineString](/sql-reference/data-types/geo.md#multilinestring)    | `BYTE_ARRAY` (WKB) + GeoParquet 元数据    |
| [MultiPolygon](/sql-reference/data-types/geo.md#multipolygon)          | `BYTE_ARRAY` (WKB) + GeoParquet 元数据    |

Array 可以嵌套，其参数也可以是 `Nullable` 类型的值。`Tuple` 和 `Map` 类型同样可以嵌套。

ClickHouse 表列的数据类型可以与插入的 Parquet 数据中对应字段的类型不同。插入数据时，ClickHouse 会按照上表解释数据类型，然后将数据[calls](/sql-reference/functions/type-conversion-functions#CAST)为 ClickHouse 表列所设置的数据类型。例如，`UINT_32` Parquet 列可以读入 [IPv4](/sql-reference/data-types/ipv4.md) ClickHouse 列。

对于某些 Parquet 类型，没有与之非常接近的 ClickHouse 类型。我们按如下方式读取它们：

* `TIME` (一天中的时间) 会被读取为时间戳。例如，`10:23:13.000` 会变成 `1970-01-01 10:23:13.000`。
* 具有 `isAdjustedToUTC=false` 的 `TIMESTAMP`/`TIME` 表示本地挂钟时间 (本地时区下的年、月、日、时、分、秒和子秒字段，而不考虑具体本地时区是哪一个) ，等同于 SQL 中的 `TIMESTAMP WITHOUT TIME ZONE`。ClickHouse 会将其当作 UTC 时间戳来读取。例如，`2025-09-29 18:42:13.000` (表示本地挂钟的读数) 会变成 `2025-09-29 18:42:13.000` (`DateTime64(3, 'UTC')`，表示某个时间点) 。如果将其转换为 String，它会显示正确的年、月、日、时、分、秒和子秒，然后可以将其解释为某个本地时区中的时间，而不是 UTC。违背直觉的是，将类型从 `DateTime64(3, 'UTC')` 改为 `DateTime64(3)` 并不会有帮助，因为这两种类型都表示时间点而不是挂钟读数，但 `DateTime64(3)` 会错误地使用本地时区来格式化。
* `INTERVAL` 当前会被读取为 `FixedString(12)`，其内容是 Parquet 文件中编码的时间间隔的原始二进制表示。

## Geo 类型 (GeoParquet) \{#geo-types\}

ClickHouse 支持按照 [GeoParquet](https://geoparquet.org/) 规范读写几何列。几何列以采用 [WKB](https://libgeos.org/specifications/wkb/) 编码的 `BYTE_ARRAY` 载荷形式存储 (读取时也支持 WKT) ，文件级 Parquet 元数据中还包含一个 JSON `geo` 键，用于描述每个几何列的编码方式、几何类型和 CRS。

### 读取行为 \{#read\}

读取时，几何列会被映射为对应的 ClickHouse [Geo 数据类型](/sql-reference/data-types/geo.md)：

* 声明为 `Point`、`LineString`、`Polygon`、`MultiLineString` 或 `MultiPolygon` 的列，会读取为相应的 ClickHouse Geo 类型。
* 具有多种或未知几何类型的列，会读取为 [`Geometry`](/sql-reference/data-types/geo.md#geometry) 类型，它是涵盖所有受支持 Geo 类型的 `Variant`。
* 如果请求的列类型为 `String`，则会忽略 GeoParquet 元数据，并按原样返回原始编码的几何载荷——即 WKB 或 WKT 字节，与 GeoParquet 列声明的编码一致。即使将设置 [`input_format_parquet_allow_geoparquet_parser`](/operations/settings/settings-formats.md#input_format_parquet_allow_geoparquet_parser) 设为 `0`，也是如此。

### 写入行为 \{#write\}

写入时，顶层中类型为 `Point`、`LineString`、`Polygon`、`MultiLineString` 或 `MultiPolygon` 的列会被编码为 `BYTE_ARRAY` (WKB) ，并将相应的 `geo` JSON 元数据追加到 Parquet 文件页脚。顶层的 [`Geometry`](/sql-reference/data-types/geo.md#geometry) `Variant` 也会被编码为 WKB `BYTE_ARRAY` 载荷 (其子值会被转换为 WKB，并存储为 `Nullable(String)` 列) ，但不会为其生成 `geo` 元数据，因此读取时，结果不会被识别为 GeoParquet 几何列。其他与 geo 相关的类型，例如 [`Ring`](/sql-reference/data-types/geo.md#ring)，则会使用其原生底层表示写入，且不包含任何 GeoParquet 元数据。通过将 [`output_format_parquet_geometadata`](/operations/settings/settings-formats.md#output_format_parquet_geometadata) 设置为 `0`，可以完全禁用此行为；在这种情况下，即使是受支持的 geo 类型，也会使用其原生底层表示写入 (`Point` 写为 `Tuple(Float64, Float64)`，`LineString` 写为 `Array(Point)`，`Polygon` 写为 `Array(Array(Point))`，等等) ，并且不会生成任何 GeoParquet 元数据。

几何列必须位于 schema 的根级，或嵌套在 `Tuple` (`struct`) 内；不支持将其嵌套在 `Array` 或 `Map` 中。geo 列同样不支持 `Nullable`。

## 示例用法 \{#example-usage\}

### 插入数据 \{#inserting-data\}

使用一个包含以下数据的 Parquet 文件，文件名为 `football.parquet`：

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

### 读取数据 \{#reading-data\}

以 `Parquet` 格式读取数据：

```sql
SELECT *
FROM football
INTO OUTFILE 'football.parquet'
FORMAT Parquet
```

:::tip
Parquet 是一种二进制格式，无法在终端中以人类可读的形式显示。请使用 `INTO OUTFILE` 输出 Parquet 文件。
:::

要与 Hadoop 进行数据交换，可以使用 [`HDFS 表引擎`](/engines/table-engines/integrations/hdfs.md)。


## 格式设置 \{#format-settings\}

| 设置                                                                             | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 默认值                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_format_parquet_case_insensitive_column_matching`                        | 在匹配 Parquet 列与 ClickHouse 列时不区分大小写。                                                                                                                                                                                                                                                                                                                                                                                                                                           | `0`                                                                                                                                                                                                                                               |
| `input_format_parquet_preserve_order`                                          | 在读取 Parquet 文件时避免对行重新排序，因为这通常会明显降低读取性能。                                                                                                                                                                                                                                                                                                                                                                                                                                       | `0`                                                                                                                                                                                                                                               |
| `input_format_parquet_filter_push_down`                                        | 在读取 Parquet 文件时，可以根据 WHERE/PREWHERE 表达式以及 Parquet 元数据中的最小值/最大值统计信息跳过整个行组。                                                                                                                                                                                                                                                                                                                                                                                                     | `1`                                                                                                                                                                                                                                               |
| `input_format_parquet_bloom_filter_push_down`                                  | 在读取 Parquet 文件时，可以根据 WHERE 表达式以及 Parquet 元数据中的布隆过滤器跳过整个行组。                                                                                                                                                                                                                                                                                                                                                                                                                    | `0`                                                                                                                                                                                                                                               |
| `input_format_parquet_allow_missing_columns`                                   | 在读取 Parquet 输入格式时允许存在缺失列                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `1`                                                                                                                                                                                                                                               |
| `input_format_parquet_local_file_min_bytes_for_seek`                           | 在使用 Parquet 输入格式本地读取文件时，为选择执行 seek 而不是执行带 ignore 选项的读取所需的最小字节数                                                                                                                                                                                                                                                                                                                                                                                                                | `8192`                                                                                                                                                                                                                                            |
| `input_format_parquet_enable_row_group_prefetch`                               | 在解析 Parquet 时启用行组预取。当前仅支持单线程解析时进行预取。                                                                                                                                                                                                                                                                                                                                                                                                                                          | `1`                                                                                                                                                                                                                                               |
| `input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference` | 在为 Parquet 格式进行模式推断时跳过不受支持类型的列                                                                                                                                                                                                                                                                                                                                                                                                                                                | `0`                                                                                                                                                                                                                                               |
| `input_format_parquet_max_block_size`                                          | Parquet 读取器的最大数据块大小。                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `65409`                                                                                                                                                                                                                                           |
| `input_format_parquet_prefer_block_bytes`                                      | Parquet 读取器输出的数据块平均大小 (字节)                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `16744704`                                                                                                                                                                                                                                        |
| `input_format_parquet_enable_json_parsing`                                     | 在读取 Parquet 文件时，将 JSON 列解析为 ClickHouse 的 JSON Column。                                                                                                                                                                                                                                                                                                                                                                                                                         | `1`                                                                                                                                                                                                                                               |
| `input_format_parquet_allow_geoparquet_parser`                                 | 在读取 Parquet 文件时，识别 GeoParquet `geo` 元数据，并根据列声明的编码，将几何列 (WKB 或 WKT) 解码为 ClickHouse 的 Geo 数据类型。若为 `0`，则几何列会以其原始物理表示 (`String`) 的形式呈现。                                                                                                                                                                                                                                                                                                                                           | `1`                                                                                                                                                                                                                                               |
| `output_format_parquet_row_group_size`                                         | 目标行组大小 (以行数计) 。                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `1000000`                                                                                                                                                                                                                                         |
| `output_format_parquet_row_group_size_bytes`                                   | 压缩前的目标行组大小 (字节) 。                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `536870912`                                                                                                                                                                                                                                       |
| `output_format_parquet_string_as_string`                                       | 对于 String 列，请使用 Parquet 的 String 类型而不是 Binary 类型。                                                                                                                                                                                                                                                                                                                                                                                                                             | `1`                                                                                                                                                                                                                                               |
| `output_format_parquet_fixed_string_as_fixed_byte_array`                       | 对于 FixedString 列，请使用 Parquet 的 FIXED&#95;LEN&#95;BYTE&#95;ARRAY 类型，而不是 Binary 类型。                                                                                                                                                                                                                                                                                                                                                                                             | `1`                                                                                                                                                                                                                                               |
| `output_format_parquet_compression_method`                                     | Parquet 输出格式的压缩方式。支持的编解码器：snappy、lz4、brotli、zstd、gzip、none (不压缩)                                                                                                                                                                                                                                                                                                                                                                                                              | `zstd`                                                                                                                                                                                                                                            |
| `output_format_parquet_parallel_encoding`                                      | 在多个线程中执行 Parquet 编码。                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `1`                                                                                                                                                                                                                                               |
| `output_format_parquet_data_page_size`                                         | 目标页大小 (压缩前) ，单位为字节。                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `1048576`                                                                                                                                                                                                                                         |
| `output_format_parquet_batch_size`                                             | 每隔指定行数检查一次页大小。如果某些列中单个值的平均大小超过数 KB，建议适当减小该参数。                                                                                                                                                                                                                                                                                                                                                                                                                                 | `1024`                                                                                                                                                                                                                                            |
| `output_format_parquet_write_page_index`                                       | 新增允许在 Parquet 文件中写入页索引的功能。                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `1`                                                                                                                                                                                                                                               |
| `output_format_parquet_geometadata`                                            | 将 GeoParquet `geo` 元数据写入 Parquet 文件页脚，并将顶层 ClickHouse 地理空间列 ([`Point`](/sql-reference/data-types/geo.md#point)、[`LineString`](/sql-reference/data-types/geo.md#linestring)、[`Polygon`](/sql-reference/data-types/geo.md#polygon)、[`MultiLineString`](/sql-reference/data-types/geo.md#multilinestring)、[`MultiPolygon`](/sql-reference/data-types/geo.md#multipolygon)) 编码为 WKB。如果为 `0`，则这些列会按其原生底层表示形式写入 (例如将 `Point` 写为 `Tuple(Float64, Float64)`) ，且不会写出任何 GeoParquet 元数据。 | `1`                                                                                                                                                                                                                                               |
| `input_format_parquet_import_nested`                                           | 已废弃的设置，不起任何作用。                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `0`                                                                                                                                                                                                                                               |
| `input_format_parquet_local_time_as_utc`                                       | true                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 确定在 `isAdjustedToUTC=false` 的情况下，模式推断对 Parquet 时间戳使用的数据类型。若为 true：DateTime64(..., &#39;UTC&#39;)，若为 false：DateTime64(...)。这两种行为都不完全正确，因为 ClickHouse 没有用于本地挂钟时间的数据类型。看似有些反直觉，但 true 可能是错误更小的选项，因为将带有 &#39;UTC&#39; 的时间戳格式化为 String 时，会得到正确本地时间的表示。 |