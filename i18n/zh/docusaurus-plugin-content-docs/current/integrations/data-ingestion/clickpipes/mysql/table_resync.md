---
title: '重新同步特定表'
description: '在 MySQL ClickPipe 中重新同步特定表'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据导入', '实时同步']
---



# 重新同步特定表 {#resync-tables}

在某些场景下,需要对管道中的特定表进行重新同步。一些示例用例可能包括 MySQL 上的重大模式变更,或者 ClickHouse 上的数据重新建模。

虽然通过点击按钮重新同步单个表的功能仍在开发中,但本指南将分享如何在 MySQL ClickPipe 中实现此操作的步骤。

### 1. 从管道中移除表 {#removing-table}

请按照[表移除指南](./removing_tables)进行操作。

### 2. 在 ClickHouse 上截断或删除表 {#truncate-drop-table}

此步骤是为了避免在下一步重新添加此表时出现数据重复。您可以前往 ClickHouse Cloud 中的 **SQL Console** 选项卡并运行查询来完成此操作。
请注意,如果表已存在于 ClickHouse 中且不为空,我们的验证机制会阻止添加该表。

### 3. 再次将表添加到 ClickPipe {#add-table-again}

请按照[表添加指南](./add_table)进行操作。
