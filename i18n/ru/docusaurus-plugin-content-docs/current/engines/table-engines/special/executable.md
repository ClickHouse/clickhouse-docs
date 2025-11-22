---
description: 'Движки таблиц `Executable` и `ExecutablePool` позволяют задать
  таблицу, строки которой генерируются скриптом, который вы определяете (записывая строки
  в **stdout**).'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Движки таблиц Executable и ExecutablePool'
doc_type: 'reference'
---



# Движки таблиц Executable и ExecutablePool

Движки таблиц `Executable` и `ExecutablePool` позволяют задать таблицу, строки которой генерируются скриптом, который вы определяете (путём записи строк в **stdout**). Исполняемый скрипт хранится в директории `users_scripts` и может читать данные из любого источника.

- Таблицы `Executable`: скрипт выполняется при каждом запросе
- Таблицы `ExecutablePool`: поддерживают пул постоянных процессов и берут процессы из пула для чтения

Дополнительно вы можете указать один или несколько входных запросов, которые потоково передают свои результаты в **stdin** для чтения скриптом.



## Создание таблицы `Executable` {#creating-an-executable-table}

Движок таблиц `Executable` требует два параметра: имя скрипта и формат входных данных. При необходимости можно передать один или несколько входных запросов:

```sql
Executable(script_name, format, [input_query...])
```

Ниже приведены соответствующие настройки для таблицы `Executable`:

- `send_chunk_header`
  - Описание: Отправлять количество строк в каждом блоке перед отправкой блока на обработку. Эта настройка может помочь написать скрипт более эффективно для предварительного выделения ресурсов
  - Значение по умолчанию: false
- `command_termination_timeout`
  - Описание: Таймаут завершения команды в секундах
  - Значение по умолчанию: 10
- `command_read_timeout`
  - Описание: Таймаут чтения данных из stdout команды в миллисекундах
  - Значение по умолчанию: 10000
- `command_write_timeout`
  - Описание: Таймаут записи данных в stdin команды в миллисекундах
  - Значение по умолчанию: 10000

Рассмотрим пример. Следующий скрипт Python называется `my_script.py` и сохранён в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, где каждая строка предваряется числом, отделённым символом табуляции:

```python
#!/usr/bin/python3

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

Следующая таблица `my_executable_table` построена на основе вывода `my_script.py`, который будет генерировать 10 случайных строк при каждом выполнении запроса `SELECT` к `my_executable_table`:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

Создание таблицы завершается немедленно и не вызывает выполнение скрипта. Запрос к `my_executable_table` вызывает выполнение скрипта:

```sql
SELECT * FROM my_executable_table
```

```response
┌─x─┬─y──────────┐
│ 0 │ BsnKBsNGNH │
│ 1 │ mgHfBCUrWM │
│ 2 │ iDQAVhlygr │
│ 3 │ uNGwDuXyCk │
│ 4 │ GcFdQWvoLB │
│ 5 │ UkciuuOTVO │
│ 6 │ HoKeCdHkbs │
│ 7 │ xRvySxqAcR │
│ 8 │ LKbXPHpyDI │
│ 9 │ zxogHTzEVV │
└───┴────────────┘
```


## Передача результатов запроса в скрипт {#passing-query-results-to-a-script}

Пользователи сайта Hacker News оставляют комментарии. В Python есть инструментарий для обработки естественного языка (`nltk`) с классом `SentimentIntensityAnalyzer`, который определяет, являются ли комментарии позитивными, негативными или нейтральными, присваивая им значение от -1 (очень негативный комментарий) до 1 (очень позитивный комментарий). Создадим таблицу `Executable`, которая вычисляет тональность комментариев Hacker News с помощью `nltk`.

В этом примере используется таблица `hackernews`, описанная [здесь](/engines/table-engines/mergetree-family/invertedindexes/#hacker-news-dataset). Таблица `hackernews` содержит столбец `id` типа `UInt64` и столбец `String` с именем `comment`. Начнём с определения таблицы `Executable`:

```sql
CREATE TABLE sentiment (
   id UInt64,
   sentiment Float32
)
ENGINE = Executable(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```

Несколько замечаний о таблице `sentiment`:

- Файл `sentiment.py` сохранён в папке `user_scripts` (папка по умолчанию для настройки `user_scripts_path`)
- Формат `TabSeparated` означает, что скрипт Python должен генерировать строки данных со значениями, разделёнными табуляцией
- Запрос выбирает два столбца из `hackernews`. Скрипт Python должен извлечь значения этих столбцов из входящих строк

Вот определение `sentiment.py`:

```python
#!/usr/local/bin/python3.9

import sys
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def main():
    sentiment_analyzer = SentimentIntensityAnalyzer()

    while True:
        try:
            row = sys.stdin.readline()
            if row == '':
                break

            split_line = row.split("\t")

            id = str(split_line[0])
            comment = split_line[1]

            score = sentiment_analyzer.polarity_scores(comment)['compound']
            print(id + '\t' + str(score) + '\n', end='')
            sys.stdout.flush()
        except BaseException as x:
            break

if __name__ == "__main__":
    main()
```

Несколько замечаний о скрипте Python:

- Для работы необходимо выполнить `nltk.downloader.download('vader_lexicon')`. Это можно было бы разместить в скрипте, но тогда загрузка происходила бы при каждом выполнении запроса к таблице `sentiment`, что неэффективно
- Каждое значение `row` представляет собой строку из результирующего набора запроса `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
- Входящая строка разделена табуляцией, поэтому мы извлекаем `id` и `comment` с помощью функции Python `split`
- Результат `polarity_scores` представляет собой JSON-объект с несколькими значениями. Мы решили использовать только значение `compound` из этого JSON-объекта
- Напомним, что таблица `sentiment` в ClickHouse использует формат `TabSeparated` и содержит два столбца, поэтому функция `print` разделяет эти столбцы табуляцией

Каждый раз при выполнении запроса, выбирающего строки из таблицы `sentiment`, выполняется запрос `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`, и результат передаётся в `sentiment.py`. Проверим это:

```sql
SELECT *
FROM sentiment
```

Результат выглядит следующим образом:


```response
┌───────id─┬─sentiment─┐
│  7398199 │    0.4404 │
│ 21640317 │    0.1779 │
│ 21462000 │         0 │
│ 25168863 │         0 │
│ 25168978 │   -0.1531 │
│ 25169359 │         0 │
│ 25169394 │   -0.9231 │
│ 25169766 │    0.4137 │
│ 25172570 │    0.7469 │
│ 25173687 │    0.6249 │
│ 28291534 │         0 │
│ 28291669 │   -0.4767 │
│ 28291731 │         0 │
│ 28291949 │   -0.4767 │
│ 28292004 │    0.3612 │
│ 28292050 │    -0.296 │
│ 28292322 │         0 │
│ 28295172 │    0.7717 │
│ 28295288 │    0.4404 │
│ 21465723 │   -0.6956 │
└──────────┴───────────┘
```


## Создание таблицы `ExecutablePool` {#creating-an-executablepool-table}

Синтаксис `ExecutablePool` аналогичен `Executable`, но имеет несколько уникальных настроек, специфичных для таблицы `ExecutablePool`:

- `pool_size`
  - Описание: Размер пула процессов. Если размер равен 0, ограничения на размер отсутствуют
  - Значение по умолчанию: 16
- `max_command_execution_time`
  - Описание: Максимальное время выполнения команды в секундах
  - Значение по умолчанию: 10

Таблицу `sentiment` из предыдущего примера можно легко преобразовать для использования `ExecutablePool` вместо `Executable`:

```sql
CREATE TABLE sentiment_pooled (
   id UInt64,
   sentiment Float32
)
ENGINE = ExecutablePool(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20000)
)
SETTINGS
    pool_size = 4;
```

ClickHouse будет поддерживать 4 процесса по мере необходимости при выполнении запросов к таблице `sentiment_pooled`.
