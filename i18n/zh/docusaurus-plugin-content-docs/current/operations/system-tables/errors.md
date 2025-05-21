---
'description': 'System table containing error codes with the number of times they
  have been triggered.'
'keywords':
- 'system table'
- 'errors'
'slug': '/operations/system-tables/errors'
'title': 'system.errors'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含错误代码及其触发次数。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 错误的名称（`errorCodeToName`）。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 错误的代码号。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 发生该错误的次数。
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最后一次发生错误的时间。
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最后一次错误的消息。
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 一个 [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)，表示调用方法存储的物理地址列表。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 远程异常（即在分布式查询期间接收到的异常）。

:::note
某些错误的计数器在成功查询执行期间可能会增加。建议在对服务器监控的目的上使用此表，除非您确定对应的错误不能是误报。
:::

**示例**

```sql
SELECT name, code, value
FROM system.errors
WHERE value > 0
ORDER BY code ASC
LIMIT 1

┌─name─────────────┬─code─┬─value─┐
│ CANNOT_OPEN_FILE │   76 │     1 │
└──────────────────┴──────┴───────┘
```

```sql
WITH arrayMap(x -> demangle(addressToSymbol(x)), last_error_trace) AS all
SELECT name, arrayStringConcat(all, '\n') AS res
FROM system.errors
LIMIT 1
SETTINGS allow_introspection_functions=1\G
```
