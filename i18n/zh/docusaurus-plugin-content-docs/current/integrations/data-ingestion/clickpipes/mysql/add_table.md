---
title: '向 ClickPipe 添加指定表'
description: '说明向 ClickPipe 添加指定表所需的步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['ClickPipes', 'MySQL', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

在某些场景下，需要将特定表添加到某个管道中。随着事务型或分析型工作负载不断扩大，这会成为一种常见需求。

## 将特定表添加到 ClickPipe 的步骤 \{#add-tables-steps\}

可按以下步骤操作：

1. [暂停](./pause_and_resume.md)该管道。
2. 点击 Edit Table settings。
3. 找到您的表——可通过搜索栏进行搜索。
4. 点击复选框选中该表。

<br />

<Image img={add_table} border size="md" />

5. 点击 update。
6. 更新成功后，管道会依次进入 `Setup`、`Snapshot` 和 `Running` 状态。可在 **Tables** 选项卡中跟踪该表的初始加载。

:::info
新表的快照完成后，现有表的 CDC 会自动恢复。
:::