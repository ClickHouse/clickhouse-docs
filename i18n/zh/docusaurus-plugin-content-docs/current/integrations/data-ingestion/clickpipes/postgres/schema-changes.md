---
title: '模式变更传播支持'
slug: /integrations/clickpipes/postgres/schema-changes
description: '介绍 ClickPipes 能在源表中检测到的模式变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---

用于 Postgres 的 ClickPipes 可以检测源表中的模式变更，并在某些情况下自动将这些变更传播到目标表。下面记录了每种 DDL 操作的处理方式：

[//]: # "TODO 扩展本页面，补充对重命名、数据类型变更和 truncate 的行为说明，以及如何处理不兼容模式变更的指导。"

| 模式变更类型                                                                         | 行为                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                             | 一旦表发生 insert/update/delete 操作，就会自动传播。模式变更之后复制的所有行中，新列都会被填充                                                   |
| 添加带默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                       | 一旦表发生 insert/update/delete 操作，就会自动传播。模式变更之后复制的所有行中，新列都会被填充，但在未执行整表刷新之前，现有行不会显示默认值 |
| 删除现有列（`ALTER TABLE DROP COLUMN ...`）                                          | 会被检测到，但**不会**传播。模式变更之后复制的所有行中，被删除的列将被填充为 `NULL`                                                                |

请注意，列的新增会在某个批次同步结束时被传播，这可能发生在达到同步间隔或拉取批次大小时。有关控制同步的更多信息请参见[此处](./controlling_sync.md)。