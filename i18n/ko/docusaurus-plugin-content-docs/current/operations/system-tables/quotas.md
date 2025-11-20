---
'description': '시스템 테이블에 대한 정보가 포함되어 있는 쿼타.'
'keywords':
- 'system table'
- 'quotas'
- 'quota'
'slug': '/operations/system-tables/quotas'
'title': 'system.quotas'
'doc_type': 'reference'
---


# system.quotas

[쿼타](../../operations/system-tables/quotas.md)에 대한 정보를 포함합니다.

컬럼:
- `name` ([String](../../sql-reference/data-types/string.md)) — 쿼타 이름.
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 쿼타 ID.
- `storage`([String](../../sql-reference/data-types/string.md)) — 쿼타의 저장소. 가능한 값: "users.xml" (users.xml 파일에 구성된 쿼타인 경우), "disk" (SQL 쿼리로 구성된 쿼타인 경우).
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — 쿼타가 공유되어야 하는 방식을 지정하는 키. 두 개의 연결이 동일한 쿼타와 키를 사용하면, 해당하는 리소스를 공유합니다. 값:
  - `[]` — 모든 사용자가 동일한 쿼타를 공유합니다.
  - `['user_name']` — 동일한 사용자 이름을 가진 연결이 동일한 쿼타를 공유합니다.
  - `['ip_address']` — 동일한 IP에서의 연결이 동일한 쿼타를 공유합니다.
  - `['client_key']` — 동일한 키를 가진 연결이 동일한 쿼타를 공유합니다. 키는 클라이언트에 의해 명시적으로 제공되어야 합니다. [clickhouse-client](../../interfaces/cli.md)를 사용할 때는 `--quota_key` 매개변수에 키 값을 전달하거나 클라이언트 구성 파일의 `quota_key` 매개변수를 사용해야 합니다. HTTP 인터페이스를 사용할 때는 `X-ClickHouse-Quota` 헤더를 사용합니다.
  - `['user_name', 'client_key']` — 동일한 `client_key`를 가진 연결이 동일한 쿼타를 공유합니다. 클라이언트가 키를 제공하지 않으면, 쿼타는 `user_name`에 대해 추적됩니다.
  - `['client_key', 'ip_address']` — 동일한 `client_key`를 가진 연결이 동일한 쿼타를 공유합니다. 클라이언트가 키를 제공하지 않으면, 쿼타는 `ip_address`에 대해 추적됩니다.
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 초 단위의 시간 간격 길이.
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리 값. 쿼타가 적용되는 사용자를 나타냅니다. 값:
  - `0` — 쿼타는 `apply_to_list`에 지정된 사용자에게 적용됩니다.
  - `1` — 쿼타는 `apply_to_except`에 나열된 사용자를 제외한 모든 사용자에게 적용됩니다.
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 쿼타가 적용되어야 하는 사용자 이름/[역할](../../guides/sre/user-management/index.md#role-management) 목록.
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 쿼타가 적용되지 않아야 하는 사용자 이름/역할 목록.

## 참조 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
