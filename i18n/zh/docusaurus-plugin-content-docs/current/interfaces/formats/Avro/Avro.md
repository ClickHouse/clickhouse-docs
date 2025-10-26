---
'alias': []
'description': 'Avro 格式的文档'
'input_format': true
'keywords':
- 'Avro'
'output_format': true
'slug': '/interfaces/formats/Avro'
'title': 'Avro'
'doc_type': 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

[Apache Avro](https://avro.apache.org/) 是一种面向行的序列化格式，使用二进制编码以实现高效的数据处理。`Avro` 格式支持读取和写入 [Avro 数据文件](https://avro.apache.org/docs/++version++/specification/#object-container-files)。此格式期望使用嵌入式模式的自描述消息。如果您使用带有模式注册表的 Avro，请参考 [`AvroConfluent`](./AvroConfluent.md) 格式。

## 数据类型映射 {#data-type-mapping}

<DataTypeMapping/>

## 格式设置 {#format-settings}

| 设置                                     | 描述                                                                                         | 默认值 |
|------------------------------------------|------------------------------------------------------------------------------------------------|-------|
| `input_format_avro_allow_missing_fields`    | 当模式中未找到字段时，是否使用默认值而不是抛出错误。                                        | `0`   |
| `input_format_avro_null_as_default`         | 当向非可空列插入 `null` 值时，是否使用默认值而不是抛出错误。                               |   `0`   |
| `output_format_avro_codec`                  | Avro 输出文件的压缩算法。可能的值包括：`null`、`deflate`、`snappy`、`zstd`。              |       |
| `output_format_avro_sync_interval`          | Avro 文件中的同步标记频率（以字节为单位）。                                               | `16384` |
| `output_format_avro_string_column_pattern`  | 用于识别 Avro 字符串类型映射的 `String` 列的正则表达式。默认情况下，ClickHouse 的 `String` 列写入为 Avro `bytes` 类型。 |       |
| `output_format_avro_rows_in_file`           | 每个 Avro 输出文件的最大行数。当达到此限制时，将创建新文件（如果存储系统支持文件拆分）。  | `1`   |

## 示例 {#examples}

### 读取 Avro 数据 {#reading-avro-data}

要将数据从 Avro 文件读入 ClickHouse 表：

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

所摄取的 Avro 文件的根模式必须为 `record` 类型。

要查找表列与 Avro 模式字段之间的对应关系，ClickHouse 会比较它们的名称。 
此比较是区分大小写的，未使用的字段会被跳过。

ClickHouse 表列的数据类型可以与插入的 Avro 数据对应字段不同。在插入数据时，ClickHouse 根据上表解释数据类型，然后 [转换](/sql-reference/functions/type-conversion-functions#cast) 数据为相应的列类型。

在导入数据时，当在模式中未找到某字段且设置 [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) 被启用时，将使用默认值而不是抛出错误。

### 写入 Avro 数据 {#writing-avro-data}

要将数据从 ClickHouse 表写入 Avro 文件：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

列名必须：

- 以 `[A-Za-z_]` 开头
- 后续仅包含 `[A-Za-z0-9_]`

可以使用 [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) 和 [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) 设置，分别配置 Avro 文件的输出压缩和同步间隔。

### 推导 Avro 模式 {#inferring-the-avro-schema}

使用 ClickHouse 的 [`DESCRIBE`](/sql-reference/statements/describe-table) 函数，您可以快速查看 Avro 文件的推导格式，如以下示例所示。 
该示例包括 ClickHouse S3 公共存储桶中可以公开访问的 Avro 文件的 URL：

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
