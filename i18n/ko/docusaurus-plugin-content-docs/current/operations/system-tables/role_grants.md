---
'description': '시스템 테이블은 사용자와 역할에 대한 역할 부여를 포함합니다.'
'keywords':
- 'system table'
- 'role_grants'
'slug': '/operations/system-tables/role_grants'
'title': 'system.role_grants'
'doc_type': 'reference'
---


# system.role_grants

사용자 및 역할에 대한 역할 부여를 포함합니다. 이 테이블에 항목을 추가하려면 `GRANT role TO user`를 사용하십시오.

컬럼:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 이름.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 역할 이름.

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` 역할에 부여된 역할의 이름. 한 역할을 다른 역할에 부여하려면 `GRANT role1 TO role2`를 사용하십시오.

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role`가 기본 역할인지 여부를 나타내는 플래그. 가능한 값:
  - 1 — `granted_role`가 기본 역할입니다.
  - 0 — `granted_role`가 기본 역할이 아닙니다.

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role`가 [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 권한을 가진 역할인지 여부를 나타내는 플래그. 가능한 값:
  - 1 — 역할이 `ADMIN OPTION` 권한을 가지고 있습니다.
  - 0 — `ADMIN OPTION` 권한이 없는 역할입니다.
