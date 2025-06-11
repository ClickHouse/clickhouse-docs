---
'description': '该表包含关于 clickhouse 服务器的警告消息。'
'keywords':
- 'system table'
- 'warnings'
'slug': '/operations/system-tables/system_warnings'
'title': 'system.warnings'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

此表显示有关 ClickHouse 服务器的警告。相同类型的警告会合并成一个单一的警告。例如，如果附加数据库的数量 N 超过了可配置阈值 T，则会显示包含当前值 N 的单个条目，而不是 N 个单独的条目。如果当前值降至阈值以下，则该条目将从表中删除。

该表可通过以下设置进行配置：

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)

列：

- `message` ([String](../../sql-reference/data-types/string.md)) — 警告信息。
- `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 用于格式化消息的格式字符串。

**示例**

查询：

```sql
SELECT * FROM system.warnings LIMIT 2 \G;
```

结果：

```text
Row 1:
──────
message:               The number of active parts is more than 10.
message_format_string: The number of active parts is more than {}.

Row 2:
──────
message:               The number of attached databases is more than 2.
message_format_string: The number of attached databases is more than {}.
```
