---
'description': '`executable` 테이블 함수는 사용자가 정의한 함수 (UDF)의 출력을 기반으로 테이블을 생성합니다. 이 함수는
  **stdout**에 행을 출력하는 스크립트에서 정의됩니다.'
'keywords':
- 'udf'
- 'user defined function'
- 'clickhouse'
- 'executable'
- 'table'
- 'function'
'sidebar_label': 'executable'
'sidebar_position': 50
'slug': '/engines/table-functions/executable'
'title': 'executable'
'doc_type': 'reference'
---


# 실행 가능한 테이블 함수 for UDFs

`executable` 테이블 함수는 **stdout**에 행을 출력하는 스크립트에서 정의한 사용자 정의 함수(UDF)를 기반으로 테이블을 생성합니다. 실행 가능한 스크립트는 `users_scripts` 디렉토리에 저장되며, 모든 소스에서 데이터를 읽을 수 있습니다. ClickHouse 서버에 실행 가능한 스크립트를 실행하는 데 필요한 모든 패키지가 설치되어 있는지 확인하십시오. 예를 들어, 파이썬 스크립트인 경우 서버에 필요한 파이썬 패키지가 설치되어 있어야 합니다.

선택적으로, 스크립트가 읽기 위해 결과를 **stdin**으로 스트리밍하는 하나 이상의 입력 쿼리를 포함할 수 있습니다.

:::note
보통 UDF 함수와 `executable` 테이블 함수 및 `Executable` 테이블 엔진의 주요 장점은 일반 UDF 함수가 행 수를 변경할 수 없다는 것입니다. 예를 들어, 입력이 100행인 경우 결과는 반드시 100행을 반환해야 합니다. `executable` 테이블 함수 또는 `Executable` 테이블 엔진을 사용할 때, 스크립트는 복잡한 집계를 포함하여 원하는 데이터 변환을 수행할 수 있습니다.
:::

## 구문 {#syntax}

`executable` 테이블 함수는 세 개의 매개변수를 요구하며, 선택적 입력 쿼리 목록을 수용합니다:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: 스크립트의 파일 이름. `user_scripts` 폴더에 저장됨 (기본적으로 `user_scripts_path` 설정의 기본 폴더)
- `format`: 생성된 테이블의 형식
- `structure`: 생성된 테이블의 테이블 스키마
- `input_query`: 선택적 쿼리 (또는 쿼리 집합)로, 결과가 **stdin**을 통해 스크립트에 전달됨

:::note
같은 입력 쿼리로 같은 스크립트를 반복 호출할 계획이라면, [`Executable` 테이블 엔진](../../engines/table-engines/special/executable.md)을 사용하는 것을 고려하세요.
:::

다음 파이썬 스크립트는 `generate_random.py`라는 이름이며, `user_scripts` 폴더에 저장됩니다. 이 스크립트는 숫자 `i`를 읽고, 탭으로 구분된 숫자 앞에 각 문자열이 오는 `i`개의 임의의 문자열을 인쇄합니다:

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Read input value
    for number in sys.stdin:
        i = int(number)

        # Generate some random rows
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Flush results to stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

스크립트를 호출하여 10개의 임의의 문자열을 생성해 보겠습니다:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

응답은 다음과 같이 보입니다:

```response
┌─id─┬─random─────┐
│  0 │ xheXXCiSkH │
│  1 │ AqxvHAoTrl │
│  2 │ JYvPCEbIkY │
│  3 │ sWgnqJwGRm │
│  4 │ fTZGrjcLon │
│  5 │ ZQINGktPnd │
│  6 │ YFSvGGoezb │
│  7 │ QyMJJZOOia │
│  8 │ NfiyDDhmcI │
│  9 │ REJRdJpWrg │
└────┴────────────┘
```

## 설정 {#settings}

- `send_chunk_header` - 데이터 청크를 처리하기 위해 보내기 전에 행 수를 보낼지 여부를 제어합니다. 기본값은 `false`입니다.
- `pool_size` — 풀의 크기. `pool_size`로 0이 지정되면 풀 크기 제한이 없습니다. 기본값은 `16`입니다.
- `max_command_execution_time` — 데이터 블록 처리에 대한 최대 실행 가능한 스크립트 명령 실행 시간입니다. 초 단위로 지정됩니다. 기본값은 10입니다.
- `command_termination_timeout` — 실행 가능한 스크립트는 주요 읽기-쓰기 루프를 포함해야 합니다. 테이블 함수가 파괴된 후, 파이프가 닫히고, 실행 파일은 ClickHouse가 자식 프로세스에 SIGTERM 신호를 보내기 전에 `command_termination_timeout` 초 동안 종료될 수 있습니다. 초 단위로 지정됩니다. 기본값은 10입니다.
- `command_read_timeout` - 명령 stdout에서 데이터를 읽는 타임아웃(밀리초 단위)입니다. 기본값은 10000입니다.
- `command_write_timeout` - 명령 stdin에 데이터를 쓰는 타임아웃(밀리초 단위)입니다. 기본값은 10000입니다.

## 쿼리 결과를 스크립트에 전달하기 {#passing-query-results-to-a-script}

쿼리 결과를 스크립트에 전달하는 방법에 대한 예제를 `Executable` 테이블 엔진에서 반드시 확인하십시오 [how to pass query results to a script](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). 다음은 해당 예제에서 `executable` 테이블 함수를 사용하여 같은 스크립트를 실행하는 방법입니다:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
