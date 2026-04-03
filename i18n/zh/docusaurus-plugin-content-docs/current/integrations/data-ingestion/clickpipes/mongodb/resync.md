---
title: '重新同步数据库 ClickPipe'
description: '关于重新同步数据库 ClickPipe 的文档'
slug: /integrations/clickpipes/mongodb/resync
sidebar_label: '重新同步 ClickPipe'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'CDC', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### 重新同步 的作用是什么？ \{#what-mongodb-resync-do\}

重新同步 会按顺序执行以下操作：

1. 删除现有的 ClickPipe，并启动一个新的 “重新同步” ClickPipe。因此，重新同步时会识别到源表结构的变更。
2. 重新同步 ClickPipe 会创建 (或替换) 一组新的目标表，这些表除了附加 `_resync` 后缀外，名称与原始表相同。
3. 对 `_resync` 表执行初始导入。
4. 然后将 `_resync` 表与原始表互换。在互换之前，原始表中被软删除的行会转移到 `_resync` 表中。

原始 ClickPipe 的所有设置都会在 重新同步 ClickPipe 中保留。原始 ClickPipe 的统计信息会在 UI 中清除。

### 重新同步 ClickPipe 的用例 \{#use-cases-mongodb-resync\}

以下是几个场景：

1. 您可能需要对源表进行重大的 schema 变更，这可能会导致现有的 ClickPipe 无法继续工作，并需要重新开始。完成这些变更后，只需点击“重新同步”即可。
2. 对于 ClickHouse，您可能需要更改目标表的 ORDER BY 键。您可以通过重新同步，将数据重新填充到具有正确排序键的新表中。

### ClickPipe 重新同步指南 \{#guide-mongodb-resync\}

1. 在 Data Sources 选项卡中，点击要重新同步的 MongoDB ClickPipe。
2. 转到 **Settings** 选项卡。
3. 点击 **重新同步** 按钮。

<Image img={resync_button} border size="md" />

4. 此时会出现确认对话框。再次点击 重新同步。
5. 转到 **Metrics** 选项卡。
6. 等待管道状态变为 **Setup** 或 **Snapshot**。
7. 可以在 **Tables** 选项卡的 **Initial Load Stats** 部分查看此次重新同步的初始导入进度。
8. 初始导入完成后，管道会以原子方式将 `_resync` 表与原始表互换。互换期间，状态将显示为 **重新同步**。
9. 互换完成后，管道将进入 **Running** 状态，并在启用时执行 CDC。