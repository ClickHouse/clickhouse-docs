---
slug: '/sql-reference/functions/udf'
sidebar_label: UDF
description: 'Документация используется для UDFs Пользовательские функции'
title: 'Пользовательские функции UDF'
doc_type: reference
---
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# UDFs Пользовательские Определенные Функции

## Исполняемые Пользовательские Определенные Функции {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
Эта функция поддерживается в частном предварительном просмотре в ClickHouse Cloud. Пожалуйста, свяжитесь с поддержкой ClickHouse по адресу https://clickhouse.cloud/support для доступа.
:::

ClickHouse может вызывать любую внешнюю исполняемую программу или скрипт для обработки данных.

Конфигурация исполняемых пользовательских определенных функций может находиться в одном или нескольких xml-файлах. Путь к конфигурации указывается в параметре [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config).

Конфигурация функции содержит следующие настройки:

| Параметр                     | Описание                                                                                                                                                                                                                                                                                                                                                                                   | Обязательный | Значение по умолчанию |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|-----------------------|
| `name`                        | Имя функции                                                                                                                                                                                                                                                                                                                                                                               | Да          | -                     |
| `command`                     | Имя скрипта для выполнения или команда, если `execute_direct` равно false                                                                                                                                                                                                                                                                                                                | Да          | -                     |
| `argument`                    | Описание аргумента с `type` и необязательным `name` аргумента. Каждый аргумент описывается в отдельной настройке. Указание имени обязательно, если имена аргументов являются частью сериализации для формата пользовательской определенной функции, такого как [Native](/interfaces/formats/Native) или [JSONEachRow](/interfaces/formats/JSONEachRow)                               | Да          | `c` + номер_аргумента |
| `format`                      | [Формат](../../interfaces/formats.md), в котором аргументы передаются команде. Ожидается, что вывод команды также будет использовать тот же формат                                                                                                                                                                                                                                     | Да          | -                     |
| `return_type`                 | Тип возвращаемого значения                                                                                                                                                                                                                                                                                                                                                                | Да          | -                     |
| `return_name`                 | Имя возвращаемого значения. Указание имени возврата обязательно, если имя возврата является частью сериализации для формата пользовательской определенной функции, такого как [Native](../../interfaces/formats.md#native) или [JSONEachRow](/interfaces/formats/JSONEachRow)                                                                                              | Необязательный | `result`              |
| `type`                        | Исполняемый тип. Если `type` установлено в `executable`, то запускается одна команда. Если установлено в `executable_pool`, то создается пул команд                                                                                                                                                                                                                                     | Да          | -                     |
| `max_command_execution_time`  | Максимальное время выполнения в секундах для обработки блока данных. Эта настройка действительна только для команд `executable_pool`                                                                                                                                                                                                                                                      | Необязательный | `10`                  |
| `command_termination_timeout` | Время в секундах, в течение которого команда должна завершиться после закрытия её канала. После этого времени отправляется `SIGTERM` процессу, выполняющему команду                                                                                                                                                                                                                     | Необязательный | `10`                  |
| `command_read_timeout`        | Тайм-аут для чтения данных из stdout команды в миллисекундах                                                                                                                                                                                                                                                                                                                          | Необязательный | `10000`               |
| `command_write_timeout`       | Тайм-аут для записи данных в stdin команды в миллисекундах                                                                                                                                                                                                                                                                                                                            | Необязательный | `10000`               |
| `pool_size`                   | Размер пула команд                                                                                                                                                                                                                                                                                                                                                                        | Необязательный | `16`                  |
| `send_chunk_header`           | Управляет тем, нужно ли отправлять количество строк перед отправкой блока данных для обработки                                                                                                                                                                                                                                                                                          | Необязательный | `false`               |
| `execute_direct`              | Если `execute_direct` = `1`, то `command` будет искаться внутри папки user_scripts, указанной в [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта могут быть указаны с использованием разделителя пробелом. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается в качестве аргумента для `bin/sh -c` | Необязательный | `1`                   |
| `lifetime`                    | Интервал перезагрузки функции в секундах. Если установлено в `0`, то функция не перезагружается                                                                                                                                                                                                                                                                                           | Необязательный | `0`                   |
| `deterministic`               | Если функция детерминистична (возвращает один и тот же результат для одного и того же ввода)                                                                                                                                                                                                                                                                                           | Необязательный | `false`               |

Команда должна читать аргументы из `STDIN` и выводить результат в `STDOUT`. Команда должна обрабатывать аргументы итеративно. То есть после обработки блока аргументов она должна ждать следующий блок.

### Примеры {#examples}

**Встроенный скрипт**

Создание `test_function_sum`, вручную указывая `execute_direct` равным `0`, с использованием XML конфигурации.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками по умолчанию).

```xml
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

Запрос:

```sql
SELECT test_function_sum(2, 2);
```

Результат:

```text
┌─test_function_sum(2, 2)─┐
│                       4 │
└─────────────────────────┘
```

**Python скрипт**

Читает значение из `STDIN` и возвращает его в виде строки:

Создание `test_function` с использованием XML конфигурации.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками по умолчанию).
```xml
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

Скрипт находится внутри папки `user_scripts` `test_function.py` (`/var/lib/clickhouse/user_scripts/test_function.py` с настройками по умолчанию).

```python
#!/usr/bin/python3

import sys

if __name__ == '__main__':
    for line in sys.stdin:
        print("Value " + line, end='')
        sys.stdout.flush()
```

Запрос:

```sql
SELECT test_function_python(toUInt64(2));
```

Результат:

```text
┌─test_function_python(2)─┐
│ Value 2                 │
└─────────────────────────┘
```

Читает два значения из `STDIN` и возвращает их сумму в виде JSON объекта:

Создание `test_function_sum_json` с именованными аргументами и форматом [JSONEachRow](../../interfaces/formats.md#jsoneachrow) с использованием XML конфигурации.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками по умолчанию).
```xml
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

Скрипт находится внутри папки `user_scripts` `test_function_sum_json.py` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py` с настройками по умолчанию).

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

Запрос:

```sql
SELECT test_function_sum_json(2, 2);
```

Результат:

```text
┌─test_function_sum_json(2, 2)─┐
│                            4 │
└──────────────────────────────┘
```

Используйте параметры в настройке `command`:

Исполняемые пользовательские определенные функции могут принимать постоянные параметры, настроенные в настройке `command` (работает только для пользовательских определенных функций с типом `executable`). Это также требует опцию `execute_direct` (чтобы избежать уязвимости расширения аргументов оболочки).
Файл `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml` с настройками по умолчанию).
```xml
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

Скрипт находится внутри папки `user_scripts` `test_function_parameter_python.py` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py` с настройками по умолчанию).

```python
#!/usr/bin/python3

import sys

if __name__ == "__main__":
    for line in sys.stdin:
        print("Parameter " + str(sys.argv[1]) + " value " + str(line), end="")
        sys.stdout.flush()
```

Запрос:

```sql
SELECT test_function_parameter_python(1)(2);
```

Результат:

```text
┌─test_function_parameter_python(1)(2)─┐
│ Parameter 1 value 2                  │
└──────────────────────────────────────┘
```

**Shell скрипт**

Shell скрипт, который умножает каждое значение на 2:

Исполняемые пользовательские определенные функции могут использоваться с shell скриптом.
Файл `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml` с настройками по умолчанию).
```xml
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

Скрипт находится внутри папки `user_scripts` `test_shell.sh` (`/var/lib/clickhouse/user_scripts/test_shell.sh` с настройками по умолчанию).

```bash
#!/bin/bash

while read read_data;
    do printf "$(expr $read_data \* 2)\n";
done
```

Запрос:

```sql
SELECT test_shell(number) FROM numbers(10);
```

Результат:

```text
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

### Обработка Ошибок {#error-handling}

Некоторые функции могут вызывать исключение, если данные недействительны. В этом случае запрос отменяется, и текст ошибки возвращается клиенту. Для распределенной обработки, когда исключение происходит на одном из серверов, другие серверы также пытаются отменить запрос.

### Оценка Выражений Аргументов {#evaluation-of-argument-expressions}

Почти во всех языках программирования одно из выражений может не быть оценено для определенных операторов. Обычно это операторы `&&`, `||`, и `?:`.
Но в ClickHouse аргументы функций (операторов) всегда оцениваются. Это потому, что целые части колонок оцениваются сразу, вместо того чтобы вычислять каждую строку отдельно.

### Выполнение Функций для Распределенной Обработки Запросов {#performing-functions-for-distributed-query-processing}

Для распределенной обработки запросов выполняется как можно больше этапов обработки запросов на удаленных серверах, а остальные этапы (объединение промежуточных результатов и все, что после этого) выполняются на сервере-запросе.

Это означает, что функции могут выполняться на разных серверах.
Например, в запросе `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- если `distributed_table` имеет как минимум два шарда, функции 'g' и 'h' выполняются на удаленных серверах, а функция 'f' выполняется на сервере-запросе.
- если `distributed_table` имеет только один шард, все функции 'f', 'g' и 'h' выполняются на сервере этого шарда.

Результат функции обычно не зависит от того, на каком сервере она выполняется. Однако иногда это важно.
Например, функции, которые работают с словарями, используют словарь, который существует на сервере, на котором они выполняются.
Другой пример - функция `hostName`, которая возвращает имя сервера, на котором она выполняется, чтобы составить `GROUP BY` по серверам в запросе `SELECT`.

Если функция в запросе выполняется на сервере-запросе, но необходимо выполнить её на удаленных серверах, вы можете обернуть её в агрегатную функцию 'any' или добавить её в ключ в `GROUP BY`.

## SQL Пользовательские Определенные Функции {#sql-user-defined-functions}

Пользовательские функции из лямбда-выражений могут быть созданы с использованием оператора [CREATE FUNCTION](../statements/create/function.md). Для удаления этих функций используйте оператор [DROP FUNCTION](../statements/drop.md#drop-function).

## Связанный Контент {#related-content}

### [Пользовательские определенные функции в ClickHouse Cloud](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}