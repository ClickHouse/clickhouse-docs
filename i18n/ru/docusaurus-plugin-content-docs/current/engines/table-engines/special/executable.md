---
slug: '/engines/table-engines/special/executable'
sidebar_label: Executable
sidebar_position: 40
description: 'Таблицы `Executable` и `ExecutablePool` позволяют вам определить таблицу,'
title: 'Движки таблиц Executable и ExecutablePool'
doc_type: reference
---
# Движки таблиц `Executable` и `ExecutablePool`

Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (путем записи строк в **stdout**). Исполняемый скрипт хранится в каталоге `users_scripts` и может читать данные из любого источника.

- Таблицы `Executable`: скрипт выполняется при каждом запросе
- Таблицы `ExecutablePool`: поддерживают пул постоянных процессов и берут процессы из пула для чтения

Вы можете по желанию включить один или несколько входящих запросов, которые передают свои результаты на **stdin** для чтения скриптом.

## Создание таблицы `Executable` {#creating-an-executable-table}

Движок таблицы `Executable` требует два параметра: имя скрипта и формат входящих данных. Вы можете по желанию передать один или несколько входящих запросов:

```sql
Executable(script_name, format, [input_query...])
```

Вот соответствующие настройки для таблицы `Executable`:

- `send_chunk_header`
  - Описание: Отправить количество строк в каждом фрагменте перед отправкой фрагмента на обработку. Эта настройка может помочь вам написать ваш скрипт более эффективно, чтобы заранее выделить некоторые ресурсы.
  - Значение по умолчанию: false
- `command_termination_timeout`
  - Описание: Тайм-аут завершения команды в секундах
  - Значение по умолчанию: 10
- `command_read_timeout`
  - Описание: Тайм-аут для чтения данных из stdout команды в миллисекундах
  - Значение по умолчанию: 10000
- `command_write_timeout`
  - Описание: Тайм-аут для записи данных в stdin команды в миллисекундах
  - Значение по умолчанию: 10000

Рассмотрим пример. Следующий Python-скрипт называется `my_script.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая из которых предшествуется числом, отделенным табуляцией:

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

Создание таблицы завершается немедленно и не вызывает скрипт. Запрос к `my_executable_table` вызывает выполнение скрипта:

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

## Передача результатов запроса скрипту {#passing-query-results-to-a-script}

Пользователи сайта Hacker News оставляют комментарии. Python содержит набор инструментов для обработки естественного языка (`nltk`) с `SentimentIntensityAnalyzer`, который определяет, являются ли комментарии положительными, отрицательными или нейтральными, включая присвоение значения от -1 (очень отрицательный комментарий) до 1 (очень положительный комментарий). Давайте создадим таблицу `Executable`, которая вычисляет сентимент комментариев Hacker News, используя `nltk`.

Этот пример использует таблицу `hackernews`, описанную [здесь](/engines/table-engines/mergetree-family/invertedindexes/#hacker-news-dataset). Таблица `hackernews` включает столбец `id` типа `UInt64` и строковый столбец с именем `comment`. Начнем с определения таблицы `Executable`:

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

Некоторые комментарии о таблице `sentiment`:

- Файл `sentiment.py` сохранен в папке `user_scripts` (в папке по умолчанию для настройки `user_scripts_path`)
- Формат `TabSeparated` означает, что наш Python-скрипт должен генерировать строки оригинальных данных, которые содержат табуляцию
- Запрос выбирает два столбца из `hackernews`. Скрипту на Python потребуется проанализировать значения этих столбцов из входящих строк

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

Некоторые комментарии о нашем Python-скрипте:

- Для этого вам нужно будет запустить `nltk.downloader.download('vader_lexicon')`. Это можно было бы поместить в скрипт, но тогда он загружался бы каждый раз при выполнении запроса к таблице `sentiment`, что неэффективно
- Каждое значение `row` будет строкой в результате набора `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
- Входящая строка отделена табуляцией, поэтому мы извлекаем `id` и `comment` с помощью функции Python `split`
- Результат `polarity_scores` - это объект JSON с несколькими значениями. Мы решили просто взять значение `compound` этого JSON-объекта
- Напомним, что таблица `sentiment` в ClickHouse использует формат `TabSeparated` и содержит два столбца, поэтому наша функция `print` разделяет эти столбцы табуляцией

Каждый раз, когда вы пишете запрос, который выбирает строки из таблицы `sentiment`, выполняется запрос `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`, и результат передается в `sentiment.py`. Давайте протестируем это:

```sql
SELECT *
FROM sentiment
```

Ответ выглядит следующим образом:

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

Синтаксис для `ExecutablePool` похож на `Executable`, но есть несколько важных настроек, уникальных для таблицы `ExecutablePool`:

- `pool_size`
  - Описание: Размер пула процессов. Если размер равен 0, то ограничения по размеру нет
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

ClickHouse будет поддерживать 4 процесса по запросу, когда ваш клиент запрашивает таблицу `sentiment_pooled`.