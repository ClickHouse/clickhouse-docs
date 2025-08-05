---
description: 'System table containing information about and status of scheduling
  nodes residing on the local server.'
keywords:
- 'system table'
- 'scheduler'
slug: '/operations/system-tables/scheduler'
title: 'system.scheduler'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.scheduler

<SystemTableCloud/>

ローカルサーバー上に存在する [スケジューリングノード](/operations/workload-scheduling.md/#hierarchy) に関する情報とステータスが含まれています。このテーブルは監視に使用できます。このテーブルには、各スケジューリングノードの行があります。

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
- `path` (`String`) - このリソーススケジューリング階層内のスケジューリングノードへのパス
- `type` (`String`) - スケジューリングノードのタイプ。
- `weight` (`Float64`) - ノードの重み。`fair` タイプの親ノードによって使用されます。
- `priority` (`Int64`) - ノードの優先度。'priority' タイプの親ノードによって使用されます（値が低いほど優先度が高い）。
- `is_active` (`UInt8`) - このノードが現在アクティブであるかどうか - デキューされるリソースリクエストがあり、制約が満たされているかどうか。
- `active_children` (`UInt64`) - アクティブな状態の子ノードの数。
- `dequeued_requests` (`UInt64`) - このノードからデキューされたリソースリクエストの合計数。
- `canceled_requests` (`UInt64`) - このノードからキャンセルされたリソースリクエストの合計数。
- `dequeued_cost` (`UInt64`) - このノードからデキューされたすべてのリクエストのコスト（バイト数など）の合計。
- `canceled_cost` (`UInt64`) - このノードからキャンセルされたすべてのリクエストのコスト（バイト数など）の合計。
- `busy_periods` (`UInt64`) - このノードの非アクティブ化の合計回数。
- `vruntime` (`Nullable(Float64)`) - `fair` ノードの子ノードのみ。ノードの仮想実行時間。SFQアルゴリズムを使用して処理する次の子を選択するために使用されます。
- `system_vruntime` (`Nullable(Float64)`) - `fair` ノードのみ。最後に処理されたリソースリクエストの `vruntime` を示す仮想実行時間。子ノードのアクティブ化時に新しい `vruntime` の値として使用されます。
- `queue_length` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するリソースリクエストの現在の数。
- `queue_cost` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するすべてのリクエストのコスト（バイト数など）の合計。
- `budget` (`Nullable(Int64)`) - `fifo` ノードのみ。新しいリソースリクエストのための利用可能な「コスト単位」の数。リソースリクエストの推定コストと実際のコストが不一致の場合に発生することがあります（例：読み取り/書き込みエラー後）。
- `is_satisfied` (`Nullable(UInt8)`) - 制約ノードのみ（例：`inflight_limit`）。このノードのすべての制約が満たされている場合は `1`。
- `inflight_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされ、現在消費中のリソースリクエストの数。
- `inflight_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされ、現在消費中のリソースリクエストのコスト（バイト数など）の合計。
- `max_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_requests` の上限。
- `max_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_cost` の上限。
- `max_speed` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークン毎秒の帯域幅の上限。
- `max_burst` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロットル内で利用可能な `tokens` の上限。
- `throttling_us` (`Nullable(Int64)`) - `bandwidth_limit` ノードのみ。このノードがサーボ状態だったマイクロ秒の合計。
- `tokens` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロットルで現在利用可能なトークンの数。
