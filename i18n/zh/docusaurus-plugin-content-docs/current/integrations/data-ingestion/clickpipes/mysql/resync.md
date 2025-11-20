---
title: "重新同步数据库 ClickPipe"
description: "重新同步数据库 ClickPipe 的文档"
slug: /integrations/clickpipes/mysql/resync
sidebar_label: "重新同步 ClickPipe"
doc_type: "guide"
keywords: ["clickpipes", "mysql", "cdc", "数据摄取", "实时同步"]
---

import resync_button from "@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png"
import Image from "@theme/IdealImage"

### 重新同步的作用是什么？ {#what-mysql-resync-do}

重新同步按以下顺序执行操作：

1. 删除现有的 ClickPipe，并启动一个新的"重新同步"ClickPipe。因此，重新同步时会捕获源表结构的变更。
2. 重新同步 ClickPipe 会创建（或替换）一组新的目标表，这些表与原始表同名，但带有 `_resync` 后缀。
3. 对 `_resync` 表执行初始加载。
4. 然后将 `_resync` 表与原始表进行交换。在交换之前，软删除的行会从原始表转移到 `_resync` 表。

原始 ClickPipe 的所有设置都会保留在重新同步 ClickPipe 中。原始 ClickPipe 的统计信息会在 UI 中清除。

### 重新同步 ClickPipe 的使用场景 {#use-cases-mysql-resync}

以下是几个典型场景：

1. 您可能需要对源表执行重大架构变更，这会导致现有 ClickPipe 失效并需要重启。您可以在执行变更后直接点击重新同步。
2. 特别是对于 ClickHouse，您可能需要更改目标表的 ORDER BY 键。您可以通过重新同步使用正确的排序键将数据重新填充到新表中。

:::note
您可以多次重新同步，但请注意重新同步时对源数据库的负载影响。
:::

### 重新同步 ClickPipe 指南 {#guide-mysql-resync}

1. 在数据源选项卡中，点击您希望重新同步的 MySQL ClickPipe。
2. 转到**设置**选项卡。
3. 点击**重新同步**按钮。

<Image img={resync_button} border size='md' />

4. 将出现一个确认对话框。再次点击重新同步。
5. 转到**指标**选项卡。
6. 大约 5 秒后（或刷新页面后），管道的状态应为**设置**或**快照**。
7. 可以在**表**选项卡的**初始加载统计**部分监控重新同步的初始加载进度。
8. 初始加载完成后，管道将原子性地交换 `_resync` 表与原始表。在交换期间，状态将显示为**重新同步**。
9. 交换完成后，管道将进入**运行**状态，并在启用的情况下执行 CDC。
