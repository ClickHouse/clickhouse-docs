---
title: '向 ClickPipe 添加指定表'
description: '描述将指定表添加到 ClickPipe 所需的步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 向 ClickPipe 添加指定表 \{#adding-specific-tables-to-a-clickpipe\}

在某些场景下，将特定表添加到 ClickPipe 中会很有用。随着事务型或分析型工作负载的增长，这一需求会变得越来越普遍。

## 将特定表添加到 ClickPipe 的步骤 \{#add-tables-steps\}

请按以下步骤操作：

1. [暂停](./pause_and_resume.md) 该 pipe。
2. 点击 **Edit Table settings**。
3. 找到您的表——可以在搜索栏中搜索表名。
4. 通过勾选复选框来选择该表。

<br/>

<Image img={add_table} border size="md"/>

5. 点击 **update**。
6. 成功更新后，pipe 将依次进入 `Setup`、`Snapshot` 和 `Running` 状态。您可以在 **Tables** 选项卡中跟踪该表的初始加载进度。

:::info
现有表的 CDC 会在新表快照完成后自动恢复。
:::