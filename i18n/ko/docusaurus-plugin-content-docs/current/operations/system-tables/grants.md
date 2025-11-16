---
'description': '시스템 테이블은 ClickHouse 사용자 계정에 부여된 권한을 보여줍니다.'
'keywords':
- 'system table'
- 'grants'
'slug': '/operations/system-tables/grants'
'title': 'system.grants'
'doc_type': 'reference'
---

ClickHouse 사용자 계정에 부여된 권한.

열:
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 이름.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 계정에 할당된 역할.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse 사용자 계정에 대한 접근 매개변수.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 데이터베이스의 이름.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 테이블의 이름.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 접근이 부여된 컬럼의 이름.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리 값. 일부 권한이 취소되었는지를 나타냅니다. 가능한 값:
  - `0` — 이 행은 권한 부여를 설명합니다.
  - `1` — 이 행은 부분적인 취소를 설명합니다.

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 권한이 `WITH GRANT OPTION`으로 부여됨, [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)를 참조하십시오.
