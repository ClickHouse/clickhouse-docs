---
title: '向 ClickPipe 添加指定表'
description: '介绍向 ClickPipe 添加指定表所需的步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', '添加表', '表配置', '初始加载', '快照']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

在某些场景下，将特定表添加到某个管道会很有帮助。随着事务型或分析型工作负载的扩展，这会逐渐成为一种常见需求。

## 向 ClickPipe 添加特定表的步骤 \{#add-tables-steps\}

可按以下步骤操作：

1. [暂停](./pause_and_resume.md)该管道。
2. 点击“Edit Table settings”。
3. 找到要添加的表——可在搜索栏中搜索表名。
4. 点击复选框以选择该表。

<br />

<Image img={add_table} border size="md" />

5. 点击“Update”。
6. 更新成功后，该管道会依次进入 `Setup`、`Snapshot` 和 `Running` 状态。可在 **Tables** 选项卡中跟踪该表的初始加载进度。

:::info
新表的快照完成后，现有表的 CDC 会自动恢复。
:::