---
description: 'Набор данных с 28 миллионами строк из Hacker News.'
sidebar_label: 'Hacker News'
slug: /getting-started/example-datasets/hacker-news
title: 'Набор данных Hacker News'
doc_type: 'guide'
keywords: ['пример набора данных', 'Hacker News', 'пример данных', 'анализ текста', 'векторный поиск']
---



# Набор данных Hacker News

> В этом учебном примере вы загрузите 28 миллионов строк данных Hacker News в таблицу
> ClickHouse из форматов CSV и Parquet и выполните несколько простых запросов для изучения данных.



## CSV {#csv}

<VerticalStepper headerLevel="h3">

### Скачивание CSV {#download}

CSV-версию набора данных можно скачать из нашего публичного [S3-бакета](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz) или выполнив следующую команду:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

Этот сжатый файл размером 4,6 ГБ, содержащий 28 млн строк, должен скачаться за 5-10 минут.

### Просмотр данных {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/) позволяет пользователям выполнять быструю обработку локальных файлов без необходимости развертывания и настройки сервера ClickHouse.

Прежде чем сохранять данные в ClickHouse, давайте просмотрим файл с помощью clickhouse-local.
Выполните в консоли:

```bash
clickhouse-local
```

Затем выполните следующую команду для изучения данных:

```sql title="Запрос"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="Ответ"
Row 1:
──────
id:          344065
deleted:     0
type:        comment
by:          callmeed
time:        2008-10-26 05:06:58
text:        What kind of reports do you need?<p>ActiveMerchant just connects your app to a gateway for cc approval and processing.<p>Braintree has very nice reports on transactions and it's very easy to refund a payment.<p>Beyond that, you are dealing with Rails after all–it's pretty easy to scaffold out some reports from your subscriber base.
dead:        0
parent:      344038
poll:        0
kids:        []
url:
score:       0
title:
parts:       []
descendants: 0

Row 2:
──────
id:          344066
deleted:     0
type:        story
by:          acangiano
time:        2008-10-26 05:07:59
text:
dead:        0
parent:      0
poll:        0
kids:        [344111,344202,344329,344606]
url:         http://antoniocangiano.com/2008/10/26/what-arc-should-learn-from-ruby/
score:       33
title:       What Arc should learn from Ruby
parts:       []
descendants: 10
```

Эта команда обладает множеством полезных возможностей.
Оператор [`file`](/sql-reference/functions/files/#file) позволяет читать файл с локального диска, указывая только формат `CSVWithNames`.
Самое важное — схема автоматически определяется из содержимого файла.
Обратите также внимание, что `clickhouse-local` способен читать сжатый файл, определяя формат gzip по расширению.
Формат `Vertical` используется для более удобного просмотра данных каждого столбца.

### Загрузка данных с автоматическим определением схемы {#loading-the-data}

Самым простым и мощным инструментом для загрузки данных является `clickhouse-client` — многофункциональный нативный клиент командной строки.
Для загрузки данных вы снова можете использовать автоматическое определение схемы, полагаясь на ClickHouse в определении типов столбцов.

Выполните следующую команду для создания таблицы и вставки данных непосредственно из удаленного CSV-файла, обращаясь к содержимому через функцию [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url).
Схема определяется автоматически:

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

Это создает пустую таблицу, используя схему, определенную из данных.
Команда [`DESCRIBE TABLE`](/sql-reference/statements/describe-table) позволяет нам понять назначенные типы.

```sql title="Запрос"
DESCRIBE TABLE hackernews
```


```text title="Ответ"
┌─name────────┬─type─────────────────────┬
│ id          │ Nullable(Float64)        │
│ deleted     │ Nullable(Float64)        │
│ type        │ Nullable(String)         │
│ by          │ Nullable(String)         │
│ time        │ Nullable(String)         │
│ text        │ Nullable(String)         │
│ dead        │ Nullable(Float64)        │
│ parent      │ Nullable(Float64)        │
│ poll        │ Nullable(Float64)        │
│ kids        │ Array(Nullable(Float64)) │
│ url         │ Nullable(String)         │
│ score       │ Nullable(Float64)        │
│ title       │ Nullable(String)         │
│ parts       │ Array(Nullable(Float64)) │
│ descendants │ Nullable(Float64)        │
└─────────────┴──────────────────────────┴
```

Для вставки данных в эту таблицу используйте команду `INSERT INTO, SELECT`.
Вместе с функцией `url` данные будут загружаться напрямую из URL:

```sql title="Запрос"
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

Вы успешно вставили 28 миллионов строк в ClickHouse одной командой!

### Исследование данных {#explore}

Получите выборку историй Hacker News и отдельных столбцов, выполнив следующий запрос:

```sql title="Запрос"
SELECT
    id,
    title,
    type,
    by,
    time,
    url,
    score
FROM hackernews
WHERE type = 'story'
LIMIT 3
FORMAT Vertical
```

```response title="Ответ"
Row 1:
──────
id:    2596866
title:
type:  story
by:
time:  1306685152
url:
score: 0

Row 2:
──────
id:    2596870
title: WordPress capture users last login date and time
type:  story
by:    wpsnipp
time:  1306685252
url:   http://wpsnipp.com/index.php/date/capture-users-last-login-date-and-time/
score: 1

Row 3:
──────
id:    2596872
title: Recent college graduates get some startup wisdom
type:  story
by:    whenimgone
time:  1306685352
url:   http://articles.chicagotribune.com/2011-05-27/business/sc-cons-0526-started-20110527_1_business-plan-recession-college-graduates
score: 1
```

Хотя автоматический вывод схемы является отличным инструментом для первоначального исследования данных, он работает по принципу «наилучшего усилия» и не является долгосрочной заменой определению оптимальной схемы для ваших данных.

### Определение схемы {#define-a-schema}

Очевидной первоочередной оптимизацией является определение типа для каждого поля.
Помимо объявления поля time как типа `DateTime`, мы определяем соответствующий тип для каждого из полей ниже после удаления существующего набора данных.
В ClickHouse первичный ключ id для данных определяется через предложение `ORDER BY`.

Выбор подходящих типов и определение столбцов для включения в предложение `ORDER BY` помогут улучшить скорость выполнения запросов и сжатие.

Выполните запрос ниже, чтобы удалить старую схему и создать улучшенную:

```sql title="Запрос"
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
    ENGINE = MergeTree
ORDER BY id
```

С оптимизированной схемой теперь можно вставить данные из локальной файловой системы.
Снова используя `clickhouse-client`, вставьте файл с помощью предложения `INFILE` с явным `INSERT INTO`.

```sql title="Запрос"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### Выполнение примеров запросов {#run-sample-queries}

Ниже представлены примеры запросов, которые помогут вам в написании собственных запросов.


#### Насколько часто упоминается "ClickHouse" в Hacker News? {#how-pervasive}

Поле score предоставляет метрику популярности для публикаций, а поле `id` и оператор конкатенации `||` можно использовать для формирования ссылки на оригинальный пост.

```sql title="Запрос"
SELECT
    time,
    score,
    descendants,
    title,
    url,
    'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url
FROM hackernews
WHERE (type = 'story') AND (title ILIKE '%ClickHouse%')
ORDER BY score DESC
LIMIT 5 FORMAT Vertical
```

```response title="Ответ"
Row 1:
──────
time:        1632154428
score:       519
descendants: 159
title:       ClickHouse, Inc.
url:         https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md
hn_url:      https://news.ycombinator.com/item?id=28595419

Row 2:
──────
time:        1614699632
score:       383
descendants: 134
title:       ClickHouse as an alternative to Elasticsearch for log storage and analysis
url:         https://pixeljets.com/blog/clickhouse-vs-elasticsearch/
hn_url:      https://news.ycombinator.com/item?id=26316401

Row 3:
──────
time:        1465985177
score:       243
descendants: 70
title:       ClickHouse – high-performance open-source distributed column-oriented DBMS
url:         https://clickhouse.yandex/reference_en.html
hn_url:      https://news.ycombinator.com/item?id=11908254

Row 4:
──────
time:        1578331410
score:       216
descendants: 86
title:       ClickHouse cost-efficiency in action: analyzing 500B rows on an Intel NUC
url:         https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc
hn_url:      https://news.ycombinator.com/item?id=21970952

Row 5:
──────
time:        1622160768
score:       198
descendants: 55
title:       ClickHouse: An open-source column-oriented database management system
url:         https://github.com/ClickHouse/ClickHouse
hn_url:      https://news.ycombinator.com/item?id=27310247
```

Растет ли количество упоминаний ClickHouse со временем? Здесь демонстрируется преимущество определения поля `time` как `DateTime`, поскольку использование правильного типа данных позволяет применять функцию `toYYYYMM()`:

```sql title="Запрос"
SELECT
   toYYYYMM(time) AS monthYear,
   bar(count(), 0, 120, 20)
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY monthYear
ORDER BY monthYear ASC
```


```response title="Ответ"
┌─monthYear─┬─bar(count(), 0, 120, 20)─┐
│    201606 │ ██▎                      │
│    201607 │ ▏                        │
│    201610 │ ▎                        │
│    201612 │ ▏                        │
│    201701 │ ▎                        │
│    201702 │ █                        │
│    201703 │ ▋                        │
│    201704 │ █                        │
│    201705 │ ██                       │
│    201706 │ ▎                        │
│    201707 │ ▎                        │
│    201708 │ ▏                        │
│    201709 │ ▎                        │
│    201710 │ █▌                       │
│    201711 │ █▌                       │
│    201712 │ ▌                        │
│    201801 │ █▌                       │
│    201802 │ ▋                        │
│    201803 │ ███▏                     │
│    201804 │ ██▏                      │
│    201805 │ ▋                        │
│    201806 │ █▏                       │
│    201807 │ █▌                       │
│    201808 │ ▋                        │
│    201809 │ █▌                       │
│    201810 │ ███▌                     │
│    201811 │ ████                     │
│    201812 │ █▌                       │
│    201901 │ ████▋                    │
│    201902 │ ███                      │
│    201903 │ ▋                        │
│    201904 │ █                        │
│    201905 │ ███▋                     │
│    201906 │ █▏                       │
│    201907 │ ██▎                      │
│    201908 │ ██▋                      │
│    201909 │ █▋                       │
│    201910 │ █                        │
│    201911 │ ███                      │
│    201912 │ █▎                       │
│    202001 │ ███████████▋             │
│    202002 │ ██████▌                  │
│    202003 │ ███████████▋             │
│    202004 │ ███████▎                 │
│    202005 │ ██████▏                  │
│    202006 │ ██████▏                  │
│    202007 │ ███████▋                 │
│    202008 │ ███▋                     │
│    202009 │ ████                     │
│    202010 │ ████▌                    │
│    202011 │ █████▏                   │
│    202012 │ ███▋                     │
│    202101 │ ███▏                     │
│    202102 │ █████████                │
│    202103 │ █████████████▋           │
│    202104 │ ███▏                     │
│    202105 │ ████████████▋            │
│    202106 │ ███                      │
│    202107 │ █████▏                   │
│    202108 │ ████▎                    │
│    202109 │ ██████████████████▎      │
│    202110 │ ▏                        │
└───────────┴──────────────────────────┘
```

Видно, что популярность ClickHouse со временем растёт.

#### Кто наиболее активно комментирует статьи о ClickHouse? {#top-commenters}

```sql title="Запрос"
SELECT
   by,
   count() AS comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY comments DESC
LIMIT 5
```

```response title="Ответ"
┌─by──────────┬─comments─┐
│ hodgesrm    │       78 │
│ zX41ZdbW    │       45 │
│ manigandham │       39 │
│ pachico     │       35 │
│ valyala     │       27 │
└─────────────┴──────────┘
```

#### Какие комментарии вызывают наибольший интерес? {#comments-by-most-interest}


```sql title="Запрос"
SELECT
  by,
  sum(score) AS total_score,
  sum(length(kids)) AS total_sub_comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY total_score DESC
LIMIT 5
```

```response title="Результат"
┌─by───────┬─total_score─┬─total_sub_comments─┐
│ zX41ZdbW │        571  │              50    │
│ jetter   │        386  │              30    │
│ hodgesrm │        312  │              50    │
│ mechmind │        243  │              16    │
│ tosh     │        198  │              12    │
└──────────┴─────────────┴────────────────────┘
```

</VerticalStepper>


## Parquet {#parquet}

Одной из сильных сторон ClickHouse является возможность работы с любым количеством [форматов](/interfaces/formats).
CSV представляет собой довольно удобный вариант использования, однако не является наиболее эффективным для обмена данными.

Далее вы загрузите данные из файла Parquet — эффективного колоночно-ориентированного формата.

Parquet имеет минимальный набор типов, которые ClickHouse должен учитывать, при этом информация о типах закодирована непосредственно в самом формате.
Автоматический вывод типов из файла Parquet неизбежно приведет к несколько иной схеме по сравнению со схемой для CSV-файла.

<VerticalStepper headerLevel="h3">

### Вставка данных {#insert-the-data}

Выполните следующий запрос для чтения тех же данных в формате Parquet, снова используя функцию url для чтения удаленных данных:

```sql
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
ENGINE = MergeTree
ORDER BY id
SETTINGS allow_nullable_key = 1 EMPTY AS
SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')

INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')
```

:::note Null-ключи в Parquet
В соответствии с требованиями формата Parquet необходимо допускать, что ключи могут быть `NULL`,
даже если в самих данных их нет.
:::

Выполните следующую команду для просмотра выведенной схемы:

```sql title="Query"
┌─name────────┬─type───────────────────┬
│ id          │ Nullable(Int64)        │
│ deleted     │ Nullable(UInt8)        │
│ type        │ Nullable(String)       │
│ time        │ Nullable(Int64)        │
│ text        │ Nullable(String)       │
│ dead        │ Nullable(UInt8)        │
│ parent      │ Nullable(Int64)        │
│ poll        │ Nullable(Int64)        │
│ kids        │ Array(Nullable(Int64)) │
│ url         │ Nullable(String)       │
│ score       │ Nullable(Int32)        │
│ title       │ Nullable(String)       │
│ parts       │ Array(Nullable(Int64)) │
│ descendants │ Nullable(Int32)        │
└─────────────┴────────────────────────┴
```

Как и в случае с CSV-файлом, вы можете указать схему вручную для большего контроля над выбранными типами и вставить данные напрямую из s3:

```sql
CREATE TABLE hackernews
(
    `id` UInt64,
    `deleted` UInt8,
    `type` String,
    `author` String,
    `timestamp` DateTime,
    `comment` String,
    `dead` UInt8,
    `parent` UInt64,
    `poll` UInt64,
    `children` Array(UInt32),
    `url` String,
    `score` UInt32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);

INSERT INTO hackernews
SELECT * FROM s3(
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        'id UInt64,
         deleted UInt8,
         type String,
         by String,
         time DateTime,
         text String,
         dead UInt8,
         parent UInt64,
         poll UInt64,
         kids Array(UInt32),
         url String,
         score UInt32,
         title String,
         parts Array(UInt32),
         descendants UInt32');
```

### Добавление skipping-индекса для ускорения запросов {#add-skipping-index}

Чтобы узнать, сколько комментариев упоминают «ClickHouse», выполните следующий запрос:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'ClickHouse');
```

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.843 sec. Processed 28.74 million rows, 9.75 GB (34.08 million rows/s., 11.57 GB/s.)
┌─count()─┐
│     516 │
└─────────┘
```

Далее вы создадите инвертированный [индекс](/engines/table-engines/mergetree-family/invertedindexes) на столбце «comment»
для ускорения этого запроса.
Обратите внимание, что комментарии будут индексироваться в нижнем регистре для поиска терминов независимо от регистра.

Выполните следующие команды для создания индекса:

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```


Материализация индекса занимает некоторое время (чтобы проверить, создан ли индекс, используйте системную таблицу `system.data_skipping_indices`).

Выполните запрос снова после того, как индекс будет создан:

```sql title="Запрос"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

Обратите внимание, что теперь запрос выполнился всего за 0,248 секунды с индексом, по сравнению с 0,843 секундами ранее без него:

```response title="Результат"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

Оператор [`EXPLAIN`](/sql-reference/statements/explain) можно использовать, чтобы понять, почему добавление этого индекса
ускорило запрос примерно в 3,4 раза.

```response text="Запрос"
EXPLAIN indexes = 1
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

```response title="Результат"
┌─explain─────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))     │
│   Aggregating                                   │
│     Expression (Before GROUP BY)                │
│       Filter (WHERE)                            │
│         ReadFromMergeTree (default.hackernews)  │
│         Indexes:                                │
│           PrimaryKey                            │
│             Condition: true                     │
│             Parts: 4/4                          │
│             Granules: 3528/3528                 │
│           Skip                                  │
│             Name: comment_idx                   │
│             Description: inverted GRANULARITY 1 │
│             Parts: 4/4                          │
│             Granules: 554/3528                  │
└─────────────────────────────────────────────────┘
```

Обратите внимание, как индекс позволил пропустить значительное количество гранул,
что ускорило выполнение запроса.

Теперь также возможен эффективный поиск одного или всех из нескольких терминов:

```sql title="Запрос"
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);
```

```response title="Результат"
┌─count()─┐
│    2177 │
└─────────┘
```

```sql title="Запрос"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

```response
┌─count()─┐
│      22 │
└─────────┘
```

</VerticalStepper>
