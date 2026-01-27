---
title: '向 ClickPipe 添加特定表'
description: '说明将特定表添加到 ClickPipe 的具体步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 向 ClickPipe 添加特定表 \{#adding-specific-tables-to-a-clickpipe\}

在某些场景下，将特定表添加到管道中会很有用。随着事务型或分析型工作负载的扩展，这会成为一种常见需求。

## 向 ClickPipe 添加特定表的步骤 \{#add-tables-steps\}

可以按以下步骤进行：
1. [暂停](./pause_and_resume.md) 该管道。
2. 点击 **Edit Table settings**。
3. 找到您的表——可以在搜索栏中搜索。
4. 勾选复选框以选择该表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击 **update**。
6. 更新成功后，管道会依次进入 `Setup`、`Snapshot` 和 `Running` 状态。您可以在 **Tables** 标签页中跟踪该表的初始加载。

:::info
新表快照完成后，现有表的 CDC 会自动恢复。
:::