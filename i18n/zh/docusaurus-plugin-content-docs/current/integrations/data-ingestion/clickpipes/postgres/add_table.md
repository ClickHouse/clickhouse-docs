---
'title': '向 ClickPipe 添加特定表'
'description': '描述将特定表添加到 ClickPipe 的步骤。'
'sidebar_label': '添加表'
'slug': '/integrations/clickpipes/postgres/add_table'
'show_title': false
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# 将特定表添加到 ClickPipe

在某些场景中，将特定表添加到管道可能会很有用。随着事务性或分析性工作负载的扩展，这成为了一种常见的需求。

## 将特定表添加到 ClickPipe 的步骤 {#add-tables-steps}

可以通过以下步骤完成：
1. [暂停](./pause_and_resume.md)管道。
2. 点击 编辑表设置。
3. 找到您的表 - 可以通过在搜索栏中搜索找到。
4. 通过点击复选框选择表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击 更新。
6. 更新成功后，管道的状态将依次为 `Setup`、`Snapshot` 和 `Running`。可以在 **Tables** 标签中跟踪表的初始加载情况。
