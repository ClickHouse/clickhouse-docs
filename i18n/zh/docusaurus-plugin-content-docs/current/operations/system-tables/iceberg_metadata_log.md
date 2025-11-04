---
'description': '系统表包含从 Iceberg 表中读取的元数据文件的信息。每个条目代表一个根元数据文件、从 Avro 文件中提取的元数据，或者某个
  Avro 文件的条目。'
'keywords':
- 'system table'
- 'iceberg_metadata_log'
'slug': '/operations/system-tables/iceberg_metadata_log'
'title': 'system.iceberg_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

`system.iceberg_metadata_log` 表记录了 ClickHouse 读取的 Iceberg 表的元数据访问和解析事件。它提供了每个处理的元数据文件或条目的详细信息，这对于调试、审计和理解 Iceberg 表结构演变非常有用。

## 目的 {#purpose}

此表记录每个从 Iceberg 表读取的元数据文件和条目，包括根元数据文件、清单列表和清单条目。它帮助用户追踪 ClickHouse 如何解释 Iceberg 表的元数据，以及诊断与模式演变、文件解析或查询规划相关的问题。

:::note
此表主要用于调试目的。
:::note

## 列 {#columns}
| 名称           | 类型      | 描述                                                                                     |
|----------------|-----------|------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 日志条目的日期。                                                                         |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 事件的时间戳。                                                                          |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 触发元数据读取的查询 ID。                                                              |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | 元数据内容的类型（见下文）。                                                            |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg 表的路径。                                                                      |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 根元数据 JSON 文件、Avro 清单列表或清单文件的路径。                                       |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 格式的内容（来自 .json 的原始元数据、Avro 元数据或 Avro 条目）。                   |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | 文件中的行号（如适用）。适用于 `ManifestListEntry` 和 `ManifestFileEntry` 内容类型。 |

## `content_type` 值 {#content-type-values}

- `None`: 无内容。
- `Metadata`: 根元数据文件。
- `ManifestListMetadata`: 清单列表元数据。
- `ManifestListEntry`: 清单列表中的条目。
- `ManifestFileMetadata`: 清单文件元数据。
- `ManifestFileEntry`: 清单文件中的条目。

<SystemTableCloud/>

## 控制日志详细性 {#controlling-log-verbosity}

您可以使用 [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 设置来控制记录哪些元数据事件。

要记录当前查询中使用的所有元数据：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

要仅记录当前查询中使用的根元数据 JSON 文件：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

有关更多信息，请参见 [`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 设置的描述。

### 需要注意 {#good-to-know}

- 仅在您需要详细调查 Iceberg 表时，才在查询级别使用 `iceberg_metadata_log_level`。否则，您可能会用过多的元数据填充日志表，并体验到性能下降。
- 该表可能包含重复条目，因为它主要用于调试，无法保证每个实体的唯一性。
- 如果您使用的 `content_type` 比 `ManifestListMetadata` 更详细，则会禁用清单列表的 Iceberg 元数据缓存。
- 同样，如果您使用的 `content_type` 比 `ManifestFileMetadata` 更详细，则会禁用清单文件的 Iceberg 元数据缓存。

## 参见 {#see-also}
- [Iceberg 表引擎](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg 表函数](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
