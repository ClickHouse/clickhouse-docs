---
'description': 'MOVE 접근 엔티티 쿼리에 대한 문서'
'sidebar_label': 'MOVE'
'sidebar_position': 54
'slug': '/sql-reference/statements/move'
'title': 'MOVE 접근 엔티티 쿼리'
'doc_type': 'reference'
---


# MOVE access entity statement

이 문장은 하나의 액세스 스토리지에서 다른 액세스 스토리지로 액세스 엔터티를 이동할 수 있게 해줍니다.

Syntax:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

현재 ClickHouse에는 다음과 같은 다섯 개의 액세스 스토리지가 있습니다:
- `local_directory`
- `memory`
- `replicated`
- `users_xml` (읽기 전용)
- `ldap` (읽기 전용)

Examples:

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
