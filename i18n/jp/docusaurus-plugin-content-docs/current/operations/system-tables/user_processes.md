---
description: "ユーザーのメモリ使用状況と ProfileEvents の概要に役立つシステムテーブル。"
slug: /operations/system-tables/user_processes
title: "system.user_processes"
keywords: ["システムテーブル", "user_processes"]
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

このシステムテーブルは、ユーザーのメモリ使用状況と ProfileEvents の概要を取得するために使用できます。

カラム:

- `user` ([String](../../sql-reference/data-types/string.md)) — ユーザー名。
- `memory_usage` ([Int64](../../sql-reference/data-types/int-uint#int-ranges)) – ユーザーのすべてのプロセスによって使用される RAM の合計。専用のメモリの一部は含まれない場合があります。[max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage) 設定を参照してください。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint#int-ranges)) — ユーザーのメモリ使用量のピーク。ユーザーにクエリが実行されていないときにリセットされる可能性があります。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map)) – ユーザーのさまざまなメトリクスを測定する ProfileEvents の要約。これらの説明はテーブル [system.events](/operations/system-tables/events) に記載されています。

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
