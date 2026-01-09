---
title: '表结构变更传播支持'
slug: /integrations/clickpipes/mysql/schema-changes
description: '说明 ClickPipes 可在源表中检测到的表结构变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

适用于 MySQL 的 ClickPipes 可以检测源表中的表结构变更，并且在某些情况下可以将这些变更自动传播到目标表。每种 DDL 操作的处理方式如下所述：

[//]: # "TODO 扩展本页内容，增加对重命名、数据类型变更和 TRUNCATE 的行为说明，以及关于如何处理不兼容表结构变更的指导。"

| 表结构变更类型                                                                      | 行为                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                            | 自动传播。新列会在表结构变更之后复制的所有行中填充                                                                           |
| 添加带默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                     | 自动传播。新列会在表结构变更之后复制的所有行中填充，但在未进行整表刷新前，现有行不会显示默认值 |
| 删除现有列（`ALTER TABLE DROP COLUMN ...`）                                         | 可检测，但**不会**传播。表结构变更之后复制的所有行中，被删除的列的值将为 `NULL`                                                                |