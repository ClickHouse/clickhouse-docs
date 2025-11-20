---
title: 'Schema 变更传播支持'
slug: /integrations/clickpipes/postgres/schema-changes
description: '介绍 ClickPipes 能在源表中检测到的 schema 变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

用于 Postgres 的 ClickPipes 可以检测源表中的 schema 变更，并且在某些情况下可以自动将这些变更传播到目标表。下面说明了每种 DDL 操作的处理方式：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema 变更类型                                                                     | 行为                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                             | 一旦表发生 insert/update/delete 操作，就会自动传播。schema 变更之后复制的所有行中，新的列都会被填充                                                   |
| 添加带默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                      | 一旦表发生 insert/update/delete 操作，就会自动传播。schema 变更之后复制的所有行中，新的列都会被填充，但对已有行，如果不进行整表刷新，将不会显示默认值 |
| 删除已有列（`ALTER TABLE DROP COLUMN ...`）                                          | 会被检测到，但**不会**传播。schema 变更之后复制的所有行中，被删除的列会以 `NULL` 填充                                                                |

请注意，添加列的操作会在某个批次同步结束时被传播，这可能发生在达到同步间隔或拉取批次大小之后。关于控制同步的更多信息参见[此处](./controlling_sync.md)