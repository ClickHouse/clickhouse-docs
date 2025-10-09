---
'title': '重新同步特定的表'
'description': '在 MongoDB ClickPipe 中重新同步特定的表'
'slug': '/integrations/clickpipes/mongodb/table_resync'
'sidebar_label': '重新同步表'
'doc_type': 'guide'
---


# 重新同步特定表 {#resync-tables}

在某些情况下，重新同步管道的特定表可能是有用的。一些示例用例可能是在 MongoDB 上进行重大架构更改，或者在 ClickHouse 上进行某些数据重新建模。

虽然通过点击按钮重新同步单个表仍在进行中，但本指南将分享如何在 MongoDB ClickPipe 中今天实现此目标的步骤。

### 1. 从管道中移除表 {#removing-table}

可以按照 [表移除指南](./removing_tables) 进行操作。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤旨在避免在下一步中再次添加该表时出现数据重复。您可以通过前往 ClickHouse Cloud 中的 **SQL 控制台** 选项卡并运行查询来执行此操作。
请注意，如果表已存在于 ClickHouse 并且不为空，我们会阻止表的添加。

### 3. 再次将表添加到 ClickPipe 中 {#add-table-again}

可以按照 [表添加指南](./add_table) 进行操作。
