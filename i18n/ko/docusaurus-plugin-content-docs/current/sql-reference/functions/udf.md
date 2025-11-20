---
'description': 'User Defined Functions (UDFs)에 대한 문서'
'sidebar_label': 'UDF'
'slug': '/sql-reference/functions/udf'
'title': '사용자 정의 함수 (UDFs)'
'doc_type': 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 사용자 정의 함수 (UDF) {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
이 기능은 ClickHouse Cloud의 비공식 미리보기에서 지원됩니다.
접속하려면 [ClickHouse Support](https://clickhouse.cloud/support)로 문의하십시오.
:::

ClickHouse는 데이터를 처리하기 위해 외부 실행 프로그램이나 스크립트를 호출할 수 있습니다.

실행 가능한 사용자 정의 함수의 구성은 하나 이상의 xml 파일에 있을 수 있습니다.
구성 경로는 [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config) 매개변수에 지정됩니다.

함수 구성에는 다음 설정이 포함됩니다:

| 매개변수                      | 설명                                                                                                                                                                                                                                                                                                                                                                                 | 필수       | 기본값               |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | 함수 이름                                                                                                                                                                                                                                                                                                                                                                           | 예        | -                     |
| `command`                     | 실행할 스크립트 이름 또는 `execute_direct`가 false 이면 명령어                                                                                                                                                                                                                                                                                                                    | 예        | -                     |
| `argument`                    | 인수 설명에는 `type` 및 선택적 인수의 `name`이 포함됩니다. 각 인수는 별도의 설정에서 설명됩니다. 사용자가 정의한 함수 형식에서 직렬화의 일부인 경우 인수 이름을 지정하는 것이 필요합니다. 예를 들어 [Native](/interfaces/formats/Native) 또는 [JSONEachRow](/interfaces/formats/JSONEachRow)                                                              | 예        | `c` + argument_number |
| `format`                      | 인수가 명령으로 전달되는 [형식](../../interfaces/formats.md). 명령의 출력도 같은 형식을 사용할 것으로 예상됩니다                                                                                                                                                                                                                                                                  | 예        | -                     |
| `return_type`                 | 반환 값의 유형                                                                                                                                                                                                                                                                                                                                                                      | 예        | -                     |
| `return_name`                 | 반환 값의 이름. 반환 이름이 사용자가 정의한 함수 형식에서 직렬화의 일부인 경우 반환 이름을 지정하는 것이 필요합니다. 예를 들어 [Native](/interfaces/formats/Native) 또는 [JSONEachRow](/interfaces/formats/JSONEachRow)                                                                                                                    | 선택적    | `result`              |
| `type`                        | 실행 가능한 유형. `type`이 `executable`로 설정되면 단일 명령어가 시작됩니다. `executable_pool`로 설정되면 명령어 풀을 생성합니다.                                                                                                                                                                                                                                             | 예        | -                     |
| `max_command_execution_time`  | 데이터 블록 처리를 위한 최대 실행 시간(초). 이 설정은 `executable_pool` 명령어에만 유효합니다.                                                                                                                                                                                                                                                                                       | 선택적    | `10`                  |
| `command_termination_timeout` | 파이프가 닫힌 후 명령어가 완료되어야 하는 시간(초). 그 시간이 지나면 `SIGTERM`이 명령어를 실행하고 있는 프로세스에 전송됩니다.                                                                                                                                                                                                                                                 | 선택적    | `10`                  |
| `command_read_timeout`        | 명령 stdout에서 데이터를 읽기 위한 타임아웃(밀리초)                                                                                                                                                                                                                                                                                                                               | 선택적    | `10000`               |
| `command_write_timeout`       | 명령 stdin에 데이터를 쓰기 위한 타임아웃(밀리초)                                                                                                                                                                                                                                                                                                                                  | 선택적    | `10000`               |
| `pool_size`                   | 명령어 풀의 크기                                                                                                                                                                                                                                                                                                                                                                    | 선택적    | `16`                  |
| `send_chunk_header`           | 데이터 청크를 처리하기 전에 행 개수를 보낼지 여부를 제어합니다.                                                                                                                                                                                                                                                                                                                    | 선택적    | `false`               |
| `execute_direct`              | `execute_direct` = `1`인 경우, `command`는 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)에서 지정한 user_scripts 폴더 내에서 검색됩니다. 추가 스크립트 인수는 공백 구분 기호를 사용하여 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`이면 `command`는 `bin/sh -c`의 인수로 전달됩니다. | 선택적    | `1`                   |
| `lifetime`                    | 함수의 재로드 간격(초). `0`으로 설정하면 함수가 재로드되지 않습니다.                                                                                                                                                                                                                                                                                                                | 선택적    | `0`                   |
| `deterministic`               | 함수가 결정적일 경우(같은 입력에 대해 동일한 결과를 반환)                                                                                                                                                                                                                                                                                                                         | 선택적    | `false`               |

명령어는 `STDIN`에서 인수를 읽어야 하며, 결과를 `STDOUT`에 출력해야 합니다. 명령어는 인수를 반복적으로 처리해야 합니다. 즉, 인수의 덩어리를 처리한 후 다음 덩어리를 기다려야 합니다.

## 실행 가능한 사용자 정의 함수 {#executable-user-defined-functions}

## 예제 {#examples}

### 인라인 스크립트에서 UDF 생성 {#udf-inline}

XML 또는 YAML 구성을 사용하여 `execute_direct`를 `0`으로 수동으로 지정하여 `test_function_sum`을 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
파일 `test_function.xml` (`/etc/clickhouse-server/test_function.xml`는 기본 경로 설정).
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
파일 `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml`는 기본 경로 설정).
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

<br/>

```sql title="Query"
SELECT test_function_sum(2, 2);
```

```text title="Result"
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

### Python 스크립트에서 UDF 생성 {#udf-python}

이 예제에서는 `STDIN`에서 값을 읽고 문자열로 반환하는 UDF를 생성합니다.

XML 또는 YAML 구성을 사용하여 `test_function`을 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
파일 `test_function.xml` (`/etc/clickhouse-server/test_function.xml`는 기본 경로 설정).
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
파일 `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml`는 기본 경로 설정).
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

<br/>

`user_scripts` 폴더 내부에 스크립트 파일 `test_function.py`를 생성합니다 (`/var/lib/clickhouse/user_scripts/test_function.py`는 기본 경로 설정).

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

### `STDIN`에서 두 값을 읽고 합계를 JSON 객체로 반환 {#udf-stdin}

XML 또는 YAML 구성을 사용하여 이름이 지정된 인수와 형식 [JSONEachRow](/interfaces/formats/JSONEachRow)로 `test_function_sum_json`을 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
파일 `test_function.xml` (`/etc/clickhouse-server/test_function.xml`는 기본 경로 설정).
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
파일 `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml`는 기본 경로 설정).
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

<br/>

`user_scripts` 폴더 내부에 스크립트 파일 `test_function_sum_json.py`를 생성합니다 (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py`는 기본 경로 설정).

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

### `command` 설정에서 매개변수 사용 {#udf-parameters-in-command}

실행 가능한 사용자 정의 함수는 `command` 설정에서 상수 매개변수를 사용할 수 있습니다(이는 `executable` 유형의 사용자 정의 함수에만 적용됩니다).
이 또한 셸 인수 확장 취약성을 방지하기 위해 `execute_direct` 옵션이 필요합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
파일 `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml`는 기본 경로 설정).
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
파일 `test_function_parameter_python.yaml` (`/etc/clickhouse-server/test_function_parameter_python.yaml`는 기본 경로 설정).
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

<br/>

`user_scripts` 폴더 내부에 스크립트 파일 `test_function_parameter_python.py`를 생성합니다 (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py`는 기본 경로 설정).

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

### 셸 스크립트에서 UDF 생성 {#udf-shell-script}

이 예제에서는 각 값을 2배로 곱하는 셸 스크립트를 생성합니다.

<Tabs>
  <TabItem value="XML" label="XML" default>
파일 `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml`는 기본 경로 설정).
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
파일 `test_function_shell.yaml` (`/etc/clickhouse-server/test_function_shell.yaml`는 기본 경로 설정).
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

<br/>

`user_scripts` 폴더 내부에 스크립트 파일 `test_shell.sh`를 생성합니다 (`/var/lib/clickhouse/user_scripts/test_shell.sh`는 기본 경로 설정).

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

## 오류 처리 {#error-handling}

일부 함수는 데이터가 유효하지 않은 경우 예외를 발생시킬 수 있습니다.
이 경우 쿼리가 취소되고 오류 텍스트가 클라이언트에 반환됩니다.
분산 처리의 경우, 서버 중 하나에서 예외가 발생하면 다른 서버도 쿼리를 중단하려고 시도합니다.

## 인수 표현식 평가 {#evaluation-of-argument-expressions}

거의 모든 프로그래밍 언어에서 특정 연산자에 대해 인수 중 하나가 평가되지 않을 수 있습니다.
이는 일반적으로 `&&`, `||`, 및 `?:` 연산자입니다.
ClickHouse에서는 함수(연산자)의 인수가 항상 평가됩니다.
이는 전체 컬럼의 일부가 한 번에 평가되기 때문입니다. 각 행을 별도로 계산하는 대신 말입니다.

## 분산 쿼리 처리를 위한 함수 수행 {#performing-functions-for-distributed-query-processing}

분산 쿼리 처리를 위해 가능한 한 많은 쿼리 처리 단계가 원격 서버에서 수행되며, 나머지 단계(중간 결과 병합 및 그 이후)는 요청자 서버에서 수행됩니다.

이는 함수가 서로 다른 서버에서 수행될 수 있음을 의미합니다.
예를 들어, 쿼리 `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`에서

- `distributed_table`에 적어도 두 개의 샤드가 있는 경우, 함수 'g'와 'h'는 원격 서버에서 수행되고, 함수 'f'는 요청자 서버에서 수행됩니다.
- `distributed_table`에 샤드가 하나만 있는 경우, 모든 'f', 'g', 및 'h' 함수는 이 샤드의 서버에서 수행됩니다.

함수의 결과는 일반적으로 수행하는 서버에 따라 다르지 않습니다. 그러나 때때로 이것이 중요합니다.
예를 들어, 사전과 함께 작업하는 함수는 실행되는 서버에 존재하는 사전을 사용합니다.
또 다른 예는 `hostName` 함수로, 이 함수는 실행 중인 서버의 이름을 반환하여 `SELECT` 쿼리에서 서버별로 `GROUP BY`를 수행할 수 있도록 합니다.

쿼리에서 함수가 요청자 서버에서 수행되지만 원격 서버에서 수행해야 하는 경우, 함수는 'any' 집계 함수로 래핑하거나 `GROUP BY`의 키에 추가할 수 있습니다.

## SQL 사용자 정의 함수 {#sql-user-defined-functions}

람다 식에서 사용자 정의 함수를 생성하려면 [CREATE FUNCTION](../statements/create/function.md) 문을 사용할 수 있습니다. 이러한 함수를 삭제하려면 [DROP FUNCTION](../statements/drop.md#drop-function) 문을 사용하십시오.

## 관련 콘텐츠 {#related-content}
- [ClickHouse Cloud의 사용자 정의 함수](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
