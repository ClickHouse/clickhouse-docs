---
title: 'Schema 变更传播支持'
slug: /integrations/clickpipes/mysql/schema-changes
description: '页面描述 ClickPipes 在源表中可检测到的 schema 变更类型'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

用于 MySQL 的 ClickPipes 可以检测源表中的 schema 变更，并在某些情况下自动将这些变更传播到目标表。下面记录了每种 DDL 操作的处理方式：

[//]: # "TODO 扩展本页面内容，增加对重命名、数据类型变更以及 truncate 行为的说明，以及如何处理不兼容 schema 变更的指导。"

| Schema 变更类型                                                                    | 行为                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                            | 自动传播。新列将在 schema 变更之后同步的所有行中被填充                                                                                        |
| 使用默认值添加新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                     | 自动传播。新列将在 schema 变更之后同步的所有行中被填充，但已有的行在未执行整表刷新前不会显示默认值 |
| 删除已有列（`ALTER TABLE DROP COLUMN ...`）                                         | 可检测，但**不会**传播。被删除的列在 schema 变更之后同步的所有行中将被填充为 `NULL`                                                            |

**MySQL 5.7 及更早版本不支持 schema 变更**。可靠地跟踪列依赖于表元数据，而这些元数据在 [MySQL 8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) 之前的 binlog 中不可用。