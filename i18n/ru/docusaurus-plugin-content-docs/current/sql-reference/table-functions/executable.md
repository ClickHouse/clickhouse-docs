---
slug: /engines/table-functions/executable
sidebar_position: 50
sidebar_label:  executable
keywords: [udf, user defined function, clickhouse, executable, table, function]
title: 'executable'
description: 'Функция таблицы `executable` создает таблицу на основе вывода заданной вами пользовательской функции (UDF), которая определена в скрипте, выводящем строки в **stdout**.'
---


# Функция таблицы executable для UDF

Функция таблицы `executable` создает таблицу на основе вывода заданной вами пользовательской функции (UDF), которая определена в скрипте, выводящем строки в **stdout**. Исполняемый скрипт хранится в директории `users_scripts` и может считывать данные из любого источника. Убедитесь, что ваш сервер ClickHouse имеет все необходимые пакеты для запуска исполняемого скрипта. Например, если это Python-скрипт, убедитесь, что на сервере установлены необходимые пакеты Python.

Вы можете дополнительно включить один или несколько входных запросов, которые передают свои результаты в **stdin** для считывания скриптом.

:::note
Ключевое преимущество между обычными функциями UDF и функцией таблицы `executable` и таблицей `Executable` заключается в том, что обычные функции UDF не могут изменять количество строк. Например, если на входе 100 строк, то результат должен вернуть 100 строк. При использовании функции таблицы `executable` или таблицы `Executable` ваш скрипт может выполнять любые преобразования данных, включая сложные агрегирования.
:::

## Синтаксис {#syntax}

Функция таблицы `executable` требует три параметра и принимает необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: имя файла скрипта, сохраненного в папке `user_scripts` (стандартная папка для настройки `user_scripts_path`)
- `format`: формат сгенерированной таблицы
- `structure`: схема таблицы сгенерированной таблицы
- `input_query`: необязательный запрос (или набор запросов), результаты которого передаются в скрипт через **stdin**

:::note
Если вы собираетесь несколько раз вызывать один и тот же скрипт с одними и теми же входными запросами, рассмотрите возможность использования таблицы [`Executable`](../../engines/table-engines/special/executable.md).
:::

Следующий скрипт на Python называется `generate_random.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая из которых предваряется числом, разделенным знаком табуляции:

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Считываем входное значение
    for number in sys.stdin:
        i = int(number)

        # Генерируем случайные строки
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Отправляем результаты в stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

Давайте вызовем скрипт и заставим его сгенерировать 10 случайных строк:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

Ответ выглядит так:

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

- `send_chunk_header` - управляет тем, отправлять ли количество строк перед отправкой блока данных на обработку. Значение по умолчанию - `false`.
- `pool_size` — размер пула. Если указано значение 0 для `pool_size`, то ограничений по размеру пула нет. Значение по умолчанию - `16`.
- `max_command_execution_time` — максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию - 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения функции таблицы канал закрывается, и исполняемому файлу дается `command_termination_timeout` секунд на завершение перед тем, как ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию - 10.
- `command_read_timeout` - тайм-аут для чтения данных из стандартного вывода команды в миллисекундах. Значение по умолчанию 10000.
- `command_write_timeout` - тайм-аут для записи данных в стандартный ввод команды в миллисекундах. Значение по умолчанию 10000.

## Передача результатов запроса в скрипт {#passing-query-results-to-a-script}

Не забудьте ознакомиться с примером в таблице `Executable` о [том, как передать результаты запроса в скрипт](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Вот как вы вызываете тот же скрипт в этом примере, используя функцию таблицы `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
