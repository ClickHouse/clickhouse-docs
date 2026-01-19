---
title: '从 ClickPipe 中删除特定表'
description: '从 ClickPipe 中删除特定表'
sidebar_label: '删除表'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: '核心'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，将特定表从 Postgres ClickPipe 中排除是合理的——例如，如果某个表对分析型工作负载不是必需的，跳过该表可以降低 ClickHouse 中的存储和数据复制成本。

## 移除特定表的步骤 \{#remove-tables-steps\}

第一步是从管道（pipe）中移除该表。可以按照以下步骤完成：

1. [暂停](./pause_and_resume.md) pipe。
2. 点击 Edit Table Settings。
3. 找到你的表——可以在搜索栏中搜索。
4. 点击已选中的复选框取消选择该表。

<br/>

<Image img={remove_table} border size="md"/>

5. 点击 Update。
6. 更新成功后，在 **Metrics** 选项卡中状态会显示为 **Running**。此表将不再通过该 ClickPipe 进行复制。