---
title: 'Начало работы с chDB'
sidebar_label: 'Начало работы'
slug: /chdb/getting-started
description: 'chDB — это встроенный OLAP-движок SQL на базе ClickHouse'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'in-process', 'in process']
doc_type: 'guide'
---



# Начало работы с chDB

В этом руководстве мы разберёмся, как начать работу с Python‑вариантом chDB.
Мы начнём с выполнения запроса к JSON‑файлу в S3, затем создадим в chDB таблицу на основе этого JSON‑файла и выполним несколько запросов к данным.
Мы также посмотрим, как получать результаты запросов в разных форматах, включая Apache Arrow и Pandas, и, наконец, узнаем, как выполнять запросы к DataFrame из Pandas. 



## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что у вас установлена версия 2.0.3 или выше:

```bash
pip install "chdb>=2.0.2"
```

Далее установим [ipython](https://ipython.org/):

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства. Запустить его можно следующей командой:

```bash
ipython
```

В этом руководстве мы также будем использовать Pandas и Apache Arrow, поэтому установим и эти библиотеки:

```bash
pip install pandas pyarrow
```


## Запрос к JSON-файлу в S3 {#querying-a-json-file-in-s3}

Теперь рассмотрим, как выполнить запрос к JSON-файлу, хранящемуся в бакете S3.
[Датасет дизлайков YouTube](/getting-started/example-datasets/youtube-dislikes) содержит более 4 миллиардов строк с дизлайками видео на YouTube до 2021 года.
Мы будем работать с одним из JSON-файлов из этого датасета.

Импортируйте chdb:

```python
import chdb
```

Можно написать следующий запрос для описания структуры одного из JSON-файлов:

```python
chdb.query(
  """
  DESCRIBE s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )
  SETTINGS describe_compact_output=1
  """
)
```

```text
"id","Nullable(String)"
"fetch_date","Nullable(String)"
"upload_date","Nullable(String)"
"title","Nullable(String)"
"uploader_id","Nullable(String)"
"uploader","Nullable(String)"
"uploader_sub_count","Nullable(Int64)"
"is_age_limit","Nullable(Bool)"
"view_count","Nullable(Int64)"
"like_count","Nullable(Int64)"
"dislike_count","Nullable(Int64)"
"is_crawlable","Nullable(Bool)"
"is_live_content","Nullable(Bool)"
"has_subtitles","Nullable(Bool)"
"is_ads_enabled","Nullable(Bool)"
"is_comments_enabled","Nullable(Bool)"
"description","Nullable(String)"
"rich_metadata","Array(Tuple(
    call Nullable(String),
    content Nullable(String),
    subtitle Nullable(String),
    title Nullable(String),
    url Nullable(String)))"
"super_titles","Array(Tuple(
    text Nullable(String),
    url Nullable(String)))"
"uploader_badges","Nullable(String)"
"video_badges","Nullable(String)"
```

Также можно подсчитать количество строк в этом файле:

```python
chdb.query(
  """
  SELECT count()
  FROM s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )"""
)
```

```text
336432
```

Этот файл содержит чуть более 300 000 записей.

chdb пока не поддерживает передачу параметров запроса, но можно извлечь путь и передать его через f-строку.

```python
path = 's3://clickhouse-public-datasets/youtube/original/files/youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst'
```

```python
chdb.query(
  f"""
  SELECT count()
  FROM s3('{path}','JSONLines')
  """
)
```

:::warning
Это допустимо для переменных, определённых в вашей программе, но не используйте этот подход с пользовательским вводом, иначе ваш запрос будет уязвим к SQL-инъекциям.
:::


## Настройка формата вывода {#configuring-the-output-format}

Формат вывода по умолчанию — `CSV`, но его можно изменить с помощью параметра `output_format`.
chDB поддерживает форматы данных ClickHouse, а также [некоторые собственные](/chdb/reference/data-formats.md), включая `DataFrame`, который возвращает Pandas DataFrame:

```python
result = chdb.query(
  f"""
  SELECT is_ads_enabled, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="DataFrame"
)

print(type(result))
print(result)
```

```text
<class 'pandas.core.frame.DataFrame'>
   is_ads_enabled  count()
0           False   301125
1            True    35307
```

Или если нужно получить таблицу Apache Arrow:

```python
result = chdb.query(
  f"""
  SELECT is_live_content, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="ArrowTable"
)

print(type(result))
print(result)
```

```text
<class 'pyarrow.lib.Table'>
pyarrow.Table
is_live_content: bool
count(): uint64 not null
----
is_live_content: [[false,true]]
count(): [[315746,20686]]
```


## Создание таблицы из JSON-файла {#creating-a-table-from-json-file}

Теперь рассмотрим, как создать таблицу в chDB.
Для этого нужно использовать другой API, поэтому сначала импортируем его:

```python
from chdb import session as chs
```

Далее инициализируем сессию.
Если нужно сохранить сессию на диск, необходимо указать имя директории.
Если оставить это поле пустым, база данных будет храниться в памяти и будет потеряна при завершении процесса Python.

```python
sess = chs.Session("gettingStarted.chdb")
```

Далее создадим базу данных:

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

Теперь можно создать таблицу `dislikes` на основе схемы из JSON-файла, используя конструкцию `CREATE...EMPTY AS`.
Используем настройку [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable), чтобы типы столбцов не были автоматически преобразованы в `Nullable`.

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes
  ORDER BY fetch_date
  EMPTY AS
  SELECT *
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

Затем можно использовать оператор `DESCRIBE` для проверки схемы:

```python
sess.query(f"""
   DESCRIBE youtube.dislikes
   SETTINGS describe_compact_output=1
   """
)
```

```text
"id","String"
"fetch_date","String"
"upload_date","String"
"title","String"
"uploader_id","String"
"uploader","String"
"uploader_sub_count","Int64"
"is_age_limit","Bool"
"view_count","Int64"
"like_count","Int64"
"dislike_count","Int64"
"is_crawlable","Bool"
"is_live_content","Bool"
"has_subtitles","Bool"
"is_ads_enabled","Bool"
"is_comments_enabled","Bool"
"description","String"
"rich_metadata","Array(Tuple(
    call String,
    content String,
    subtitle String,
    title String,
    url String))"
"super_titles","Array(Tuple(
    text String,
    url String))"
"uploader_badges","String"
"video_badges","String"
```

Далее заполним эту таблицу:

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT *
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

Также можно выполнить оба этих шага за один раз, используя конструкцию `CREATE...AS`.
Создадим другую таблицу, используя эту конструкцию:

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes2
  ORDER BY fetch_date
  AS
  SELECT *
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```


## Запрос к таблице {#querying-a-table}

Наконец, выполним запрос к таблице:

```sql
df = sess.query("""
  SELECT uploader, sum(view_count) AS viewCount, sum(like_count) AS likeCount, sum(dislike_count) AS dislikeCount
  FROM youtube.dislikes
  GROUP BY ALL
  ORDER BY viewCount DESC
  LIMIT 10
  """,
  "DataFrame"
)
df
```

```text
                             uploader  viewCount  likeCount  dislikeCount
0                             Jeremih  139066569     812602         37842
1                     TheKillersMusic  109313116     529361         11931
2  LetsGoMartin- Canciones Infantiles  104747788     236615        141467
3                    Xiaoying Cuisine   54458335    1031525         37049
4                                Adri   47404537     279033         36583
5                  Diana and Roma IND   43829341     182334        148740
6                      ChuChuTV Tamil   39244854     244614        213772
7                            Cheez-It   35342270        108            27
8                            Anime Uz   33375618    1270673         60013
9                    RC Cars OFF Road   31952962     101503         49489
```

Предположим, что затем мы добавим дополнительный столбец в DataFrame для вычисления соотношения лайков к дизлайкам.
Можно написать следующий код:

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```


## Запросы к Pandas DataFrame {#querying-a-pandas-dataframe}

Затем можно выполнить запрос к этому DataFrame из chDB:

```python
chdb.query(
  """
  SELECT uploader, likeDislikeRatio
  FROM Python(df)
  """,
  output_format="DataFrame"
)
```

```text
                             uploader  likeDislikeRatio
0                             Jeremih         21.473548
1                     TheKillersMusic         44.368536
2  LetsGoMartin- Canciones Infantiles          1.672581
3                    Xiaoying Cuisine         27.842182
4                                Adri          7.627395
5                  Diana and Roma IND          1.225857
6                      ChuChuTV Tamil          1.144275
7                            Cheez-It          4.000000
8                            Anime Uz         21.173296
9                    RC Cars OFF Road          2.051021
```

Подробнее о запросах к Pandas DataFrame см. в [руководстве разработчика по работе с Pandas](guides/querying-pandas.md).


## Следующие шаги {#next-steps}

Надеемся, это руководство дало вам хорошее представление о chDB.
Чтобы узнать больше о работе с ним, ознакомьтесь со следующими руководствами для разработчиков:

- [Выполнение запросов к Pandas DataFrames](guides/querying-pandas.md)
- [Выполнение запросов к Apache Arrow](guides/querying-apache-arrow.md)
- [Использование chDB в JupySQL](guides/jupysql.md)
- [Использование chDB с существующей базой данных clickhouse-local](guides/clickhouse-local.md)
