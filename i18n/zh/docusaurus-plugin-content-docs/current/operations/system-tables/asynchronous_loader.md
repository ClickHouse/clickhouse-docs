---
'description': '系统表包含有关最近异步作业的信息和状态（例如，正在加载的表）。该表为每个作业包含一行。'
'keywords':
- 'system table'
- 'asynchronous_loader'
'slug': '/operations/system-tables/asynchronous_loader'
'title': 'system.asynchronous_loader'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

包含最近异步作业（例如表加载）的信息和状态。该表为每个作业包含一行。可以使用工具 `utils/async_loader_graph` 来可视化该表的信息。

示例：

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

列：

- `job` （`String`）- 作业名称（可能不是唯一的）。
- `job_id` （`UInt64`）- 作业的唯一 ID。
- `dependencies` （`Array(UInt64)`）- 该作业之前应该完成的作业 ID 列表。
- `dependencies_left` （`UInt64`）- 当前剩余的依赖项数量。
- `status` （`Enum`）- 作业的当前加载状态：
    `PENDING`: 加载作业尚未开始。
    `OK`: 加载作业已执行且成功。
    `FAILED`: 加载作业已执行但失败。
    `CANCELED`: 加载作业因移除或依赖失败将不会执行。

待处理的作业可能处于以下状态之一：
- `is_executing` （`UInt8`）- 作业当前正在被工作线程执行。
- `is_blocked` （`UInt8`）- 作业在等待其依赖项完成。
- `is_ready` （`UInt8`）- 作业已准备好执行并在等待工作线程。
- `elapsed` （`Float64`）- 从执行开始到现在经过的秒数。如果作业尚未开始，则为零。如果作业完成，则为总执行时间。

每个作业都有一个与之相关联的池，并在该池中启动。每个池具有恒定的优先级和可变的最大工作线程数。优先级更高（`priority` 值更低）的作业将优先运行。任何优先级较低的作业在至少有一个优先级较高的作业准备或正在执行时都不会启动。可以通过优先安排来提升作业的优先级（但不能降低）。例如，如果传入的查询需要该表，则加载表和启动的作业将被优先安排。在执行过程中也可以优先安排作业，但作业不会从其 `execution_pool` 移动到新分配的 `pool`。该作业使用 `pool` 来创建新作业以避免优先级反转。已经启动的作业不会被优先级更高的作业抢占，并在启动后始终完成执行。
- `pool_id` （`UInt64`）- 当前分配给作业的池 ID。
- `pool` （`String`）- `pool_id` 池的名称。
- `priority` （`Int64`）- `pool_id` 池的优先级。
- `execution_pool_id` （`UInt64`）- 作业执行所在的池 ID。在执行开始前等于最初分配的池。
- `execution_pool` （`String`）- `execution_pool_id` 池的名称。
- `execution_priority` （`Int64`）- `execution_pool_id` 池的优先级。

- `ready_seqno` （`Nullable(UInt64)`）- 对于已准备好的作业不为 null。工作线程从其池的准备队列中拉取下一个要执行的作业。如果有多个准备好的作业，则选择 `ready_seqno` 值最低的作业。
- `waiters` （`UInt64`）- 等待该作业的线程数。
- `exception` （`Nullable(String)`）- 对于失败和取消的作业不为 null。保存查询执行期间引发的错误消息或导致取消此作业及其依赖链的错误信息。

作业生命周期中的时间瞬间：
- `schedule_time` （`DateTime64`）- 作业被创建并调度执行的时间（通常连同所有依赖项）。
- `enqueue_time` （`Nullable(DateTime64)`）- 作业准备好并被加入到其池的准备队列的时间。如果作业尚未准备好，则为 null。
- `start_time` （`Nullable(DateTime64)`）- 工作线程从准备队列解除作业并开始执行的时间。如果作业尚未开始，则为 null。
- `finish_time` （`Nullable(DateTime64)`）- 作业执行完成的时间。如果作业尚未完成，则为 null。
