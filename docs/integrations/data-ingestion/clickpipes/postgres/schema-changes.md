---
title: 'Schema Changes Propagation Support'
slug: /integrations/clickpipes/postgres/schema-changes
description: 'Page describing schema change types detectable by ClickPipes in the source tables'
---

ClickPipes for Postgres can detect schema changes in the source tables. It can propagate some of these changes to the corresponding destination tables as well. The way each schema change is handled is documented below:

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | Propagated automatically, all rows after the change will have all columns filled                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | Propagated automatically, all rows after the change will have all columns filled but existing rows will not show the DEFAULT value without a full table refresh |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | Detected, but not propagated. All rows after the change will have NULL for the dropped columns                                                                |
