description: 'このテーブルには ClickHouse サーバーに関する警告メッセージが含まれています。'
keywords: [ 'システムテーブル', '警告' ]
slug: /operations/system-tables/system_warnings
title: 'system.warnings'
```

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

このテーブルは ClickHouse サーバーに関する警告を表示します。  
同じタイプの警告は1つの警告にまとめられます。  
たとえば、接続されているデータベースの数 N が設定可能なしきい値 T を超えると、現在の値 N を含む単一エントリが表示され、N 個の別々のエントリは表示されません。  
現在の値がしきい値を下回ると、そのエントリはテーブルから削除されます。

テーブルは次の設定で構成できます：

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
行 1:
──────
message:               アクティブなパーツの数が10を超えています。
message_format_string: アクティブなパーツの数は {} を超えています。

行 2:
──────
message:               接続されているデータベースの数が2を超えています。
message_format_string: 接続されているデータベースの数は {} を超えています。
