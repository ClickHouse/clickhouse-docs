---
'description': 'Набор данных, содержащий 28 миллионов строк данных о Hacker News.'
'sidebar_label': 'Hacker News'
'slug': '/getting-started/example-datasets/hacker-news'
'title': 'Набор данных Hacker News'
'doc_type': 'reference'
---


# Набор данных Hacker News

> В этом руководстве вы вставите 28 миллионов строк данных Hacker News в таблицу ClickHouse из форматов CSV и Parquet и выполните несколько простых запросов для изучения данных.

## CSV {#csv}

<VerticalStepper headerLevel="h3">

### Скачивание CSV {#download}

CSV-версию набора данных можно скачать из нашего публичного [s3 ведра](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz) или выполнив эту команду:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

Размером 4.6 ГБ и с 28 миллионами строк этот сжатый файл должен загрузиться за 5-10 минут.

### Пример данных {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/) позволяет пользователям выполнять быструю обработку локальных файлов без необходимости разворачивать и настраивать сервер ClickHouse.

Прежде чем хранить какие-либо данные в ClickHouse, давайте сделаем выборку из файла, используя clickhouse-local. Из консоли выполните:

```bash
clickhouse-local
```

Затем выполните следующую команду для изучения данных:

```sql title="Query"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="Response"
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

В этой команде много тонких возможностей.
Оператор [`file`](/sql-reference/functions/files/#file) позволяет вам прочитать файл с локального диска, указывая только формат `CSVWithNames`.
Самое главное, схема автоматически выводится для вас из содержимого файла.
Обратите внимание также, как `clickhouse-local` может читать сжатый файл, выводя формат gzip из расширения.
Формат `Vertical` используется для более удобного отображения данных для каждой колонки.

### Загрузка данных с выводом схемы {#loading-the-data}

Самым простым и мощным инструментом для загрузки данных является `clickhouse-client`: многофункциональный нативный клиент командной строки.
Чтобы загрузить данные, вы снова можете воспользоваться выводом схемы, полагаясь на то, что ClickHouse определит типы колонок.

Выполните следующую команду, чтобы создать таблицу и вставить данные непосредственно из удаленного CSV-файла, обратившись к содержимому через функцию [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url).
Схема определяется автоматически:

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

Это создает пустую таблицу, используя схему, выведенную из данных.
Команда [`DESCRIBE TABLE`](/sql-reference/statements/describe-table) позволяет нам понять присвоенные типы.

```sql title="Query"
DESCRIBE TABLE hackernews
```

```text title="Response"
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

Чтобы вставить данные в эту таблицу, используйте команду `INSERT INTO, SELECT`.
Вместе с функцией `url` данные будут передаваться напрямую из URL:

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

Вы успешно вставили 28 миллионов строк в ClickHouse одной командой!

### Изучение данных {#explore}

Выберите истории Hacker News и конкретные колонки, выполнив следующий запрос:

```sql title="Query"
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

```response title="Response"
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

Хотя вывод схемы является отличным инструментом для первоначального изучения данных, он является «наилучшим усилием» и не является долгосрочной заменой для определения оптимальной схемы для ваших данных.

### Определение схемы {#define-a-schema}

Очевидная немедленная оптимизация - определить тип для каждого поля.
В дополнение к объявлению поля времени как типа `DateTime`, мы определяем соответствующий тип для каждого из нижеперечисленных полей после удаления нашего существующего набора данных.
В ClickHouse первичный ключ id для данных определяется черезClause `ORDER BY`.

Выбор соответствующих типов и определение, какие колонки включить вClause `ORDER BY`
поможет улучшить скорость запросов и сжатие.

Выполните запрос ниже, чтобы удалить старую схему и создать улучшенную схему:

```sql title="Query"
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
Снова с помощью `clickhouse-client` вставьте файл, используяClause `INFILE` с явной командой `INSERT INTO`.

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### Выполнение выборочных запросов {#run-sample-queries}

Некоторые выборочные запросы представлены ниже, чтобы вдохновить вас на написание своих
собственных запросов.

#### Насколько широко распространена тема "ClickHouse" в Hacker News? {#how-pervasive}

Поле score предоставляет метрику популярности историй, в то время как поле `id` и оператор конкатенации `||` 
могут быть использованы для создания ссылки на оригинальный пост.

```sql title="Query"
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

```response title="Response"
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

Генерирует ли ClickHouse больше шума с течением времени? Здесь полезность определения поля `time`
как `DateTime` становится очевидной, поскольку использование правильного типа данных позволяет использовать функцию `toYYYYMM()`:

```sql title="Query"
SELECT
   toYYYYMM(time) AS monthYear,
   bar(count(), 0, 120, 20)
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY monthYear
ORDER BY monthYear ASC
```

```response title="Response"
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

Похоже, что "ClickHouse" становится все более популярным с течением времени.

#### Кто является лучшими комментаторами на статьи, связанные с ClickHouse? {#top-commenters}

```sql title="Query"
SELECT
   by,
   count() AS comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY comments DESC
LIMIT 5
```

```response title="Response"
┌─by──────────┬─comments─┐
│ hodgesrm    │       78 │
│ zX41ZdbW    │       45 │
│ manigandham │       39 │
│ pachico     │       35 │
│ valyala     │       27 │
└─────────────┴──────────┘
```

#### Какие комментарии вызывают наибольший интерес? {#comments-by-most-interest}

```sql title="Query"
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

```response title="Response"
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

Одним из основных преимуществ ClickHouse является его способность обрабатывать любое количество [форматов](/interfaces/formats).
CSV представляет собой довольно идеальный случай использования и не является самым эффективным для обмена данными.

Далее вы загрузите данные из файла Parquet, который является эффективным столбцовым форматом.

Parquet имеет минимальные типы, которые ClickHouse должен соблюдать, и эта информация о типах закодирована в самом формате.
Вывод типов на основе файла Parquet неизбежно приведет к несколько другой схеме, чем для CSV-файла.

<VerticalStepper headerLevel="h3">

### Вставка данных {#insert-the-data}

Выполните следующий запрос, чтобы прочитать те же данные в формате Parquet, снова используя функцию url для чтения удаленных данных:

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

:::note Null keys with Parquet
В соответствии с условием формата Parquet, мы должны принять, что ключи могут быть `NULL`,
даже если их нет в данных.
:::

Выполните следующую команду, чтобы просмотреть выведенную схему:

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

Как и в случае с CSV-файлом, вы можете вручную указать схему для большей контроля над выбранными типами и вставить
данные непосредственно из s3:

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

### Добавление индекса пропуска для ускорения запросов {#add-skipping-index}

Чтобы узнать, сколько комментариев упоминает "ClickHouse", выполните следующий запрос:

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

Далее вы создадите инвертированный [индекс](/engines/table-engines/mergetree-family/invertedindexes) на колонне "comment"
для ускорения этого запроса.
Обратите внимание, что комментарии в нижнем регистре будут индексироваться для поиска терминов независимо от регистра.

Выполните следующие команды для создания индекса:

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```

Материализация индекса занимает некоторое время (чтобы проверить, был ли создан индекс, используйте системную таблицу `system.data_skipping_indices`).

Выполните запрос снова, как только индекс будет создан:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

Обратите внимание, что выполнение запроса теперь заняло всего 0.248 секунд с индексом, уменьшившись с 0.843 секунд ранее без него:

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

Клаузула [`EXPLAIN`](/sql-reference/statements/explain) может быть использована, чтобы понять, почему добавление этого индекса
улучшило запрос примерно в 3.4 раза.

```response text="Query"
EXPLAIN indexes = 1
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

```response title="Response"
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

Обратите внимание, как индекс позволил пропустить значительное количество гранул
для ускорения запроса.

Теперь также можно эффективно искать один или все из нескольких терминов:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);
```

```response title="Response"
┌─count()─┐
│    2177 │
└─────────┘
```

```sql title="Query"
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
