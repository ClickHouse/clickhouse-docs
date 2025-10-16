---
'description': '系统表包含关于从 Delta Lake 表中读取的元数据文件的信息。每个条目代表一个根元数据 JSON 文件。'
'keywords':
- 'system table'
- 'delta_lake_metadata_log'
'slug': '/operations/system-tables/delta_lake_metadata_log'
'title': 'system.delta_lake_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` 表记录了 ClickHouse 读取 Delta Lake 表的元数据访问和解析事件。它提供关于每个元数据文件的详细信息，这对于调试、审计以及理解 Delta 表的结构演变非常有用。

## Purpose {#purpose}

此表记录了从 Delta Lake 表读取的每个元数据文件。它帮助用户追踪 ClickHouse 如何解释 Delta 表元数据，并诊断与模式演变、快照解析或查询计划相关的问题。

:::note
此表主要用于调试目的。
:::note

## Columns {#columns}
| 名称           | 类型      | 描述                                                                                       |
|----------------|-----------|--------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | 日志文件的日期。                                                                           |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | 事件的时间戳。                                                                            |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | 触发元数据读取的查询 ID。                                                                  |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Delta Lake 表的路径。                                                                       |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | 根元数据 JSON 文件的路径。                                                       |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 格式的内容（来自 .json 的原始元数据）。                                     |

<SystemTableCloud/>

## Controlling log verbosity {#controlling-log-verbosity}

您可以使用 [`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) 设置来控制哪些元数据事件被记录。

要记录当前查询中使用的所有元数据：

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
