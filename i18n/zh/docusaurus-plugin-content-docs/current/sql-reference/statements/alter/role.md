---
'description': '角色的文档'
'sidebar_label': '角色'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/role'
'title': '修改角色'
---



变更角色。

语法：

```sql
ALTER ROLE [IF EXISTS] name1 [RENAME TO new_name |, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [DROP ALL PROFILES]
    [DROP ALL SETTINGS]
    [DROP PROFILES 'profile_name' [,...] ]
    [DROP SETTINGS variable [,...] ]
    [ADD|MODIFY SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
    [ADD PROFILES 'profile_name' [,...] ]
```
