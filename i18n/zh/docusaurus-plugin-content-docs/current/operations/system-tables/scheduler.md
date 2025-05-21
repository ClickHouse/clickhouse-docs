---
'description': 'System table containing information about and status of scheduling
  nodes residing on the local server.'
'keywords':
- 'system table'
- 'scheduler'
'slug': '/operations/system-tables/scheduler'
'title': 'system.scheduler'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.scheduler

<SystemTableCloud/>

包含本地服务器上 [调度节点](/operations/workload-scheduling.md/#hierarchy) 的信息和状态。 
该表可用于监控。每个调度节点在此表中都有一行。

示例：

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

列：

- `resource` (`String`) - 资源名称
- `path` (`String`) - 在此资源调度层次结构中调度节点的路径
- `type` (`String`) - 调度节点的类型。
- `weight` (`Float64`) - 节点权重，由 `fair` 类型的父节点使用。
- `priority` (`Int64`) - 节点的优先级，由 'priority' 类型的父节点使用（较低的值表示更高的优先级）。
- `is_active` (`UInt8`) - 该节点当前是否处于活动状态 - 是否有资源请求待出队且约束条件得到满足。
- `active_children` (`UInt64`) - 处于活动状态的子节点数量。
- `dequeued_requests` (`UInt64`) - 从此节点出队的资源请求总数。
- `canceled_requests` (`UInt64`) - 从此节点取消的资源请求总数。
- `dequeued_cost` (`UInt64`) - 从此节点出队的所有请求的成本总和（例如，字节大小）。
- `canceled_cost` (`UInt64`) - 从此节点取消的所有请求的成本总和（例如，字节大小）。
- `busy_periods` (`UInt64`) - 该节点的总非活动次数。
- `vruntime` (`Nullable(Float64)`) - 仅对于 `fair` 节点的子节点。节点的虚拟运行时间，用于 SFQ 算法以最大-最小公平方式选择下一个处理的子节点。
- `system_vruntime` (`Nullable(Float64)`) - 仅对于 `fair` 节点。显示最后处理的资源请求的 `vruntime` 的虚拟运行时间。在子节点激活期间用作 `vruntime` 的新值。
- `queue_length` (`Nullable(UInt64)`) - 仅对于 `fifo` 节点。当前队列中驻留的资源请求数量。
- `queue_cost` (`Nullable(UInt64)`) - 仅对于 `fifo` 节点。驻留在队列中的所有请求的成本总和（例如，字节大小）。
- `budget` (`Nullable(Int64)`) - 仅对于 `fifo` 节点。用于新资源请求的可用“成本单位”数量。在估计成本与实际成本不一致时可出现（例如，在读/写失败后）。
- `is_satisfied` (`Nullable(UInt8)`) - 仅对于约束节点（例如，`inflight_limit`）。如果此节点的所有约束条件都得到满足，则等于 `1`。
- `inflight_requests` (`Nullable(Int64)`) - 仅对于 `inflight_limit` 节点。从此节点出队的资源请求数量，当前处于消费状态。
- `inflight_cost` (`Nullable(Int64)`) - 仅对于 `inflight_limit` 节点。所有从此节点出队的资源请求的成本总和（例如，字节），当前处于消费状态。
- `max_requests` (`Nullable(Int64)`) - 仅对于 `inflight_limit` 节点。导致约束违反的 `inflight_requests` 的上限。
- `max_cost` (`Nullable(Int64)`) - 仅对于 `inflight_limit` 节点。导致约束违反的 `inflight_cost` 的上限。
- `max_speed` (`Nullable(Float64)`) - 仅对于 `bandwidth_limit` 节点。每秒令牌的带宽上限。
- `max_burst` (`Nullable(Float64)`) - 仅对于 `bandwidth_limit` 节点。令牌桶节流器中可用的 `tokens` 的上限。
- `throttling_us` (`Nullable(Int64)`) - 仅对于 `bandwidth_limit` 节点。该节点处于节流状态的总微秒数。
- `tokens` (`Nullable(Float64)`) - 仅对于 `bandwidth_limit` 节点。令牌桶节流器中当前可用的令牌数量。
