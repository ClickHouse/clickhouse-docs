---
title: '重新同步特定表'
description: '在 Postgres ClickPipe 中重新同步特定表'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定数据表 \\{#resync-tables\\}

在某些场景下，重新同步管道中的特定数据表会非常有用。例如，一些典型用例包括在 Postgres 上进行重大模式（schema）变更，或在 ClickHouse 上进行数据重新建模。

虽然通过单击按钮来重新同步单个数据表的功能仍在开发中，但本指南将介绍目前在 Postgres ClickPipe 中实现这一目标的操作步骤。

### 1. 从管道中移除该数据表 \\{#removing-table\\}

可参考[移除数据表指南](./removing_tables)来完成此操作。

### 2. 在 ClickHouse 中对该数据表执行 TRUNCATE 或 DROP 操作 \\{#truncate-drop-table\\}

此步骤是为了在下一步重新添加该数据表时避免数据重复。可前往 ClickHouse Cloud 中的 **SQL Console** 选项卡并执行查询来完成此操作。
请注意，如果该数据表在 ClickHouse 中已存在且非空，系统的校验会阻止将其重新添加到管道中。

### 3. 再次将该数据表添加到 ClickPipe 中 \\{#add-table-again\\}

可参考[添加数据表指南](./add_table)来完成此操作。