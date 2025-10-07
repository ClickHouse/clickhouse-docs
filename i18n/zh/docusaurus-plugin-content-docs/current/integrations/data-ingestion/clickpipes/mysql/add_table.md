---
'title': '将特定表添加到 ClickPipe'
'description': '描述将特定表添加到 ClickPipe 所需的步骤。'
'sidebar_label': '添加表'
'slug': '/integrations/clickpipes/mysql/add_table'
'show_title': false
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# 将特定表添加到 ClickPipe

在某些情况下，添加特定表到管道是非常有用的。随着您的事务或分析工作负载的扩展，这种需求变得越来越普遍。

## 将特定表添加到 ClickPipe 的步骤 {#add-tables-steps}

可以通过以下步骤完成：
1. [暂停](./pause_and_resume.md)管道。
2. 点击编辑表设置。
3. 定位您的表 - 可以通过在搜索栏中搜索来完成此操作。
4. 通过点击复选框选择表。
<br/>
<Image img={add_table} border size="md"/>

5. 点击更新。
6. 更新成功后，管道的状态将依次为 `Setup`、`Snapshot` 和 `Running`。表的初始加载可以在 **Tables** 标签中跟踪。

:::info
现有表的 CDC 在新表快照完成后会自动恢复。
:::
