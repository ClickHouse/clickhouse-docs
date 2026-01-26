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
