---
'description': '현재 사용자에 대한 활성 역할을 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'current_roles'
'slug': '/operations/system-tables/current_roles'
'title': 'system.current_roles'
'doc_type': 'reference'
---

현재 사용자의 활성 역할을 포함합니다. `SET ROLE`은 이 테이블의 내용을 변경합니다.

컬럼:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 역할 이름.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role`이 `ADMIN OPTION` 권한을 가진 역할인지 나타내는 플래그.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role`이 기본 역할인지 나타내는 플래그.
