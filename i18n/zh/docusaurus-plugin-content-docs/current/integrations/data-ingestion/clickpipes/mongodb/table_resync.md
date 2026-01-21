---
title: '重新同步指定表'
description: '在 MongoDB ClickPipe 中重新同步指定表'
slug: /integrations/clickpipes/mongodb/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定表 \{#resync-tables\}

在某些场景下，让某个 pipe 中的特定表重新同步会非常有用。典型用例包括对 MongoDB 进行重大 schema 变更，或者在 ClickHouse 上进行数据重建模。

虽然通过单击按钮来重新同步单个表的功能仍在开发中，但本指南将介绍目前如何在 MongoDB ClickPipe 中实现这一操作的步骤。

### 1. 从 pipe 中移除该表 \{#removing-table\}

可以参考[表移除指南](./removing_tables)来完成这一步。

### 2. 在 ClickHouse 中截断或删除该表 \{#truncate-drop-table\}

此步骤是为了在下一步重新添加该表时避免数据重复。您可以进入 ClickHouse Cloud 中的 **SQL Console** 选项卡并执行查询来完成这一步。  
请注意，如果该表在 ClickHouse 中已存在且非空，我们的校验会阻止再次添加该表。

### 3. 再次将该表添加到 ClickPipe 中 \{#add-table-again\}

可以参考[表添加指南](./add_table)来完成这一步。