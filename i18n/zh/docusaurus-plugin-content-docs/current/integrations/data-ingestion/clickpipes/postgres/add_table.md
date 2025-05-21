---
'title': 'Adding specific tables to a ClickPipe'
'description': '描述了将特定表添加到 ClickPipe 的步骤。'
'sidebar_label': '添加表'
'slug': '/integrations/clickpipes/postgres/add_table'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

在某些场景下，将特定表添加到管道中是有用的。随着您的事务或分析工作负载的扩展，这成为一种常见的需求。

## 添加特定表的步骤 {#add-tables-steps}
可以通过以下步骤完成：
1. [暂停](./pause_and_resume.md) 管道。
2. 点击编辑表设置。
3. 找到您的表 - 可以通过在搜索框中搜索来完成。
4. 通过点击复选框选择该表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击更新。
6. 更新成功后，管道将依次显示状态 `Setup`、`Snapshot` 和 `Running`。可以在 **Tables** 标签中跟踪表的初始加载情况。
