---
description: "システムテーブルで、エラーコードとそれがトリガーされた回数を含んでいます。"
slug: /operations/system-tables/errors
title: "system.errors"
keywords: ["システムテーブル", "エラー"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

エラーコードとそれがトリガーされた回数を含んでいます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — エラーの名前 (`errorCodeToName`)。
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — エラーのコード番号。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このエラーが発生した回数。
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最後のエラーが発生した時刻。
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最後のエラーに関するメッセージ。
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 呼び出されたメソッドが格納されている物理アドレスのリストを表す [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リモート例外（すなわち、分散クエリのいずれかで受信されたもの）。

:::note
いくつかのエラーのカウンターは、成功したクエリの実行中に増加する場合があります。このテーブルをサーバー監視の目的で使用することは推奨されません。該当するエラーが誤検知でないことが確実である場合を除きます。
:::

**例**

``` sql
SELECT name, code, value
FROM system.errors
WHERE value > 0
ORDER BY code ASC
LIMIT 1

┌─name─────────────┬─code─┬─value─┐
│ CANNOT_OPEN_FILE │   76 │     1 │
└──────────────────┴──────┴───────┘
```

``` sql
WITH arrayMap(x -> demangle(addressToSymbol(x)), last_error_trace) AS all
SELECT name, arrayStringConcat(all, '\n') AS res
FROM system.errors
LIMIT 1
SETTINGS allow_introspection_functions=1\G
```
