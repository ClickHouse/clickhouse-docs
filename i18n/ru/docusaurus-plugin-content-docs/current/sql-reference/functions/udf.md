---
description: 'Документация по пользовательским функциям (UDF)'
sidebar_label: 'UDF'
slug: /sql-reference/functions/udf
title: 'Пользовательские функции (UDF)'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Пользовательская функция (UDF) \{#executable-user-defined-functions\}

<PrivatePreviewBadge/>

:::note
Эта возможность поддерживается в закрытом предварительном просмотре в ClickHouse Cloud.
Пожалуйста, свяжитесь со службой поддержки ClickHouse по адресу https://clickhouse.cloud/support для получения доступа.
:::

ClickHouse может вызывать любую внешнюю исполняемую программу или скрипт для обработки данных.

Конфигурация исполняемых пользовательских функций может находиться в одном или нескольких XML-файлах.
Путь к конфигурации указывается в параметре [`user_defined_executable_functions_config`](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config).

Конфигурация функции содержит следующие настройки:

| Parameter                     | Description                                                                                                                                                                                                                                                                                                                                                                                   | Required  | Default Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------------------|
| `name`                        | Имя функции                                                                                                                                                                                                                                                                                                                                                                                   | Yes       | -                     |
| `command`                     | Имя скрипта для выполнения или команда, если `execute_direct` имеет значение `false`                                                                                                                                                                                                                                                                                                         | Yes       | -                     |
| `argument`                    | Описание аргумента с `type` и необязательным `name` аргумента. Каждый аргумент описывается в отдельной настройке. Указание имени требуется, если имена аргументов являются частью сериализации для формата пользовательской функции, такого как [Native](/interfaces/formats/Native) или [JSONEachRow](/interfaces/formats/JSONEachRow)                                                     | Yes       | `c` + argument_number |
| `format`                      | [Формат](../../interfaces/formats.md), в котором аргументы передаются команде. Ожидается, что вывод команды также будет использовать тот же формат                                                                                                                                                                                                                                           | Yes       | -                     |
| `return_type`                 | Тип возвращаемого значения                                                                                                                                                                                                                                                                                                                                                                    | Yes       | -                     |
| `return_name`                 | Имя возвращаемого значения. Указание имени возвращаемого значения требуется, если оно является частью сериализации для формата пользовательской функции, такого как [Native](/interfaces/formats/Native) или [JSONEachRow](/interfaces/formats/JSONEachRow)                                                                                                                                    | Optional  | `result`              |
| `type`                        | Тип исполняемой сущности. Если `type` имеет значение `executable`, то запускается одна команда. Если задано `executable_pool`, то создаётся пул команд                                                                                                                                                                                                                                       | Yes       | -                     |
| `max_command_execution_time`  | Максимальное время выполнения в секундах для обработки блока данных. Эта настройка применяется только для команд `executable_pool`                                                                                                                                                                                                                                                            | Optional  | `10`                  |
| `command_termination_timeout` | Время в секундах, в течение которого команда должна завершить работу после закрытия её канала. По истечении этого времени процессу, выполняющему команду, отправляется сигнал `SIGTERM`                                                                                                                                                                                                       | Optional  | `10`                  |
| `command_read_timeout`        | Таймаут чтения данных из `stdout` команды в миллисекундах                                                                                                                                                                                                                                                                                                                                     | Optional  | `10000`               |
| `command_write_timeout`       | Таймаут записи данных в `stdin` команды в миллисекундах                                                                                                                                                                                                                                                                                                                                      | Optional  | `10000`               |
| `pool_size`                   | Размер пула команд                                                                                                                                                                                                                                                                                                                                                                            | Optional  | `16`                  |
| `send_chunk_header`           | Определяет, нужно ли отправлять количество строк перед отправкой блока данных на обработку                                                                                                                                                                                                                                                                                                    | Optional  | `false`               |
| `execute_direct`              | Если `execute_direct` = `1`, то `command` будет искаться в папке `user_scripts`, заданной параметром [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать, используя пробел в качестве разделителя. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передаётся как аргумент для `bin/sh -c` | Optional  | `1`                   |
| `lifetime`                    | Интервал перезагрузки функции в секундах. Если установлено значение `0`, функция не перезагружается                                                                                                                                                                                                                                                                                           | Optional  | `0`                   |
| `deterministic`               | Определяет, является ли функция детерминированной (возвращает одинаковый результат для одинаковых входных данных)                                                                                                                                                                                                                                                                             | Optional  | `false`               |

Команда должна читать аргументы из `STDIN` и выводить результат в `STDOUT`. Команда должна обрабатывать аргументы итеративно, то есть после обработки блока аргументов она должна ожидать следующий блок.

## Выполнимые пользовательские функции \{#executable-user-defined-functions\}

## Примеры \{#examples\}

### UDF из inline-скрипта \{#udf-inline\}

Создайте `test_function_sum`, вручную установив `execute_direct` в `0`, используя конфигурацию в формате XML или YAML.

<Tabs>
  <TabItem value="XML" label="XML" default>
    Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` при настройках путей по умолчанию).

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
    Файл `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml` при настройках путей по умолчанию).

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

### UDF из скрипта на Python \{#udf-python\}

В этом примере мы создаём UDF, который читает значение из `STDIN` и возвращает его в виде строки.

Создайте `test_function`, используя конфигурацию в формате XML или YAML.

<Tabs>
  <TabItem value="XML" label="XML" default>
    Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` при стандартных настройках пути).

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
    Файл `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml` при стандартных настройках пути).

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

Создайте файл скрипта `test_function.py` в каталоге `user_scripts` (`/var/lib/clickhouse/user_scripts/test_function.py` при стандартных настройках пути).

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
│ Значение 2              │
└─────────────────────────┘
```

### Считать два значения из `STDIN` и вернуть их сумму в виде JSON-объекта \{#udf-stdin\}

Создайте `test_function_sum_json` с именованными аргументами и форматом [JSONEachRow](/interfaces/formats/JSONEachRow), используя конфигурацию в формате XML или YAML.

<Tabs>
  <TabItem value="XML" label="XML" default>
    Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` при использовании путей по умолчанию).

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
    Файл `test_function.yaml` (`/etc/clickhouse-server/test_function.yaml` при использовании путей по умолчанию).

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

Создайте файл скрипта `test_function_sum_json.py` в каталоге `user_scripts` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py` при использовании путей по умолчанию).

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

### Использование параметров в настройке `command` \{#udf-parameters-in-command\}

Исполняемые пользовательские функции могут принимать константные параметры, задаваемые в настройке `command` (это работает только для пользовательских функций типа `executable`).
Также требуется опция `execute_direct`, чтобы исключить уязвимости, связанные с расширением аргументов оболочкой.

<Tabs>
  <TabItem value="XML" label="XML" default>
    Файл `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml` при настройках пути по умолчанию).

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
    Файл `test_function_parameter_python.yaml` (`/etc/clickhouse-server/test_function_parameter_python.yaml` при настройках пути по умолчанию).

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

Создайте файл скрипта `test_function_parameter_python.py` в каталоге `user_scripts` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py` при настройках пути по умолчанию).

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
│ Параметр 1, значение 2               │
└──────────────────────────────────────┘
```

### UDF на основе shell-скрипта \{#udf-shell-script\}

В этом примере мы создаём shell-скрипт, который умножает каждое значение на 2.

<Tabs>
  <TabItem value="XML" label="XML" default>
    Файл `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml` при стандартных настройках пути).

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
    Файл `test_function_shell.yaml` (`/etc/clickhouse-server/test_function_shell.yaml` при стандартных настройках пути).

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

Создайте файл скрипта `test_shell.sh` в каталоге `user_scripts` (`/var/lib/clickhouse/user_scripts/test_shell.sh` при стандартных настройках пути).

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

## Обработка ошибок \{#error-handling\}

Некоторые функции могут выбрасывать исключение, если данные некорректны.
В этом случае запрос отменяется, а клиенту возвращается текст ошибки.
При распределённой обработке, когда исключение происходит на одном из серверов, остальные серверы также пытаются прервать выполнение запроса.

## Вычисление выражений аргументов \{#evaluation-of-argument-expressions\}

Почти во всех языках программирования один из аргументов может не вычисляться для некоторых операторов.
Обычно это операторы `&&`, `||` и `?:`.
В ClickHouse аргументы функций (операторов) всегда вычисляются.
Это связано с тем, что целые фрагменты столбцов обрабатываются сразу, а не вычисляется каждая строка по отдельности.

## Выполнение функций при распределённой обработке запросов \{#performing-functions-for-distributed-query-processing\}

При распределённой обработке запросов как можно больше стадий обработки выполняется на удалённых серверах, а оставшиеся стадии (слияние промежуточных результатов и всё последующее) выполняются на сервере, инициировавшем запрос.

Это означает, что функции могут выполняться на разных серверах.
Например, в запросе `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- если `distributed_table` содержит как минимум два шарда, функции `g` и `h` выполняются на удалённых серверах, а функция `f` выполняется на сервере, инициировавшем запрос;
- если `distributed_table` содержит только один шард, все функции `f`, `g` и `h` выполняются на сервере этого шарда.

Результат выполнения функции обычно не зависит от того, на каком сервере она выполняется. Однако иногда это важно.
Например, функции, работающие со словарями, используют словарь, размещённый на том сервере, на котором они выполняются.
Другой пример — функция `hostName`, которая возвращает имя сервера, на котором она выполняется, чтобы можно было сделать `GROUP BY` по серверам в запросе `SELECT`.

Если функция в запросе выполняется на сервере, инициировавшем запрос, но вам нужно выполнить её на удалённых серверах, вы можете обернуть её в агрегатную функцию `any` или добавить её в ключ группировки в `GROUP BY`.

## Определяемые пользователем SQL-функции \{#sql-user-defined-functions\}

Пользовательские функции на основе лямбда-выражений можно создавать с помощью оператора [CREATE FUNCTION](../statements/create/function.md). Чтобы удалить эти функции, используйте оператор [DROP FUNCTION](../statements/drop.md#drop-function).

## Связанные материалы \{#related-content\}
- [Пользовательские функции (UDF) в ClickHouse Cloud](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs)
