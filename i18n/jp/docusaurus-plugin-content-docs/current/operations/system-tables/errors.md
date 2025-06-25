---
'description': 'System table containing error codes with the number of times they
  have been triggered.'
'keywords':
- 'system table'
- 'errors'
'slug': '/operations/system-tables/errors'
'title': 'system.errors'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

エラーコードとそれが発生した回数を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — エラーの名前 (`errorCodeToName`)。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーのコード番号。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最後のエラーが発生した時刻。
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最後のエラーメッセージ。
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 呼び出されたメソッドが格納されている物理アドレスのリストを表す [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（すなわち、分散クエリの1つ中に受信したもの）。

:::note
成功したクエリの実行中に、一部のエラーのカウンターが増加する場合があります。対応するエラーが誤検知でないと確信できない限り、このテーブルをサーバーの監視目的で使用することはお勧めしません。
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
