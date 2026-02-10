---
title: '重新同步指定表'
description: '在 Postgres ClickPipe 中重新同步指定表'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: '重新同步表'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 重新同步特定表 \{#resync-tables\}

在某些场景下，重新同步某个管道（pipe）中的特定表会很有用。例如：在 Postgres 上进行了重大 schema 变更，或者在 ClickHouse 中对数据模型进行了较大规模的重构。

虽然通过单击按钮来重新同步单个表的功能仍在开发中，但本指南将介绍如何在当前的 Postgres ClickPipe 中实现这一操作的步骤。

### 1. 从 pipe 中移除该表 \{#removing-table\}

接下来请参阅[表移除指南](./removing_tables)中的步骤进行操作。

### 2. 在 ClickHouse 中截断或删除该表 \{#truncate-drop-table\}

此步骤是为了在下一步再次添加该表时避免数据重复。可以进入 ClickHouse Cloud 中的 **SQL Console** 选项卡，并运行查询来完成此操作。
请注意，如果表在 ClickHouse 中已经存在且非空，我们的验证逻辑会阻止再次添加该表。

另外，如果需要保留旧表，也可以直接重命名该表。当表非常大且删除（drop）操作可能耗时时，这种方式也会很有帮助。

```sql
RENAME TABLE table_A TO table_A_bak;
```


### 3. 重新将该表添加到 ClickPipe 中 \{#add-table-again\}

接下来请按照[添加表指南](./add_table)中的步骤操作。