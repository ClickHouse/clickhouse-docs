---
description: '현재 사용자의 현재 역할과 해당 역할에 부여된 역할을 포함하여, 현재 시점의 모든 활성 역할을 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'enabled_roles']
slug: /operations/system-tables/enabled_roles
title: 'system.enabled_roles'
doc_type: 'reference'
---

현재 시점의 모든 활성 역할을 포함하며, 여기에는 현재 사용자의 현재 역할과 해당 역할에 부여된 역할이 포함됩니다.

컬럼:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 역할 이름입니다.
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 `ADMIN OPTION` 권한을 가진 역할인지 여부를 나타내는 플래그입니다.
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 현재 사용자의 현재 역할인지 여부를 나타내는 플래그입니다.
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role`이 기본 역할인지 여부를 나타내는 플래그입니다.