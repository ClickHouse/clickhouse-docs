---
'title': '架构更改传播支持'
'slug': '/integrations/clickpipes/mysql/schema-changes'
'description': '页面描述源表中 ClickPipes 可检测到的架构更改类型'
'doc_type': 'reference'
---

ClickPipes for MySQL 可以检测源表中的模式变化，并在某些情况下自动将这些变化传播到目标表。每个 DDL 操作的处理方式在下面进行了文档说明：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| 模式变化类型                                                                            | 行为                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                               | 自动传播。新的列将在模式变化后复制的所有行中填充                                                                          |
| 添加带有默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                     | 自动传播。新的列将在模式变化后复制的所有行中填充，但现有行在未进行全表刷新时不会显示默认值                                  |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                            | 检测到，但**不**传播。删除的列将在模式变化后复制的所有行中填充为 `NULL`                                                       |
