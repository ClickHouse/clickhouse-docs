---
description: 'Системная таблица, содержащая информацию, полезную для обзора использования памяти и ProfileEvents пользователей.'
slug: /operations/system-tables/user_processes
title: 'system.user_processes'
keywords: ['системная таблица', 'user_processes']
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Эта системная таблица может быть использована для получения обзора использования памяти и ProfileEvents пользователей.

Колонки:

- `user` ([String](../../sql-reference/data-types/string.md)) — Имя пользователя.
- `memory_usage` ([Int64](/sql-reference/data-types/int-uint#integer-ranges)) – Сумма используемой оперативной памяти всеми процессами пользователя. Она может не включать некоторые типы выделенной памяти. См. настройку [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage).
- `peak_memory_usage` ([Int64](/sql-reference/data-types/int-uint#integer-ranges)) — Пик использования памяти пользователем. Он может быть сброшен, когда для пользователя не выполняются запросы.
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map)) – Сводка ProfileEvents, которые измеряют различные метрики для пользователя. Описание их можно найти в таблице [system.events](/operations/system-tables/events)

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
