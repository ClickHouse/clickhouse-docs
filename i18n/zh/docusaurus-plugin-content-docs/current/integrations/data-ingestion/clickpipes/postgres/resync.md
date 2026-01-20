---
title: '重新同步数据库 ClickPipe'
description: '关于重新同步数据库 ClickPipe 的文档'
slug: /integrations/clickpipes/postgres/resync
sidebar_label: '重新同步 ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 有什么作用？ \{#what-postgres-resync-do\}

Resync 会按以下顺序执行操作：

1. 删除现有的 ClickPipe，并启动一个新的“resync” ClickPipe。这样，在你执行 resync 时，对源表结构的更改会被捕获。
2. resync ClickPipe 会创建（或替换）一组新的目标表，这些表与原始表同名，但会多一个 `_resync` 后缀。
3. 对 `_resync` 表执行初始加载。
4. 然后将 `_resync` 表与原始表进行交换。在交换前，会将原始表中的软删除行转移到 `_resync` 表中。

原始 ClickPipe 的所有设置都会保留在 resync ClickPipe 中。原始 ClickPipe 的统计信息会在 UI 中被清除。

### 何时需要对 ClickPipe 进行 Resync \{#use-cases-postgres-resync\}

以下是几种典型场景：

1. 你可能需要在源表上执行重大 schema 变更，这会导致现有 ClickPipe 出错，需要重新启动。这种情况下，只需在完成变更后点击 Resync 即可。
2. 尤其是对于 ClickHouse，你可能需要更改目标表上的 ORDER BY 键。你可以通过 Resync 将数据重新填充到带有正确排序键的新表中。
3. ClickPipe 的 replication slot 失效：Resync 会在源数据库上创建一个新的 ClickPipe 和一个新的 replication slot。

:::note
你可以多次执行 Resync 操作，但每次 Resync 时请考虑对源数据库的负载，
因为每次都会涉及使用并行线程的初始加载。
:::

### Resync ClickPipe 指南 \{#guide-postgres-resync\}

1. 在 Data Sources 选项卡中，点击你想要执行 resync 的 Postgres ClickPipe。
2. 进入 **Settings** 选项卡。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md" />

4. 会弹出一个确认对话框。再次点击 Resync。
5. 前往 **Metrics** 选项卡。
6. 大约 5 秒后（或刷新页面后），该 pipe 的状态应为 **Setup** 或 **Snapshot**。
7. 可以在 **Tables** 选项卡的 **Initial Load Stats** 区域监控 resync 的初始加载过程。
8. 一旦初始加载完成，pipe 会以原子方式将 `_resync` 表与原始表进行交换。交换期间，状态会显示为 **Resync**。
9. 交换完成后，pipe 会进入 **Running** 状态，并在启用的情况下执行 CDC（变更数据捕获）。