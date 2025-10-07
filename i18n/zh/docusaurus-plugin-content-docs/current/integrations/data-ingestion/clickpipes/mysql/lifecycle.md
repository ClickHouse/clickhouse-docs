---
'sidebar_label': 'MySQL ClickPipe 的生命周期'
'description': '各种管道状态及其含义'
'slug': '/integrations/clickpipes/mysql/lifecycle'
'title': 'MySQL ClickPipe 的生命周期'
'doc_type': 'guide'
---


# MySQL ClickPipe 的生命周期 {#lifecycle}

这是关于 MySQL ClickPipe 各个阶段、不同状态及其含义的文档。请注意，这同样适用于 MariaDB。

## 供应 {#provisioning}

当你点击创建 ClickPipe 按钮时，ClickPipe 会在 `Provisioning` 状态下创建。供应过程是在这一阶段，我们为服务启动运行 ClickPipes 的基础设施，并为管道注册一些初始元数据。由于在一个服务中，ClickPipes 的计算是共享的，因此你的第二个 ClickPipe 会比第一个创建得更快，因为基础设施已经就位。

## 设置 {#setup}

管道供应完成后，进入 `Setup` 状态。在这一状态下，我们创建目标 ClickHouse 表。同时，我们还会在这里获取并记录源表的表定义。

## 快照 {#snapshot}

完成设置后，我们进入 `Snapshot` 状态（除非是仅 CDC 管道，这种情况下会过渡到 `Running` 状态）。`Snapshot`、`Initial Snapshot` 和 `Initial Load`（更常见）是可以互换的术语。在此状态下，我们对源 MySQL 表进行快照并将其加载到 ClickHouse 中。二进制日志的保留设置应考虑初始加载时间。有关初始加载的更多信息，请参见 [并行初始加载文档](./parallel_initial_load)。当触发重新同步或向已有管道中添加新表时，管道也会进入 `Snapshot` 状态。

## 运行 {#running}

一旦初始加载完成，管道进入 `Running` 状态（除非是仅快照管道，这种情况下会过渡到 `Completed` 状态）。在此状态下，管道开始 `Change-Data Capture`（变更数据捕获）。我们开始读取源数据库的二进制日志，并将数据批量同步到 ClickHouse 中。有关控制 CDC 的信息，请参见 [控制 CDC 文档](./sync_control)。

## 暂停 {#paused}

一旦管道处于 `Running` 状态，你可以暂停它。这将停止 CDC 过程，管道将进入 `Paused` 状态。在此状态下，源数据库不会再拉取新数据，但 ClickHouse 中的现有数据保持不变。你可以从这个状态恢复管道。

## 暂停中 {#pausing}

:::note
此状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在添加对它的支持，以确保在发布时你的集成继续正常工作。
:::
当你点击暂停按钮时，管道进入 `Pausing` 状态。这是一个临时状态，我们正在停止 CDC 过程。一旦 CDC 过程完全停止，管道将进入 `Paused` 状态。

## 修改 {#modifying}
:::note
此状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在添加对它的支持，以确保在发布时你的集成继续正常工作。
:::
当前，这表示管道正在移除表的过程中。

## 重新同步 {#resync}
:::note
此状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在添加对它的支持，以确保在发布时你的集成继续正常工作。
:::
此状态表示管道正在执行重新同步，它正在进行 _resync 表与原表的原子交换。有关重新同步的更多信息，请参见 [重新同步文档](./resync)。

## 完成 {#completed}

此状态适用于仅快照管道，表示快照已完成，并且没有更多工作要做。

## 失败 {#failed}

如果管道发生不可恢复的错误，它将进入 `Failed` 状态。你可以联系支持或 [重新同步](./resync) 你的管道以从此状态恢复。

## 降级 {#degraded}

:::note
此状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在添加对它的支持，以确保在发布时你的集成继续正常工作。
:::
