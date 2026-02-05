---
title: 'Schema Changes Propagation Support'
slug: /integrations/clickpipes/mysql/schema-changes
description: 'Page describing schema change types detectable by ClickPipes in the source tables'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

ClickPipes for MySQL can detect schema changes in the source tables and, in some cases, automatically propagate the changes to the destination tables. The way each DDL operation is handled is documented below:

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | Propagated automatically. The new column(s) will be populated for all rows replicated after the schema change                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | Propagated automatically. The new column(s) will be populated for all rows replicated after the schema change, but existing rows will not show the default value without a full table refresh |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | Detected, but **not** propagated. The dropped column(s) will be populated with `NULL` for all rows replicated after the schema change                                                                |

### MySQL 5.x limitations {#mysql-5-limitations}

MySQL versions older than [8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) do not include full column metadata in the binlog (`binlog_row_metadata=FULL`), so ClickPipes tracks columns by ordinal position. This means:

- **Adding a column at the end** (`ALTER TABLE ADD COLUMN ...`) is supported.
- **Any DDL that shifts column positions** will cause the pipe to raise an error, because ordinal positions can no longer be reliably mapped. This includes:
  - `ALTER TABLE DROP COLUMN ...`
  - `ALTER TABLE ADD COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE MODIFY COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE CHANGE COLUMN ... AFTER ...` / `FIRST`

If you hit this error, you will need to resync the pipe.
