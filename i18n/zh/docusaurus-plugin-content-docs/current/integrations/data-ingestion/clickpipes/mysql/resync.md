---
title: '重新同步数据库 ClickPipe'
description: '本文档介绍如何重新同步数据库 ClickPipe'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: '重新同步 ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 有什么作用？ {#what-mysql-resync-do}

Resync 按以下顺序执行如下操作：

1. 删除现有的 ClickPipe，并启动一个新的 “resync” ClickPipe。这样，在你执行 resync 时，对源表结构所做的更改会被自动识别并应用。
2. resync ClickPipe 会创建（或替换）一组新的目标表，这些表与原始表同名，但会追加 `_resync` 后缀。
3. 对这些 `_resync` 表执行初始装载。
4. 然后将 `_resync` 表与原始表进行交换。在交换之前，会将原始表中的软删除行转移到 `_resync` 表中。

原始 ClickPipe 的所有设置都会在 resync ClickPipe 中保留。原始 ClickPipe 的统计信息会在 UI 中被清除。

### 何时需要对 ClickPipe 执行 resync {#use-cases-mysql-resync}

以下是几个典型场景：

1. 你可能需要对源表执行较大的 schema 变更，这会导致现有的 ClickPipe 出错并需要重新启动。这种情况下，可以在完成更改后直接点击 Resync。
2. 尤其是针对 ClickHouse，你可能需要更改目标表上的 ORDER BY 键。你可以通过 Resync 将数据重新写入到具有正确排序键的新表中。

:::note
你可以多次执行 resync，但在执行 resync 时请务必考虑对源数据库的负载影响。
:::

### Resync ClickPipe 指南 {#guide-mysql-resync}

1. 在 **Data Sources** 选项卡中，点击你希望进行 resync 的 MySQL ClickPipe。
2. 进入 **Settings** 选项卡。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md" />

4. 将会弹出一个确认对话框，再次点击 Resync。
5. 前往 **Metrics** 选项卡。
6. 大约 5 秒后（以及在页面刷新时），该 ClickPipe 的状态应为 **Setup** 或 **Snapshot**。
7. 可以在 **Tables** 选项卡的 **Initial Load Stats** 部分监控此次 resync 的初始装载进度。
8. 一旦初始装载完成，该 ClickPipe 会以原子方式将 `_resync` 表与原始表进行交换。在交换期间，状态会变为 **Resync**。
9. 交换完成后，该 ClickPipe 会进入 **Running** 状态，并在启用的情况下执行 CDC（变更数据捕获）。