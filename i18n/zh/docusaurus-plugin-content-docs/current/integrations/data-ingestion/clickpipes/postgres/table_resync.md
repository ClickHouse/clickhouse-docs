---
'title': 'Resyncing Specific Tables'
'description': 'Resyncing specific tables in a Postgres ClickPipe'
'slug': '/integrations/clickpipes/postgres/table_resync'
'sidebar_label': 'Resync Table'
---




# 重新同步特定表 {#resync-tables}

在某些场景中，重新同步管道中的特定表是非常有用的。一些示例用例可能包括在 Postgres 上进行重大模式更改，或者在 ClickHouse 上进行某些数据重新建模。

尽管通过按钮点击重新同步单个表仍在开发中，但本指南将分享如何在 Postgres ClickPipe 中实现这一目标的步骤。

### 1. 从管道中移除表 {#removing-table}

可以按照 [表移除指南](./removing_tables) 来执行此操作。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤是为了避免在下一步中再次添加此表时出现数据重复。您可以通过访问 ClickHouse Cloud 中的 **SQL 控制台** 选项卡并运行查询来执行此操作。注意，由于 PeerDB 默认创建 ReplacingMergeTree 表，如果您的表足够小，其中临时重复是无害的，则可以跳过此步骤。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

可以按照 [表添加指南](./add_table) 来执行此操作。
