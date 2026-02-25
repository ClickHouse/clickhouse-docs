---
description: '시스템 내 모든 마스킹 정책에 대한 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'masking_policies']
slug: /operations/system-tables/masking_policies
title: 'system.masking_policies'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# system.masking_policies \{#systemmasking_policies\}

시스템에 정의된 모든 마스킹 정책에 대한 정보를 포함합니다.

컬럼:

* `name` ([String](/sql-reference/data-types/string.md)) — 마스킹 정책 이름입니다. 전체 이름 형식은 `short_name ON database.table`입니다.
* `short_name` ([String](/sql-reference/data-types/string.md)) — 마스킹 정책의 짧은 이름입니다. 예를 들어 전체 이름이 `mask_email ON mydb.mytable`인 경우, 짧은 이름은 `mask_email`입니다.
* `database` ([String](/sql-reference/data-types/string.md)) — 데이터베이스 이름입니다.
* `table` ([String](/sql-reference/data-types/string.md)) — 테이블 이름입니다.
* `id` ([UUID](/sql-reference/data-types/uuid.md)) — 마스킹 정책 ID입니다.
* `storage` ([String](/sql-reference/data-types/string.md)) — 마스킹 정책이 저장되는 디렉터리 이름입니다.
* `update_assignments` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — 데이터가 어떻게 마스킹되어야 하는지 정의하는 UPDATE 할당식입니다. 예: `email = '***masked***', phone = '***-***-****'`.
* `where_condition` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — 마스킹을 언제 적용해야 하는지 지정하는 선택적 WHERE 조건입니다.
* `priority` ([Int64](/sql-reference/data-types/int-uint.md)) — 여러 마스킹 정책을 적용할 때의 우선순위입니다. 우선순위가 더 높은 정책이 먼저 적용됩니다. 기본값은 0입니다.
* `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint.md)) — 마스킹 정책이 모든 역할 및/또는 사용자에게 적용되는지 여부를 나타냅니다. 참이면 1, 그렇지 않으면 0입니다.
* `apply_to_list` ([Array(String)](/sql-reference/data-types/array.md)) — 마스킹 정책이 적용되는 역할 및/또는 사용자 목록입니다.
* `apply_to_except` ([Array(String)](/sql-reference/data-types/array.md)) — 나열된 역할 및/또는 사용자를 제외한 모든 역할 및/또는 사용자에게 마스킹 정책이 적용됩니다. `apply_to_all`이 1일 때만 값이 설정됩니다.