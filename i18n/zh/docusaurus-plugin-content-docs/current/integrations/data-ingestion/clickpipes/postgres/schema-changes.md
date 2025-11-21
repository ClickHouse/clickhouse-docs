---
title: 'Schema Changes Propagation Support'
slug: /integrations/clickpipes/postgres/schema-changes
description: '介绍 ClickPipes 在源表中可检测到的模式变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

用于 Postgres 的 ClickPipes 可以检测源表中的模式变更，并且在某些情况下，可以将这些变更自动传播到目标表。各类 DDL 操作的处理方式如下所示：

[//]: # "TODO 扩展本页内容，补充对重命名、数据类型变更以及 truncate 的行为说明，并提供关于如何处理不兼容模式变更的指导。"

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 一旦表发生 insert/update/delete 操作，即会自动传播。新列将在模式变更之后被复制的所有行中填充数据                                                   |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 一旦表发生 insert/update/delete 操作，即会自动传播。新列将在模式变更之后被复制的所有行中填充数据，但对已有的行，如果不进行整表刷新，将不会显示该默认值 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 会被检测到，但**不会**传播。被删除的列在模式变更之后被复制的所有行中，其值将被填充为 `NULL`                                                                |

请注意，新增列会在一个批次同步结束时被传播，这可能发生在达到同步间隔或拉取批大小之后。关于控制同步的更多信息请参见[此处](./controlling_sync.md)。