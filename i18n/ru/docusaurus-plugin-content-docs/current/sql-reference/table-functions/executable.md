---
slug: '/engines/table-functions/executable'
sidebar_label: executable
sidebar_position: 50
description: 'Функция `executable` таблицы создает таблицу на основе вывода пользовательской'
title: executable
keywords: ['udf', 'пользовательская функция', 'clickhouse', 'executable', 'таблица', 'функция']
doc_type: reference
---
# Исполняемая Табличная Функция для UDF

Табличная функция `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, выводящем строки в **stdout**. Исполняемый скрипт хранится в директории `users_scripts` и может читать данные из любого источника. Убедитесь, что ваш сервер ClickHouse имеет все необходимые пакеты для выполнения исполняемого скрипта. Например, если это Python-скрипт, убедитесь, что на сервере установлены необходимые пакеты Python.

Вы можете также включить один или несколько входных запросов, которые передают свои результаты в **stdin** для чтения скриптом.

:::note
Ключевое преимущество между обычными UDF-функциями и табличной функцией `executable` и движком таблиц `Executable` заключается в том, что обычные UDF-функции не могут изменять количество строк. Например, если входных данных 100 строк, то результат должен вернуть 100 строк. При использовании табличной функции `executable` или движка таблиц `Executable` ваш скрипт может выполнять любые преобразования данных, включая сложные агрегации.
:::

## Синтаксис {#syntax}

Табличная функция `executable` требует три параметра и принимает необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: имя файла скрипта, сохраненного в папке `user_scripts` (папка по умолчанию для настройки `user_scripts_path`)
- `format`: формат генерируемой таблицы
- `structure`: схема таблицы генерируемой таблицы
- `input_query`: необязательный запрос (или коллекция запросов), результаты которых передаются в скрипт через **stdin**

:::note
Если вы собираетесь многократно вызывать один и тот же скрипт с одними и теми же входными запросами, рассмотрите возможность использования движка таблиц [`Executable`](../../engines/table-engines/special/executable.md).
:::

Следующий Python-скрипт называется `generate_random.py` и хранится в папке `user_scripts`. Он принимает число `i` и выводит `i` случайных строк, каждая из которых предваряется номером, разделенным табуляцией:

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

Давайте вызовем скрипт и сгенерируем 10 случайных строк:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

Ответ выглядит следующим образом:

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

## Настройки {#settings}

- `send_chunk_header` - контролирует, следует ли отправить количество строк перед отправкой куска данных на обработку. Значение по умолчанию - `false`.
- `pool_size` — Размер пула. Если указан 0 в качестве `pool_size`, то ограничений по размеру пула нет. Значение по умолчанию - 16.
- `max_command_execution_time` — Максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию - 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения табличной функции, цикл закрывается, и исполняемому файлу будет предоставлено `command_termination_timeout` секунд для завершения, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию - 10.
- `command_read_timeout` - тайм-аут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию - 10000.
- `command_write_timeout` - тайм-аут для записи данных в stdin команды в миллисекундах. Значение по умолчанию - 10000.

## Передача Результатов Запросов Скрипту {#passing-query-results-to-a-script}

Обязательно ознакомьтесь с примером в движке таблиц `Executable` о [том, как передавать результаты запросов скрипту](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Вот как вы можете выполнить тот же скрипт в этом примере, используя табличную функцию `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```