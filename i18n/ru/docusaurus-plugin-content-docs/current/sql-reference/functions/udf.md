---
description: 'Документация для пользовательских функций UDF'
sidebar_label: 'UDF'
sidebar_position: 15
slug: /sql-reference/functions/udf
title: 'Пользовательские функции UDF'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# Пользовательские функции UDF

## Выполнимые пользовательские функции {#executable-user-defined-functions}

<PrivatePreviewBadge/>

:::note
Эта функция поддерживается в приватном превью в ClickHouse Cloud. Пожалуйста, свяжитесь с поддержкой ClickHouse по адресу https://clickhouse.cloud/support для получения доступа.
:::

ClickHouse может вызывать любую внешнюю исполняемую программу или скрипт для обработки данных.

Конфигурация выполняемых пользовательских функций может находиться в одном или нескольких xml-файлах. Путь к конфигурации указывается в параметре [user_defined_executable_functions_config](../../operations/server-configuration-parameters/settings.md#user_defined_executable_functions_config).

Конфигурация функции содержит следующие настройки:

- `name` - имя функции.
- `command` - имя скрипта для выполнения или команда, если `execute_direct` равно false.
- `argument` - описание аргумента с `type` и необязательным `name` аргумента. Каждый аргумент описывается в отдельной настройке. Указание имени необходимо, если имена аргументов являются частью сериализации для формата пользовательской функции, такого как [Native](/interfaces/formats/Native) или [JSONEachRow](/interfaces/formats/JSONEachRow). Значение имени аргумента по умолчанию - `c` + аргумент_номер.
- `format` - [формат](../../interfaces/formats.md) в котором аргументы передаются команде.
- `return_type` - тип возвращаемого значения.
- `return_name` - имя возвращаемого значения. Указание имени возвращаемого значения необходимо, если имя возвращаемого значения является частью сериализации для формата пользовательской функции, такого как [Native](../../interfaces/formats.md#native) или [JSONEachRow](/interfaces/formats/JSONEachRow). Необязательно. Значение по умолчанию - `result`.
- `type` - исполняемый тип. Если `type` установлен на `executable`, то запускается одна команда. Если он установлен на `executable_pool`, создается пул команд.
- `max_command_execution_time` - максимальное время выполнения в секундах для обработки блока данных. Эта настройка действительна только для команд `executable_pool`. Необязательно. Значение по умолчанию - `10`.
- `command_termination_timeout` - время в секундах, в течение которого команда должна завершиться после закрытия ее канала. После этого времени отправляется `SIGTERM` процессу, выполняющему команду. Необязательно. Значение по умолчанию - `10`.
- `command_read_timeout` - тайм-аут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `command_write_timeout` - тайм-аут для записи данных в stdin команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `pool_size` - размер пула команд. Необязательно. Значение по умолчанию - `16`.
- `send_chunk_header` - управляет тем, следует ли отправлять количество строк перед отправкой блока данных для обработки. Необязательно. Значение по умолчанию - `false`.
- `execute_direct` - Если `execute_direct` = `1`, тогда `command` будет искаться внутри папки user_scripts, определенной параметром [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта могут быть указаны с помощью разделителя пробела. Например: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается как аргумент для `bin/sh -c`. Значение по умолчанию - `1`. Необязательный параметр.
- `lifetime` - интервал перезагрузки функции в секундах. Если он установлен на `0`, тогда функция не будет перезагружаться. Значение по умолчанию - `0`. Необязательный параметр.
- `deterministic` - является ли функция детерминированной (возвращает одинаковый результат для одного и того же входа). Значение по умолчанию - `false`. Необязательный параметр.

Команда должна читать аргументы из `STDIN` и выводить результат в `STDOUT`. Команда должна обрабатывать аргументы итеративно. То есть после обработки блока аргументов она должна ждать следующий блок.

### Примеры {#examples}

**Встроенный скрипт**

Создание `test_function_sum`, вручную указывая `execute_direct` равным `0` с помощью конфигурации XML.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками пути по умолчанию).
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

**Скрипт на Python**

Читает значение из `STDIN` и возвращает его как строку:

Создание `test_function` с использованием конфигурации XML.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками пути по умолчанию).
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

Файл скрипта внутри папки `user_scripts` `test_function.py` (`/var/lib/clickhouse/user_scripts/test_function.py` с настройками пути по умолчанию).

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

Читает два значения из `STDIN` и возвращает их сумму как JSON-объект:

Создание `test_function_sum_json` с именованными аргументами и форматом [JSONEachRow](../../interfaces/formats.md#jsoneachrow) с использованием конфигурации XML.
Файл `test_function.xml` (`/etc/clickhouse-server/test_function.xml` с настройками пути по умолчанию).
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

Файл скрипта внутри папки `user_scripts` `test_function_sum_json.py` (`/var/lib/clickhouse/user_scripts/test_function_sum_json.py` с настройками пути по умолчанию).

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

Выполнимые пользовательские функции могут принимать постоянные параметры, настроенные в настройке `command` (работает только для пользовательских функций с типом `executable`). Это также требует опции `execute_direct` (для обеспечения отсутствия уязвимости расширения аргументов оболочки).
Файл `test_function_parameter_python.xml` (`/etc/clickhouse-server/test_function_parameter_python.xml` с настройками пути по умолчанию).
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

Файл скрипта внутри папки `user_scripts` `test_function_parameter_python.py` (`/var/lib/clickhouse/user_scripts/test_function_parameter_python.py` с настройками пути по умолчанию).

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

**Скрипт оболочки**

Скрипт оболочки, который умножает каждое значение на 2:

Выполнимые пользовательские функции могут быть использованы с оболочными скриптами.
Файл `test_function_shell.xml` (`/etc/clickhouse-server/test_function_shell.xml` с настройками пути по умолчанию).
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

Файл скрипта внутри папки `user_scripts` `test_shell.sh` (`/var/lib/clickhouse/user_scripts/test_shell.sh` с настройками пути по умолчанию).

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


### Обработка ошибок {#error-handling}

Некоторые функции могут вызывать исключение, если данные некорректны. В этом случае запрос отменяется, и текст ошибки возвращается клиенту. Для распределенной обработки, когда происходит исключение на одном из серверов, другие серверы также пытаются отменить запрос.

### Оценка выражений аргументов {#evaluation-of-argument-expressions}

Почти во всех языках программирования один из аргументов может не оцениваться для определенных операторов. Обычно это операторы `&&`, `||` и `?:`.
Но в ClickHouse аргументы функций (операторов) всегда оцениваются. Это потому, что целые части столбцов оцениваются сразу, вместо расчета каждой строки отдельно.

### Выполнение функций для распределенной обработки запросов {#performing-functions-for-distributed-query-processing}

Для распределенной обработки запросов выполняется как можно больше этапов обработки запроса на удаленных серверах, а остальные этапы (слияние промежуточных результатов и все, что после этого) выполняются на сервере, отправившем запрос.

Это означает, что функции могут выполняться на разных серверах.
Например, в запросе `SELECT f(sum(g(x))) FROM distributed_table GROUP BY h(y),`

- если `distributed_table` имеет как минимум два шарда, функции 'g' и 'h' выполняются на удаленных серверах, а функция 'f' выполняется на сервере, отправившем запрос.
- если `distributed_table` имеет только один шард, все функции 'f', 'g' и 'h' выполняются на сервере этого шарда.

Результат функции обычно не зависит от того, на каком сервере она выполняется. Тем не менее, иногда это важно.
Например, функции, которые работают со словарями, используют словарь, который существует на сервере, на котором они выполняются.
Другой пример - функция `hostName`, которая возвращает имя сервера, на котором она выполняется, чтобы сделать `GROUP BY` по серверам в запросе `SELECT`.

Если функция в запросе выполняется на сервере, отправившем запрос, но вам нужно выполнить ее на удаленных серверах, вы можете обернуть ее в агрегатную функцию 'any' или добавить ее в ключ в `GROUP BY`.

## SQL-пользовательские функции {#sql-user-defined-functions}

Пользовательские функции из лямбда-выражений могут быть созданы с помощью оператора [CREATE FUNCTION](../statements/create/function.md). Чтобы удалить эти функции, используйте оператор [DROP FUNCTION](../statements/drop.md#drop-function).

## Связанный контент {#related-content}

### [Пользовательские функции в ClickHouse Cloud](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}
