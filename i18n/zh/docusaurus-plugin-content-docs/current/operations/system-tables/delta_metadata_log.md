---
description: '包含从 Delta Lake 表中读取的元数据文件相关信息的系统表。每个条目表示一个根元数据 JSON 文件。'
keywords: ['system table', 'delta_lake_metadata_log']
slug: /operations/system-tables/delta_lake_metadata_log
title: 'system.delta_lake_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` 表记录了 ClickHouse 读取 Delta Lake 表时的元数据访问和解析事件。它为每个元数据文件提供详细信息，有助于调试、审计以及理解 Delta 表结构的演进情况。



## 用途 {#purpose}

此表记录从 Delta Lake 表中读取的每个元数据文件。它帮助用户追踪 ClickHouse 如何解释 Delta 表元数据,并诊断与架构演进、快照解析或查询规划相关的问题。

:::note
此表主要用于调试目的。
:::


## 列 {#columns}

| 名称         | 类型                                                   | 描述                                       |
| ------------ | ------------------------------------------------------ | ------------------------------------------------- |
| `event_date` | [Date](../../sql-reference/data-types/date.md)         | 日志文件的日期。                             |
| `event_time` | [DateTime](../../sql-reference/data-types/datetime.md) | 事件的时间戳。                           |
| `query_id`   | [String](../../sql-reference/data-types/string.md)     | 触发元数据读取的查询 ID。        |
| `table_path` | [String](../../sql-reference/data-types/string.md)     | Delta Lake 表的路径。                     |
| `file_path`  | [String](../../sql-reference/data-types/string.md)     | 根元数据 JSON 文件的路径。              |
| `content`    | [String](../../sql-reference/data-types/string.md)     | JSON 格式的内容(来自 .json 文件的原始元数据)。 |

<SystemTableCloud />


## 控制日志详细程度 {#controlling-log-verbosity}

您可以使用 [`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) 设置来控制记录哪些元数据事件。

要记录当前查询中使用的所有元数据：

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
