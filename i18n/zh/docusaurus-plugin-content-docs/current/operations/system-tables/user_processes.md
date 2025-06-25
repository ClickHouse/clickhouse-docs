---
'description': '系统表包含用户内存使用情况和ProfileEvents的概览信息。'
'keywords':
- 'system table'
- 'user_processes'
'slug': '/operations/system-tables/user_processes'
'title': 'system.user_processes'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.user_processes

<SystemTableCloud/>

此系统表可用于获取用户的内存使用情况和 ProfileEvents 的概述。

列：

- `user` ([String](../../sql-reference/data-types/string.md)) — 用户名。
- `memory_usage` ([Int64](/sql-reference/data-types/int-uint#integer-ranges)) – 用户所有进程使用的内存（RAM）总和。它可能不包括某些类型的专用内存。请参见 [max_memory_usage](/operations/settings/settings#max_memory_usage) 设置。
- `peak_memory_usage` ([Int64](/sql-reference/data-types/int-uint#integer-ranges)) — 用户的内存使用峰值。当用户没有运行查询时，它可以被重置。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map)) – 测量用户不同指标的 ProfileEvents 汇总。它们的描述可以在表 [system.events](/operations/system-tables/events) 中找到。

```sql
SELECT * FROM system.user_processes LIMIT 10 FORMAT Vertical;
```

```response
Row 1:
──────
user:              default
memory_usage:      9832
peak_memory_usage: 9832
ProfileEvents:     {'Query':5,'SelectQuery':5,'QueriesWithSubqueries':38,'SelectQueriesWithSubqueries':38,'QueryTimeMicroseconds':842048,'SelectQueryTimeMicroseconds':842048,'ReadBufferFromFileDescriptorRead':6,'ReadBufferFromFileDescriptorReadBytes':234,'IOBufferAllocs':3,'IOBufferAllocBytes':98493,'ArenaAllocChunks':283,'ArenaAllocBytes':1482752,'FunctionExecute':670,'TableFunctionExecute':16,'DiskReadElapsedMicroseconds':19,'NetworkSendElapsedMicroseconds':684,'NetworkSendBytes':139498,'SelectedRows':6076,'SelectedBytes':685802,'ContextLock':1140,'RWLockAcquiredReadLocks':193,'RWLockReadersWaitMilliseconds':4,'RealTimeMicroseconds':1585163,'UserTimeMicroseconds':889767,'SystemTimeMicroseconds':13630,'SoftPageFaults':1947,'OSCPUWaitMicroseconds':6,'OSCPUVirtualTimeMicroseconds':903251,'OSReadChars':28631,'OSWriteChars':28888,'QueryProfilerRuns':3,'LogTrace':79,'LogDebug':24}

1 row in set. Elapsed: 0.010 sec.
```
