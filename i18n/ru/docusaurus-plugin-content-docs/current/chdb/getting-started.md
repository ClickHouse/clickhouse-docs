---
slug: '/chdb/getting-started'
sidebar_label: 'Начало работы'
description: 'chDB является встроенным SQL OLAP движком, основанным на ClickHouse'
title: 'Начало работы с chDB'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'в процессе', 'in process']
doc_type: guide
---
# Начало работы с chDB

В этом руководстве мы научимся быстро настраивать Python-версию chDB. 
Начнем с выполнения запроса к JSON-файлу на S3, затем создадим таблицу в chDB на основе JSON-файла и выполним несколько запросов к данным. 
Также мы рассмотрим, как получать данные в различных форматах, включая Apache Arrow и Pandas, и, наконец, научимся выполнять запросы к DataFrame Pandas.

## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB. 
Убедитесь, что у вас версия 2.0.3 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь мы установим [ipython](https://ipython.org/):

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства, который можно запустить, выполнив:

```bash
ipython
```

Также мы будем использовать Pandas и Apache Arrow в этом руководстве, поэтому давайте установим и эти библиотеки:

```bash
pip install pandas pyarrow
```

## Запрос к JSON-файлу на S3 {#querying-a-json-file-in-s3}

Теперь давайте посмотрим, как выполнить запрос к JSON-файлу, который хранится в корзине S3. 
[Датасет с дизлайками на YouTube](/getting-started/example-datasets/youtube-dislikes) содержит более 4 миллиардов строк дизлайков к видео на YouTube до 2021 года. 
Мы будем работать с одним из JSON-файлов из того датасета.

Импортируем chdb:

```python
import chdb
```

Мы можем написать следующий запрос, чтобы описать структуру одного из JSON-файлов:

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

Мы также можем подсчитать количество строк в этом файле:

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

chdb пока не поддерживает передачу параметров запроса, но мы можем извлечь путь и передать его через f-строку.

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
Это нормально делать с переменными, определенными в вашей программе, но не делайте это с пользовательским вводом, иначе ваш запрос будет подвержен SQL-инъекциям.
:::

## Настройка формата вывода {#configuring-the-output-format}

Формат вывода по умолчанию — `CSV`, но мы можем изменить его с помощью параметра `output_format`. 
chDB поддерживает форматы данных ClickHouse, а также [некоторые свои](/chdb/reference/data-formats.md), включая `DataFrame`, который возвращает DataFrame Pandas:

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

Или, если мы хотим получить таблицу Apache Arrow:

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

Теперь давайте посмотрим, как создать таблицу в chDB. 
Для этого нам нужно использовать другой API, поэтому сначала импортируем его:

```python
from chdb import session as chs
```

Затем инициализируем сессию. 
Если мы хотим, чтобы сессия сохранялась на диске, нам нужно предоставить имя каталога. 
Если мы оставим это поле пустым, база данных будет храниться в памяти и потеряется, как только мы завершим работу с Python-процессом.

```python
sess = chs.Session("gettingStarted.chdb")
```

Теперь создадим базу данных:

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

Теперь мы можем создать таблицу `dislikes` на основе схемы из JSON-файла, используя технику `CREATE...EMPTY AS`. 
Мы будем использовать настройку [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable), чтобы типы столбцов не были все `Nullable`.

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

Мы можем затем использовать оператор `DESCRIBE`, чтобы проверить схему:

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

Теперь давайте заполним эту таблицу:

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

Мы также можем выполнить оба эти шага за один раз, используя технику `CREATE...AS`. 
Давайте создадим другую таблицу, используя эту методику:

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

Наконец, давайте запросим таблицу:

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

Предположим, что мы добавляем дополнительный столбец в DataFrame, чтобы вычислить соотношение лайков и дизлайков. 
Мы можем написать следующий код:

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Запрос к DataFrame Pandas {#querying-a-pandas-dataframe}

Затем мы можем запросить этот DataFrame из chDB:

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

Вы также можете прочитать больше о запросах к DataFrames Pandas в [руководстве для разработчиков по запросам к Pandas](guides/querying-pandas.md).

## Следующие шаги {#next-steps}

Надеюсь, это руководство дало вам хорошее представление о chDB. 
Чтобы узнать больше о том, как его использовать, смотрите следующие руководства для разработчиков:

* [Запросы к DataFrames Pandas](guides/querying-pandas.md)
* [Запросы к Apache Arrow](guides/querying-apache-arrow.md)
* [Использование chDB в JupySQL](guides/jupysql.md)
* [Использование chDB с существующей базой данных clickhouse-local](guides/clickhouse-local.md)