---
description: 'Табличная функция `executable` создаёт таблицу на основе вывода пользовательской функции (UDF), которую вы задаёте в скрипте, выводящем строки в стандартный поток вывода (**stdout**).'
keywords: ['udf', 'пользовательская функция', 'clickhouse', 'executable', 'таблица', 'функция']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---



# Табличная функция executable для UDF

Табличная функция `executable` создаёт таблицу на основе вывода пользовательской функции (UDF), которую вы реализуете в скрипте, выводящем строки в **stdout**. Исполняемый скрипт хранится в каталоге `users_scripts` и может считывать данные из любого источника. Убедитесь, что на сервере ClickHouse установлены все необходимые пакеты для запуска этого скрипта. Например, если это скрипт на Python, убедитесь, что на сервере установлены все необходимые пакеты Python.

Дополнительно вы можете указать один или несколько входных запросов, которые будут передавать свои результаты в **stdin**, откуда их сможет прочитать скрипт.

:::note
Ключевое отличие между обычными UDF и табличной функцией `executable` и табличным движком `Executable` заключается в том, что обычные UDF не могут изменять количество строк. Например, если на входе 100 строк, то результат также должен содержать 100 строк. При использовании табличной функции `executable` или табличного движка `Executable` ваш скрипт может выполнять любые преобразования данных, включая сложные агрегации.
:::



## Синтаксис {#syntax}

Табличная функция `executable` требует три параметра и принимает необязательный список входных запросов:

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: имя файла скрипта, сохранённого в папке `user_scripts` (папка по умолчанию для настройки `user_scripts_path`)
- `format`: формат генерируемой таблицы
- `structure`: схема таблицы генерируемой таблицы
- `input_query`: необязательный запрос (или набор запросов), результаты которого передаются скрипту через **stdin**

:::note
Если вы планируете многократно вызывать один и тот же скрипт с одинаковыми входными запросами, рассмотрите возможность использования [движка таблиц `Executable`](../../engines/table-engines/special/executable.md).
:::

Следующий скрипт Python называется `generate_random.py` и сохранён в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая из которых предваряется числом, отделённым символом табуляции:

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Чтение входного значения
    for number in sys.stdin:
        i = int(number)

        # Генерация случайных строк
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Сброс результатов в stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

Вызовем скрипт и сгенерируем 10 случайных строк:

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

Результат выглядит следующим образом:

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

- `send_chunk_header` — управляет отправкой количества строк перед отправкой фрагмента данных на обработку. Значение по умолчанию: `false`.
- `pool_size` — размер пула. Если для `pool_size` указано значение 0, ограничения на размер пула отсутствуют. Значение по умолчанию: `16`.
- `max_command_execution_time` — максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию: 10.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения табличной функции канал закрывается, и у исполняемого файла будет `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию: 10.
- `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию: 10000.
- `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию: 10000.


## Передача результатов запроса в скрипт {#passing-query-results-to-a-script}

Обязательно ознакомьтесь с примером в движке таблиц `Executable`, где показано, [как передать результаты запроса в скрипт](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script). Ниже показано, как выполнить тот же скрипт из этого примера с помощью табличной функции `executable`:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
