---
'sidebar_label': 'Postgres ClickPipe 的生命周期'
'description': '各种管道状态及其含义'
'slug': '/integrations/clickpipes/postgres/lifecycle'
'title': 'Postgres ClickPipe 的生命周期'
'doc_type': 'guide'
---


# Postgres ClickPipe 的生命周期 {#lifecycle}

这是关于 Postgres ClickPipe 各个阶段、它可能拥有的不同状态以及其含义的文档。

## 配置中 {#provisioning}

当您点击 "创建 ClickPipe" 按钮时，ClickPipe 在 `配置中` 状态下被创建。配置过程是我们启动底层基础设施以运行 ClickPipes 的服务，同时为管道注册一些初始元数据。由于 ClickPipes 的计算资源在服务中是共享的，因此您的第二个 ClickPipe 的创建速度会比第一个快得多——因为基础设施已经到位。

## 设置中 {#setup}

在管道配置好之后，它进入 `设置中` 状态。在这个状态下，我们创建目标 ClickHouse 表。同时我们在此处获取并记录您的源表的表定义。

## 快照 {#snapshot}

一旦设置完成，我们进入 `快照` 状态（除非它是仅支持 CDC 的管道，这将过渡到 `运行中`）。`快照`、`初始快照` 和 `初始加载`（更常见）是可以互换的术语。在这个状态下，我们对源数据库表进行快照并将其加载到 ClickHouse 中。这并不使用逻辑复制，但在此步骤中会创建复制槽，因此您的 `max_slot_wal_keep_size` 和存储参数应考虑到初始加载期间槽的增长。有关初始加载的更多信息，请参见 [并行初始加载文档](./parallel_initial_load)。当触发重新同步或向现有管道添加新表时，管道也会进入 `快照` 状态。

## 运行中 {#running}

一旦初始加载完成，管道进入 `运行中` 状态（除非它是仅支持快照的管道，这将过渡到 `完成`）。在此状态下，管道开始进行 `变更数据捕获`。在这个状态中，我们开始从源数据库到 ClickHouse 的逻辑复制。有关控制 CDC 的信息，请参见 [控制 CDC 文档](./sync_control)。

## 暂停 {#paused}

一旦管道处于 `运行中` 状态，您可以暂停它。这将停止 CDC 过程，管道将进入 `暂停` 状态。在这个状态下，不会从源数据库提取新数据，但 ClickHouse 中现有的数据保持完好。您可以从此状态恢复管道。

## 正在暂停 {#pausing}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就添加对它的支持，以确保在发布时您的集成继续正常工作。
:::
当您点击暂停按钮时，管道进入 `正在暂停` 状态。这是一个短暂状态，我们正在停止 CDC 过程。一旦 CDC 过程完全停止，管道将进入 `暂停` 状态。

## 正在修改 {#modifying}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就添加对它的支持，以确保在发布时您的集成继续正常工作。
:::
当前，这表示管道正在删除表的过程中。

## 重新同步 {#resync}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就添加对它的支持，以确保在发布时您的集成继续正常工作。
:::
此状态表示管道处于重新同步阶段，其中正在执行 _重新同步 表和原始表的原子交换。有关重新同步的更多信息，请参见 [重新同步文档](./resync)。

## 已完成 {#completed}

此状态适用于仅限快照的管道，表示快照已完成且没有更多工作要做。

## 失败 {#failed}

如果管道出现不可恢复的错误，它将进入 `失败` 状态。您可以与支持部门联系或 [重新同步](./resync) 您的管道以从此状态恢复。

## 降级 {#degraded}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就添加对它的支持，以确保在发布时您的集成继续正常工作。
:::
