---
description: "ローカルサーバーに存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。"
slug: /operations/system-tables/scheduler
title: "スケジューラ"
keywords: ["システムテーブル", "スケジューラ"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

ローカルサーバーに存在する[scheduling nodes](/operations/workload-scheduling.md/#hierarchy)に関する情報とステータスを含みます。  
このテーブルはモニタリングに使用できます。テーブルには各スケジューリングノードの行が含まれています。

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
system_vruntime:   ᴺᵁᴸᴸ
queue_length:      0
queue_cost:        0
budget:            -60524
is_satisfied:      ᴺᵁᴸᴸ
inflight_requests: ᴺᵁᴸᴸ
inflight_cost:     ᴺᵁᴼᴸ
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
- `weight` (`Float64`) - `fair` タイプの親ノードによって使用されるノードの重み。
- `priority` (`Int64`) - 'priority' タイプの親ノードによって使用されるノードの優先度（値が低いほど優先度が高い）。
- `is_active` (`UInt8`) - このノードが現在アクティブであるかどうか - デキューされるリソースリクエストがあり、制約が満たされている。
- `active_children` (`UInt64`) - アクティブな状態の子ノードの数。
- `dequeued_requests` (`UInt64`) - このノードからデキューされたリソースリクエストの合計数。
- `canceled_requests` (`UInt64`) - このノードからキャンセルされたリソースリクエストの合計数。
- `dequeued_cost` (`UInt64`) - このノードからデキューされたすべてのリクエストのコストの合計（例：バイトサイズ）。
- `canceled_cost` (`UInt64`) - このノードからキャンセルされたすべてのリクエストのコストの合計（例：バイトサイズ）。
- `busy_periods` (`UInt64`) - このノードの非アクティブ化の合計回数。
- `vruntime` (`Nullable(Float64)`) - `fair` ノードの子ノードのみ。最大最小公平に処理する次の子を選択するためにSFQアルゴリズムによって使用されるノードの仮想実行時間。
- `system_vruntime` (`Nullable(Float64)`) - `fair` ノードのみ。最後に処理されたリソースリクエストの `vruntime` を示す仮想実行時間。子のアクティベーション時に `vruntime` の新しい値として使用される。
- `queue_length` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するリソースリクエストの現在の数。
- `queue_cost` (`Nullable(UInt64)`) - `fifo` ノードのみ。キュー内に存在するすべてのリクエストのコストの合計（例：バイトサイズ）。
- `budget` (`Nullable(Int64)`) - `fifo` ノードのみ。新しいリソースリクエストのために利用可能な「コスト単位」の数。リソースリクエストの推定コストと実コストの不一致が発生した場合に現れる可能性があります（例：読み取り/書き込みの失敗後）。
- `is_satisfied` (`Nullable(UInt8)`) - 制約ノードのみ（例：`inflight_limit`）。このノードのすべての制約が満たされている場合は `1`。
- `inflight_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされたリソースリクエストの数で、現在消費状態にある。
- `inflight_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。このノードからデキューされたリソースリクエストのコストの合計（例：バイト）で、現在消費状態にある。
- `max_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_requests` の上限。
- `max_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみ。制約違反を引き起こす `inflight_cost` の上限。
- `max_speed` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。1秒あたりのトークンの帯域幅の上限。
- `max_burst` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロッターで利用可能な `tokens` の上限。
- `throttling_us` (`Nullable(Int64)`) - `bandwidth_limit` ノードのみ。このノードがスロットリング状態にあった合計マイクロ秒数。
- `tokens` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみ。トークンバケットスロッターで現在利用可能なトークンの数。
