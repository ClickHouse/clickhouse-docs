---
title: '向 ClickPipe 添加特定表'
description: '描述将特定表添加到 ClickPipe 的步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'add table', 'table configuration', 'initial load', 'snapshot']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 向 ClickPipe 添加特定表 {#adding-specific-tables-to-a-clickpipe}

在某些场景下，将特定的表添加到某个 ClickPipe 中会非常有用。随着您的事务型或分析型工作负载不断扩展，这将成为一种常见需求。

## 将特定表添加到 ClickPipe 的步骤 {#add-tables-steps}

可以按照以下步骤操作：
1. [暂停](./pause_and_resume.md)该 pipe。
2. 点击 Edit Table settings。
3. 找到你的表 —— 可以在搜索栏中搜索该表。
4. 勾选复选框选择该表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击 update。
6. 更新成功后，该 pipe 会依次处于 `Setup`、`Snapshot` 和 `Running` 状态。可以在 **Tables** 选项卡中跟踪该表的初始加载进度。

:::info
对已有表的 CDC 会在新表快照完成后自动恢复。
:::
