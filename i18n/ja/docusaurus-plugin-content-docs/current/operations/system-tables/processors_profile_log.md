---
description: "プロセッサーレベルのプロファイリング情報を含むシステムテーブル (これは `EXPLAIN PIPELINE` で見つけることができます)"
slug: /operations/system-tables/processors_profile_log
title: "processors_profile_log"
keywords: ["system table", "processors_profile_log", "EXPLAIN PIPELINE"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

このテーブルには、プロセッサーレベルのプロファイリング情報が含まれています（これは [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline) で見つけることができます）。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日時。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントが発生した日付と時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生したマイクロ秒精度の日付と時間。
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサのID。
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 親プロセッサのID。
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサを作成したクエリプランステップのID。プロセッサがどのステップからも追加されなかった場合、値はゼロとなります。
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — クエリプランステップによって作成された場合のプロセッサのグループ。グループは、同じクエリプランステップから追加されたプロセッサの論理的な区分です。グループは `EXPLAIN PIPELINE` の結果を見やすくするためにのみ使用されます。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリのID（分散クエリ実行用）。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — プロセッサの名前。
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサが実行されたマイクロ秒数。
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサがデータを待機していたマイクロ秒数（他のプロセッサからのデータ）。
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサが出力ポートがいっぱいで待機していたマイクロ秒数。
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサによって消費された行の数。
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサによって消費されたバイト数。
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサによって生成された行の数。
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサによって生成されたバイト数。

**例**

クエリ:

``` sql
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

結果:

``` text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

ここで確認できます:

- `ExpressionTransform` は `sleep(1)` 関数を実行しているため、`work` に1e6かかり、したがって `elapsed_us` は1e6を超えています。
- `SourceFromSingleChunk` は待機する必要があります。なぜなら、`ExpressionTransform` は `sleep(1)` の実行中にデータを受け入れないため、1e6マイクロ秒間 `PortFull` 状態に留まります。そのため、`output_wait_elapsed_us` は1e6を超えています。
- `LimitsCheckingTransform` / `NullSource` / `LazyOutputFormat` は、`ExpressionTransform` が `sleep(1)` を実行するまで待機する必要があります。結果を処理するため、`input_wait_elapsed_us` は1e6を超えています。

**関連情報**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
