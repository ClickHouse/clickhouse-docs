---
description: 'このテーブルには、ClickHouse サーバーに関する警告メッセージが格納されています。'
keywords: [ 'システムテーブル', '警告' ]
slug: /operations/system-tables/system_warnings
title: 'system.warnings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.warnings \\{#systemwarnings\\}

<SystemTableCloud />

このテーブルは ClickHouse サーバーに関する警告を表示します。
同種の警告は 1 つの警告にまとめられます。
たとえば、アタッチされているデータベースの数 N が設定可能なしきい値 T を超えた場合、N 個の個別エントリではなく、現在の値 N を含む 1 つのエントリのみが表示されます。
現在の値がしきい値を下回ると、そのエントリはテーブルから削除されます。

このテーブルは次の設定で調整できます:

* [max&#95;table&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
* [max&#95;database&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
* [max&#95;dictionary&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
* [max&#95;view&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
* [max&#95;part&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
* [max&#95;pending&#95;mutations&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
* [max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
* [max&#95;named&#95;collection&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
* [resource&#95;overload&#95;warnings](/operations/settings/server-overload#resource-overload-warnings)

列:

* `message` ([String](../../sql-reference/data-types/string.md)) — 警告メッセージ。
* `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — メッセージの整形に使用されるフォーマット文字列。

**例**

クエリ:

```sql
 SELECT * FROM system.warnings LIMIT 2 \G;
```

結果:

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
