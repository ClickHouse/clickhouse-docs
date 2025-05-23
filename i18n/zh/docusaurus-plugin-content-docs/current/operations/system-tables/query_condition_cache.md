---
'description': '系统表，显示查询条件缓存的内容。'
'keywords':
- 'system table'
- 'query_condition_cache'
'slug': '/operations/system-tables/query_condition_cache'
'title': 'system.query_condition_cache'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_condition_cache

<SystemTableCloud/>

显示 [查询条件缓存](../query-condition-cache.md) 的内容。

列：

- `table_uuid` ([String](../../sql-reference/data-types/string.md)) — 表的 UUID。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — 分片名称。
- `condition` ([String](/sql-reference/data-types/string.md)) — 哈希过滤条件。仅在设置 query_condition_cache_store_conditions_as_plaintext = true 时设置。
- `condition_hash` ([String](/sql-reference/data-types/string.md)) — 过滤条件的哈希值。
- `entry_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 条目的大小（字节）。
- `matching_marks` ([String](../../sql-reference/data-types/string.md)) — 匹配标记。

**示例**

```sql
SELECT * FROM system.query_condition_cache FORMAT Vertical;
```

```text
Row 1:
──────
table_uuid:     28270a24-ea27-49f6-99cd-97b9bee976ac
part_name:      all_1_1_0
condition:      or(equals(b, 10000_UInt16), equals(c, 10000_UInt16))
condition_hash: 5456494897146899690 -- 5.46 quintillion
entry_size:     40
matching_marks: 111111110000000000000000000000000000000000000000000000000111111110000000000000000

1 row in set. Elapsed: 0.004 sec.
```
