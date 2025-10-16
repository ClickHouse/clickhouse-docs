---
'title': '模式变更传播支持'
'slug': '/integrations/clickpipes/postgres/schema-changes'
'description': '页面描述源表中 ClickPipes 可检测的模式变更类型'
'doc_type': 'reference'
---

ClickPipes for Postgres 可以检测源表中的模式更改，并在某些情况下自动将更改传播到目标表。每种 DDL 操作的处理方式在下面有说明：

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| 模式更改类型                                                                         | 行为                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                             | 一旦表格进行插入/更新/删除操作，自动传播。新列将对模式更改后复制的所有行进行填充。                                                      |
| 添加带默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                     | 一旦表格进行插入/更新/删除操作，自动传播。新列将对模式更改后复制的所有行进行填充，但是现有行在没有完全刷新表格的情况下将不会显示默认值。        |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                          | 被检测到，但**不**会传播。被删除列对于模式更改后复制的所有行将填充为 `NULL`。                                                            |

注意，列的添加将在批次同步结束时传播，这可能在同步间隔或提取批大小达到后发生。有关控制同步的更多信息[这里](./controlling_sync.md)。
