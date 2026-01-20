---
description: 'ALTER ROW POLICY のドキュメント'
sidebar_label: '行ポリシー'
sidebar_position: 47
slug: /sql-reference/statements/alter/row-policy
title: 'ALTER ROW POLICY'
doc_type: 'reference'
---

# ALTER ROW POLICY \{#alter-row-policy\}

行ポリシーを変更します。

構文:

```sql
ALTER [ROW] POLICY [IF EXISTS] name1 [ON CLUSTER cluster_name1] ON [database1.]table1 [RENAME TO new_name1]
        [, name2 [ON CLUSTER cluster_name2] ON [database2.]table2 [RENAME TO new_name2] ...]
    [AS {PERMISSIVE | RESTRICTIVE}]
    [FOR SELECT]
    [USING {condition | NONE}][,...]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```
