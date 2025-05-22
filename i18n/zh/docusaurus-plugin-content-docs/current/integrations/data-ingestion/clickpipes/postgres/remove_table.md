---
'title': '从 ClickPipe 中删除特定表'
'description': '从 ClickPipe 中删除特定表'
'sidebar_label': '删除表'
'slug': '/integrations/clickpipes/postgres/removing_tables'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

在某些情况下，将特定表从 Postgres ClickPipe 中排除是有意义的——例如，如果某个表不需要用于您的分析工作负载，跳过它可以减少 ClickHouse 中的存储和复制成本。

## 移除特定表的步骤 {#remove-tables-steps}

第一步是从管道中移除该表。可以通过以下步骤完成：

1. [暂停](./pause_and_resume.md)管道。
2. 点击编辑表设置。
3. 找到您的表——可以通过在搜索栏中搜索来完成。
4. 通过单击选中的复选框取消选择该表。
<br/>

<Image img={remove_table} border size="md"/>

5. 点击更新。
6. 更新成功后，在 **Metrics** 选项卡中状态将显示为 **Running**。该表将不再被此 ClickPipe 复制。
