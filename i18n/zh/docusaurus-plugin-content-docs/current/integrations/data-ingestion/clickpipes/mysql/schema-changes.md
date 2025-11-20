---
title: 'Schema 变更传播支持'
slug: /integrations/clickpipes/mysql/schema-changes
description: '介绍 ClickPipes 在源表中可检测的 schema 变更类型的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

适用于 MySQL 的 ClickPipes 可以检测源表中的 schema 变更，并在某些情况下自动将这些变更传播到目标表。各类 DDL 操作的处理方式如下：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema 变更类型                                                                    | 行为                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                             | 自动传播。新列会填充到 schema 变更之后复制的所有行中                                                                 |
| 添加带默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                      | 自动传播。新列会填充到 schema 变更之后复制的所有行中，但在未执行整表刷新的情况下，现有行不会显示该默认值 |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                          | 能检测到，但**不会**传播。schema 变更之后复制的所有行中，被删除列的值将为 `NULL`                                                  |