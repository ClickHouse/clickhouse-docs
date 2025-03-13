---
description: "ローカルサーバー上に存在するスケジューリングノードに関する情報と状態を含むシステムテーブル。"
slug: /operations/system-tables/scheduler
title: "system.scheduler"
keywords: ["システムテーブル", "スケジューラー"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

ローカルサーバーに存在する [スケジューリングノード](/operations/workload-scheduling.md/#hierarchy) に関する情報と状態が含まれています。このテーブルは監視に使用できます。このテーブルには、すべてのスケジューリングノードに対して1行が含まれています。

例:

``` sql
SELECT *
FROM system.scheduler
WHERE resource = 'network_read' AND path = '/prio/fair/prod'
FORMAT Vertical
```

``` text
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
system_vruntime:   ᴺᵁᴺᴵ
queue_length:      0
queue_cost:        0
budget:            -60524
is_satisfied:      ᴺᵁᴺᴵ
inflight_requests: ᴺᵁᴺᴵ
inflight_cost:     ᴺᵁᴺᴵ
max_requests:      ᴺᵁᴺᴵ
max_cost:          ᴺᵁᴺᴵ
max_speed:         ᴺᵁᴺᴵ
max_burst:         ᴺᵁᴺᴵ
throttling_us:     ᴺᵁᴺᴵ
tokens:            ᴺᵁᴺᴵ
```

カラム:

- `resource` (`String`) - リソース名
- `path` (`String`) - このリソーススケジューリング階層内のスケジューリングノードへのパス
- `type` (`String`) - スケジューリングノードのタイプ。
- `weight` (`Float64`) - `fair` タイプの親ノードによって使用されるノードの重み。
- `priority` (`Int64`) - 'priority' タイプの親ノードによって使用されるノードの優先度（小さい値は高い優先度を意味します）。
- `is_active` (`UInt8`) - このノードが現在アクティブであるかどうか（リソース要求がデキューされ、制約が満たされているか）。
- `active_children` (`UInt64`) - アクティブ状態の子ノードの数。
- `dequeued_requests` (`UInt64`) - このノードからデキューされたリソース要求の総数。
- `canceled_requests` (`UInt64`) - このノードからキャンセルされたリソース要求の総数。
- `dequeued_cost` (`UInt64`) - このノードからデキューされたすべての要求のコストの合計（例：バイト単位のサイズ）。
- `canceled_cost` (`UInt64`) - このノードからキャンセルされたすべての要求のコストの合計（例：バイト単位のサイズ）。
- `busy_periods` (`UInt64`) - このノードの非アクティブ化の総数。
- `vruntime` (`Nullable(Float64)`) - `fair` ノードの子ノードにのみ。次の子を最大最小公平に処理するためにSFQアルゴリズムによって使用されるノードの仮想ランタイム。
- `system_vruntime` (`Nullable(Float64)`) - `fair` ノードのみに適用。最後に処理されたリソース要求の `vruntime` を示す仮想ランタイム。子のアクティベーション時に新しい `vruntime` の値として使用されます。
- `queue_length` (`Nullable(UInt64)`) - `fifo` ノードのみに適用。キュー内に存在するリソース要求の現在の数。
- `queue_cost` (`Nullable(UInt64)`) - `fifo` ノードのみに適用。キュー内に存在するすべての要求のコストの合計（例：バイト単位のサイズ）。
- `budget` (`Nullable(Int64)`) - `fifo` ノードのみに適用。新しいリソース要求のための「コスト単位」の利用可能な数。リソース要求の見積もりコストと実際のコストとの間に不一致がある場合に発生することがあります（例：読み取り/書き込みの失敗後）。
- `is_satisfied` (`Nullable(UInt8)`) - 制約ノードのみに適用（例：`inflight_limit`）。このノードのすべての制約が満たされていれば `1` に等しい。
- `inflight_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみに適用。このノードからデキューされたリソース要求の数で、現在消費状態にあります。
- `inflight_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみに適用。このノードからデキューされたすべてのリソース要求のコストの合計（例：バイト）で、現在消費状態にあります。
- `max_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみに適用。制約違反を引き起こす `inflight_requests` の上限。
- `max_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみに適用。制約違反を引き起こす `inflight_cost` の上限。
- `max_speed` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに適用。トークン毎秒あたりの帯域幅の上限。
- `max_burst` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに適用。トークンバケットスロットル器で利用可能なトークンの上限。
- `throttling_us` (`Nullable(Int64)`) - `bandwidth_limit` ノードのみに適用。このノードがスロットル状態であった合計マイクロ秒数。
- `tokens` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに適用。トークンバケットスロットル器で現在利用可能なトークンの数。
