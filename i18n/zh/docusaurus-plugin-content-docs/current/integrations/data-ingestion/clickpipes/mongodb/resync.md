---
title: '重新同步数据库 ClickPipe'
description: '用于重新同步数据库 ClickPipe 的文档'
slug: /integrations/clickpipes/mongodb/resync
sidebar_label: '重新同步 ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 有什么作用？ {#what-mongodb-resync-do}

Resync 按如下顺序执行以下操作：

1. 删除现有的 ClickPipe，并启动一个新的名为 “resync” 的 ClickPipe。这样，当你执行 Resync 时，对源表结构的更改会被识别并同步。
2. resync ClickPipe 会创建（或替换）一组新的目标表，这些表与原始表同名，但会带有 `_resync` 后缀。
3. 在 `_resync` 表上执行初始加载。
4. 然后将 `_resync` 表与原始表进行交换。在交换前，会将原始表中被软删除的行转移到 `_resync` 表中。

原始 ClickPipe 的所有设置都会在 resync ClickPipe 中保留。原始 ClickPipe 的统计信息会在 UI 中被清除。

### 何时需要对 ClickPipe 进行 Resync {#use-cases-mongodb-resync}

以下是一些典型场景：

1. 你可能需要对源表进行较大的 schema 变更，这会破坏现有的 ClickPipe，并需要重新启动。在完成这些变更后，你可以直接点击 Resync。
2. 尤其是对于 ClickHouse，可能需要更改目标表上的 ORDER BY 键。你可以通过 Resync 将数据重新填充到具有正确排序键的新表中。

### Resync ClickPipe 指南 {#guide-mongodb-resync}

1. 在 **Data Sources** 选项卡中，点击你想要执行 Resync 的 MongoDB ClickPipe。
2. 转到 **Settings** 选项卡。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md" />

4. 会弹出一个确认对话框。再次点击 Resync。
5. 前往 **Metrics** 选项卡。
6. 等待管道状态变为 **Setup** 或 **Snapshot**。
7. 可以在 **Tables** 选项卡的 **Initial Load Stats** 部分监控 Resync 的初始加载。
8. 初始加载完成后，管道会以原子方式将 `_resync` 表与原始表进行交换。在交换期间，状态将为 **Resync**。
9. 交换完成后，管道会进入 **Running** 状态，并在启用时执行 CDC（变更数据捕获）。
