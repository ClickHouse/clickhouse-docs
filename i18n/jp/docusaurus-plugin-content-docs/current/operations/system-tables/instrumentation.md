---
description: '計測ポイントを含むシステムテーブル'
keywords: ['システムテーブル', '計測']
slug: /operations/system-tables/instrumentation
title: 'system.instrumentation'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.instrumentation {#systeminstrumentation}

<SystemTableCloud />

LLVM の XRay 機能を使用したインストルメンテーションポイントを含むシステムテーブルです。

カラム:

* `id` ([UInt32](../../sql-reference/data-types/int-uint.md)) — インストルメンテーションポイントの ID。
* `function_id` ([Int32](../../sql-reference/data-types/int-uint.md)) — ELF バイナリの `xray_instr_map` セクション内で関数に割り当てられた ID。
* `function_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 関数をインストルメントするために使用される名前。
* `handler` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — ハンドラーの種別。
* `entry_type` ([Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1, &#39;EntryAndExit&#39; = 2)](../../sql-reference/data-types/enum.md)) — エントリの種別: `Entry`、`Exit`、`EntryAndExit`。
* `symbol` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 完全なデマングル済みシンボル。
* `parameters` ([Array(Dynamic)](../../sql-reference/data-types/array.md)) — ハンドラー呼び出しに渡されるパラメータ。

**例**

```sql
SELECT * FROM system.instrumentation FORMAT Vertical;
```

```text
行 1:
──────
id:            0
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       log
entry_type:    Entry
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    ['test']

行 2:
──────
id:            1
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       profile
entry_type:    EntryAndExit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    []

行 3:
──────
id:            2
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       sleep
entry_type:    Exit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    [0.3]

3行のセット。経過時間: 0.302秒。
```

**関連項目**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — 計測ポイントの追加または削除を行います。
* [system.trace&#95;log](../../operations/system-tables/trace_log.md) — プロファイリングログを確認します。
* [system.symbols](../../operations/system-tables/symbols.md) — 計測ポイントの追加に使用するシンボルを確認します。
