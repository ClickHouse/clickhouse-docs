---
title: '从 ClickPipe 中移除特定表'
description: '从 ClickPipe 中移除特定表'
sidebar_label: '移除表'
slug: /integrations/clickpipes/mysql/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', '数据摄取', '实时同步']
integration:
  - support_level: '核心'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，将特定表从 MySQL ClickPipe 中排除是合理的，例如，如果某个表对你的分析工作负载并非必需，跳过它可以降低在 ClickHouse 中的存储和复制成本。

## 移除特定表的步骤 \\{#remove-tables-steps\\}

第一步是将该表从 pipe 中移除。你可以按照以下步骤操作：

1. [暂停](./pause_and_resume.md) pipe。
2. 点击 **Edit Table Settings**。
3. 找到你的表——可以在搜索栏中搜索该表。
4. 点击该表前已选中的复选框以取消选择。

<br/>

<Image img={remove_table} border size="md"/>

5. 点击 **Update**。
6. 成功更新后，在 **Metrics** 选项卡中，状态将为 **Running**。该表将不再由此 ClickPipe 进行复制。