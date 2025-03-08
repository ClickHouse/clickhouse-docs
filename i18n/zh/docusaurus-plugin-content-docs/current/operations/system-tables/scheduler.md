---
description: '包含本地服务器上调度节点的信息和状态的系统表。'
slug: /operations/system-tables/scheduler
title: 'system.scheduler'
keywords: ['system table', 'scheduler']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含本地服务器上[调度节点](/operations/workload-scheduling.md/#hierarchy)的信息和状态。此表可用于监控。表中为每个调度节点包含一行。

示例：

``` sql
SELECT *
FROM system.scheduler
WHERE resource = 'network_read' AND path = '/prio/fair/prod'
FORMAT Vertical
```

``` text
行 1:
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
- `path` (`String`) - 在此资源调度层级中的调度节点路径
- `type` (`String`) - 调度节点的类型。
- `weight` (`Float64`) - 节点权重，由`fair`类型的父节点使用。
- `priority` (`Int64`) - 节点优先级，由'priority'类型的父节点使用（值越小，优先级越高）。
- `is_active` (`UInt8`) - 此节点是否当前处于活动状态 - 是否有资源请求被出队且约束已满足。
- `active_children` (`UInt64`) - 活动状态下的子节点数量。
- `dequeued_requests` (`UInt64`) - 从此节点出队的资源请求总数。
- `canceled_requests` (`UInt64`) - 从此节点取消的资源请求总数。
- `dequeued_cost` (`UInt64`) - 从此节点出队的所有请求的成本总和（例如，字节大小）。
- `canceled_cost` (`UInt64`) - 从此节点取消的所有请求的成本总和（例如，字节大小）。
- `busy_periods` (`UInt64`) - 此节点的总去激活次数。
- `vruntime` (`Nullable(Float64)`) - 仅适用于`fair`节点的子节点。用于SFQ算法选择下一个处理子节点的虚拟运行时间，以最大-最小公平的方式。
- `system_vruntime` (`Nullable(Float64)`) - 仅适用于`fair`节点。显示最后处理的资源请求的`vruntime`的虚拟运行时间。在子节点激活时用作`vruntime`的新值。
- `queue_length` (`Nullable(UInt64)`) - 仅适用于`fifo`节点。当前在队列中的资源请求数量。
- `queue_cost` (`Nullable(UInt64)`) - 仅适用于`fifo`节点。队列中所有请求成本（例如字节大小）的总和。
- `budget` (`Nullable(Int64)`) - 仅适用于`fifo`节点。可用于新资源请求的“成本单位”数量。在预计和实际资源请求成本不匹配的情况下可能出现（例如，读/写失败后）。
- `is_satisfied` (`Nullable(UInt8)`) - 仅适用于约束节点（例如`inflight_limit`）。如果满足此节点的所有约束，则等于`1`。
- `inflight_requests` (`Nullable(Int64)`) - 仅适用于`inflight_limit`节点。从此节点出队的、当前处于消费状态的资源请求数量。
- `inflight_cost` (`Nullable(Int64)`) - 仅适用于`inflight_limit`节点。从此节点出队的、当前处于消费状态的所有资源请求的成本总和（例如字节）。
- `max_requests` (`Nullable(Int64)`) - 仅适用于`inflight_limit`节点。导致约束违反的`inflight_requests`上限。
- `max_cost` (`Nullable(Int64)`) - 仅适用于`inflight_limit`节点。导致约束违反的`inflight_cost`上限。
- `max_speed` (`Nullable(Float64)`) - 仅适用于`bandwidth_limit`节点。每秒的令牌带宽上限。
- `max_burst` (`Nullable(Float64)`) - 仅适用于`bandwidth_limit`节点。令牌桶限流器中可用令牌的上限。
- `throttling_us` (`Nullable(Int64)`) - 仅适用于`bandwidth_limit`节点。此节点处于限流状态的总微秒数。
- `tokens` (`Nullable(Float64)`) - 仅适用于`bandwidth_limit`节点。令牌桶限流器中当前可用的令牌数量。
