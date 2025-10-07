---
'title': '从 ClickPipe 中移除特定表'
'description': '从 ClickPipe 中移除特定表'
'sidebar_label': '移除表'
'slug': '/integrations/clickpipes/mongodb/removing_tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，从 MongoDB ClickPipe 中排除特定的表是有意义的——例如，如果一个表不需要用于你的分析工作负载，跳过它可以减少 ClickHouse 中的存储和复制费用。

## 移除特定表的步骤 {#remove-tables-steps}

第一步是从管道中移除该表。这可以通过以下步骤完成：

1. [暂停](./pause_and_resume.md) 管道。
2. 点击编辑表设置。
3. 定位到你的表——这可以通过在搜索栏中搜索来完成。
4. 通过点击选中的复选框取消选择该表。
<br/>

<Image img={remove_table} border size="md"/>

5. 点击更新。
6. 更新成功后，在 **Metrics** 标签中状态将显示为 **Running**。该表将不再被此 ClickPipe 复制。
