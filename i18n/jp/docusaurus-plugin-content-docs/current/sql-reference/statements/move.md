---
'description': 'MOVEアクセスエンティティステートメントのドキュメント'
'sidebar_label': 'MOVE'
'sidebar_position': 54
'slug': '/sql-reference/statements/move'
'title': 'MOVEアクセスエンティティステートメント'
---




# MOVE アクセスエンティティ文

この文は、アクセスエンティティを1つのアクセスストレージから別のアクセスストレージに移動することを許可します。

構文:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

現在、ClickHouseには5つのアクセスストレージがあります：
 - `local_directory`
 - `memory`
 - `replicated`
 - `users_xml` (ro)
 - `ldap` (ro)

例:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
