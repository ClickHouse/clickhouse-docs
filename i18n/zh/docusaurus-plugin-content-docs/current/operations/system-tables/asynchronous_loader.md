import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous_loader

<SystemTableCloud/>

包含有关最近异步作业（例如加载表）的信息和状态。该表为每个作业提供一行。可以使用工具 `utils/async_loader_graph` 来可视化此表中的信息。

示例：

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

列：

- `job` (`String`) - 作业名称（可能不唯一）。
- `job_id` (`UInt64`) - 作业的唯一 ID。
- `dependencies` (`Array(UInt64)`) - 在此作业之前应该完成的作业 ID 列表。
- `dependencies_left` (`UInt64`) - 当前剩余需完成的依赖项数量。
- `status` (`Enum`) - 作业的当前加载状态：
    `PENDING`: 加载作业尚未开始。
    `OK`: 加载作业已执行并成功。
    `FAILED`: 加载作业已执行但失败。
    `CANCELED`: 加载作业因删除或依赖失败而不打算执行。

挂起的作业可能处于以下状态之一：
- `is_executing` (`UInt8`) - 作业当前正在 worker 中执行。
- `is_blocked` (`UInt8`) - 作业在等待其依赖项完成。
- `is_ready` (`UInt8`) - 作业已准备好执行，并在等待一个 worker。
- `elapsed` (`Float64`) - 自执行开始以来经过的秒数。如果作业尚未开始，则为零。如果作业已完成，则为总执行时间。

每个作业都有一个与其关联的池，并在该池中启动。每个池具有一个恒定的优先级和可变的最大工作线程数。优先级较高（`priority` 值较低）的作业会优先执行。在至少有一个优先级较高的作业已准备好或正在执行时，不能启动优先级较低的作业。作业优先级可以通过提升其优先级来提高（但不能降低）。例如，如果传入查询需要此表，则加载和启动的表的作业将被优先考虑。在作业执行期间可以提升作业的优先级，但作业不会从其 `execution_pool` 移动到新分配的 `pool`。该作业使用 `pool` 创建新作业以避免优先级反转。已启动的作业不会被更高优先级的作业抢占，并且始终会在启动后完成执行。
- `pool_id` (`UInt64`) - 当前分配给作业的池的 ID。
- `pool` (`String`) - `pool_id` 池的名称。
- `priority` (`Int64`) - `pool_id` 池的优先级。
- `execution_pool_id` (`UInt64`) - 作业执行所在池的 ID。等于执行开始前初始分配的池。
- `execution_pool` (`String`) - `execution_pool_id` 池的名称。
- `execution_priority` (`Int64`) - `execution_pool_id` 池的优先级。

- `ready_seqno` (`Nullable(UInt64)`) - 对于已准备好的作业不为 null。Worker 从其池的准备队列中提取下一个将要执行的作业。如果有多个准备好的作业，则选择 `ready_seqno` 值最低的作业。
- `waiters` (`UInt64`) - 等待此作业的线程数量。
- `exception` (`Nullable(String)`) - 对于失败和取消的作业不为 null。保存在查询执行过程中引发的错误消息或导致取消该作业的错误，以及作业名称的依赖失败链。

作业生命周期中的时间点：
- `schedule_time` (`DateTime64`) - 作业创建并安排执行（通常是与其所有依赖项一起）时的时间。
- `enqueue_time` (`Nullable(DateTime64)`) - 作业变为准备状态并被加入到其池的准备队列中的时间。如果作业还未准备好，则为 null。
- `start_time` (`Nullable(DateTime64)`) - Worker 从准备队列中取出作业并开始执行的时间。如果作业尚未开始，则为 null。
- `finish_time` (`Nullable(DateTime64)`) - 作业执行完成的时间。如果作业尚未完成，则为 null。
