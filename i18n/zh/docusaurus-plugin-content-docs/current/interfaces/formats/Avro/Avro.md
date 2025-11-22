---
alias: []
description: 'Avro 格式文档'
input_format: true
keywords: ['Avro']
output_format: true
slug: /interfaces/formats/Avro
title: 'Avro'
doc_type: 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## Description {#description}

[Apache Avro](https://avro.apache.org/) 是一种面向行的序列化格式,采用二进制编码以实现高效的数据处理。`Avro` 格式支持读取和写入 [Avro 数据文件](https://avro.apache.org/docs/++version++/specification/#object-container-files)。该格式要求消息具有自描述性并内嵌 schema。如果您使用 Avro 时配合 schema registry,请参阅 [`AvroConfluent`](./AvroConfluent.md) 格式。


## 数据类型映射 {#data-type-mapping}

<DataTypeMapping />


## 格式设置 {#format-settings}

| 设置                                    | 描述                                                                                                                                             | 默认值 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `input_format_avro_allow_missing_fields`   | 当模式中找不到字段时，是否使用默认值而不是抛出错误。                                                    | `0`     |
| `input_format_avro_null_as_default`        | 当向非空列插入 `null` 值时，是否使用默认值而不是抛出错误。                                   | `0`     |
| `output_format_avro_codec`                 | Avro 输出文件的压缩算法。可选值：`null`、`deflate`、`snappy`、`zstd`。                                                      |         |
| `output_format_avro_sync_interval`         | Avro 文件中同步标记的频率(以字节为单位)。                                                                                                         | `16384` |
| `output_format_avro_string_column_pattern` | 用于识别 `String` 列以进行 Avro 字符串类型映射的正则表达式。默认情况下,ClickHouse 的 `String` 列会被写入为 Avro 的 `bytes` 类型。 |         |
| `output_format_avro_rows_in_file`          | 每个 Avro 输出文件的最大行数。达到此限制时,将创建新文件(如果存储系统支持文件拆分)。         | `1`     |


## 示例 {#examples}

### 读取 Avro 数据 {#reading-avro-data}

从 Avro 文件读取数据到 ClickHouse 表:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

导入的 Avro 文件的根模式必须为 `record` 类型。

为了确定表列与 Avro 模式字段之间的对应关系,ClickHouse 会比较它们的名称。
此比较区分大小写,未使用的字段会被跳过。

ClickHouse 表列的数据类型可以与插入的 Avro 数据的相应字段不同。插入数据时,ClickHouse 根据上表解释数据类型,然后将数据[转换](/sql-reference/functions/type-conversion-functions#cast)为相应的列类型。

在导入数据时,如果在模式中找不到某个字段且启用了 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 设置,则会使用默认值而不是抛出错误。

### 写入 Avro 数据 {#writing-avro-data}

将 ClickHouse 表中的数据写入 Avro 文件:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名必须:

- 以 `[A-Za-z_]` 开头
- 后续字符只能为 `[A-Za-z0-9_]`

Avro 文件的输出压缩和同步间隔可以分别通过 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 和 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 设置进行配置。

### 推断 Avro 模式 {#inferring-the-avro-schema}

使用 ClickHouse 的 [`DESCRIBE`](/sql-reference/statements/describe-table) 函数,您可以快速查看 Avro 文件的推断格式,如下例所示。
此示例包含 ClickHouse S3 公共存储桶中可公开访问的 Avro 文件的 URL:

```sql
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);

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
