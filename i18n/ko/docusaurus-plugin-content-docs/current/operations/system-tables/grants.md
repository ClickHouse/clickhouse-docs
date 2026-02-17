---
description: 'ClickHouse 사용자 계정에 부여된 권한을 보여 주는 시스템 테이블입니다.'
keywords: ['system table', 'grants']
slug: /operations/system-tables/grants
title: 'system.grants'
doc_type: 'reference'
---

ClickHouse 사용자 계정에 부여된 권한입니다.

컬럼:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 이름입니다.

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 사용자 계정에 할당된 역할입니다.

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse 사용자 계정에 대한 액세스 매개변수입니다.

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 데이터베이스 이름입니다.

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 테이블 이름입니다.

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 권한이 부여된 컬럼 이름입니다.

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 논리값입니다. 일부 권한이 철회되었는지를 나타냅니다. 가능한 값은 다음과 같습니다.
- `0` — 이 행은 권한 부여를 나타냅니다.
- `1` — 이 행은 부분 철회를 나타냅니다.

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `WITH GRANT OPTION`으로 권한이 부여되었음을 나타냅니다. [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)를 참고하십시오.