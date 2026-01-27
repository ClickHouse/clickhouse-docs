---
description: 'Системная таблица, содержащая статус загрузки и метаданные конфигурации для пользовательских функций (UDF).'
keywords: ['системная таблица', 'user_defined_functions', 'udf', 'исполняемый']
slug: /operations/system-tables/user_defined_functions
title: 'system.user_defined_functions'
doc_type: 'reference'
---

# system.user_defined_functions \{#systemuser_defined_functions\}

Содержит статус загрузки, информацию об ошибках и метаданные конфигурации для [пользовательских функций (UDF)](/docs/en/sql-reference/functions/udf.md).

Столбцы:

**Статус загрузки**

* `name` ([String](/docs/en/sql-reference/data-types/string.md)) — имя UDF.
* `load_status` ([Enum8](/docs/en/sql-reference/data-types/enum.md)) — статус загрузки: `Success` (UDF загружена и готова), `Failed` (UDF не удалось загрузить).
* `loading_error_message` ([String](/docs/en/sql-reference/data-types/string.md)) — подробное сообщение об ошибке при неудачной загрузке. Пусто, если загрузка прошла успешно.
* `last_successful_update_time` ([Nullable(DateTime)](/docs/en/sql-reference/data-types/datetime.md)) — временная метка последней успешной загрузки. `NULL`, если загрузка ни разу не была успешной.
* `loading_duration_ms` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — время, затраченное на загрузку UDF, в миллисекундах.

**Конфигурация UDF**

* `type` ([Enum8](/docs/en/sql-reference/data-types/enum.md)) — тип UDF: `executable` (один процесс на блок) или `executable_pool` (постоянный пул процессов).
* `command` ([String](/docs/en/sql-reference/data-types/string.md)) — скрипт или команда для выполнения, включая аргументы.
* `format` ([String](/docs/en/sql-reference/data-types/string.md)) — формат данных для ввода/вывода (например, `TabSeparated`, `JSONEachRow`).
* `return_type` ([String](/docs/en/sql-reference/data-types/string.md)) — тип возвращаемого значения функции (например, `String`, `UInt64`).
* `return_name` ([String](/docs/en/sql-reference/data-types/string.md)) — необязательный идентификатор возвращаемого значения. Пусто, если не настроен.
* `argument_types` ([Array(String)](/docs/en/sql-reference/data-types/array.md)) — массив типов аргументов.
* `argument_names` ([Array(String)](/docs/en/sql-reference/data-types/array.md)) — массив имен аргументов. Пустые строки для безымянных аргументов.

**Параметры выполнения**

* `max_command_execution_time` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — максимальное количество секунд на обработку блока данных. Только для типа `executable_pool`.
* `command_termination_timeout` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — количество секунд до отправки SIGTERM процессу команды.
* `command_read_timeout` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — таймаут чтения из stdout команды в миллисекундах.
* `command_write_timeout` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — таймаут записи в stdin команды в миллисекундах.
* `pool_size` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — количество экземпляров процесса в пуле. Только для типа `executable_pool`.
* `send_chunk_header` ([UInt8](/docs/en/sql-reference/data-types/int-uint.md)) — отправлять ли количество строк перед каждым фрагментом данных (1 = true, 0 = false).
* `execute_direct` ([UInt8](/docs/en/sql-reference/data-types/int-uint.md)) — выполнять ли команду напрямую (1) или через `/bin/bash` (0).
* `lifetime` ([UInt64](/docs/en/sql-reference/data-types/int-uint.md)) — интервал перезагрузки в секундах. 0 означает, что перезагрузка отключена.
* `deterministic` ([UInt8](/docs/en/sql-reference/data-types/int-uint.md)) — возвращает ли функция одинаковый результат для одинаковых аргументов (1 = true, 0 = false).

**Пример**

Просмотреть все UDF и их статус загрузки:

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

Найдите UDF, завершившиеся с ошибкой:

```sql
SELECT
    name,
    loading_error_message
FROM system.user_defined_functions
WHERE load_status = 'Failed';
```

**См. также**

* [User-Defined Functions](/docs/en/sql-reference/functions/udf.md) — Как создавать и настраивать функции UDF.
