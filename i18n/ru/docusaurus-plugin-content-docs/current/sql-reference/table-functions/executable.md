---
description: 'Функция таблицы `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, который выводит строки в **stdout**.'
keywords: ['udf', 'пользовательская функция', 'clickhouse', 'executable', 'таблица', 'функция']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
---


# Функция таблицы executable для UDF

Функция таблицы `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, который выводит строки в **stdout**. Исполняемый скрипт хранится в директории `users_scripts` и может считывать данные из любого источника. Убедитесь, что ваш сервер ClickHouse имеет все необходимые пакеты для выполнения исполняемого скрипта. Например, если это скрипт на Python, убедитесь, что на сервере установлены необходимые пакеты Python.

Вы можете по желанию включить один или несколько входных запросов, которые передают свои результаты в **stdin** для чтения скриптом.

:::note
Ключевое преимущество между обычными функциями UDF и функцией таблицы `executable` и движком таблицы `Executable` заключается в том, что обычные функции UDF не могут изменять количество строк. Например, если входных данных 100 строк, то результирующий набор данных также должен содержать 100 строк. При использовании функции таблицы `executable` или движка таблицы `Executable` ваш скрипт может выполнять любые трансформации данных, включая сложные агрегации.
:::

## Синтаксис {#syntax}

Функция таблицы `executable` требует три параметра и принимает необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: имя файла скрипта, сохраненного в папке `user_scripts` (дефолтная папка для настройки `user_scripts_path`)
- `format`: формат создаваемой таблицы
- `structure`: схема таблицы создаваемой таблицы
- `input_query`: необязательный запрос (или набор запросов), результаты которого передаются скрипту через **stdin**

:::note
Если вы собираетесь многократно вызывать один и тот же скрипт с одними и теми же входными запросами, рассмотрите возможность использования [`Executable` таблицы](../../engines/table-engines/special/executable.md).
:::

Следующий скрипт на Python называется `generate_random.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, при этом каждая строка предваряется числом, разделенным табуляцией:

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Считать входное значение
    for number in sys.stdin:
        i = int(number)

        # Генерировать случайные строки
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Сбросить результаты в stdout
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

- `send_chunk_header` - управляет тем, будет ли отправлять количество строк перед отправкой блока данных для обработки. Значение по умолчанию: `false`.
- `pool_size` — размер пула. Если указано значение 0 для `pool_size`, то ограничения на размер пула отсутствуют. Значение по умолчанию: `16`.
- `max_command_execution_time` — максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию: 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения функции таблицы труба закрывается, и исполняемому файлу будет предоставлено `command_termination_timeout` секунд, чтобы завершиться, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию: 10.
- `command_read_timeout` - таймаут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию: 10000.
- `command_write_timeout` - таймаут для записи данных в stdin команды в миллисекундах. Значение по умолчанию: 10000.

## Передача результатов запроса в скрипт {#passing-query-results-to-a-script}

Обязательно ознакомьтесь с примером в движке таблицы `Executable` о том, [как передать результаты запроса в скрипт](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Вот как вы выполняете тот же скрипт в этом примере, используя функцию таблицы `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
