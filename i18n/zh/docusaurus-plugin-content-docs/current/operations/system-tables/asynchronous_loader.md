---
'description': 'System table containing information about and status of recent asynchronous
  jobs (e.g. for tables which are loading). The table contains a row for every job.'
'keywords':
- 'system table'
- 'asynchronous_loader'
'slug': '/operations/system-tables/asynchronous_loader'
'title': 'system.asynchronous_loader'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

包含最近异步任务的信息和状态（例如，针对表加载）。该表为每个任务包含一行。可以使用工具 `utils/async_loader_graph` 可视化此表中的信息。

示例：

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

列：

- `job` (`String`) - 任务名称（可能不是唯一的）。
- `job_id` (`UInt64`) - 任务的唯一 ID。
- `dependencies` (`Array(UInt64)`) - 完成此任务之前应该完成的任务 ID 列表。
- `dependencies_left` (`UInt64`) - 当前剩余依赖任务的数量。
- `status` (`Enum`) - 任务的当前加载状态：
    `PENDING`: 加载任务尚未开始。
    `OK`: 加载任务已执行并成功。
    `FAILED`: 加载任务已执行并失败。
    `CANCELED`: 加载任务因删除或依赖失败而不再执行。

待处理的任务可能处于以下状态之一：
- `is_executing` (`UInt8`) - 任务当前由工作者执行。
- `is_blocked` (`UInt8`) - 任务等待其依赖完成。
- `is_ready` (`UInt8`) - 任务准备执行，等待工作者。
- `elapsed` (`Float64`) - 自执行开始以来经过的秒数。如果任务尚未开始，则为零。如果任务完成，则为总执行时间。

每个任务都有一个与之关联的池，并在该池中启动。每个池具有固定的优先级和可变的最大工作者数量。优先级高（`priority` 值较低）的任务优先执行。当至少有一个更高优先级的任务准备好或正在执行时，不会启动较低优先级的任务。任务的优先级可以提升（但不能降低），通过优先化来实现。例如，如果传入的查询需要此表，则表加载和启动的任务将被优先处理。在任务执行过程中可以提升任务的优先级，但任务并不会从其 `execution_pool` 移动到新分配的 `pool`。任务使用 `pool` 创建新任务以避免优先级反转。已启动的任务不会被优先级更高的任务抢占，始终会在启动后执行完成。
- `pool_id` (`UInt64`) - 当前分配给任务的池的 ID。
- `pool` (`String`) - `pool_id` 池的名称。
- `priority` (`Int64`) - `pool_id` 池的优先级。
- `execution_pool_id` (`UInt64`) - 任务执行所在的池的 ID。等于执行开始前初始分配的池。
- `execution_pool` (`String`) - `execution_pool_id` 池的名称。
- `execution_priority` (`Int64`) - `execution_pool_id` 池的优先级。

- `ready_seqno` (`Nullable(UInt64)`) - 对于准备好的任务不为 null。工作者从其池的准备队列中提取下一个要执行的任务。如果有多个准备好的任务，则选择 `ready_seqno` 值最低的任务。
- `waiters` (`UInt64`) - 等待此任务的线程数量。
- `exception` (`Nullable(String)`) - 对于失败和取消的任务不为 null。包含在查询执行过程中引发的错误消息或导致取消此任务的错误，以及依赖失败的任务名称链。

任务生命周期中的时间点：
- `schedule_time` (`DateTime64`) - 任务创建和计划执行的时间（通常与所有依赖一起）。
- `enqueue_time` (`Nullable(DateTime64)`) - 任务变为准备状态并被加入到其池的准备队列的时间。如果任务尚未准备，则为 null。
- `start_time` (`Nullable(DateTime64)`) - 工作者从准备队列中取出任务并开始执行的时间。如果任务尚未开始，则为 null。
- `finish_time` (`Nullable(DateTime64)`) - 任务执行完成的时间。如果任务尚未完成，则为 null。
