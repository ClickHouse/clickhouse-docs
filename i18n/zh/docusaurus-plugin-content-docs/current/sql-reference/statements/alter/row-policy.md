---
'description': 'ALTER ROW POLICY 的文档'
'sidebar_label': 'ROW POLICY'
'sidebar_position': 47
'slug': '/sql-reference/statements/alter/row-policy'
'title': 'ALTER ROW POLICY'
---


# ALTER ROW POLICY

更改行策略。

语法：

```sql
ALTER [ROW] POLICY [IF EXISTS] name1 [ON CLUSTER cluster_name1] ON [database1.]table1 [RENAME TO new_name1]
        [, name2 [ON CLUSTER cluster_name2] ON [database2.]table2 [RENAME TO new_name2] ...]
    [AS {PERMISSIVE | RESTRICTIVE}]
    [FOR SELECT]
    [USING {condition | NONE}][,...]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```
