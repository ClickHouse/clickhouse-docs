---
description: 'UDF(User Defined Function) 문서'
sidebar_label: 'UDF'
slug: /sql-reference/functions/udf
title: 'UDF(User Defined Function)'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# User Defined Function (UDF) \{#executable-user-defined-functions\}

<PrivatePreviewBadge/>

:::note
이 기능은 ClickHouse Cloud에서 프라이빗 프리뷰로 제공됩니다.
액세스하려면 https://clickhouse.cloud/support 에서 ClickHouse Support에 문의하십시오.
:::

ClickHouse는 데이터를 처리하기 위해 임의의 외부 실행 프로그램 또는 스크립트를 호출할 수 있습니다.

실행 가능한 사용자 정의 함수(UDF)의 구성은 하나 이상의 XML 파일에 위치할 수 있습니다.
구성 파일의 경로는 [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 파라미터로 지정합니다.

함수 구성에는 다음과 같은 설정이 포함됩니다:

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                   | Required  | Default Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | 함수 이름                                                                                                                                                                                                                                                                                                                                                                                      | Yes       | -                     |
| `command`                     | 실행할 스크립트 이름 또는 `execute_direct`가 false인 경우 실행할 명령                                                                                                                                                                                                                                                                                                                          | Yes       | -                     |
| `argument`                    | 인수의 `type`과 선택적인 `name`을 포함한 인수 설명입니다. 각 인수는 별도의 설정으로 기술됩니다. 인수 이름이 [Native](/interfaces/formats/Native) 또는 [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 사용자 정의 함수 포맷의 직렬화에 포함되는 경우 이름을 지정해야 합니다                                                                                                                         | Yes       | `c` + argument_number |
| `format`                      | 인수를 명령에 전달할 때 사용하는 [format](../../interfaces/formats.md)입니다. 명령의 출력도 동일한 형식을 사용해야 합니다                                                                                                                                                                                                                                                                      | Yes       | -                     |
| `return_type`                 | 반환 값의 타입                                                                                                                                                                                                                                                                                                                                                                                | Yes       | -                     |
| `return_name`                 | 반환 값의 이름입니다. 반환 이름이 [Native](/interfaces/formats/Native) 또는 [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 사용자 정의 함수 포맷의 직렬화에 포함되는 경우 반환 이름을 지정해야 합니다                                                                                                                                                                           | Optional  | `result`              |
| `type`                        | 실행 타입입니다. `type`이 `executable`로 설정되면 단일 명령이 시작됩니다. `executable_pool`로 설정되면 명령 풀을 생성합니다                                                                                                                                                                                                                                                                  | Yes       | -                     |
| `max_command_execution_time`  | 데이터 블록을 처리하기 위한 최대 실행 시간(초)입니다. 이 설정은 `executable_pool` 명령에만 유효합니다                                                                                                                                                                                                                                                                                         | Optional  | `10`                  |
| `command_termination_timeout` | 파이프가 닫힌 후 명령이 종료되어야 하는 시간(초)입니다. 해당 시간이 지나면 명령을 실행 중인 프로세스에 `SIGTERM`이 전송됩니다                                                                                                                                                                                                                                                                 | Optional  | `10`                  |
| `command_read_timeout`        | 명령의 stdout에서 데이터를 읽기 위한 타임아웃(밀리초)                                                                                                                                                                                                                                                                                                                                          | Optional  | `10000`               |
| `command_write_timeout`       | 명령의 stdin에 데이터를 쓰기 위한 타임아웃(밀리초)                                                                                                                                                                                                                                                                                                                                             | Optional  | `10000`               |
| `pool_size`                   | 명령 풀의 크기                                                                                                                                                                                                                                                                                                                                                                                | Optional  | `16`                  |
| `send_chunk_header`           | 처리할 데이터 청크를 보내기 전에 행 수를 전송할지 여부를 제어합니다                                                                                                                                                                                                                                                                                                                            | Optional  | `false`               |
| `execute_direct`              | `execute_direct` = `1`이면, `command`는 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)로 지정된 user_scripts 폴더 내에서 검색됩니다. 공백 구분자를 사용하여 추가 스크립트 인수를 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`이면 `command`는 `bin/sh -c`의 인수로 전달됩니다                   | Optional  | `1`                   |
| `lifetime`                    | 함수의 재로드 간격(초)입니다. `0`으로 설정하면 함수는 재로드되지 않습니다                                                                                                                                                                                                                                                                                                                     | Optional  | `0`                   |
| `deterministic`               | 함수가 결정론적인 함수인지(동일한 입력에 대해 항상 동일한 결과를 반환하는지) 여부                                                                                                                                                                                                                                                                                                             | Optional  | `false`               |

명령은 `STDIN`에서 인수를 읽고 결과를 `STDOUT`으로 출력해야 합니다. 명령은 인수를 반복적으로 처리해야 하며, 하나의 인수 청크를 처리한 후에는 다음 청크를 기다려야 합니다.



## 실행형 사용자 정의 함수(UDF) \{#executable-user-defined-functions\}



## 예시 \{#examples\}

### 인라인 스크립트에서 정의한 UDF \{#udf-inline\}

XML 또는 YAML 설정을 사용하여 `execute_direct` 값을 `0`으로 수동 지정해 `test_function_sum`을 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
    파일 `test_function.xml`(기본 경로 설정 시 `/etc/clickhouse-server/test_function.xml`).

    ```xml title="/etc/clickhouse-server/test_function.xml"
    <functions>
        <function>
            <type>executable</type>
            <name>test_function_sum</name>
            <return_type>UInt64</return_type>
            <argument>
                <type>UInt64</type>
                <name>lhs</name>
            </argument>
            <argument>
                <type>UInt64</type>
                <name>rhs</name>
            </argument>
            <format>TabSeparated</format>
            <command>cd /; clickhouse-local --input-format TabSeparated --output-format TabSeparated --structure 'x UInt64, y UInt64' --query "SELECT x + y FROM table"</command>
            <execute_direct>0</execute_direct>
            <deterministic>true</deterministic>
        </function>
    </functions>
    ```
  </TabItem>

  <TabItem value="YAML" label="YAML">
    파일 `test_function.yaml`(기본 경로 설정 시 `/etc/clickhouse-server/test_function.yaml`).

    ```yml title="/etc/clickhouse-server/test_function.yaml"
    functions:
      type: executable
      name: test_function_sum
      return_type: UInt64
      argument:
        - type: UInt64
          name: lhs
        - type: UInt64
          name: rhs
      format: TabSeparated
      command: 'cd /; clickhouse-local --input-format TabSeparated --output-format TabSeparated --structure ''x UInt64, y UInt64'' --query "SELECT x + y FROM table"'
      execute_direct: 0
      deterministic: true
    ```
  </TabItem>
</Tabs>

<br />

```sql title="Query"
SELECT test_function_sum(2, 2);
```

```text title="Result"
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

### Python 스크립트에서 사용하는 UDF \{#udf-python\}

이 예제에서는 `STDIN`에서 값을 읽어 문자열로 반환하는 UDF를 생성합니다.

XML 또는 YAML 구성을 사용하여 `test_function`을 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
    파일 `test_function.xml` (기본 경로 설정에서는 `/etc/clickhouse-server/test_function.xml`에 위치합니다).

    ```xml title="/etc/clickhouse-server/test_function.xml"
    <functions>
        <function>
            <type>executable</type>
            <name>test_function_python</name>
            <return_type>String</return_type>
            <argument>
                <type>UInt64</type>
                <name>value</name>
            </argument>
            <format>TabSeparated</format>
            <command>test_function.py</command>
        </function>
    </functions>
    ```
  </TabItem>

  <TabItem value="YAML" label="YAML">
    파일 `test_function.yaml` (기본 경로 설정에서는 `/etc/clickhouse-server/test_function.yaml`에 위치합니다).

    ```yml title="/etc/clickhouse-server/test_function.yaml"
    functions:
      type: executable
      name: test_function_python
      return_type: String
      argument:
        - type: UInt64
          name: value
      format: TabSeparated
      command: test_function.py
    ```
  </TabItem>
</Tabs>

<br />

`user_scripts` 폴더 안에 `test_function.py` 스크립트 파일을 생성합니다(기본 경로 설정에서는 `/var/lib/clickhouse/user_scripts/test_function.py`에 위치합니다).

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

```sql title="Query"
SELECT test_function_python(toUInt64(2));
```

```text title="Result"
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

### `STDIN`에서 두 개의 값을 읽고 JSON 객체로 합계를 반환합니다 \{#udf-stdin\}

XML 또는 YAML 구성을 사용하여 이름이 있는 인수와 [JSONEachRow](/interfaces/formats/JSONEachRow) 형식을 갖는 `test_function_sum_json`을 생성합니다.


<Tabs>
  <TabItem value="XML" label="XML" default>
    파일 `test_function.xml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function.xml`에 위치합니다).

    ```xml title="/etc/clickhouse-server/test_function.xml"
    <functions>
        <function>
            <type>executable</type>
            <name>test_function_sum_json</name>
            <return_type>UInt64</return_type>
            <return_name>result_name</return_name>
            <argument>
                <type>UInt64</type>
                <name>argument_1</name>
            </argument>
            <argument>
                <type>UInt64</type>
                <name>argument_2</name>
            </argument>
            <format>JSONEachRow</format>
            <command>test_function_sum_json.py</command>
        </function>
    </functions>
    ```
  </TabItem>

  <TabItem value="YAML" label="YAML">
    파일 `test_function.yaml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function.yaml`에 위치합니다).

    ```yml title="/etc/clickhouse-server/test_function.yaml"
    functions:
      type: executable
      name: test_function_sum_json
      return_type: UInt64
      return_name: result_name
      argument:
        - type: UInt64
          name: argument_1
        - type: UInt64
          name: argument_2
      format: JSONEachRow
      command: test_function_sum_json.py
    ```
  </TabItem>
</Tabs>

<br />

`user_scripts` 폴더 안에 스크립트 파일 `test_function_sum_json.py`를 생성합니다(기본 경로 설정에서는 `/var/lib/clickhouse/user_scripts/test_function_sum_json.py`에 위치합니다).

```python
#!/usr/bin/python3

import sys
import json

if __name__ == '__main__':
    for line in sys.stdin:
        value = json.loads(line)
        first_arg = int(value['argument_1'])
        second_arg = int(value['argument_2'])
        result = {'result_name': first_arg + second_arg}
        print(json.dumps(result), end='\n')
        sys.stdout.flush()
```

```sql title="Query"
SELECT test_function_sum_json(2, 2);
```

```text title="Result"
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

### `command` 설정에서 매개변수 사용 \{#udf-parameters-in-command\}

실행 가능한 사용자 정의 함수는 `command` 설정에 구성된 상수 매개변수를 받을 수 있습니다(`executable` 타입의 사용자 정의 함수에만 작동합니다).
또한 셸 인자 확장 취약성을 방지하기 위해 `execute_direct` 옵션이 필요합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
    파일 `test_function_parameter_python.xml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function_parameter_python.xml`).

    ```xml title="/etc/clickhouse-server/test_function_parameter_python.xml"
    <functions>
        <function>
            <type>executable</type>
            <execute_direct>true</execute_direct>
            <name>test_function_parameter_python</name>
            <return_type>String</return_type>
            <argument>
                <type>UInt64</type>
            </argument>
            <format>TabSeparated</format>
            <command>test_function_parameter_python.py {test_parameter:UInt64}</command>
        </function>
    </functions>
    ```
  </TabItem>

  <TabItem value="YAML" label="YAML">
    파일 `test_function_parameter_python.yaml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function_parameter_python.yaml`).

    ```yml title="/etc/clickhouse-server/test_function_parameter_python.yaml"
    functions:
      type: executable
      execute_direct: true
      name: test_function_parameter_python
      return_type: String
      argument:
        - type: UInt64
      format: TabSeparated
      command: test_function_parameter_python.py {test_parameter:UInt64}
    ```
  </TabItem>
</Tabs>

<br />

`user_scripts` 폴더 내부에 `test_function_parameter_python.py` 스크립트 파일을 생성하십시오(기본 경로 설정에서는 `/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`).

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

```sql title="Query"
SELECT test_function_parameter_python(1)(2);
```


```text title="Result"
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

### 셸 스크립트를 사용하는 UDF \{#udf-shell-script\}

이 예제에서는 각 값을 2배로 곱하는 셸 스크립트를 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
    파일 `test_function_shell.xml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function_shell.xml`).

    ```xml title="/etc/clickhouse-server/test_function_shell.xml"
    <functions>
        <function>
            <type>executable</type>
            <name>test_shell</name>
            <return_type>String</return_type>
            <argument>
                <type>UInt8</type>
                <name>value</name>
            </argument>
            <format>TabSeparated</format>
            <command>test_shell.sh</command>
        </function>
    </functions>
    ```
  </TabItem>

  <TabItem value="YAML" label="YAML">
    파일 `test_function_shell.yaml`(기본 경로 설정에서는 `/etc/clickhouse-server/test_function_shell.yaml`).

    ```yml title="/etc/clickhouse-server/test_function_shell.yaml"
    functions:
      type: executable
      name: test_shell
      return_type: String
      argument:
        - type: UInt8
          name: value
      format: TabSeparated
      command: test_shell.sh
    ```
  </TabItem>
</Tabs>

<br />

`user_scripts` 폴더 안에 스크립트 파일 `test_shell.sh`를 생성합니다(기본 경로 설정에서는 `/var/lib/clickhouse/user_scripts/test_shell.sh`).

```bash title="/var/lib/clickhouse/user_scripts/test_shell.sh"
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

```sql title="Query"
SELECT test_shell(number) FROM numbers(10);
```

```text title="Result"
    ┌─test_shell(number)─┐
 1. │ 0                  │
 2. │ 2                  │
 3. │ 4                  │
 4. │ 6                  │
 5. │ 8                  │
 6. │ 10                 │
 7. │ 12                 │
 8. │ 14                 │
 9. │ 16                 │
10. │ 18                 │
    └────────────────────┘
```


## 오류 처리 \{#error-handling\}

일부 함수는 데이터가 유효하지 않은 경우 예외를 던질 수 있습니다.
이 경우 쿼리가 취소되고 오류 메시지가 클라이언트에 반환됩니다.
분산 처리 환경에서는 서버 중 하나에서 예외가 발생하면 다른 서버들도 해당 쿼리 중단을 시도합니다.



## 인수 표현식의 평가 \{#evaluation-of-argument-expressions\}

대부분의 프로그래밍 언어에서는 특정 연산자의 경우 인수 중 일부가 평가되지 않을 수 있습니다.
이러한 연산자로는 보통 `&&`, `||`, `?:` 가 있습니다.
ClickHouse에서는 함수(연산자)의 인수는 항상 평가됩니다.
이는 각 행을 개별적으로 계산하는 대신, 컬럼 파트 전체를 한 번에 평가하기 때문입니다.



## 분산 쿼리 처리를 위한 함수 실행 \{#performing-functions-for-distributed-query-processing\}

분산 쿼리 처리에서는 가능한 한 많은 쿼리 처리 단계를 원격 서버에서 수행하고, 나머지 단계(중간 결과 병합 및 그 이후의 모든 단계)는 요청자 서버에서 수행합니다.

이는 함수가 서로 다른 서버에서 실행될 수 있다는 뜻입니다.
예를 들어, 쿼리 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),` 에서

- `distributed_table`에 최소 2개의 세그먼트가 있으면, 함수 'g'와 'h'는 원격 서버에서 실행되고, 함수 'f'는 요청자 서버에서 실행됩니다.
- `distributed_table`에 세그먼트가 하나만 있으면, 'f', 'g', 'h' 함수 모두 해당 세그먼트의 서버에서 실행됩니다.

함수의 결과는 보통 어느 서버에서 실행되는지에 의존하지 않습니다. 그러나 때로는 이 점이 중요할 수 있습니다.
예를 들어, 딕셔너리와 함께 동작하는 함수는 자신이 실행 중인 서버에 존재하는 딕셔너리를 사용합니다.
또 다른 예로, `hostName` 함수는 자신이 실행 중인 서버의 이름을 반환하여 `SELECT` 쿼리에서 서버별로 `GROUP BY`를 수행할 수 있도록 합니다.

쿼리에서 어떤 함수가 요청자 서버에서 실행되지만 이를 원격 서버에서 실행해야 하는 경우, 해당 함수를 'any' 집계 함수로 감싸거나 `GROUP BY`의 키에 추가할 수 있습니다.



## SQL User Defined Functions \{#sql-user-defined-functions\}

람다 표현식으로 정의한 사용자 정의 함수는 [CREATE FUNCTION](../statements/create/function.md) SQL 문을 사용해 생성할 수 있습니다. 이러한 함수를 삭제하려면 [DROP FUNCTION](../statements/drop.md#drop-function) SQL 문을 사용합니다.



## 관련 콘텐츠 \{#related-content\}
- [ClickHouse Cloud에서의 사용자 정의 함수](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
