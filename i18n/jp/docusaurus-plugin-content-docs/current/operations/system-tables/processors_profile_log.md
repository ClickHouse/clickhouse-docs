---
description: 'プロセッサーレベルのプロファイリング情報を保持するシステムテーブル（`EXPLAIN PIPELINE` で確認できます）'
keywords: ['system table', 'processors_profile_log', 'EXPLAIN PIPELINE']
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.processors&#95;profile&#95;log

<SystemTableCloud />

このテーブルには、プロセッサレベル（[`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline) で確認できる）のプロファイリング情報が含まれます。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントが発生した日時。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日時（マイクロ秒精度）。
* `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサの ID。
* `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 親プロセッサの ID。
* `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサを作成したクエリプランステップの ID。プロセッサがどのステップからも追加されていない場合、この値は 0 です。
* `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — クエリプランステップによって作成された場合のプロセッサのグループ。同一のクエリプランステップから追加されたプロセッサの論理的な区分。グループは EXPLAIN PIPELINE の結果を見やすくするためだけに使用されます。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリの ID（分散クエリ実行時）。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリの ID。
* `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — プロセッサ名。
* `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサが実行されていた時間（マイクロ秒）。
* `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサが（他のプロセッサからの）データを待機していた時間（マイクロ秒）。
* `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 出力ポートがフルだったためにこのプロセッサが待機していた時間（マイクロ秒）。
* `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサが消費した行数。
* `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサが消費したバイト数。
* `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサが生成した行数。
* `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサが生成したバイト数。
  **例**

クエリ:

```sql
EXPLAIN PIPELINE
SELECT sleep(1)
┌─explain─────────────────────────┐
│ (Expression)                    │
│ ExpressionTransform             │
│   (SettingQuotaAndLimits)       │
│     (ReadFromStorage)           │
│     SourceFromSingleChunk 0 → 1 │
└─────────────────────────────────┘

SELECT sleep(1)
SETTINGS log_processors_profiles = 1
Query id: feb5ed16-1c24-4227-aa54-78c02b3b27d4
┌─sleep(1)─┐
│        0 │
└──────────┘
1 rows in set. Elapsed: 1.018 sec.

SELECT
    name,
    elapsed_us,
    input_wait_elapsed_us,
    output_wait_elapsed_us
FROM system.processors_profile_log
WHERE query_id = 'feb5ed16-1c24-4227-aa54-78c02b3b27d4'
ORDER BY name ASC
```

結果：


```text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

ここでは次のことがわかります:

* `ExpressionTransform` は `sleep(1)` 関数を実行していたため、その `work` の実行時間は 1e6 us となり、その結果 `elapsed_us` &gt; 1e6 となります。
* `SourceFromSingleChunk` は待機する必要があります。これは、`ExpressionTransform` が `sleep(1)` の実行中はデータを一切受け付けないためであり、その間 1e6 us のあいだ `PortFull` 状態となるため、`output_wait_elapsed_us` &gt; 1e6 となります。
* `LimitsCheckingTransform`、`NullSource`、`LazyOutputFormat` は、結果を処理するために `ExpressionTransform` が `sleep(1)` を実行し終えるまで待機する必要があるため、`input_wait_elapsed_us` &gt; 1e6 となります。

**関連項目**

* [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
