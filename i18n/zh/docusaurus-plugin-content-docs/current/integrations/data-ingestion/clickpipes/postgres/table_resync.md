---
'title': '重新同步特定表'
'description': '在 Postgres ClickPipe 中重新同步特定表'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': '重新同步表'
---


# 重同步特定表 {#resync-tables}

在某些情况下，重同步管道的特定表会很有用。一些示例用例可能是在 Postgres 上进行重大模式更改，或者在 ClickHouse 上进行某些数据重建。

虽然通过单击按钮重同步单个表仍在进行中，但本指南将分享如何在 Postgres ClickPipe 中实现这一目标的步骤。

### 1. 从管道中移除表 {#removing-table}

可以按照 [移除表指南](./removing_tables) 进行操作。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤是为了避免在下一步中重新添加此表时出现数据重复。您可以通过前往 ClickHouse Cloud 中的 **SQL 控制台** 选项卡并运行查询来执行此操作。
请注意，由于 PeerDB 默认创建 ReplacingMergeTree 表，因此如果您的表足够小，临时重复是无害的，则可以跳过此步骤。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

可以按照 [添加表指南](./add_table) 进行操作。
