---
title: '重新同步特定表'
description: '在 MySQL ClickPipe 中重新同步特定表'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定表 \{#resync-tables\}

在某些场景下，对某个 pipe 中的特定表执行重新同步操作会很有用。例如，一些典型用例包括 MySQL 上的重大模式变更，或者在 ClickHouse 中进行了数据重新建模。

尽管通过单击按钮来重新同步单个表的功能仍在开发中，但本指南将介绍目前如何在 MySQL ClickPipe 中手动完成这一操作的步骤。

### 1. 从 pipe 中移除表 \{#removing-table\}

接下来请按照[表移除指南](./removing_tables)中的步骤进行操作。

### 2. 在 ClickHouse 上截断或删除该表 \{#truncate-drop-table\}

此步骤用于在下一步重新添加该表时避免产生重复数据。可以在 ClickHouse Cloud 中打开 **SQL Console** 选项卡并运行查询来完成此操作。
请注意，如果该表在 ClickHouse 中已存在且非空，系统的校验机制会阻止再次添加该表。

### 3. 再次将该表添加到 ClickPipe \{#add-table-again\}

接下来可以按照[添加表的指南](./add_table)进行操作。