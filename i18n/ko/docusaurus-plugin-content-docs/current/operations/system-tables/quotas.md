---
description: 'QUOTA 관련 정보를 포함하는 system 테이블입니다.'
keywords: ['system table', 'QUOTA', 'QUOTA']
slug: /operations/system-tables/quotas
title: 'system.quotas'
doc_type: 'reference'
---



# system.quotas \{#systemquotas\}

[쿼터](../../operations/system-tables/quotas.md)에 대한 정보를 포함합니다.

Columns:
- `name` ([String](../../sql-reference/data-types/string.md)) — 쿼터 이름입니다.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 쿼터 ID입니다.
- `storage`([String](../../sql-reference/data-types/string.md)) — 쿼터가 저장되는 위치입니다. 가능한 값: 쿼터가 users.xml 파일에서 설정된 경우 "users.xml", SQL 쿼리로 설정된 경우 "disk".
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — 쿼터를 어떻게 공유할지 지정하는 키입니다. 두 연결이 동일한 쿼터와 키를 사용하면 동일한 양의 리소스를 공유합니다. 값:
  - `[]` — 모든 사용자가 동일한 쿼터를 공유합니다.
  - `['user_name']` — 동일한 사용자 이름을 사용하는 연결이 동일한 쿼터를 공유합니다.
  - `['ip_address']` — 동일한 IP에서 오는 연결이 동일한 쿼터를 공유합니다.
  - `['client_key']` — 동일한 키를 사용하는 연결이 동일한 쿼터를 공유합니다. 키는 클라이언트가 명시적으로 제공해야 합니다. [clickhouse-client](../../interfaces/cli.md)를 사용할 때는 `--quota_key` 파라미터로 키 값을 전달하거나, 클라이언트 설정 파일에서 `quota_key` 파라미터를 사용합니다. HTTP 인터페이스를 사용할 때는 `X-ClickHouse-Quota` 헤더를 사용합니다.
  - `['user_name', 'client_key']` — 동일한 `client_key`를 사용하는 연결이 동일한 쿼터를 공유합니다. 클라이언트가 키를 제공하지 않으면 쿼터는 `user_name` 기준으로 추적됩니다.
  - `['client_key', 'ip_address']` — 동일한 `client_key`를 사용하는 연결이 동일한 쿼터를 공유합니다. 클라이언트가 키를 제공하지 않으면 쿼터는 `ip_address` 기준으로 추적됩니다.
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 시간 간격의 길이(초)입니다.
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리 값입니다. 쿼터가 어떤 사용자에게 적용되는지 나타냅니다. 값:
  - `0` — 쿼터는 `apply_to_list`에 지정된 사용자에게 적용됩니다.
  - `1` — 쿼터는 `apply_to_except`에 나열된 사용자를 제외한 모든 사용자에게 적용됩니다.
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 쿼터를 적용해야 하는 사용자 이름 또는 [roles](../../guides/sre/user-management/index.md#role-management) 목록입니다.
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 쿼터를 적용하지 말아야 하는 사용자 이름 또는 역할 목록입니다.



## 참고 \{#see-also\}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
