---
'description': 'システムテーブルはクエリキャッシュの内容を表示します。'
'keywords':
- 'system table'
- 'query_cache'
'slug': '/operations/system-tables/query_cache'
'title': 'system.query_cache'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_cache

<SystemTableCloud/>

クエリキャッシュの内容を表示します。[query cache](../query-cache.md) に関する情報です。

カラム:

- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `result_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリキャッシュエントリのサイズ。
- `tag` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — クエリキャッシュエントリのタグ。
- `stale` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが古いかどうか。
- `shared` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが複数のユーザー間で共有されているかどうか。
- `compressed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが圧縮されているかどうか。
- `expires_at` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリキャッシュエントリが古くなる時間。
- `key_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ文字列のハッシュで、クエリキャッシュエントリを見つけるためのキーとして使用されます。

**例**

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
