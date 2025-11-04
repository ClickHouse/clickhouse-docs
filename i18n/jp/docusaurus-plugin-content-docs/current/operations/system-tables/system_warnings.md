---
'description': 'このテーブルには、ClickHouseサーバーに関する警告メッセージが含まれています。'
'keywords':
- 'system table'
- 'warnings'
'slug': '/operations/system-tables/system_warnings'
'title': 'system.warnings'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

このテーブルは ClickHouse サーバーの警告を示します。  
同じタイプの警告は1つの警告にまとめられます。  
例えば、接続されているデータベースの数 N が設定可能な閾値 T を超えると、現在の値 N を含む1つのエントリが表示され、N 個の別々のエントリは表示されません。  
現在の値が閾値を下回ると、そのエントリはテーブルから削除されます。

このテーブルは次の設定で構成できます：

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
- [max_named_collection_num_to_warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
- [resource_overload_warnings](/operations/settings/server-overload#resource-overload-warnings)

列：

- `message` ([String](../../sql-reference/data-types/string.md)) — 警告メッセージ。
- `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — メッセージをフォーマットするために使用されるフォーマット文字列。

**例**

クエリ：

```sql
SELECT * FROM system.warnings LIMIT 2 \G;
```

結果：

```text
Row 1:
──────
message:               The number of active parts is more than 10.
message_format_string: The number of active parts is more than {}.

Row 2:
──────
message:               The number of attached databases is more than 2.
message_format_string: The number of attached databases is more than {}.
```
