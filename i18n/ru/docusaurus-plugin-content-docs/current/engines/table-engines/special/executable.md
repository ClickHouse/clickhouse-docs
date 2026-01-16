---
description: 'Движки таблиц `Executable` и `ExecutablePool` позволяют определить
  таблицу, строки которой генерируются указанным вами скриптом (путём записи строк
  в **stdout**).'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Движки таблиц Executable и ExecutablePool'
doc_type: 'reference'
---

# Движки таблиц Executable и ExecutablePool \\{#executable-and-executablepool-table-engines\\}

Движки таблиц `Executable` и `ExecutablePool` позволяют задать таблицу, строки которой генерируются скриптом, который вы пишете (путём вывода строк в **stdout**). Исполняемый скрипт хранится в каталоге `users_scripts` и может читать данные из любого источника.

* Таблицы `Executable`: скрипт выполняется при каждом запросе
* Таблицы `ExecutablePool`: поддерживается пул долгоживущих процессов, и для чтения процессы берутся из этого пула

Дополнительно вы можете указать один или несколько входных запросов, результаты которых будут передаваться в **stdin** для чтения скриптом.

## Создание таблицы `Executable` \{#creating-an-executable-table\}

Движку таблицы `Executable` требуются два параметра: имя скрипта и формат входящих данных. При необходимости можно передать один или несколько входных запросов:

```sql
Executable(script_name, format, [input_query...])
```

Ниже приведены соответствующие параметры для таблицы `Executable`:

* `send_chunk_header`
  * Description: Отправлять количество строк в каждом чанке перед отправкой чанка на обработку. Этот параметр позволяет писать скрипты более эффективно, заранее выделяя необходимые ресурсы
  * Default value: false
* `command_termination_timeout`
  * Description: Таймаут завершения команды в секундах
  * Default value: 10
* `command_read_timeout`
  * Description: Таймаут чтения данных из stdout команды в миллисекундах
  * Default value: 10000
* `command_write_timeout`
  * Description: Таймаут записи данных в stdin команды в миллисекундах
  * Default value: 10000

Рассмотрим пример. Следующий скрипт на Python называется `my_script.py` и сохранён в папке `user_scripts`. Он считывает число `i` и выводит `i` случайных строк, при этом каждая строка предваряется числом, отделённым символом табуляции:

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

Следующая таблица `my_executable_table` создаётся на основе вывода скрипта `my_script.py`, который будет генерировать 10 случайных строк каждый раз при выполнении запроса `SELECT` к `my_executable_table`:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

Создание таблицы завершается немедленно и не запускает скрипт. Выполнение запроса к `my_executable_table` приводит к запуску скрипта:

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


## Передача результатов запроса в скрипт \{#passing-query-results-to-a-script\}

Пользователи веб‑сайта Hacker News оставляют комментарии. В Python есть набор инструментов для обработки естественного языка (`nltk`) с `SentimentIntensityAnalyzer` для определения, являются ли комментарии положительными, отрицательными или нейтральными, — в том числе для присвоения значения от -1 (очень негативный комментарий) до 1 (очень позитивный комментарий). Давайте создадим таблицу `Executable`, которая вычисляет тональность комментариев Hacker News с помощью `nltk`.

В этом примере используется таблица `hackernews`, описанная [здесь](/engines/table-engines/mergetree-family/textindexes/#hacker-news-dataset). Таблица `hackernews` включает столбец `id` типа `UInt64` и столбец типа `String` с именем `comment`. Начнём с определения таблицы `Executable`:

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

* Файл `sentiment.py` сохранён в каталоге `user_scripts` (каталог по умолчанию для настройки `user_scripts_path`)
* Формат `TabSeparated` означает, что наш Python-скрипт должен генерировать строки сырых данных, содержащие значения, разделённые символом табуляции
* Запрос выбирает два столбца из `hackernews`. Python-скрипту потребуется извлекать значения этих столбцов из входящих строк

Ниже приведено определение `sentiment.py`:

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

Несколько комментариев к нашему Python-скрипту:

* Чтобы это работало, вам нужно выполнить `nltk.downloader.download('vader_lexicon')`. Это можно было бы поместить в сам скрипт, но тогда загрузка выполнялась бы при каждом выполнении запроса к таблице `sentiment`, что неэффективно
* Каждое значение `row` будет строкой в результирующем наборе запроса `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`
* Входящая строка имеет табличный формат (значения разделены табуляцией), поэтому мы извлекаем `id` и `comment`, используя Python-функцию `split`
* Результат `polarity_scores` — это JSON-объект с несколькими значениями. Мы решили просто взять значение `compound` из этого JSON-объекта
* Напомним, что таблица `sentiment` в ClickHouse использует формат `TabSeparated` и содержит два столбца, поэтому наша функция `print` разделяет эти столбцы символом табуляции

Каждый раз, когда вы пишете запрос, выбирающий строки из таблицы `sentiment`, выполняется запрос `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`, а его результат передаётся в `sentiment.py`. Давайте протестируем это:

```sql
SELECT *
FROM sentiment
```

Результат будет таким:


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


## Создание таблицы `ExecutablePool` \{#creating-an-executablepool-table\}

Синтаксис `ExecutablePool` похож на `Executable`, но у таблицы `ExecutablePool` есть несколько параметров, характерных именно для нее:

* `pool_size`
  * Описание: Размер пула процессов. Если размер равен 0, ограничения по размеру отсутствуют.
  * Значение по умолчанию: 16
* `max_command_execution_time`
  * Описание: Максимальное время выполнения команды в секундах.
  * Значение по умолчанию: 10

Мы можем легко преобразовать таблицу `sentiment`, показанную выше, для использования `ExecutablePool` вместо `Executable`:

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

ClickHouse будет по требованию поддерживать в работе 4 процесса, когда клиент выполняет запрос к таблице `sentiment_pooled`.
