---
description: 'Табличная функция `executable` создаёт таблицу на основе вывода пользовательской функции (UDF), заданной в скрипте, который выводит строки в **stdout**.'
keywords: ['udf', 'пользовательская функция', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---

# табличная функция `executable` для UDF \{#executable-table-function-for-udfs\}

Табличная функция `executable` создаёт таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, выводящем строки в **stdout**. Исполняемый скрипт хранится в директории `users_scripts` и может читать данные из любого источника. Убедитесь, что на вашем сервере ClickHouse установлены все необходимые пакеты для запуска исполняемого скрипта. Например, если это скрипт на Python, убедитесь, что на сервере установлены необходимые пакеты Python.

При необходимости вы можете указать один или несколько входных запросов, которые будут передавать свои результаты в **stdin**, чтобы скрипт мог их читать.

:::note
Ключевое преимущество по сравнению с обычными UDF-функциями у табличной функции `executable` и движка таблицы `Executable` заключается в том, что обычные UDF-функции не могут изменять количество строк. Например, если на вход подаётся 100 строк, то результат также должен содержать 100 строк. При использовании табличной функции `executable` или движка таблицы `Executable` ваш скрипт может выполнять любые необходимые преобразования данных, включая сложные агрегации.
:::

## Синтаксис \{#syntax\}

Табличная функция `executable` принимает три обязательных параметра и необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

* `script_name`: имя файла скрипта, который сохраняется в папке `user_scripts` (папка по умолчанию для настройки `user_scripts_path`)
* `format`: формат создаваемой таблицы
* `structure`: схема создаваемой таблицы
* `input_query`: необязательный запрос (или набор запросов), результаты которого передаются в скрипт через **stdin**

:::note
Если вы собираетесь вызывать один и тот же скрипт многократно с одинаковыми входными запросами, рассмотрите возможность использования [движка таблиц `Executable`](../../engines/table-engines/special/executable.md).
:::

Следующий скрипт Python называется `generate_random.py` и сохраняется в папке `user_scripts`. Он читает число `i` и выводит `i` случайных строк, при этом каждая строка предваряется числом, отделённым табуляцией:

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

Давайте запустим скрипт и попросим его сгенерировать 10 случайных строк:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

Ответ будет выглядеть следующим образом:

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

## Настройки \{#settings\}

- `send_chunk_header` — управляет тем, нужно ли отправлять количество строк перед отправкой блока данных на обработку. Значение по умолчанию — `false`.
- `pool_size` — размер пула. Если в качестве `pool_size` указано 0, то ограничения на размер пула отсутствуют. Значение по умолчанию — `16`.
- `max_command_execution_time` — максимальное время выполнения команды скрипта при обработке блока данных. Задаётся в секундах. Значение по умолчанию — 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения/записи. После того как табличная функция уничтожается, канал (pipe) закрывается, и у исполняемого файла есть `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Задаётся в секундах. Значение по умолчанию — 10.
- `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000.
- `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000.

## Передача результатов запроса в скрипт \{#passing-query-results-to-a-script\}

Обязательно ознакомьтесь с примером в табличном движке `Executable` о том, [как передать результаты запроса в скрипт](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Ниже показано, как выполнить тот же скрипт из этого примера с помощью табличной функции `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
