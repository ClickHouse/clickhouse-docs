---
'description': '系统表，包含错误代码以及它们触发的次数。'
'keywords':
- 'system table'
- 'errors'
'slug': '/operations/system-tables/errors'
'title': 'system.errors'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含错误代码及其触发次数。

要显示所有可能的错误代码，包括未触发的错误代码，请将设置 [system_events_show_zero_values](../settings/settings.md#system_events_show_zero_values) 设置为 1。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 错误的名称 (`errorCodeToName`)。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 错误的代码编号。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此错误发生的次数。
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最后一次错误发生的时间。
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最后一次错误的消息。
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 一个 [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)，表示调用方法存储的物理地址列表。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 远程异常（即在一次分布式查询中收到的异常）。

:::note
某些错误的计数器可能在成功的查询执行期间增加。除非您确定相应的错误不可能是误报，否则不推荐将此表用于服务器监控目的。
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
