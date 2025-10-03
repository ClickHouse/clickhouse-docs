---
description: 'System table which shows the content of the query cache.'
keywords:
- 'system table'
- 'query_cache'
slug: '/operations/system-tables/query_cache'
title: 'system.query_cache'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_cache

<SystemTableCloud/>

[クエリキャッシュ](../query-cache.md) の内容を表示します。

カラム:

- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `result_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリキャッシュエントリのサイズ。
- `tag` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — クエリキャッシュエントリのタグ。
- `stale` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが古いかどうか。
- `shared` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが複数のユーザー間で共有されているかどうか。
- `compressed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリキャッシュエントリが圧縮されているかどうか。
- `expires_at` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリキャッシュエントリが古くなる時刻。
- `key_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ文字列のハッシュで、クエリキャッシュエントリを検索するためのキーとして使用されます。

**例**

```sql
SELECT * FROM system.query_cache FORMAT Vertical;
```

```text
行 1:
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

1行の結果。経過時間: 0.004 秒。
```
