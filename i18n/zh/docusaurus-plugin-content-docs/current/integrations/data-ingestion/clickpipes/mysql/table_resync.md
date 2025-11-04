---
'title': '重新同步特定表'
'description': '在 MySQL ClickPipe 中重新同步特定表'
'slug': '/integrations/clickpipes/mysql/table_resync'
'sidebar_label': '重新同步表'
'doc_type': 'guide'
---


# 重新同步特定表 {#resync-tables}

在某些场景中，重新同步管道的特定表是非常有用的。一些示例用例可能是在 MySQL 上进行重大架构更改，或者在 ClickHouse 上进行数据重建。

虽然通过点击按钮重新同步单个表的功能仍在完善中，但本指南将分享如何在 MySQL ClickPipe 中实现这一目标的步骤。

### 1. 从管道中移除表 {#removing-table}

这可以通过遵循 [表移除指南](./removing_tables) 来完成。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤是为了避免在下一步再次添加此表时数据重复。您可以通过在 ClickHouse Cloud 中导航到 **SQL 控制台** 选项卡并运行查询来完成此操作。
注意，我们有验证机制阻止添加已经存在于 ClickHouse 中且不为空的表。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

这可以通过遵循 [表添加指南](./add_table) 来完成。
