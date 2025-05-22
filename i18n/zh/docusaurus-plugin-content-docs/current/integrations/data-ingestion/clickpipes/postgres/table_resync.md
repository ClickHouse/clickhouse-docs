---
'title': '重新同步特定表'
'description': '在 Postgres ClickPipe 中重新同步特定表'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': '重新同步表'
---


# 重新同步特定表 {#resync-tables}

在某些场景中，重新同步管道中的特定表是非常有用的。一些示例用例可能是 Postgres 上的重大模式更改，或者在 ClickHouse 上进行某些数据重新建模。

虽然通过按钮点击重新同步单个表的功能仍在开发中，但本指南将分享如何在 Postgres ClickPipe 中实现这一目标的步骤。

### 1. 从管道中移除表 {#removing-table}

可以参考 [表移除指南](./removing_tables) 来完成此操作。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤是为了避免在下一步中再次添加此表时出现数据重复。您可以通过访问 ClickHouse Cloud 中的 **SQL 控制台** 选项卡并运行查询来完成此操作。
请注意，由于 PeerDB 默认创建 ReplacingMergeTree 表，如果您的表足够小，暂时的重复数据是没有害处的，可以跳过此步骤。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

可以参考 [表添加指南](./add_table) 来完成此操作。
