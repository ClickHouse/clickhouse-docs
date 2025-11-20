---
title: '从 ClickPipe 中移除特定表'
description: '从 ClickPipe 中移除特定表'
sidebar_label: '移除表'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，将特定表从 MongoDB ClickPipe 中排除是合乎逻辑的——例如，如果某个表对你的分析工作负载并非必需，跳过它可以降低在 ClickHouse 中的存储和复制成本。


## 移除特定表的步骤 {#remove-tables-steps}

第一步是从管道中移除表。可以通过以下步骤完成:

1. [暂停](./pause_and_resume.md)管道。
2. 点击"编辑表设置"。
3. 定位您的表 - 可以在搜索栏中搜索。
4. 点击已选中的复选框以取消选择该表。
   <br />

<Image img={remove_table} border size='md' />

5. 点击"更新"。
6. 更新成功后,在 **指标** 选项卡中状态将显示为 **运行中**。此表将不再由该 ClickPipe 复制。
