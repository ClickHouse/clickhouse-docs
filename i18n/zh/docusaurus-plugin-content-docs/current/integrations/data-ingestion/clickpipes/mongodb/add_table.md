---
'title': '将特定表添加到 ClickPipe'
'description': '描述将特定表添加到 ClickPipe 所需的步骤。'
'sidebar_label': '添加表'
'slug': '/integrations/clickpipes/mongodb/add_table'
'show_title': false
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# 将特定表添加到 ClickPipe

在某些情况下，将特定表添加到管道中会很有用。随着事务或分析工作负载的扩展，这成为一种常见的需求。

## 将特定表添加到 ClickPipe 的步骤 {#add-tables-steps}

可以通过以下步骤完成此操作：
1. [暂停](./pause_and_resume.md) 管道。
2. 点击编辑表设置。
3. 定位您的表 - 您可以通过搜索栏搜索找到它。
4. 通过点击复选框选择表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击更新。
6. 更新成功后，管道将依次显示状态 `Setup`、`Snapshot` 和 `Running`。可以在 **Tables** 标签中跟踪表的初始加载。

:::info
现有表的 CDC 在新表的快照完成后会自动恢复。
:::
