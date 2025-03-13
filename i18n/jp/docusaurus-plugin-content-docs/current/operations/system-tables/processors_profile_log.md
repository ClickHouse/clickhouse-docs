---
description: "プロセッサーレベルのプロファイリング情報を含むシステムテーブル（`EXPLAIN PIPELINE`で見つけることができます）"
slug: /operations/system-tables/processors_profile_log
title: "system.processors_profile_log"
keywords: ["system table", "processors_profile_log", "EXPLAIN PIPELINE"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

このテーブルにはプロセッサーレベルのプロファイリング情報が含まれています（それは[`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)で見つけることができます）。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントが発生した日時。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生したマイクロ秒精度の日時。
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーのID。
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 親プロセッサーのID。
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーを作成したクエリプランステップのID。プロセッサーがどのステップからも追加されていない場合、値はゼロです。
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーがクエリプランステップによって作成された場合のグループ。グループは、同じクエリプランステップから追加されたプロセッサーの論理的な部分分けです。グループはEXPLAIN PIPELINEの結果を美しくするためだけに使用されます。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリのID（分散クエリ実行用）。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — プロセッサーの名前。
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーが実行されたマイクロ秒数。
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーがデータを待機していたマイクロ秒数（他のプロセッサーから）。
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーが出力ポートがいっぱいだったために待機していたマイクロ秒数。
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって消費された行数。
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって消費されたバイト数。
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって生成された行数。
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって生成されたバイト数。
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
クエリID: feb5ed16-1c24-4227-aa54-78c02b3b27d4
┌─sleep(1)─┐
│        0 │
└──────────┘
1行がセットに含まれています。経過時間: 1.018秒。

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

ここで見ることができます:

- `ExpressionTransform`は`sleep(1)`関数を実行していて、そのため`work`は1e6までかかるため、`elapsed_us` > 1e6です。
- `SourceFromSingleChunk`は待機する必要があります。なぜなら`ExpressionTransform`は`sleep(1)`の実行中にデータを受け取れないからです。そのため、`PortFull`状態になるのは1e6 usまでで、`output_wait_elapsed_us` > 1e6です。
- `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat`は、結果を処理するために`ExpressionTransform`が`sleep(1)`を実行するまで待機する必要があり、そのため`input_wait_elapsed_us` > 1e6です。

**参照**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
