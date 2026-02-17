---
title: '重新同步指定表'
description: '在 MongoDB ClickPipe 中重新同步指定的表'
slug: /integrations/clickpipes/mongodb/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定表 \{#resync-tables\}

在某些场景下，重新同步某个管道（pipe）中的特定表会很有用。例如，对 MongoDB 进行重大 schema 变更，或者在 ClickHouse 中进行一些数据模型重构。

虽然通过单击按钮来重新同步单个表的功能仍在开发中，但本指南将介绍当前在 MongoDB ClickPipe 中实现这一目标的步骤。

### 1. 从 pipe 中移除该表 \{#removing-table\}

然后按照[表移除指南](./removing_tables)进行操作。

### 2. 在 ClickHouse 上截断或删除该表 \{#truncate-drop-table\}

此步骤是为了在下一步再次添加该表时避免出现重复数据。您可以在 ClickHouse Cloud 的 **SQL Console** 选项卡中执行一条查询来完成此操作。  
请注意，如果该表在 ClickHouse 中已存在且不为空，我们的校验逻辑会阻止再次添加该表。

### 3. 将该表重新添加到 ClickPipe \{#add-table-again\}

然后参照[添加表指南](./add_table)进行操作。