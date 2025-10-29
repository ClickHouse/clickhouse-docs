---
'description': 'システムテーブルはプロセッサーレベルに関するプロファイリング情報を含みます（`EXPLAIN PIPELINE`で見つけることができます）'
'keywords':
- 'system table'
- 'processors_profile_log'
- 'EXPLAIN PIPELINE'
'slug': '/operations/system-tables/processors_profile_log'
'title': 'system.processors_profile_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.processors_profile_log

<SystemTableCloud/>

このテーブルには、プロセッサーレベルのプロファイリングが含まれています（これは[`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)で見つけることができます）。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントが発生した日付と時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生したマイクロ秒精度の日付と時間。
- `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーのID。
- `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 親プロセッサーのID。
- `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーを作成したクエリプランステップのID。プロセッサーがどのステップからも追加されなかった場合、その値はゼロになります。
- `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーがクエリプランステップによって作成された場合のグループ。グループは同じクエリプランステップから追加されたプロセッサーの論理分割です。グループはEXPLAIN PIPELINEの結果を美化するためにのみ使用されます。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 最初のクエリのID（分散クエリ実行用）。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — プロセッサーの名前。
- `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーが実行されていたマイクロ秒数。
- `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーがデータを待っていたマイクロ秒数（他のプロセッサーから）。
- `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — このプロセッサーが出力ポートが満杯のために待っていたマイクロ秒数。
- `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって消費された行数。
- `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって消費されたバイト数。
- `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって生成された行数。
- `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — プロセッサーによって生成されたバイト数。

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

結果:

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

ここでわかること:

- `ExpressionTransform`は`sleep(1)`関数を実行していたため、`work`は1e6を要し、したがって`elapsed_us` > 1e6となります。
- `SourceFromSingleChunk`は待つ必要があります。なぜなら`ExpressionTransform`は`sleep(1)`の実行中にデータを受け付けないため、`PortFull`状態で1e6 us待機し、したがって`output_wait_elapsed_us` > 1e6となります。
- `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat`は、`ExpressionTransform`が`sleep(1)`を実行して結果を処理するまで待機する必要があり、したがって`input_wait_elapsed_us` > 1e6となります。

**関連情報**

- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
