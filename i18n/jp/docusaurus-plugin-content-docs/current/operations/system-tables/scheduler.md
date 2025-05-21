---
description: 'ローカルサーバー上に存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。'
keywords: ['system table', 'scheduler']
slug: /operations/system-tables/scheduler
title: 'system.scheduler'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.scheduler

<SystemTableCloud/>

ローカルサーバー上に存在する [スケジューリングノード](/operations/workload-scheduling.md/#hierarchy) に関する情報とステータスを含みます。このテーブルは監視に使用できます。テーブルは各スケジューリングノードの行を含みます。

例:

```sql
SELECT *
FROM system.scheduler
WHERE resource = 'network_read' AND path = '/prio/fair/prod'
FORMAT Vertical
```

```text
Row 1:
──────
resource:          network_read
path:              /prio/fair/prod
type:              fifo
weight:            5
priority:          0
is_active:         0
active_children:   0
dequeued_requests: 67
canceled_requests: 0
dequeued_cost:     4692272
canceled_cost:     0
busy_periods:      63
vruntime:          938454.1999999989
system_vruntime:   ᴺᵁᴸᴸ
queue_length:      0
queue_cost:        0
budget:            -60524
is_satisfied:      ᴺᵁᴸᴸ
inflight_requests: ᴺᵁᴸᴸ
inflight_cost:     ᴺᵁᴸᴸ
max_requests:      ᴺᵁᴸᴸ
max_cost:          ᴺᵁᴸᴸ
max_speed:         ᴺᵁᴸᴸ
max_burst:         ᴺᵁᴸᴸ
throttling_us:     ᴺᵁᴸᴸ
tokens:            ᴺᵁᴸᴸ
```

カラム:

- `resource` (`String`) - リソース名
- `path` (`String`) - このリソースのスケジューリング階層内のスケジューリングノードへのパス
- `type` (`String`) - スケジューリングノードのタイプ。
- `weight` (`Float64`) - `fair` タイプの親ノードによって使用されるノードの重み。
- `priority` (`Int64`) - 'priority' タイプの親ノードによって使用されるノードの優先度 (値が低いほど優先度が高い)。
- `is_active` (`UInt8`) - このノードが現在アクティブかどうか - デキューされるリソースリクエストがあり、制約が満たされている。
- `active_children` (`UInt64`) - アクティブ状態の子ノードの数。
- `dequeued_requests` (`UInt64`) - このノードからデキューされたリソースリクエストの総数。
- `canceled_requests` (`UInt64`) - このノードからキャンセルされたリソースリクエストの総数。
- `dequeued_cost` (`UInt64`) - このノードからデキューされたすべてのリクエストのコストの合計 (例: バイト単位のサイズ)。
- `canceled_cost` (`UInt64`) - このノードからキャンセルされたすべてのリクエストのコストの合計 (例: バイト単位のサイズ)。
- `busy_periods` (`UInt64`) - このノードの非アクティブ化の総数。
- `vruntime` (`Nullable(Float64)`) - `fair` ノードの子ノードのみ。最大最小公正方式で次の子ノードを処理するためにSFQアルゴリズムによって使用されるノードの仮想実行時間。
- `system_vruntime` (`Nullable(Float64)`) - `fair` ノードのみ。最後に処理されたリソースリクエストの `vruntime` を示す仮想実行時間。子ノードのアクティブ化時に新しい `vruntime` の値として使用されます。
- `queue_length` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するリソースリクエストの現在の数。
- `queue_cost` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するすべてのリクエストのコストの合計 (例: バイト単位のサイズ)。
- `budget` (`Nullable(Int64)`) - `fifo` ノードのみ。新しいリソースリクエストのための利用可能な「コスト単位」の数。リソースリクエストの推定コストと実際のコストに乖離がある場合に出現することがあります (例: 読み込み/書き込み失敗後)。
- `is_satisfied` (`Nullable(UInt8)`) - 制約ノードのみ (例: `inflight_limit`)。このノードのすべての制約が満たされている場合は `1` になります。
- `inflight_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされたリソースリクエストの数で、現在消費状態にあるもの。
- `inflight_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされたすべてのリソースリクエストのコストの合計 (例: バイト単位) で、現在消費状態にあるもの。
- `max_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_requests` の上限。
- `max_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_cost` の上限。
- `max_speed` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークン毎秒での帯域幅の上限。
- `max_burst` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロットラーで利用可能な `tokens` の上限。
- `throttling_us` (`Nullable(Int64)`) - `bandwidth_limit` ノードのみ。このノードがスロットリング状態にあった合計マイクロ秒数。
- `tokens` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロットラーで現在利用可能なトークンの数。

