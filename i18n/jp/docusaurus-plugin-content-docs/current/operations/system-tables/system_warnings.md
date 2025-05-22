---
'description': 'This table contains warning messages about clickhouse server.'
'keywords':
- 'system table'
- 'warnings'
'slug': '/operations/system-tables/system_warnings'
'title': 'system.warnings'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

このテーブルは、ClickHouse サーバーに関する警告を表示します。 同じ種類の警告は、1 つの警告にまとめられます。 たとえば、接続されているデータベースの数 N が構成可能な閾値 T を超えると、N 個の個別のエントリの代わりに、現在の値 N を含む単一のエントリが表示されます。 現在の値が閾値を下回ると、エントリはテーブルから削除されます。

テーブルは、次の設定で構成できます：

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)

カラム：

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
message:               アクティブなパーツの数が 10 を超えています。
message_format_string: アクティブなパーツの数が {} を超えています。

Row 2:
──────
message:               接続されているデータベースの数が 2 を超えています。
message_format_string: 接続されているデータベースの数が {} を超えています。
```
