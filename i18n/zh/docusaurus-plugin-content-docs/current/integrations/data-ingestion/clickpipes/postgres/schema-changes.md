---
'title': '模式变更传播支持'
'slug': '/integrations/clickpipes/postgres/schema-changes'
'description': '页面描述源表中 ClickPipes 可检测的模式变更类型'
---

ClickPipes for Postgres 可以检测源表中的模式变化。它可以将其中一些变化传播到相应的目标表中。每种模式变化的处理方式在下文中进行了记录：

| 模式变化类型                                                                         | 行为                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                             | 自动传播，所有变化后的行都将填充所有列                                                                |
| 添加带默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                      | 自动传播，所有变化后的行都将填充所有列，但现有行在未进行完整表刷新的情况下不会显示默认值                                    |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                         | 检测到，但未传播。所有变化后的行将在删除的列中显示 NULL                                                |
