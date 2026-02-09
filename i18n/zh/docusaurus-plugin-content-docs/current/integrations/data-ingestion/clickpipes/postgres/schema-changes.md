---
title: 'Schema 变更传播支持'
slug: /integrations/clickpipes/postgres/schema-changes
description: '描述 ClickPipes 在源表中可检测的 Schema 变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

用于 Postgres 的 ClickPipes 可以检测源表中的 Schema 变更，并在某些情况下自动将这些变更传播到目标表。各类 DDL 操作的处理方式如下：

[//]: # "TODO 扩展本页面，加入关于重命名、数据类型变更以及 truncate 的行为说明，以及如何处理不兼容 Schema 变更的指南。"

| Schema 变更类型                                                                     | 行为                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                            | 在表发生 insert/update/delete 操作后会自动传播。Schema 变更之后复制的所有行中，新列都会被填充                                                   |
| 添加带默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                     | 在表发生 insert/update/delete 操作后会自动传播。Schema 变更之后复制的所有行中，新列都会被填充，但在未进行整表刷新之前，现有行不会显示默认值 |
| 删除现有列（`ALTER TABLE DROP COLUMN ...`）                                         | 会被检测到，但**不会**被传播。Schema 变更之后复制的所有行中，被删除的列对应的值将为 `NULL`                                                                |

请注意，新增列会在某个批次同步结束时才会被传播，这可能发生在达到同步间隔或拉取批大小限制之后。关于控制同步的更多信息见 [此处](./controlling_sync.md)