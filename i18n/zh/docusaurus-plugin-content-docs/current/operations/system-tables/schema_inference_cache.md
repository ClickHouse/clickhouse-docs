---
'description': 'System table containing information about all cached file schemas.'
'keywords':
- 'system table'
- 'schema_inference_cache'
'slug': '/operations/system-tables/schema_inference_cache'
'title': 'system.schema_inference_cache'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.schema_inference_cache

<SystemTableCloud/>

包含所有缓存文件架构的信息。

列：
- `storage` ([String](/sql-reference/data-types/string.md)) — 存储名称：文件、URL、S3或HDFS。
- `source` ([String](/sql-reference/data-types/string.md)) — 文件源。
- `format` ([String](/sql-reference/data-types/string.md)) — 格式名称。
- `additional_format_info` ([String](/sql-reference/data-types/string.md)) - 识别架构所需的附加信息。例如，格式特定的设置。
- `registration_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 架构添加到缓存中的时间戳。
- `schema` ([String](/sql-reference/data-types/string.md)) - 缓存的架构。

**示例**

假设我们有一个文件 `data.jsonl`，其内容如下：
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

:::tip
将 `data.jsonl` 放在 `user_files_path` 目录中。你可以通过查看你的 ClickHouse 配置文件找到这个路径。默认路径为：
```sql
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
:::

打开 `clickhouse-client` 并运行 `DESCRIBE` 查询：

```sql
DESCRIBE file('data.jsonl') SETTINGS input_format_try_infer_integers=0;
```

```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Float64)       │              │                    │         │                  │                │
│ age     │ Nullable(Float64)       │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

让我们查看 `system.schema_inference_cache` 表的内容：

```sql
SELECT *
FROM system.schema_inference_cache
FORMAT Vertical
```
```response
Row 1:
──────
storage:                File
source:                 /home/droscigno/user_files/data.jsonl
format:                 JSONEachRow
additional_format_info: schema_inference_hints=, max_rows_to_read_for_schema_inference=25000, schema_inference_make_columns_nullable=true, try_infer_integers=false, try_infer_dates=true, try_infer_datetimes=true, try_infer_numbers_from_strings=true, read_bools_as_numbers=true, try_infer_objects=false
registration_time:      2022-12-29 17:49:52
schema:                 id Nullable(Float64), age Nullable(Float64), name Nullable(String), hobbies Array(Nullable(String))
```


**另请参见**
- [从输入数据自动推断架构](/interfaces/schema-inference.md)
