---
'description': 'システムテーブルは、クエリ条件キャッシュの内容を表示します。'
'keywords':
- 'system table'
- 'query_condition_cache'
'slug': '/operations/system-tables/query_condition_cache'
'title': 'system.query_condition_cache'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_condition_cache

<SystemTableCloud/>

[クエリ条件キャッシュ](../query-condition-cache.md)の内容を表示します。

カラム:

- `table_uuid` ([String](../../sql-reference/data-types/string.md)) — テーブルのUUID。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — パーツの名前。
- `condition` ([String](/sql-reference/data-types/string.md)) — ハッシュ化されたフィルター条件。setting query_condition_cache_store_conditions_as_plaintext = true の場合のみ設定されます。
- `condition_hash` ([UInt64](/sql-reference/data-types/int-uint.md)) — フィルター条件のハッシュ。
- `entry_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エントリのサイズ（バイト単位）。
- `matching_marks` ([String](../../sql-reference/data-types/string.md)) — 一致マーク。

**例**

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
