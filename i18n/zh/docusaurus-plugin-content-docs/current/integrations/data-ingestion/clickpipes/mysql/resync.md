---
title: '重新同步数据库 ClickPipe'
description: '重新同步数据库 ClickPipe 的文档'
slug: /integrations/clickpipes/mysql/resync
sidebar_label: '重新同步 ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### 重新同步 的作用是什么？ \{#what-mysql-resync-do\}

重新同步 按顺序执行以下操作：

1. 现有的 ClickPipe 会被删除，并启动一个新的 “重新同步” ClickPipe。因此，执行重新同步时会捕获源表结构的变更。
2. 重新同步 ClickPipe 会创建 (或替换) 一组新的目标表，这些表的名称与原始表相同，只是添加了 `_resync` 后缀。
3. 对 `_resync` 表执行初始导入。
4. 随后，`_resync` 表会与原始表交换。在交换之前，会先将原始表中被软删除的行转移到 `_resync` 表中。

原始 ClickPipe 的所有设置都会保留在重新同步 ClickPipe 中。原始 ClickPipe 的统计信息会在 UI 中清空。

### 重新同步 ClickPipe 的使用场景 \{#use-cases-mysql-resync\}

以下是几个场景：

1. 您可能需要对源表进行较大的 schema 变更，这可能会导致现有 ClickPipe 无法继续使用，从而需要重新启动。完成这些更改后，只需点击重新同步即可。
2. 对于 ClickHouse，您可能需要更改目标表的 ORDER BY 键。您可以通过重新同步将数据重新导入到具有正确排序键的新表中。

:::note
您可以多次重新同步，但请注意重新同步时对源数据库造成的负载。
:::

### 重新同步 ClickPipe 指南 \{#guide-mysql-resync\}

1. 在 Data Sources 选项卡中，点击要重新同步的 MySQL ClickPipe。
2. 进入 **Settings** 选项卡。
3. 点击 **重新同步** 按钮。

<Image img={resync_button} border size="md" />

4. 此时应会出现确认对话框。再次点击重新同步。
5. 进入 **Metrics** 选项卡。
6. 大约 5 秒后 (以及刷新页面后) ，管道状态应为 **Setup** 或 **Snapshot**。
7. 可在 **Tables** 选项卡的 **Initial Load Stats** 部分监控重新同步的初始导入进度。
8. 初始导入完成后，管道会以原子方式将 `_resync` 表与原始表进行交换。在交换期间，状态将显示为 **重新同步**。
9. 交换完成后，管道将进入 **Running** 状态，并在启用时执行 CDC。