---
'title': 'Schema Changes Propagation Support'
'slug': '/integrations/clickpipes/postgres/schema-changes'
'description': 'Page describing schema change types detectable by ClickPipes in the
  source tables'
---



ClickPipes for Postgres 可以检测源表中的模式更改。它可以将这些更改的一部分传播到相应的目标表。每种模式更改的处理方式如下所述：

| 模式更改类型                                                                | 行为                                   |
| ----------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                     | 自动传播，更改后的所有行将填充所有列                                   |
| 添加具有默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）           | 自动传播，更改后的所有行将填充所有列，但现有行在未进行完整表刷新时将不会显示默认值 |
| 删除现有列（`ALTER TABLE DROP COLUMN ...`）                                   | 检测到，但不传播。更改后的所有行在被删除的列中将显示 NULL                  |
