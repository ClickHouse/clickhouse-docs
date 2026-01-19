---
title: '从 ClickPipe 中删除特定表'
description: '从 ClickPipe 中删除特定表'
sidebar_label: '删除表'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，从 MongoDB ClickPipe 中排除特定表是合理的——例如，如果某个表并不是分析工作负载所必需的，跳过该表可以降低在 ClickHouse 中的存储和复制成本。

## 移除特定数据表的步骤 \{#remove-tables-steps\}

第一步是从管道中移除该数据表。可按以下步骤操作：

1. [暂停](./pause_and_resume.md) 管道。
2. 点击 **Edit Table Settings**。
3. 找到你的数据表——可以在搜索栏中搜索该数据表。
4. 点击已勾选的复选框以取消选择该数据表。

<br/>

<Image img={remove_table} border size="md"/>

5. 点击 **update**。
6. 更新成功后，在 **Metrics** 选项卡中状态将显示为 **Running**。该数据表将不再通过此 ClickPipe 进行复制。