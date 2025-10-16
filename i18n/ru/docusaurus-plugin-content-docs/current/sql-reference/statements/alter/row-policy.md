---
slug: '/sql-reference/statements/alter/row-policy'
sidebar_label: 'ROW POLICY'
sidebar_position: 47
description: 'Документация для ALTER ROW POLICY'
title: 'ALTER ROW POLICY'
doc_type: reference
---
# ИЗМЕНЕНИЕ ПОЛИТИКИ СТРОК

Изменяет политику строк.

Синтаксис:

```sql
ALTER [ROW] POLICY [IF EXISTS] name1 [ON CLUSTER cluster_name1] ON [database1.]table1 [RENAME TO new_name1]
        [, name2 [ON CLUSTER cluster_name2] ON [database2.]table2 [RENAME TO new_name2] ...]
    [AS {PERMISSIVE | RESTRICTIVE}]
    [FOR SELECT]
    [USING {condition | NONE}][,...]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```