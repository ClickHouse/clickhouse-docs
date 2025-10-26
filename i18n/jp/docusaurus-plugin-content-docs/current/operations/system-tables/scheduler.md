---
'description': 'ローカルサーバーに存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。'
'keywords':
- 'system table'
- 'scheduler'
'slug': '/operations/system-tables/scheduler'
'title': 'system.scheduler'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.scheduler

<SystemTableCloud/>

ローカルサーバー上に存在する [スケジューリングノード](/operations/workload-scheduling.md/#hierarchy) に関する情報とステータスを含みます。  
このテーブルは監視に使用できます。テーブルには、各スケジューリングノードの行が含まれています。

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
- `type` (`String`) - スケジューリングノードの種類。
- `weight` (`Float64`) - ノードの重み。`fair` タイプの親ノードによって使用されます。
- `priority` (`Int64`) - ノードの優先度。'priority' タイプの親ノードによって使用されます（値が低いほど優先度が高くなります）。
- `is_active` (`UInt8`) - このノードが現在アクティブかどうか - リソース要求が待機中で、制約が満たされているか。
- `active_children` (`UInt64`) - アクティブ状態の子ノードの数。
- `dequeued_requests` (`UInt64`) - このノードからデキューされたリソース要求の総数。
- `canceled_requests` (`UInt64`) - このノードからキャンセルされたリソース要求の総数。
- `dequeued_cost` (`UInt64`) - このノードからデキューされたすべての要求のコストの合計（例: バイト数）。
- `canceled_cost` (`UInt64`) - このノードからキャンセルされたすべての要求のコストの合計（例: バイト数）。
- `busy_periods` (`UInt64`) - このノードの非アクティブ化の総数。
- `vruntime` (`Nullable(Float64)`) - `fair` ノードの子ノードのみ。最大最小公平な方法で次に処理すべき子を選択するために SFQ アルゴリズムで使用されるノードの仮想実行時間。
- `system_vruntime` (`Nullable(Float64)`) - `fair` ノードのみに該当。最後に処理されたリソース要求の `vruntime` を示す仮想実行時間。子ノードのアクティベーション時に新しい `vruntime` の値として使用されます。
- `queue_length` (`Nullable(UInt64)`) - `fifo` ノードのみに該当。キュー内に存在するリソース要求の現在の数。
- `queue_cost` (`Nullable(UInt64)`) - `fifo` ノードのみに該当。キュー内に存在するすべての要求のコストの合計（例: バイト数）。
- `budget` (`Nullable(Int64)`) - `fifo` ノードのみに該当。新しいリソース要求のための利用可能な「コスト単位」の数。リソース要求の見積もりコストと実際のコストの不一致がある場合に出現することがあります（例: 読み込み/書き込みの失敗後）。
- `is_satisfied` (`Nullable(UInt8)`) - 制約ノードのみに該当（例: `inflight_limit`）。このノードのすべての制約が満たされている場合は `1` に等しい。
- `inflight_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみに該当。このノードからデキューされたリソース要求で、現在消費状態にあるものの数。
- `inflight_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみに該当。このノードからデキューされたリソース要求のコストの合計（例: バイト数）で、現在消費状態にあるもの。
- `max_requests` (`Nullable(Int64)`) - `inflight_limit` ノードのみに該当。制約違反を引き起こす `inflight_requests` の上限。
- `max_cost` (`Nullable(Int64)`) - `inflight_limit` ノードのみに該当。制約違反を引き起こす `inflight_cost` の上限。
- `max_speed` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに該当。トークン毎秒の帯域幅の上限。
- `max_burst` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに該当。トークンバケットスロットル内で利用可能な `tokens` の上限。
- `throttling_us` (`Nullable(Int64)`) - `bandwidth_limit` ノードのみに該当。このノードがスロットリング状態にあった合計マイクロ秒数。
- `tokens` (`Nullable(Float64)`) - `bandwidth_limit` ノードのみに該当。トークンバケットスロットル内で現在利用可能なトークンの数。
