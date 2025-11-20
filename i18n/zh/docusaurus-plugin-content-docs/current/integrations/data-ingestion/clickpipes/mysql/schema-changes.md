---
title: 'Schema Changes Propagation Support'
slug: /integrations/clickpipes/mysql/schema-changes
description: '页面描述 ClickPipes 在源表中可检测到的模式变更类型'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

适用于 MySQL 的 ClickPipes 可以检测源表中的模式变更，并且在某些情况下，自动将这些变更传播到目标表。各类 DDL 操作的处理方式如下所示：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 自动传播。新列将在模式变更之后复制的所有行中被填充                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自动传播。新列将在模式变更之后复制的所有行中被填充，但在未进行整表刷新时，已有行不会显示该默认值 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 可检测到，但**不会**传播。被删除的列在模式变更之后复制的所有行中将被填充为 `NULL`                                                                |