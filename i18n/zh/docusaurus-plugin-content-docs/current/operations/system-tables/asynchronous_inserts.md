---
'description': '系统表包含有关队列中待处理的异步插入的信息。'
'keywords':
- 'system table'
- 'asynchronous_inserts'
'slug': '/operations/system-tables/asynchronous_inserts'
'title': 'system.asynchronous_inserts'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关队列中待处理异步插入的信息。

列：

- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `format` ([String](/sql-reference/data-types/string.md)) — 格式名称。
- `first_update` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 微秒级分辨率的第一次插入时间。
- `total_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 排队等待的总字节数。
- `entries.query_id` ([Array(String)](../../sql-reference/data-types/array.md)) - 等待队列中插入的查询 ID 数组。
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

**参见**

- [system.query_log](/operations/system-tables/query_log) — 描述 `query_log` 系统表的内容，该表包含有关查询执行的常见信息。
- [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) — 此表包含有关执行的异步插入的信息。
