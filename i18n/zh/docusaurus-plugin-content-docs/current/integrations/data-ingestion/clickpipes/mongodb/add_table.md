---
title: '向 ClickPipe 添加指定表'
description: '说明将指定表添加到 ClickPipe 所需的步骤。'
sidebar_label: '添加表'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# 向 ClickPipe 添加特定表

在某些场景下，将特定表添加到管道中会非常有用。随着事务型或分析型工作负载的扩展，这会成为一种常见需求。



## 向 ClickPipe 添加特定表的步骤 {#add-tables-steps}

可以通过以下步骤完成此操作：

1. [暂停](./pause_and_resume.md)管道。
2. 点击"编辑表设置"。
3. 定位您的表 - 可以在搜索栏中搜索。
4. 点击复选框选择表。

   <br />
   <Image img={add_table} border size='md' />

5. 点击"更新"。
6. 更新成功后，管道将依次显示 `Setup`、`Snapshot` 和 `Running` 状态。可以在 **Tables** 选项卡中跟踪表的初始加载进度。

:::info
新表的快照完成后，现有表的 CDC 将自动恢复。
:::
