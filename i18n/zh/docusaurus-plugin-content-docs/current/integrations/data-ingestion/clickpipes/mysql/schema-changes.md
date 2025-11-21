---
title: '模式变更传播支持'
slug: /integrations/clickpipes/mysql/schema-changes
description: '页面描述 ClickPipes 在源表中可检测到的模式变更类型'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

适用于 MySQL 的 ClickPipes 能够检测源表中的模式变更，并且在某些情况下可以自动将这些变更传播到目标表。每种 DDL 操作的处理方式如下所述：

[//]: # "TODO 扩展本页内容，增加关于重命名、数据类型变更和 truncate 的行为说明，以及关于如何处理不兼容模式变更的指导。"

| 模式变更类型                                                                        | 行为                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                             | 自动传播。新列将在模式变更之后同步的所有行中被填充                                                                                      |
| 添加带默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                      | 自动传播。新列将在模式变更之后同步的所有行中被填充，但现有行在未进行整表刷新时不会显示该默认值 |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                          | 可检测，但**不会**传播。被删除的列在模式变更之后同步的所有行中将被填充为 `NULL`                                                           |