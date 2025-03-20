---
slug: /engines/table-engines/special/executable
sidebar_position: 40
sidebar_label:  Исполняемый
title: "Исполняемые и ИсполняемыеПулы Табличные Движки"
description: "Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (путем записи строк в **stdout**)."
---


# Исполняемые и ИсполняемыеПулы Табличные Движки

Движки таблиц `Executable` и `ExecutablePool` позволяют вам определить таблицу, строки которой генерируются из скрипта, который вы определяете (путем записи строк в **stdout**). Исполняемый скрипт сохраняется в директории `users_scripts` и может считывать данные из любого источника.

- Таблицы `Executable`: скрипт выполняется при каждом запросе
- Таблицы `ExecutablePool`: поддерживают пул постоянных процессов и берут процессы из пула для чтения

Вы можете дополнительно включить один или несколько входящих запросов, которые передают свои результаты в **stdin** для считывания скриптом.

## Создание Исполняемой Таблицы {#creating-an-executable-table}

Движок таблицы `Executable` требует два параметра: имя скрипта и формат входящих данных. Вы можете также передать один или несколько входящих запросов:

```sql
Executable(script_name, format, [input_query...])
```

Вот соответствующие настройки для таблицы `Executable`:

- `send_chunk_header`
    - Описание: Отправлять количество строк в каждом блоке перед отправкой блока на обработку. Эта настройка может помочь написать ваш скрипт более эффективным образом, чтобы предварительно выделить некоторые ресурсы.
    - Значение по умолчанию: false
- `command_termination_timeout`
    - Описание: Таймаут завершения команды в секундах
    - Значение по умолчанию: 10
- `command_read_timeout`
    - Описание: Таймаут для чтения данных из stdout команды в миллисекундах
    - Значение по умолчанию: 10000
- `command_write_timeout`
    - Описание: Таймаут для записи данных в stdin команды в миллисекундах
    - Значение по умолчанию: 10000

Рассмотрим пример. Следующий скрипт на Python называется `my_script.py` и сохранен в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, каждая из которых предварена номером, разделенным табуляцией:

```python
#!/usr/bin/python3

import sys
import string
import random

def main():

    # Чтение входящего значения
    for number in sys.stdin:
        i = int(number)

        # Генерация случайных строк
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Сброс результатов на stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

Следующая таблица `my_executable_table` строится из вывода `my_script.py`, который будет генерировать 10 случайных строк каждый раз, когда вы выполняете `SELECT` из `my_executable_table`:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

Создание таблицы возвращает результат немедленно и не вызывает скрипт. Запрос к `my_executable_table` вызывает выполнение скрипта:

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

## Передача Результатов Запроса Скрипту {#passing-query-results-to-a-script}

Пользователи сайта Hacker News оставляют комментарии. Python содержит набор инструментов обработки естественного языка (`nltk`) с `SentimentIntensityAnalyzer` для определения, являются ли комментарии положительными, отрицательными или нейтральными - включая назначение значения от -1 (очень отрицательный комментарий) до 1 (очень положительный комментарий). Давайте создадим таблицу `Executable`, которая вычисляет настроение комментариев Hacker News с использованием `nltk`.

Этот пример использует таблицу `hackernews`, описанную [здесь](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset). Таблица `hackernews` включает колонку `id` типа `UInt64` и колонку `String` с именем `comment`. Начнем с определения таблицы `Executable`:

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

- Файл `sentiment.py` сохранен в папке `user_scripts` (стандартная папка настройки `user_scripts_path`)
- Формат `TabSeparated` означает, что наш скрипт на Python должен генерировать строки сырьевых данных, которые содержат табуляцию
- Запрос выбирает две колонки из `hackernews`. Скрипту на Python нужно будет проанализировать значения этих колонок из входящих строк

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

Некоторые комментарии о нашем скрипте на Python:

- Для этого вам нужно будет выполнить `nltk.downloader.download('vader_lexicon')`. Это можно было бы поместить в скрипт, но тогда он бы загружался каждый раз, когда выполнялся запрос к таблице `sentiment`, что неэффективно.
- Каждое значение `row` будет строкой в результирующем наборе `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
- Входящая строка разделена табуляцией, поэтому мы извлекаем `id` и `comment`, используя функцию `split` на Python
- Результат `polarity_scores` представляет собой объект JSON с несколькими значениями. Мы решили просто взять значение `compound` из этого объекта JSON.
- Напоминаем, что таблица `sentiment` в ClickHouse использует формат `TabSeparated` и содержит две колонки, так что наша функция `print` разделяет эти колонки табуляцией.

Каждый раз, когда вы пишете запрос, который выбирает строки из таблицы `sentiment`, запрос `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` выполняется, и результат передается в `sentiment.py`. Давайте протестируем это:

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

## Создание ИсполняемойПул Таблицы {#creating-an-executablepool-table}

Синтаксис для `ExecutablePool` аналогичен `Executable`, но есть несколько соответствующих настроек, уникальных для таблицы `ExecutablePool`:

- `pool_size`
    - Описание: Размер пула процессов. Если размер равен 0, то размерных ограничений нет.
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
