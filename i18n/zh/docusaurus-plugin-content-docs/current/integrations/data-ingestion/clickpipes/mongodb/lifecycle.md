---
'sidebar_label': 'MongoDB ClickPipe 的生命周期'
'description': '各种管道状态及其含义'
'slug': '/integrations/clickpipes/mongodb/lifecycle'
'title': 'MongoDB ClickPipe 的生命周期'
'doc_type': 'guide'
---


# MongoDB ClickPipe 的生命周期 {#lifecycle}

这是有关 MongoDB ClickPipe 各个阶段、它可以拥有的不同状态及其含义的文档。

## 配置 {#provisioning}

当您点击“创建 ClickPipe”按钮时，ClickPipe 会处于 `Provisioning` 状态。配置过程是我们启动用于运行 ClickPipes 服务的底层基础设施，同时注册一些管道的初始元数据。由于 ClickPipes 在服务中共享计算资源，因此您的第二个 ClickPipe 的创建速度会比第一个快得多，因为基础设施已经到位。

## 设置 {#setup}

在管道配置后，它进入 `Setup` 状态。在这个状态下，我们创建目标的 ClickHouse 表。

## 快照 {#snapshot}

一旦设置完成，我们进入 `Snapshot` 状态（除非它是仅限 CDC 的管道，这将转换为 `Running`）。`Snapshot`、`Initial Snapshot` 和 `Initial Load`（更常见）是可互换的术语。在这个状态下，我们对源 MongoDB 集合进行快照并将其加载到 ClickHouse 中。oplog 的保留设置应考虑到初始加载时间。当触发重新同步或向现有管道添加新表时，管道也将进入 `Snapshot` 状态。

## 运行 {#running}

初始加载完成后，管道进入 `Running` 状态（除非它是仅限快照的管道，这将转换为 `Completed`）。在这里，管道开始执行 `Change-Data Capture`。在此状态下，我们开始从源 MongoDB 集群向 ClickHouse 流式传输更改。有关控制 CDC 的信息，请参见 [控制 CDC 的文档](./sync_control)。

## 暂停 {#paused}

当管道处于 `Running` 状态时，您可以暂停它。这将停止 CDC 过程，管道将进入 `Paused` 状态。在此状态下，未从源 MongoDB 拉取新数据，但 ClickHouse 中的现有数据保持不变。您可以从此状态恢复管道。

## 正在暂停 {#pausing}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在为其添加支持，以确保您的集成在发布时继续正常工作。
:::
当您点击“暂停”按钮时，管道进入 `Pausing` 状态。这是一个临时状态，我们正在停止 CDC 过程。一旦 CDC 过程完全停止，管道将进入 `Paused` 状态。

## 修改 {#modifying}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在为其添加支持，以确保您的集成在发布时继续正常工作。
:::
目前，这表示管道正在删除表的过程中。

## 重新同步 {#resync}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在为其添加支持，以确保您的集成在发布时继续正常工作。
:::
此状态表示管道正在重新同步的阶段，其中正在对 _resync 表与原始表进行原子交换。有关重新同步的更多信息，请参见 [重新同步文档](./resync)。

## 完成 {#completed}

此状态适用于仅限快照的管道，并表示快照已完成，没有更多的工作要做。

## 失败 {#failed}

如果管道中出现无法恢复的错误，它将进入 `Failed` 状态。您可以联系支持或 [重新同步](./resync) 您的管道以从此状态恢复。

## 降级 {#degraded}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在为其添加支持，以确保您的集成在发布时继续正常工作。
:::
