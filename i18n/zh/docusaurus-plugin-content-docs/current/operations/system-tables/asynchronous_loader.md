---
description: '系统表包含有关最近异步工作的信息和状态（例如，正在加载的表）。该表为每个工作包含一行。'
slug: /operations/system-tables/asynchronous_loader
title: 'system.asynchronous_loader'
keywords: ['system table', 'asynchronous_loader']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关最近异步工作的详细信息和状态（例如，正在加载的表）。该表为每个工作包含一行。还有一个工具可以可视化此表中的信息 `utils/async_loader_graph`。

示例：

``` sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

列：

- `job` (`String`) - 工作名称（可能不是唯一的）。
- `job_id` (`UInt64`) - 工作的唯一 ID。
- `dependencies` (`Array(UInt64)`) - 应在此工作之前完成的工作 ID 列表。
- `dependencies_left` (`UInt64`) - 当前待完成的依赖项数量。
- `status` (`Enum`) - 工作的当前加载状态：
    `PENDING`: 加载工作尚未开始。
    `OK`: 加载工作已经执行成功。
    `FAILED`: 加载工作执行失败。
    `CANCELED`: 加载工作因被移除或依赖失败而不再执行。

待处理的工作可能处于以下状态之一：
- `is_executing` (`UInt8`) - 工作当前由工作线程执行。
- `is_blocked` (`UInt8`) - 工作等待其依赖项完成。
- `is_ready` (`UInt8`) - 工作准备好执行，等待工作线程。
- `elapsed` (`Float64`) - 自执行开始以来经过的秒数。如果工作尚未开始则为零。如果工作完成，则为总执行时间。

每个工作都有一个关联的池，并在该池中启动。每个池都有一个固定的优先级和可变的最大工作线程数量。优先级较高（`priority` 值较低）的工作首先执行。只要有至少一个高优先级的工作准备好或正在执行，则不会启动低优先级的工作。可以通过优先处理来提升工作优先级（但不能降低）。例如，对于加载的表和启动的工作，如果传入的查询需要该表，则这些工作将被优先处理。在执行过程中也可以优先处理工作，但工作不会从其 `execution_pool` 转移到新分配的 `pool`。该工作使用 `pool` 创建新工作以避免优先级反转。已经启动的工作不会被更高优先级的工作抢占，并始终在启动后一直运行到完成。
- `pool_id` (`UInt64`) - 当前分配给工作的池 ID。
- `pool` (`String`) - `pool_id` 池的名称。
- `priority` (`Int64`) - `pool_id` 池的优先级。
- `execution_pool_id` (`UInt64`) - 工作执行所在池的 ID。等于执行开始前初始分配的池。
- `execution_pool` (`String`) - `execution_pool_id` 池的名称。
- `execution_priority` (`Int64`) - `execution_pool_id` 池的优先级。

- `ready_seqno` (`Nullable(UInt64)`) - 对于准备好的工作不为 null。工作线程从其池的准备队列中提取下一个要执行的工作。如果有多个准备好的工作，则选择 `ready_seqno` 值最低的工作。
- `waiters` (`UInt64`) - 等待该工作的线程数量。
- `exception` (`Nullable(String)`) - 对于失败和取消的工作不为 null。保存查询执行过程中引发的错误消息或导致取消该工作的错误，以及依赖失败的工作名称链。

工作生命周期中的时间瞬间：
- `schedule_time` (`DateTime64`) - 工作创建并安排执行的时间（通常与其所有依赖项一起）。
- `enqueue_time` (`Nullable(DateTime64)`) - 工作变为准备好并被加入到其池的准备队列中的时间。如果工作尚未准备好，则为 null。
- `start_time` (`Nullable(DateTime64)`) - 工作线程从准备队列中取出工作并开始执行的时间。如果工作尚未开始，则为 null。
- `finish_time` (`Nullable(DateTime64)`) - 工作执行完成的时间。如果工作尚未完成，则为 null。
