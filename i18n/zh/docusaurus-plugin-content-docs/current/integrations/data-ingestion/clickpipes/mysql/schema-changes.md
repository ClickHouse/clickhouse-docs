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

### MySQL 5.x 限制 \{#mysql-5-limitations\}

[8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) 之前的 MySQL 版本在 binlog 中不会包含完整的列元数据（`binlog_row_metadata=FULL`），因此 ClickPipes 会根据列的序号位置进行跟踪。也就是说：

- **在末尾新增列**（`ALTER TABLE ADD COLUMN ...`）是支持的。
- **任何会改变列位置的 DDL** 都会导致管道报错，因为列序号位置不再能被可靠映射。包括：
  - `ALTER TABLE DROP COLUMN ...`
  - `ALTER TABLE ADD COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE MODIFY COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE CHANGE COLUMN ... AFTER ...` / `FIRST`

如果遇到此错误，则需要重新同步该管道。