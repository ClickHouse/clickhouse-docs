---
title: Avro
slug: /interfaces/formats/Avro
keywords: ['Avro']
input_format: true
output_format: true
alias: []
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入  | 输出  | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

[Apache Avro](https://avro.apache.org/) 是一个行导向的数据序列化框架，在 Apache 的 Hadoop 项目中开发。
ClickHouse 的 `Avro` 格式支持读取和写入 [Avro 数据文件](https://avro.apache.org/docs/current/spec.html#Object+Container+Files)。

## 数据类型匹配 {#data-types-matching}

<DataTypesMatching/>

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

要从 Avro 文件插入数据到 ClickHouse 表中：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

输入的 Avro 文件的根架构必须是 `record` 类型。

要找到表列和 Avro 架构字段之间的对应关系，ClickHouse 会比较它们的名称。 
这个比较是区分大小写的，未使用的字段会被跳过。

ClickHouse 表列的数据类型可以与插入的 Avro 数据的字段不同。在插入数据时，ClickHouse 会根据上表解释数据类型，然后 [转换](/sql-reference/functions/type-conversion-functions#cast) 数据到相应的列类型。

在导入数据时，当在架构中未找到字段且设置 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 已启用时，将使用默认值而不是抛出错误。

### 选择数据 {#selecting-data}

要从 ClickHouse 表中选择数据到 Avro 文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名必须：

- 以 `[A-Za-z_]` 开头
- 后续只能包含 `[A-Za-z0-9_]`

输出的 Avro 文件压缩和同步间隔可以通过设置 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 和 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 分别配置。

### 示例数据 {#example-data}

使用 ClickHouse 的 [`DESCRIBE`](/sql-reference/statements/describe-table) 函数，可以快速查看 Avro 文件的推断格式，如以下示例所示。 
该示例包含 ClickHouse S3 公共存储桶中一个可以公开访问的 Avro 文件的 URL：

```sql title="查询"
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);
```
```response title="响应"
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

| 设置                                         | 描述                                                                                               | 默认    |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | 对于 Avro/AvroConfluent 格式：当架构中未找到字段时使用默认值而不是错误                               | `0`     |
| `input_format_avro_null_as_default`         | 对于 Avro/AvroConfluent 格式：在 null 和非 Nullable 列的情况下插入默认值                             |   `0`   |
| `format_avro_schema_registry_url`           | 对于 AvroConfluent 格式：Confluent Schema Registry URL。                                            |         |
| `output_format_avro_codec`                  | 输出所使用的压缩编解码器。可能的值：'null', 'deflate', 'snappy', 'zstd'。                          |         |
| `output_format_avro_sync_interval`          | 以字节为单位的同步间隔。                                                                            | `16384` |
| `output_format_avro_string_column_pattern`  | 对于 Avro 格式：选择为 AVRO 字符串的字符串列的正则表达式。                                         |         |
| `output_format_avro_rows_in_file`           | 文件中的最大行数（如果存储允许的话）                                                                | `1`     |
