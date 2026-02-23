---
description: 'USER와 역할에 대한 역할 부여 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'role_grants']
slug: /operations/system-tables/role_grants
title: 'system.role_grants'
doc_type: 'reference'
---

# system.role_grants \{#systemrole_grants\}

사용자와 롤에 대한 롤 부여 정보를 포함합니다. 이 테이블에 항목을 추가하려면 `GRANT role TO user`를 사용합니다.

컬럼:

* `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 이름.

* `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 롤 이름.

* `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` 롤에 부여된 롤의 이름입니다. 한 롤을 다른 롤에 부여하려면 `GRANT role1 TO role2`를 사용합니다.

* `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role`가 기본 롤인지 나타내는 플래그입니다. 가능한 값은 다음과 같습니다.
  * 1 — `granted_role`가 기본 롤입니다.
  * 0 — `granted_role`가 기본 롤이 아닙니다.

* `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role`가 [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 권한이 있는 롤인지 나타내는 플래그입니다. 가능한 값은 다음과 같습니다.
  * 1 — 해당 롤에 `ADMIN OPTION` 권한이 있습니다.
  * 0 — 해당 롤에 `ADMIN OPTION` 권한이 없습니다.