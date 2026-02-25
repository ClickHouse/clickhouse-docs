---
description: '사용자 정의 함수(User-Defined Functions, UDF)의 로드 상태와 구성 메타데이터를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'user_defined_functions', 'udf', 'executable']
slug: /operations/system-tables/user_defined_functions
title: 'system.user_defined_functions'
doc_type: 'reference'
---

# system.user_defined_functions \{#systemuser_defined_functions\}

[사용자 정의 함수(User-Defined Functions, UDF)](/sql-reference/functions/udf.md)에 대한 로딩 상태, 오류 정보, 구성 메타데이터를 포함합니다.

컬럼:

**로딩 상태**

* `name` ([String](/sql-reference/data-types/string.md)) — UDF 이름입니다.
* `load_status` ([Enum8](/sql-reference/data-types/enum.md)) — 로딩 상태입니다: `Success` (UDF가 로드되어 사용 가능), `Failed` (UDF 로드 실패).
* `loading_error_message` ([String](/sql-reference/data-types/string.md)) — 로딩 실패 시의 상세 오류 메시지입니다. 성공적으로 로드된 경우 비어 있습니다.
* `last_successful_update_time` ([Nullable(DateTime)](/sql-reference/data-types/datetime.md)) — 마지막으로 성공적으로 로드된 시점의 타임스탬프입니다. 한 번도 성공한 적이 없으면 `NULL`입니다.
* `loading_duration_ms` ([UInt64](/sql-reference/data-types/int-uint.md)) — UDF 로딩에 소요된 시간(밀리초)입니다.

**UDF 구성**

* `type` ([Enum8](/sql-reference/data-types/enum.md)) — UDF 유형입니다: `executable`(블록당 단일 프로세스) 또는 `executable_pool`(지속적인 프로세스 풀).
* `command` ([String](/sql-reference/data-types/string.md)) — 인자를 포함하여 실행할 스크립트 또는 명령입니다.
* `format` ([String](/sql-reference/data-types/string.md)) — 입출력에 사용할 데이터 형식입니다(예: `TabSeparated`, `JSONEachRow`).
* `return_type` ([String](/sql-reference/data-types/string.md)) — 함수 반환 타입입니다(예: `String`, `UInt64`).
* `return_name` ([String](/sql-reference/data-types/string.md)) — 선택적인 반환 값 식별자입니다. 설정되지 않은 경우 비어 있습니다.
* `argument_types` ([Array(String)](/sql-reference/data-types/array.md)) — 인자 타입 배열입니다.
* `argument_names` ([Array(String)](/sql-reference/data-types/array.md)) — 인자 이름 배열입니다. 이름이 없는 인자는 빈 문자열입니다.

**실행 파라미터**

* `max_command_execution_time` ([UInt64](/sql-reference/data-types/int-uint.md)) — 데이터 블록을 처리하는 최대 시간(초)입니다. `executable_pool` 유형에만 적용됩니다.
* `command_termination_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 명령 프로세스에 SIGTERM을 전송하기까지의 시간(초)입니다.
* `command_read_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 명령의 stdout에서 읽기 위한 시간 제한(밀리초)입니다.
* `command_write_timeout` ([UInt64](/sql-reference/data-types/int-uint.md)) — 명령의 stdin에 쓰기 위한 시간 제한(밀리초)입니다.
* `pool_size` ([UInt64](/sql-reference/data-types/int-uint.md)) — 풀에 있는 프로세스 인스턴스 개수입니다. `executable_pool` 유형에만 적용됩니다.
* `send_chunk_header` ([UInt8](/sql-reference/data-types/int-uint.md)) — 각 데이터 청크 앞에 행(row) 개수를 전송할지 여부입니다(1 = 예, 0 = 아니오).
* `execute_direct` ([UInt8](/sql-reference/data-types/int-uint.md)) — 명령을 직접 실행할지(1) 또는 `/bin/bash`를 통해 실행할지(0)에 대한 설정입니다.
* `lifetime` ([UInt64](/sql-reference/data-types/int-uint.md)) — 재로딩 주기(초)입니다. 0이면 재로딩이 비활성화됩니다.
* `deterministic` ([UInt8](/sql-reference/data-types/int-uint.md)) — 동일한 인자에 대해 항상 동일한 결과를 반환하는 함수인지 여부입니다(1 = 예, 0 = 아니오).

**예시**

다음과 같이 모든 UDF와 해당 로딩 상태를 조회할 수 있습니다:

```sql
SELECT
    name,
    load_status,
    type,
    command,
    return_type,
    argument_types
FROM system.user_defined_functions
FORMAT Vertical;
```

```response
Row 1:
──────
name:           my_sum_udf
load_status:    Success
type:           executable
command:        /var/lib/clickhouse/user_scripts/sum.py
return_type:    UInt64
argument_types: ['UInt64','UInt64']
```

실패한 UDF 조회:

```sql
SELECT
    name,
    loading_error_message
FROM system.user_defined_functions
WHERE load_status = 'Failed';
```

**추가 참고**

* [사용자 정의 함수](/sql-reference/functions/udf.md) — UDF 생성 및 구성 방법.
