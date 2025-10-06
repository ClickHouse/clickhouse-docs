---
'description': 'MOVE アクセスエンティティ ステートメントのドキュメント'
'sidebar_label': 'MOVE'
'sidebar_position': 54
'slug': '/sql-reference/statements/move'
'title': 'MOVE アクセスエンティティ ステートメント'
'doc_type': 'reference'
---


# MOVE アクセスエンティティステートメント

このステートメントは、アクセスエンティティを1つのアクセスストレージから別のものに移動することを許可します。

構文:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

現在、ClickHouseには5つのアクセスストレージがあります:
- `local_directory`
- `memory`
- `replicated`
- `users_xml` (読み取り専用)
- `ldap` (読み取り専用)

例:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
