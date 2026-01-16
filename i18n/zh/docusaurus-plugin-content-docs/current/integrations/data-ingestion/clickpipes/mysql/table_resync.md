---
title: '重新同步指定表'
description: '在 MySQL ClickPipe 中重新同步指定表'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: '重新同步表'
doc_type: '指南'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定表 \\{#resync-tables\\}

在某些场景下，重新同步某个 pipe 中的特定表会很有用。典型用例包括在 MySQL 上进行重大 schema 变更，或者在 ClickHouse 上进行数据重构/重建建模。

虽然通过点击按钮来重新同步单个表的功能仍在开发中，但本指南将介绍目前在 MySQL ClickPipe 中实现这一目标的操作步骤。

### 1. 从 pipe 中移除该表 \\{#removing-table\\}

你可以按照[表移除指南](./removing_tables)来完成此操作。

### 2. 在 ClickHouse 上对该表执行 TRUNCATE 或 DROP 操作 \\{#truncate-drop-table\\}

此步骤是为了在下一步重新添加该表时避免数据重复。你可以前往 ClickHouse Cloud 中的 **SQL Console** 选项卡并执行查询来完成。
请注意，如果该表在 ClickHouse 中已存在且非空，我们的校验逻辑会阻止添加该表。

### 3. 将该表重新添加到 ClickPipe 中 \\{#add-table-again\\}

你可以按照[表添加指南](./add_table)来完成此操作。