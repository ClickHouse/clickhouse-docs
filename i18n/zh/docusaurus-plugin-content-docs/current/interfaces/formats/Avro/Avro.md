---
'alias': []
'description': 'Avro 格式的 Documentation'
'input_format': true
'keywords':
- 'Avro'
'output_format': true
'slug': '/interfaces/formats/Avro'
'title': 'Avro'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入   | 输出   | 别名  |
|--------|--------|-------|
| ✔      | ✔      |       |

## 描述 {#description}

[Apache Avro](https://avro.apache.org/) 是一个行导向的数据序列化框架，在 Apache 的 Hadoop 项目中开发。 ClickHouse 的 `Avro` 格式支持读取和写入 [Avro 数据文件](https://avro.apache.org/docs/current/spec.html#Object+Container+Files)。

## 数据类型匹配 {#data-types-matching}

<DataTypesMatching/>

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

要从 Avro 文件插入数据到 ClickHouse 表中：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

所输入的 Avro 文件的根模式必须是 `record` 类型。

为了找到表列和 Avro 模式字段之间的对应关系，ClickHouse 会比较它们的名称。此比较是区分大小写的，未使用的字段会被跳过。

ClickHouse 表列的数据类型可以与插入的 Avro 数据的相应字段不同。插入数据时，ClickHouse 根据上表解释数据类型，并将数据[转换](/sql-reference/functions/type-conversion-functions#cast)为相应列类型。

在导入数据时，当模式中找不到字段并且设置 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 启用时，将使用默认值，而不是抛出错误。

### 选择数据 {#selecting-data}

要从 ClickHouse 表中选择数据到 Avro 文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名称必须：

- 以 `[A-Za-z_]` 开头
- 仅后跟 `[A-Za-z0-9_]`

输出 Avro 文件的压缩和同步间隔可以通过设置 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 和 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 配置。

### 示例数据 {#example-data}

使用 ClickHouse 的 [`DESCRIBE`](/sql-reference/statements/describe-table) 函数，您可以快速查看如下示例的推断格式。该示例包含 ClickHouse S3 公共存储桶中公开可访问的 Avro 文件的 URL：

```sql title="Query"
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);
```
```response title="Response"
┌─name───────────────────────┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ WatchID                    │ Int64           │              │                    │         │                  │                │
│ JavaEnable                 │ Int32           │              │                    │         │                  │                │
│ Title                      │ String          │              │                    │         │                  │                │
│ GoodEvent                  │ Int32           │              │                    │         │                  │                │
│ EventTime                  │ Int32           │              │                    │         │                  │                │
│ EventDate                  │ Date32          │              │                    │         │                  │                │
│ CounterID                  │ Int32           │              │                    │         │                  │                │
│ ClientIP                   │ Int32           │              │                    │         │                  │                │
│ ClientIP6                  │ FixedString(16) │              │                    │         │                  │                │
│ RegionID                   │ Int32           │              │                    │         │                  │                │
...
│ IslandID                   │ FixedString(16) │              │                    │         │                  │                │
│ RequestNum                 │ Int32           │              │                    │         │                  │                │
│ RequestTry                 │ Int32           │              │                    │         │                  │                │
└────────────────────────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## 格式设置 {#format-settings}

| 设置                                       | 描述                                                                                              | 默认   |
|--------------------------------------------|----------------------------------------------------------------------------------------------------|--------|
| `input_format_avro_allow_missing_fields`    | 对于 Avro/AvroConfluent 格式：当架构中未找到字段时，使用默认值而不是错误                         | `0`    |
| `input_format_avro_null_as_default`         | 对于 Avro/AvroConfluent 格式：在 null 及非 Nullable 列的情况下插入默认值                         | `0`    |
| `format_avro_schema_registry_url`           | 对于 AvroConfluent 格式：Confluent Schema Registry URL。                                           |        |
| `output_format_avro_codec`                  | 输出时使用的压缩编解码器。可能的值：'null'，'deflate'，'snappy'，'zstd'。                          |        |
| `output_format_avro_sync_interval`          | 以字节为单位的同步间隔。                                                                            | `16384`|
| `output_format_avro_string_column_pattern`  | 对于 Avro 格式：选择作为 AVRO 字符串的字符串列的正则表达式。                                        |        |
| `output_format_avro_rows_in_file`           | 文件中的最大行数（如果存储允许）                                                                    | `1`    |
