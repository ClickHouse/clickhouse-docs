---
'description': 'システムテーブルで、エラーコードとそれがトリガーされた回数を含みます。'
'keywords':
- 'system table'
- 'errors'
'slug': '/operations/system-tables/errors'
'title': 'system.errors'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

エラーコードと、その発生回数を含みます。

トリガーされなかったエラーも含めて、すべてのエラーコードを表示するには、設定 [system_events_show_zero_values](../settings/settings.md#system_events_show_zero_values) を 1 に設定します。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — エラーの名前 (`errorCodeToName`)。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーのコード番号。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最後のエラーが発生した時間。
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最後のエラーのメッセージ。
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 呼び出されたメソッドが格納されている物理アドレスのリストを表す[A stack trace](https://en.wikipedia.org/wiki/Stack_trace)。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（つまり、分散クエリのいずれかの間に受信されたもの）。

:::note
一部のエラーに対しては、クエリの成功した実行中にカウンターが増加する場合があります。このテーブルをサーバーの監視目的で使用することは推奨されません。該当するエラーが偽陽性でないことが確実である場合を除きます。
:::

**例**

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
