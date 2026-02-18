---
description: '`executable` 테이블 함수는 행을 **stdout**(표준 출력)으로 출력하는 스크립트에서 정의한 사용자 정의 함수(UDF)의 출력 결과를 기반으로 테이블을 생성합니다.'
keywords: ['udf', 'user defined function', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---



# UDF를 위한 executable 테이블 함수 \{#executable-table-function-for-udfs\}

`executable` 테이블 함수는 **stdout**으로 행을 출력하는 스크립트에 정의한 사용자 정의 함수(UDF)의 출력을 기반으로 테이블을 생성합니다. 이 실행 스크립트는 `users_scripts` 디렉터리에 저장되며, 어떤 소스에서든 데이터를 읽을 수 있습니다. ClickHouse 서버에 이 실행 스크립트를 실행하는 데 필요한 패키지가 모두 설치되어 있는지 확인하십시오. 예를 들어 Python 스크립트인 경우, 서버에 필요한 Python 패키지가 설치되어 있어야 합니다.

선택적으로 하나 이상의 입력 쿼리를 지정하여, 그 결과를 **stdin**으로 스트리밍해 스크립트가 읽도록 할 수 있습니다.

:::note
일반적인 UDF와 `executable` 테이블 함수 및 `Executable` 테이블 엔진의 핵심적인 차이점은, 일반적인 UDF는 행 개수를 변경할 수 없다는 점입니다. 예를 들어 입력이 100행이면 결과도 반드시 100행이어야 합니다. 반면 `executable` 테이블 함수나 `Executable` 테이블 엔진을 사용할 때는, 스크립트가 복잡한 집계를 포함하여 원하는 모든 데이터 변환을 수행할 수 있습니다.
:::



## 구문 \{#syntax\}

`executable` 테이블 FUNCTION은 세 개의 매개변수가 필요하며, 선택적인 입력 쿼리 목록을 받을 수 있습니다.

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

* `script_name`: 스크립트의 파일 이름입니다. `user_scripts` 폴더(`user_scripts_path` 설정의 기본 폴더)에 저장됩니다.
* `format`: 생성되는 테이블의 형식입니다.
* `structure`: 생성되는 테이블의 스키마입니다.
* `input_query`: 선택적 쿼리(또는 여러 개의 쿼리 모음)로, 결과가 **stdin**을 통해 스크립트에 전달됩니다.

:::note
동일한 입력 쿼리로 같은 스크립트를 반복적으로 호출하려는 경우 [`Executable` table engine](../../engines/table-engines/special/executable.md) 사용을 고려하십시오.
:::

다음 Python 스크립트의 이름은 `generate_random.py`이며 `user_scripts` 폴더에 저장됩니다. 이 스크립트는 숫자 `i`를 입력으로 받아 `i`개의 임의 문자열을 출력하며, 각 문자열 앞에는 탭으로 구분된 번호가 붙습니다.

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

스크립트를 실행해서 무작위 문자열 10개를 생성해 보겠습니다:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

응답은 다음과 같습니다.

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


## Settings \{#settings\}

- `send_chunk_header` - 데이터를 처리하기 위해 청크를 전송하기 전에 행(row) 개수를 먼저 전송할지 여부를 제어합니다. 기본값은 `false`입니다.
- `pool_size` — 풀의 크기입니다. `pool_size`로 0이 지정되면 풀 크기에 대한 제한이 없습니다. 기본값은 `16`입니다.
- `max_command_execution_time` — 데이터 블록을 처리하기 위한 실행 스크립트 명령의 최대 실행 시간입니다. 단위는 초입니다. 기본값은 10입니다.
- `command_termination_timeout` — 실행 스크립트에는 기본 읽기-쓰기 루프가 포함되어야 합니다. 테이블 함수가 소멸된 후 파이프가 닫히며, 자식 프로세스에 ClickHouse가 SIGTERM 신호를 보내기 전에 실행 파일은 종료를 위해 `command_termination_timeout`초가 주어집니다. 단위는 초입니다. 기본값은 10입니다.
- `command_read_timeout` - 명령의 stdout에서 데이터를 읽기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다.
- `command_write_timeout` - 명령의 stdin에 데이터를 쓰기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다.



## 쿼리 결과를 스크립트로 전달하기 \{#passing-query-results-to-a-script\}

`Executable` 테이블 엔진에 있는 [쿼리 결과를 스크립트로 전달하는 방법](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)에 대한 예제를 반드시 확인하십시오. 다음은 해당 예제에서 사용한 동일한 스크립트를 `executable` 테이블 함수로 실행하는 방법입니다.

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
