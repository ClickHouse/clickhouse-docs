---
'description': '시스템 테이블로 현재 활성화된 모든 역할을 포함하고 있으며, 현재 사용자의 현재 역할과 현재 역할에 부여된 역할을 포함합니다.'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled_roles'
'title': 'system.enabled_roles'
'doc_type': 'reference'
---

현재 활성화된 모든 역할이 포함되어 있으며, 여기에는 현재 사용자의 현재 역할 및 현재 역할에 대해 부여된 역할이 포함됩니다.

컬럼:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 역할 이름.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 `ADMIN OPTION` 권한이 있는 역할인지 여부를 나타내는 플래그.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 현재 사용자의 현재 역할인지 여부를 나타내는 플래그.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 기본 역할인지 여부를 나타내는 플래그.
