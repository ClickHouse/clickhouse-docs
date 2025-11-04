---
'description': '系统表包含关于最近的异步作业的信息和状态（例如，正在加载的表）。该表为每个作业包含一行.'
'keywords':
- 'system table'
- 'asynchronous_loader'
'slug': '/operations/system-tables/asynchronous_loader'
'title': 'system.asynchronous_loader'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

包含最近异步作业（例如，表加载）的信息和状态。该表为每个作业包含一行。可以使用工具 `utils/async_loader_graph` 来可视化该表中的信息。

示例：

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

列：

- `job` (`String`) - 作业名称（可能不是唯一的）。
- `job_id` (`UInt64`) - 作业的唯一 ID。
- `dependencies` (`Array(UInt64)`) - 应在此作业之前完成的作业 ID 列表。
- `dependencies_left` (`UInt64`) - 当前尚未完成的依赖项数量。
- `status` (`Enum`) - 作业的当前加载状态：
    `PENDING`: 加载作业尚未开始。
    `OK`: 加载作业已执行并成功完成。
    `FAILED`: 加载作业已执行但失败。
    `CANCELED`: 由于删除或依赖项失败，加载作业将不会被执行。

一个待处理的作业可能处于以下状态之一：
- `is_executing` (`UInt8`) - 作业当前正在由工作线程执行。
- `is_blocked` (`UInt8`) - 作业在等待其依赖项完成。
- `is_ready` (`UInt8`) - 作业准备好执行，正在等待工作线程。
- `elapsed` (`Float64`) - 自执行开始以来已经过的秒数。如果作业尚未开始，则为零。如果作业完成，则为总执行时间。

每个作业都有一个与之相关联的池，并在该池中启动。每个池都有一个固定的优先级和一个可变的最大工作线程数量。更高的优先级（较低的 `priority` 值）作业会优先运行。在至少存在一个更高优先级的作业准备好或正在执行的情况下，不会启动优先级较低的作业。作业优先级可以提升（但不能降低），通过优先处理它。例如，如果即将到来的查询需要此表，则表加载和启动的作业将会被优先处理。在执行期间，也可以优先处理作业，但作业不会从其 `execution_pool` 移动到新分配的 `pool`。该作业使用 `pool` 创建新作业以避免优先级反转。已经开始的作业不会被更高优先级的作业抢占，并且在启动后始终完整运行至完成。
- `pool_id` (`UInt64`) - 当前分配给作业的池的 ID。
- `pool` (`String`) - `pool_id` 池的名称。
- `priority` (`Int64`) - `pool_id` 池的优先级。
- `execution_pool_id` (`UInt64`) - 该作业执行所在池的 ID。执行开始前初始分配的池的 ID。
- `execution_pool` (`String`) - `execution_pool_id` 池的名称。
- `execution_priority` (`Int64`) - `execution_pool_id` 池的优先级。

- `ready_seqno` (`Nullable(UInt64)`) - 对于准备好的作业不为 null。工作线程从其池的准备队列中提取下一个将要执行的作业。如果有多个准备好的作业，则选择 `ready_seqno` 值最低的作业。
- `waiters` (`UInt64`) - 等待此作业的线程数量。
- `exception` (`Nullable(String)`) - 对于失败和取消的作业不为 null。保存查询执行期间引发的错误消息或导致取消此作业的错误及其依赖项失败链中的作业名称。

作业生命周期中的时间点：
- `schedule_time` (`DateTime64`) - 作业被创建并安排执行的时间（通常是与其所有依赖项一起）。
- `enqueue_time` (`Nullable(DateTime64)`) - 作业准备就绪并被加入其池的准备队列的时间。如果作业尚未准备，则为 null。
- `start_time` (`Nullable(DateTime64)`) - 工作线程从准备队列中取出作业并开始执行的时间。如果作业尚未开始，则为 null。
- `finish_time` (`Nullable(DateTime64)`) - 作业执行完成的时间。如果作业尚未完成，则为 null。
