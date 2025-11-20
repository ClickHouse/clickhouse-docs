---
title: '模式变更传播支持'
slug: /integrations/clickpipes/postgres/schema-changes
description: '页面描述 ClickPipes 在源表中可检测到的模式变更类型'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

适用于 Postgres 的 ClickPipes 可以检测源表中的模式变更，并且在某些情况下，可以将这些变更自动传播到目标表。下表说明了各类 DDL 操作的处理方式：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 一旦表发生 insert/update/delete 操作，就会自动传播。新列将在模式变更之后复制的所有行上被填充                                                   |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 一旦表发生 insert/update/delete 操作，就会自动传播。新列将在模式变更之后复制的所有行上被填充，但在未进行整表刷新前，已有行不会显示该默认值 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 会被检测到，但**不会**被传播。被删除的列在模式变更之后复制的所有行上将被填充为 `NULL`                                                                |

请注意，新增列会在一个批次同步结束时被传播，这可能发生在达到同步间隔或拉取批大小之后。关于同步控制的更多信息请见[此处](./controlling_sync.md)