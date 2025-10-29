---
'description': '系统表，显示查询缓存的内容。'
'keywords':
- 'system table'
- 'query_cache'
'slug': '/operations/system-tables/query_cache'
'title': 'system.query_cache'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_cache

<SystemTableCloud/>

显示 [查询缓存](../query-cache.md) 的内容。

列：

- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
- `result_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询缓存条目的大小。
- `tag` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 查询缓存条目的标签。
- `stale` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询缓存条目是否已过期。
- `shared` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询缓存条目是否在多个用户之间共享。
- `compressed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询缓存条目是否被压缩。
- `expires_at` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询缓存条目变为过期的时间。
- `key_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询字符串的哈希值，用作查找查询缓存条目的键。

**示例**

```sql
SELECT * FROM system.query_cache FORMAT Vertical;
```

```text
Row 1:
──────
query:       SELECT 1 SETTINGS use_query_cache = 1
query_id:    7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
result_size: 128
tag:
stale:       0
shared:      0
compressed:  1
expires_at:  2023-10-13 13:35:45
key_hash:    12188185624808016954

1 row in set. Elapsed: 0.004 sec.
```
