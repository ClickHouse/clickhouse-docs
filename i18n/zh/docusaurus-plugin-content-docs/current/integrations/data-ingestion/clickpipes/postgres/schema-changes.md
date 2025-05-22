---
'title': '模式更改传播支持'
'slug': '/integrations/clickpipes/postgres/schema-changes'
'description': '描述在源表中通过ClickPipes可检测的模式更改类型的页面'
---

ClickPipes for Postgres 可以检测源表中的模式变化。它还可以将其中一些变化传播到相应的目标表中。每种模式变化的处理方式如下文所述：

| 模式变化类型                                                                     | 行为                                  |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列 (`ALTER TABLE ADD COLUMN ...`)                                          | 自动传播，所有变化后的行将填充所有列                                        |
| 添加带默认值的新列 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`)                   | 自动传播，所有变化后的行将填充所有列，但现有行在未进行完整表刷新之前不会显示默认值 |
| 删除现有列 (`ALTER TABLE DROP COLUMN ...`)                                       | 检测到，但不传播。所有变化后的行在被删除的列上将显示 NULL                     |
