---
title: 'ClickPipes for Postgres: Schema Changes Propagation Support'
slug: /integrations/clickpipes/postgres/schema-changes
---

ClickPipes for Postgres 可以检测源表中的模式更改。它还可以将其中一些更改传播到相应的目标表。每种模式更改的处理方式如下文所述：

| 模式更改类型                                                                       | 行为                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 添加新列（`ALTER TABLE ADD COLUMN ...`）                                         | 自动传播，所有更改后的行将填充所有列                                                                         |
| 添加带有默认值的新列（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）                 | 自动传播，所有更改后的行将填充所有列，但现有行在未进行完整表刷新时将不显示默认值 |
| 删除现有列（`ALTER TABLE DROP COLUMN ...`）                                       | 被检测到，但不传播。所有更改后的行在被删除的列中将为 NULL                                                                |
