---
'description': '包含有关待处理异步插入队列的信息的系统表。'
'keywords':
- 'system table'
- 'asynchronous_inserts'
'slug': '/operations/system-tables/asynchronous_inserts'
'title': '系统.异步插入'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关待处理的异步插入队列的信息。

列：

- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `format` ([String](/sql-reference/data-types/string.md)) — 格式名称。
- `first_update` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 第一次插入时间，精确到微秒。
- `total_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 队列中待处理的字节总数。
- `entries.query_id` ([Array(String)](../../sql-reference/data-types/array.md)) - 等待队列中插入的查询ID数组。
- `entries.bytes` ([Array(UInt64)](../../sql-reference/data-types/array.md)) - 等待队列中每个插入查询的字节数组。

**示例**

查询：

```sql
SELECT * FROM system.asynchronous_inserts LIMIT 1 \G;
```

结果：

```text
Row 1:
──────
query:            INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:         public
table:            data_guess
format:           CSV
first_update:     2023-06-08 10:08:54.199606
total_bytes:      133223
entries.query_id: ['b46cd4c4-0269-4d0b-99f5-d27668c6102e']
entries.bytes:    [133223]
```

**另请参见**

- [system.query_log](/operations/system-tables/query_log) — 描述 `query_log` 系统表，该表包含有关查询执行的一般信息。
- [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) — 本表包含有关执行的异步插入的信息。
