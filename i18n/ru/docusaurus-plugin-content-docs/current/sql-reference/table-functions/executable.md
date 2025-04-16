---
description: 'Функция таблицы `executable` создает таблицу на основе вывода
  пользовательской функции (UDF), которую вы определяете в скрипте, который выводит строки на
  **stdout**.'
keywords: ['udf', 'пользовательская функция', 'clickhouse', 'executable', 'таблица', 'функция']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
---


# Функция таблицы executable для UDF

Функция таблицы `executable` создает таблицу на основе вывода пользовательской функции (UDF), которую вы определяете в скрипте, который выводит строки на **stdout**. Исполняемый скрипт хранится в директории `users_scripts` и может считывать данные из любого источника. Убедитесь, что ваш сервер ClickHouse имеет все необходимые пакеты для запуска исполняемого скрипта. Например, если это Python-скрипт, убедитесь, что на сервере установлены необходимые пакеты Python.

Вы можете по желанию включить один или несколько входных запросов, результаты которых передаются в **stdin** для чтения скриптом.

:::note
Ключевое преимущество между обычными функциями UDF и функцией таблицы `executable` и движком таблицы `Executable` заключается в том, что обычные функции UDF не могут изменять количество строк. Например, если входных данных 100 строк, то результат должен вернуть 100 строк. При использовании функции таблицы `executable` или движка таблицы `Executable` ваш скрипт может выполнять любые преобразования данных, включая сложные агрегации.
:::

## Синтаксис {#syntax}

Функция таблицы `executable` требует три параметра и принимает необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: имя файла скрипта, сохраненного в папке `user_scripts` (папка по умолчанию для настройки `user_scripts_path`)
- `format`: формат создаваемой таблицы
- `structure`: схема таблицы создаваемой таблицы
- `input_query`: необязательный запрос (или коллекция запросов), результаты которого передаются скрипту через **stdin**

:::note
Если вы собираетесь многократно вызывать один и тот же скрипт с теми же входными запросами, подумайте о использовании [`Executable` движка таблицы](../../engines/table-engines/special/executable.md).
:::

Следующий Python-скрипт называется `generate_random.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая из которых предшествована числом, разделенным табуляцией:

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

        # Сбрасываем результаты на stdout
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

- `send_chunk_header` - управляет тем, отправлять ли количество строк перед отправкой блока данных для обработки. Значение по умолчанию `false`.
- `pool_size` — размер пула. Если указан 0 как `pool_size`, то ограничений по размеру пула нет. Значение по умолчанию `16`.
- `max_command_execution_time` — максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения функции таблицы, трубопровод закрывается, и исполняемому файлу будет предоставлено `command_termination_timeout` секунд для завершения работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию 10.
- `command_read_timeout` - тайм-аут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию 10000.
- `command_write_timeout` - тайм-аут для записи данных в stdin команды в миллисекундах. Значение по умолчанию 10000.

## Передача результатов запроса в скрипт {#passing-query-results-to-a-script}

Обязательно ознакомьтесь с примером в движке `Executable` о [том, как передавать результаты запроса в скрипт](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Вот как вы выполняете тот же скрипт в данном примере, используя функцию таблицы `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
