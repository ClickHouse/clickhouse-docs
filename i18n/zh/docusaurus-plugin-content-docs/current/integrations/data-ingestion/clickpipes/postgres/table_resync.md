---
'title': '重新同步特定表'
'description': '在 Postgres ClickPipe 中重新同步特定表'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': '重新同步表'
'doc_type': 'guide'
---


# 重新同步特定表 {#resync-tables}

在某些场景中，重新同步管道中的特定表可能会很有用。一些示例用例可能是在 Postgres 上进行重大模式更改，或者在 ClickHouse 上进行一些数据重建。

虽然通过点击按钮重新同步单个表尚在开发中，但本指南将分享如何在 Postgres ClickPipe 中实现这一目标的步骤。

### 1. 从管道中移除表 {#removing-table}

可以遵循 [表移除指南](./removing_tables)。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤旨在避免在下一步中重新添加此表时出现数据重复。您可以通过前往 ClickHouse Cloud 中的 **SQL 控制台** 选项卡并运行查询来实现。请注意，我们有验证机制来阻止在 ClickHouse 中添加表，如果该表已存在且不为空。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

可以遵循 [表添加指南](./add_table)。
