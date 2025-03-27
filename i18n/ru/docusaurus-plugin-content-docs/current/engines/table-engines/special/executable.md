---
description: 'Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (путем записи строк в **stdout**).'
sidebar_label: 'Executable'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Движки таблиц Executable и ExecutablePool'
---


# Движки таблиц Executable и ExecutablePool

Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (путем записи строк в **stdout**). Исполняемый скрипт хранится в директории `users_scripts` и может читать данные из любого источника.

- Таблицы `Executable`: скрипт выполняется при каждом запросе
- Таблицы `ExecutablePool`: поддерживают пул постоянных процессов и используют процессы из пула для чтения

Вы можете дополнительно включить один или несколько входных запросов, которые передают свои результаты в **stdin** для чтения скриптом.

## Создание таблицы Executable {#creating-an-executable-table}

Движок таблицы `Executable` требует два параметра: имя скрипта и формат входящих данных. Вы можете дополнять один или несколько входных запросов:

```sql
Executable(script_name, format, [input_query...])
```

Вот соответствующие настройки для таблицы `Executable`:

- `send_chunk_header`
    - Описание: Отправлять количество строк в каждом чанке перед отправкой чанка на обработку. Эта настройка может помочь вам более эффективно написать ваш скрипт для предварительного выделения некоторых ресурсов
    - Значение по умолчанию: false
- `command_termination_timeout`
    - Описание: Время ожидания завершения команды в секундах
    - Значение по умолчанию: 10
- `command_read_timeout`
    - Описание: Время ожидания для чтения данных из stdout команды в миллисекундах
    - Значение по умолчанию: 10000
- `command_write_timeout`
    - Описание: Время ожидания для записи данных в stdin команды в миллисекундах
    - Значение по умолчанию: 10000


Посмотрим на пример. Следующий скрипт на Python называется `my_script.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая строка предваряется номером, отделенным табуляцией:

```python
#!/usr/bin/python3

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

Следующая таблица `my_executable_table` строится на основе вывода `my_script.py`, который будет генерировать 10 случайных строк каждый раз, когда вы выполняете `SELECT` из `my_executable_table`:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

Создание таблицы возвращает результат сразу и не вызывает скрипт. Запрос к `my_executable_table` вызывает выполнение скрипта:

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

## Передача результатов запросов в скрипт {#passing-query-results-to-a-script}

Пользователи сайта Hacker News оставляют комментарии. Python содержит набор инструментов обработки естественного языка (`nltk`) с `SentimentIntensityAnalyzer` для определения, являются ли комментарии положительными, отрицательными или нейтральными - включая выставление значения между -1 (очень отрицательный комментарий) и 1 (очень положительный комментарий). Давайте создадим таблицу `Executable`, которая рассчитывает настроение комментариев Hacker News с использованием `nltk`.

Этот пример использует таблицу `hackernews`, описанную [здесь](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset). Таблица `hackernews` включает в себя столбец `id` типа `UInt64` и столбец `String` с именем `comment`. Начнем с определения таблицы `Executable`:

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

Некоторые комментарии по поводу таблицы `sentiment`:

- Файл `sentiment.py` сохранен в папке `user_scripts` (стандартная папка настройки `user_scripts_path`)
- Формат `TabSeparated` означает, что наш скрипт на Python должен генерировать строки необработанных данных, содержащие табуляции
- Запрос выбирает два столбца из `hackernews`. Скрипт на Python должен будет разобрать эти значения столбцов из входящих строк

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

Некоторые комментарии по поводу нашего скрипта на Python:

- Для этого вам нужно будет выполнить `nltk.downloader.download('vader_lexicon')`. Это можно было бы разместить в скрипте, но тогда он скачивался бы каждый раз, когда выполнялся запрос к таблице `sentiment` - что неэффективно
- Каждое значение `row` будет строкой в результирующем наборе данных `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
- Входная строка разделяется табуляцией, поэтому мы разбираем `id` и `comment` с помощью функции `split` Python
- Результат `polarity_scores` - это объект JSON с несколькими значениями. Мы решили просто взять значение `compound` этого объекта JSON
- Напоминаем, что таблица `sentiment` в ClickHouse использует формат `TabSeparated` и содержит два столбца, поэтому наша функция `print` разделяет эти столбцы табуляцией

Каждый раз, когда вы выполняете запрос, который выбирает строки из таблицы `sentiment`, выполняется запрос `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`, и результат передается в `sentiment.py`. Давайте протестируем это:

```sql
SELECT *
FROM sentiment
```

Ответ выглядит так:

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


## Создание таблицы ExecutablePool {#creating-an-executablepool-table}

Синтаксис для `ExecutablePool` схож с `Executable`, но есть несколько соответствующих настроек, уникальных для таблицы `ExecutablePool`:

- `pool_size`
    - Описание: Размер пула процессов. Если размер 0, то ограничения по размеру отсутствуют
    - Значение по умолчанию: 16
- `max_command_execution_time`
    - Описание: Максимальное время выполнения команды в секундах
    - Значение по умолчанию: 10

Мы можем легко преобразовать таблицу `sentiment` выше, чтобы использовать `ExecutablePool` вместо `Executable`:

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

ClickHouse будет поддерживать 4 процесса по мере необходимости, когда ваш клиент запрашивает таблицу `sentiment_pooled`.
