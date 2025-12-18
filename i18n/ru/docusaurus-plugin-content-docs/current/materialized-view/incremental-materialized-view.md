---
slug: /materialized-view/incremental-materialized-view
title: 'Incremental materialized view'
description: 'Как использовать incremental materialized views для ускорения выполнения запросов'
keywords: ['incremental materialized views', 'ускорение запросов', 'оптимизация запросов']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';


## Общие сведения {#background}

Incremental Materialized Views (Materialized Views) позволяют перенести вычислительные затраты с момента выполнения запроса на момент вставки данных, что приводит к более быстрым `SELECT`‑запросам.

В отличие от транзакционных баз данных, таких как Postgres, materialized view в ClickHouse — это по сути триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результат этого запроса вставляется во вторую «целевую» таблицу. При вставке новых строк результаты снова записываются в целевую таблицу, где промежуточные результаты обновляются и сливаются. Этот объединённый результат эквивалентен запуску запроса над всеми исходными данными.

Основной мотив использования Materialized Views состоит в том, что результаты, вставляемые в целевую таблицу, представляют собой итог агрегации, фильтрации или трансформации строк. Часто эти результаты являются более компактным представлением исходных данных (частичным приближением в случае агрегаций). Это, вместе с тем, что запрос для чтения результатов из целевой таблицы получается простым, обеспечивает более быстрое выполнение запросов по сравнению с выполнением тех же вычислений над исходными данными, перенося вычисления (и, следовательно, задержку выполнения запроса) с момента выполнения запроса на момент вставки данных.

Materialized views в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на основе которой они построены, и работают скорее как постоянно обновляющиеся индексы. Это отличается от других баз данных, где Materialized Views, как правило, представляют собой статичные снимки результата запроса, которые необходимо периодически обновлять (аналогично ClickHouse [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)).

<Image img={materializedViewDiagram} size="md" alt="Схема materialized view"/>

## Пример {#example}

В качестве примера мы будем использовать набор данных Stack Overflow, описанный в разделе [«Проектирование схемы»](/data-modeling/schema-design).

Предположим, необходимо получить количество голосов «за» и «против» по дням для публикации.

```sql
CREATE TABLE votes
(
    `Id` UInt32,
    `PostId` Int32,
    `VoteTypeId` UInt8,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `BountyAmount` UInt8
)
ENGINE = MergeTree
ORDER BY (VoteTypeId, CreationDate, PostId)

INSERT INTO votes SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 29.359 sec. Processed 238.98 million rows, 2.13 GB (8.14 million rows/s., 72.45 MB/s.)
```

Это довольно простой запрос в ClickHouse благодаря использованию функции [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay):

```sql
SELECT toStartOfDay(CreationDate) AS day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY day
ORDER BY day ASC
LIMIT 10

┌─────────────────day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 00:00:00 │       6 │         0 │
│ 2008-08-01 00:00:00 │     182 │        50 │
│ 2008-08-02 00:00:00 │     436 │       107 │
│ 2008-08-03 00:00:00 │     564 │       100 │
│ 2008-08-04 00:00:00 │    1306 │       259 │
│ 2008-08-05 00:00:00 │    1368 │       269 │
│ 2008-08-06 00:00:00 │    1701 │       211 │
│ 2008-08-07 00:00:00 │    1544 │       211 │
│ 2008-08-08 00:00:00 │    1241 │       212 │
│ 2008-08-09 00:00:00 │     576 │        46 │
└─────────────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.133 sec. Processed 238.98 million rows, 2.15 GB (1.79 billion rows/s., 16.14 GB/s.)
Peak memory usage: 363.22 MiB.
```

Этот запрос уже выполняется быстро благодаря ClickHouse, но можем ли мы сделать его ещё быстрее?

Если мы хотим выполнять эти вычисления на этапе вставки с использованием materialized view, нам нужна таблица для приёма результатов. В этой таблице должна храниться только одна строка на день. Если для уже существующего дня поступает обновление, остальные столбцы должны быть объединены с существующей строкой этого дня. Чтобы такое слияние инкрементальных состояний было возможно, для остальных столбцов необходимо хранить частичные состояния.

Для этого в ClickHouse требуется специальный табличный движок: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммы значений для числовых столбцов. Следующая таблица будет объединять все строки с одинаковой датой, суммируя все числовые столбцы:

```sql
CREATE TABLE up_down_votes_per_day
(
  `Day` Date,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
ENGINE = SummingMergeTree
ORDER BY Day
```

Чтобы продемонстрировать нашу materialized view, предположим, что таблица `votes` пуста и в неё ещё не было записано ни одной строки. Наша materialized view выполняет приведённый выше запрос `SELECT` при вставке данных в `votes`, а результаты записываются в `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

Клауза `TO` здесь ключевая: она определяет, куда будут отправлены результаты — в `up_down_votes_per_day`.

Мы можем заново заполнить таблицу голосов, используя ранее выполненную вставку:


```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

По завершении мы можем проверить размер таблицы `up_down_votes_per_day`: в ней должна быть по одной строке на каждый день.

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

Мы фактически сократили количество строк с 238 миллионов (в `votes`) до 5000, сохранив результат нашего запроса. Важно, однако, что при вставке новых голосов в таблицу `votes` новые значения будут попадать в `up_down_votes_per_day` для соответствующего дня, где они будут автоматически асинхронно объединяться в фоновом режиме — при этом сохраняется только одна строка в день. Таким образом, `up_down_votes_per_day` всегда будет и небольшой по размеру, и актуальной.

Поскольку объединение строк происходит асинхронно, на момент выполнения запроса пользователем в таблице может существовать более одной строки на день. Чтобы гарантировать, что все ещё не объединённые строки будут учтены во время выполнения запроса, у нас есть два варианта:

* Использовать модификатор `FINAL` в имени таблицы в запросе. Мы делали это для запроса COUNT выше.
* Агрегировать по ключу сортировки, используемому в нашей итоговой таблице, то есть `CreationDate`, и суммировать метрики. Обычно это более эффективно и гибко (таблицу можно использовать и для других целей), но первый вариант может быть проще для некоторых запросов. Ниже мы показываем оба подхода:

```sql
SELECT
        Day,
        UpVotes,
        DownVotes
FROM up_down_votes_per_day
FINAL
ORDER BY Day ASC
LIMIT 10

10 rows in set. Elapsed: 0.004 sec. Processed 8.97 thousand rows, 89.68 KB (2.09 million rows/s., 20.89 MB/s.)
Peak memory usage: 289.75 KiB.

SELECT Day, sum(UpVotes) AS UpVotes, sum(DownVotes) AS DownVotes
FROM up_down_votes_per_day
GROUP BY Day
ORDER BY Day ASC
LIMIT 10
┌────────Day─┬─UpVotes─┬─DownVotes─┐
│ 2008-07-31 │       6 │         0 │
│ 2008-08-01 │     182 │        50 │
│ 2008-08-02 │     436 │       107 │
│ 2008-08-03 │     564 │       100 │
│ 2008-08-04 │    1306 │       259 │
│ 2008-08-05 │    1368 │       269 │
│ 2008-08-06 │    1701 │       211 │
│ 2008-08-07 │    1544 │       211 │
│ 2008-08-08 │    1241 │       212 │
│ 2008-08-09 │     576 │        46 │
└────────────┴─────────┴───────────┘

10 rows in set. Elapsed: 0.010 sec. Processed 8.97 thousand rows, 89.68 KB (907.32 thousand rows/s., 9.07 MB/s.)
Peak memory usage: 567.61 KiB.
```

Это ускорило наш запрос с 0,133 с до 0,004 с — более чем в 25 раз!

:::important Важно: `ORDER BY` = `GROUP BY`
В большинстве случаев столбцы, используемые в предложении `GROUP BY` в преобразовании materialized view, должны соответствовать столбцам, используемым в предложении `ORDER BY` целевой таблицы при использовании движков таблиц `SummingMergeTree` или `AggregatingMergeTree`. Эти движки полагаются на столбцы `ORDER BY` для слияния строк с идентичными значениями во время фоновых операций слияния. Несоответствие между столбцами `GROUP BY` и `ORDER BY` может привести к неэффективному выполнению запросов, неоптимальным слияниям или даже к расхождениям в данных.
:::


### Более сложный пример {#a-more-complex-example}

Приведённый выше пример использует Materialized Views для вычисления и поддержки двух сумм в день. Суммы представляют собой простейшую форму агрегации для поддержания частичных состояний — мы можем просто добавлять новые значения к существующим по мере их поступления. Однако Materialized Views в ClickHouse могут использоваться для любого типа агрегации.

Предположим, мы хотим вычислить некоторые статистические показатели по постам за каждый день: 99.9-й перцентиль для `Score` и среднее значение `CommentCount`. Запрос для их вычисления может выглядеть так:

```sql
SELECT
        toStartOfDay(CreationDate) AS Day,
        quantile(0.999)(Score) AS Score_99th,
        avg(CommentCount) AS AvgCommentCount
FROM posts
GROUP BY Day
ORDER BY Day DESC
LIMIT 10

┌─────────────────Day─┬────────Score_99th─┬────AvgCommentCount─┐
│ 2024-03-31 00:00:00 │  5.23700000000008 │ 1.3429811866859624 │
│ 2024-03-30 00:00:00 │                 5 │ 1.3097158891616976 │
│ 2024-03-29 00:00:00 │  5.78899999999976 │ 1.2827635327635327 │
│ 2024-03-28 00:00:00 │                 7 │  1.277746158224246 │
│ 2024-03-27 00:00:00 │ 5.738999999999578 │ 1.2113264918282023 │
│ 2024-03-26 00:00:00 │                 6 │ 1.3097536945812809 │
│ 2024-03-25 00:00:00 │                 6 │ 1.2836721018539201 │
│ 2024-03-24 00:00:00 │ 5.278999999999996 │ 1.2931667891256429 │
│ 2024-03-23 00:00:00 │ 6.253000000000156 │  1.334061135371179 │
│ 2024-03-22 00:00:00 │ 9.310999999999694 │ 1.2388059701492538 │
└─────────────────────┴───────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.113 sec. Processed 59.82 million rows, 777.65 MB (528.48 million rows/s., 6.87 GB/s.)
Peak memory usage: 658.84 MiB.
```

Как и раньше, мы можем создать materialized view, который будет выполнять приведённый выше запрос по мере вставки новых постов в нашу таблицу `posts`.

В рамках примера и чтобы избежать загрузки данных постов из S3, мы создадим дублирующую таблицу `posts_null` с той же схемой, что и у `posts`. Однако эта таблица не будет хранить какие-либо данные и будет использоваться materialized view только в момент вставки строк. Чтобы избежать хранения данных, мы можем использовать [тип движка таблицы `Null`](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Движок таблицы Null — это мощная оптимизация, по сути, аналог `/dev/null`. Наш materialized view будет вычислять и сохранять сводную статистику, когда таблица `posts_null` получает строки при вставке — это всего лишь триггер. Однако «сырые» данные сохраняться не будут. Хотя в нашем случае мы, вероятно, всё же хотим сохранять исходные посты, такой подход можно использовать для вычисления агрегатов, избегая накладных расходов на хранение сырых данных.

Таким образом, materialized view становится:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Обратите внимание, что мы добавляем суффикс `State` к названиям наших агрегатных функций. Это гарантирует, что будет возвращено агрегированное состояние функции, а не окончательный результат. Оно будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями. Например, в случае вычисления среднего оно будет включать количество и сумму по столбцу.

> Частичные состояния агрегации необходимы для вычисления корректных результатов. Например, при вычислении среднего простое усреднение средних по поддиапазонам даёт некорректные результаты.

Теперь создадим целевую таблицу для этого представления `post_stats_per_day`, которая хранит эти частичные состояния агрегации:


```sql
CREATE TABLE post_stats_per_day
(
  `Day` Date,
  `Score_quantiles` AggregateFunction(quantile(0.999), Int32),
  `AvgCommentCount` AggregateFunction(avg, UInt8)
)
ENGINE = AggregatingMergeTree
ORDER BY Day
```

Хотя ранее для сохранения счетчиков было достаточно `SummingMergeTree`, для других функций нам требуется более продвинутый тип движка: [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
Чтобы ClickHouse знал, что будут храниться состояния агрегатных функций, мы определяем `Score_quantiles` и `AvgCommentCount` как столбцы типа `AggregateFunction`, указывая исходную функцию для частичных состояний и тип их исходных столбцов. Как и в случае с `SummingMergeTree`, строки с одинаковым значением ключа `ORDER BY` будут объединяться (в приведенном выше примере — по `Day`).

Чтобы заполнить нашу таблицу `post_stats_per_day` с помощью materialized view, мы можем просто вставить все строки из `posts` в `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> В рабочей (production) среде вы, вероятнее всего, привяжете materialized view к таблице `posts`. Здесь мы использовали `posts_null`, чтобы продемонстрировать null-таблицу.

Наш окончательный запрос должен использовать суффикс `Merge` для наших функций (так как столбцы хранят состояния частичной агрегации):

```sql
SELECT
        Day,
        quantileMerge(0.999)(Score_quantiles),
        avgMerge(AvgCommentCount)
FROM post_stats_per_day
GROUP BY Day
ORDER BY Day DESC
LIMIT 10
```

Обратите внимание, что здесь мы используем `GROUP BY` вместо `FINAL`.


## Другие варианты использования {#other-applications}

Выше основное внимание уделялось использованию Materialized Views для инкрементального обновления частичных агрегатов данных, тем самым перенося вычисления с момента выполнения запроса на момент вставки. Помимо этого распространённого сценария, Materialized Views имеют и ряд других применений.

### Фильтрация и трансформация {#filtering-and-transformation}

В некоторых ситуациях может потребоваться вставлять лишь подмножество строк и столбцов. В этом случае наша таблица `posts_null` может принимать вставки, а запрос `SELECT` будет фильтровать строки перед вставкой в таблицу `posts`. Например, предположим, что мы хотим трансформировать столбец `Tags` в таблице `posts`. Этот столбец содержит список имён тегов, разделённых символом вертикальной черты. Преобразовав его в массив, мы сможем проще выполнять агрегацию по отдельным значениям тегов.

> Мы могли бы выполнить эту трансформацию при выполнении `INSERT INTO SELECT`. materialized view позволяет инкапсулировать эту логику в ClickHouse DDL и упростить наш `INSERT`, применяя трансформацию ко всем новым строкам.

Наш materialized view для этой трансформации показан ниже:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```


### Таблица поиска {#lookup-table}

При выборе ключа сортировки ClickHouse следует учитывать характер доступа к данным. В ключ стоит включать столбцы, которые часто используются в условиях фильтрации и агрегации. Это может накладывать ограничения в сценариях, когда пользователи имеют более разнообразные шаблоны доступа, которые нельзя выразить одним набором столбцов. Например, рассмотрим следующую таблицу `comments`:

```sql
CREATE TABLE comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY PostId

0 rows in set. Elapsed: 46.357 sec. Processed 90.38 million rows, 11.14 GB (1.95 million rows/s., 240.22 MB/s.)
```

Ключ сортировки в данном случае оптимизирует таблицу для запросов, которые фильтруют по `PostId`.

Предположим, пользователь хочет отфильтровать по конкретному `UserId` и вычислить его средний `Score`:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.778 sec. Processed 90.38 million rows, 361.59 MB (116.16 million rows/s., 464.74 MB/s.)
Peak memory usage: 217.08 MiB.
```

Хотя запрос выполняется быстро (данные небольшие для ClickHouse), по числу обработанных строк — 90,38 миллиона — видно, что требуется полное сканирование таблицы. Для более крупных наборов данных мы можем использовать materialized view, чтобы получать значения нашего ключа упорядочивания `PostId` для фильтрации по столбцу `UserId`. Эти значения затем можно использовать для эффективного поиска.

В этом примере наша materialized view может быть очень простой: при вставке она выбирает только `PostId` и `UserId` из `comments`. Эти результаты, в свою очередь, отправляются в таблицу `comments_posts_users`, которая упорядочена по `UserId`. Ниже мы создаём пустую (без данных) версию таблицы `Comments` и используем её для заполнения нашей materialized view и таблицы `comments_posts_users`:

```sql
CREATE TABLE comments_posts_users (
  PostId UInt32,
  UserId Int32
) ENGINE = MergeTree ORDER BY UserId

CREATE TABLE comments_null AS comments
ENGINE = Null

CREATE MATERIALIZED VIEW comments_posts_users_mv TO comments_posts_users AS
SELECT PostId, UserId FROM comments_null

INSERT INTO comments_null SELECT * FROM comments

0 rows in set. Elapsed: 5.163 sec. Processed 90.38 million rows, 17.25 GB (17.51 million rows/s., 3.34 GB/s.)
```

Теперь мы можем использовать это представление во вложенном запросе, чтобы ускорить предыдущий запрос:

```sql
SELECT avg(Score)
FROM comments
WHERE PostId IN (
        SELECT PostId
        FROM comments_posts_users
        WHERE UserId = 8592047
) AND UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 88.61 thousand rows, 771.37 KB (7.09 million rows/s., 61.73 MB/s.)
```


### Связывание / каскадирование materialized views {#chaining}

Materialized views можно связывать (или каскадировать), что позволяет выстраивать сложные конвейеры обработки.
Для получения дополнительной информации см. руководство ["Cascading materialized views"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views).

## Materialized views и JOIN {#materialized-views-and-joins}

:::note Refreshable Materialized Views
Следующее относится только к Incremental Materialized Views. Refreshable Materialized Views периодически выполняют свой запрос над всем целевым набором данных и полностью поддерживают JOIN. Рассмотрите возможность их использования для сложных JOIN, если допустимо снижение актуальности результатов.
:::

Incremental materialized views в ClickHouse полностью поддерживают операции `JOIN`, но с одним критически важным ограничением: **materialized view срабатывает только при вставках в исходную таблицу (самую левую таблицу в запросе).** Таблицы справа в JOIN не инициируют обновления, даже если их данные меняются. Это поведение особенно важно при построении **Incremental** materialized views, где данные агрегируются или трансформируются на этапе вставки.

Когда Incremental materialized view определяется с использованием `JOIN`, самая левая таблица в запросе `SELECT` выступает в роли источника. При вставке новых строк в эту таблицу ClickHouse выполняет запрос materialized view *только* для этих вновь вставленных строк. Таблицы справа в JOIN полностью читаются во время этого выполнения, но изменения только в них не приводят к срабатыванию представления.

Такое поведение делает JOIN в materialized views аналогичным snapshot JOIN по статическим данным измерений. 

Это хорошо подходит для обогащения данных с помощью справочных или dimension-таблиц. Однако любые обновления таблиц справа (например, пользовательских метаданных) не будут задним числом обновлять materialized view. Чтобы увидеть обновлённые данные, в исходную таблицу должны поступить новые вставки.

### Пример {#materialized-views-and-joins-example}

Рассмотрим конкретный пример с использованием [набора данных Stack Overflow](/data-modeling/schema-design). Мы будем использовать materialized view для вычисления **ежедневного числа значков на пользователя**, включая отображаемое имя пользователя из таблицы `users`.

Напомним, схемы наших таблиц следующие:

```sql
CREATE TABLE badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId

CREATE TABLE users
(
    `Id` Int32,
    `Reputation` UInt32,
    `CreationDate` DateTime64(3, 'UTC'),
    `DisplayName` LowCardinality(String),
    `LastAccessDate` DateTime64(3, 'UTC'),
    `Location` LowCardinality(String),
    `Views` UInt32,
    `UpVotes` UInt32,
    `DownVotes` UInt32
)
ENGINE = MergeTree
ORDER BY Id;
```

Предположим, что таблица `users` уже заполнена:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

materialized view и связанная с ней целевая таблица определены следующим образом:

```sql
CREATE TABLE daily_badges_by_user
(
    Day Date,
    UserId Int32,
    DisplayName LowCardinality(String),
    Gold UInt32,
    Silver UInt32,
    Bronze UInt32
)
ENGINE = SummingMergeTree
ORDER BY (DisplayName, UserId, Day);

CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user AS
SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

:::note Согласование группировки и сортировки
Оператор `GROUP BY` в materialized view должен включать `DisplayName`, `UserId` и `Day`, чтобы соответствовать `ORDER BY` в целевой таблице на `SummingMergeTree`. Это гарантирует, что строки корректно агрегируются и сливаются. Пропуск любого из этих полей может привести к неверным результатам или неэффективным слияниям.
:::

Если теперь назначить бейджи, представление сработает и заполнит нашу таблицу `daily_badges_by_user`.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

Предположим, что мы хотим просмотреть значки, полученные конкретным пользователем; для этого можно написать следующий запрос:


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'

┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

8 rows in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 642.14 KB (1.86 million rows/s., 36.44 MB/s.)
```

Теперь, если этот пользователь получит новый бейдж и будет вставлена новая строка, наше материализованное представление будет обновлено:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'gingerwizard'
┌────────Day─┬──UserId─┬─DisplayName──┬─Gold─┬─Silver─┬─Bronze─┐
│ 2013-10-30 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2013-11-18 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-27 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-02-28 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-04-17 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2023-10-31 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2024-03-04 │ 2936484 │ gingerwizard │    0 │      1 │      0 │
│ 2024-03-05 │ 2936484 │ gingerwizard │    0 │      0 │      1 │
│ 2025-04-13 │ 2936484 │ gingerwizard │    1 │      0 │      0 │
└────────────┴─────────┴──────────────┴──────┴────────┴────────┘

9 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 642.27 KB (1.96 million rows/s., 38.50 MB/s.)
```

:::warning
Обратите внимание на задержку операции вставки. Вставленная строка пользователя соединяется со всей таблицей `users`, что существенно снижает производительность вставки. Ниже мы предлагаем подходы к решению этой проблемы в разделе [&quot;Использование исходной таблицы в фильтрах и соединениях&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::

В обратной ситуации, если мы сначала вставим бейдж для нового пользователя, а затем строку для этого пользователя, наша materialized view не сможет корректно зафиксировать метрики пользователей.

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

В этом случае представление выполняется только при вставке значка, до того как будет создана строка пользователя. Если мы вставим для этого пользователя ещё один значок, будет добавлена строка, как и должно быть:

```sql
INSERT INTO badges VALUES (53505060, 23923286, 'Teacher', now(), 'Bronze', 0);

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user'

┌────────Day─┬───UserId─┬─DisplayName────┬─Gold─┬─Silver─┬─Bronze─┐
│ 2025-04-13 │ 23923286 │ brand_new_user │    0 │      0 │      1 │
└────────────┴──────────┴────────────────┴──────┴────────┴────────┘

1 row in set. Elapsed: 0.018 sec. Processed 32.77 thousand rows, 644.48 KB (1.87 million rows/s., 36.72 MB/s.)
```

Однако учтите, что этот результат некорректен.


### Рекомендации по использованию JOIN в materialized views {#join-best-practices}

- **Используйте левую таблицу как триггер.** Только таблица слева в операторе `SELECT` инициирует обновление materialized view. Изменения в таблицах справа не приводят к его обновлению.

- **Предварительно вставляйте данные для JOIN.** Убедитесь, что данные в присоединяемых таблицах уже существуют до вставки строк в исходную таблицу. JOIN вычисляется во время вставки, поэтому отсутствие данных приведёт к строкам без совпадений или значениям null.

- **Ограничивайте столбцы, выбираемые из JOIN.** Выбирайте только необходимые столбцы из присоединяемых таблиц, чтобы минимизировать использование памяти и сократить задержку при вставке (см. ниже).

- **Оценивайте производительность вставок.** JOIN увеличивает стоимость вставок, особенно при больших правых таблицах. Проведите бенчмарки скоростей вставки на репрезентативных production‑данных.

- **Предпочитайте словари для простых поисков.** Используйте [Dictionaries](/dictionary) для key‑value‑поиска (например, сопоставление ID пользователя и имени), чтобы избежать дорогостоящих операций JOIN.

- **Согласуйте `GROUP BY` и `ORDER BY` для эффективного слияния.** При использовании `SummingMergeTree` или `AggregatingMergeTree` убедитесь, что `GROUP BY` соответствует выражению `ORDER BY` в целевой таблице, чтобы обеспечить эффективное слияние строк.

- **Используйте явные псевдонимы столбцов.** Когда в таблицах есть пересекающиеся имена столбцов, используйте псевдонимы, чтобы избежать неоднозначности и гарантировать корректные результаты в целевой таблице.

- **Учитывайте объём и частоту вставок.** JOIN хорошо работает при умеренных нагрузках вставок. Для высокопроизводительной ингестии рассмотрите использование промежуточных (staging) таблиц, предварительных JOIN или других подходов, таких как Dictionaries и [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view).

### Использование исходной таблицы в фильтрах и JOIN-ах {#using-source-table-in-filters-and-joins-in-materialized-views}

При работе с Materialized Views в ClickHouse важно понимать, как исходная таблица обрабатывается при выполнении запроса materialized view. В частности, исходная таблица в запросе materialized view заменяется на вставляемый блок данных. Такое поведение может приводить к неожиданным результатам, если его не учитывать должным образом.

#### Пример сценария {#example-scenario}

Рассмотрим следующую схему:

```sql
CREATE TABLE t0 (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw1_inner (`c0` Int) ENGINE = Memory;
CREATE TABLE mvw2_inner (`c0` Int) ENGINE = Memory;

CREATE VIEW vt0 AS SELECT * FROM t0;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN ( SELECT * FROM t0 ) AS x ON t0.c0 = x.c0;

CREATE MATERIALIZED VIEW mvw2 TO mvw2_inner
AS SELECT count(*) AS c0
    FROM t0
    LEFT JOIN vt0 ON t0.c0 = vt0.c0;

INSERT INTO t0 VALUES (1),(2),(3);

INSERT INTO t0 VALUES (1),(2),(3),(4),(5);

SELECT * FROM mvw1;
┌─c0─┐
│  3 │
│  5 │
└────┘

SELECT * FROM mvw2;
┌─c0─┐
│  3 │
│  8 │
└────┘
```


#### Пояснение {#explanation}

В приведённом выше примере у нас есть две materialized view `mvw1` и `mvw2`, которые выполняют схожие операции, но с небольшим различием в том, как они обращаются к исходной таблице `t0`.

В `mvw1` таблица `t0` напрямую используется внутри подзапроса `(SELECT * FROM t0)` в правой части оператора JOIN. Когда данные вставляются в `t0`, запрос materialized view выполняется с вставленным блоком данных, подставленным вместо `t0`. Это означает, что операция JOIN выполняется только над вновь вставленными строками, а не над всей таблицей.

Во втором случае, при соединении с `vt0`, представление считывает все данные из `t0`. Это гарантирует, что операция JOIN учитывает все строки в `t0`, а не только недавно вставленный блок.

Ключевое различие заключается в том, как ClickHouse обрабатывает исходную таблицу в запросе materialized view. Когда materialized view срабатывает при вставке данных, исходная таблица (в данном случае `t0`) заменяется вставленным блоком данных. Такое поведение можно использовать для оптимизации запросов, но оно также требует внимательного учета, чтобы избежать неожиданных результатов.

### Сценарии использования и ограничения {#use-cases-and-caveats}

На практике вы можете использовать это поведение для оптимизации materialized views, которым нужно обрабатывать только часть данных исходной таблицы. Например, вы можете использовать подзапрос, чтобы отфильтровать исходную таблицу перед объединением её с другими таблицами. Это может сократить объём данных, обрабатываемых materialized view, и повысить производительность.

```sql
CREATE TABLE t0 (id UInt32, value String) ENGINE = MergeTree() ORDER BY id;
CREATE TABLE t1 (id UInt32, description String) ENGINE = MergeTree() ORDER BY id;
INSERT INTO t1 VALUES (1, 'A'), (2, 'B'), (3, 'C');

CREATE TABLE mvw1_target_table (id UInt32, value String, description String) ENGINE = MergeTree() ORDER BY id;

CREATE MATERIALIZED VIEW mvw1 TO mvw1_target_table AS
SELECT t0.id, t0.value, t1.description
FROM t0
JOIN (SELECT * FROM t1 WHERE t1.id IN (SELECT id FROM t0)) AS t1
ON t0.id = t1.id;
```

В этом примере множество, построенное из подзапроса `IN (SELECT id FROM t0)`, содержит только вновь вставленные строки, что позволяет использовать его для фильтрации `t1`.


#### Пример со Stack Overflow {#example-with-stack-overflow}

Рассмотрим наш [предыдущий пример materialized view](/materialized-view/incremental-materialized-view#example) для вычисления **ежедневных значков для каждого пользователя**, включая отображаемое имя пользователя из таблицы `users`.

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN users AS u ON b.UserId = u.Id
GROUP BY Day, b.UserId, u.DisplayName;
```

Это представление существенно влияло на задержку вставки в таблицу `badges`, например:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

Используя описанный выше подход, мы можем оптимизировать это представление. Добавим фильтр к таблице `users`, используя идентификаторы пользователей из вставленных строк с бейджами:

```sql
CREATE MATERIALIZED VIEW daily_badges_by_user_mv TO daily_badges_by_user
AS SELECT
    toDate(Date) AS Day,
    b.UserId,
    u.DisplayName,
    countIf(Class = 'Gold') AS Gold,
    countIf(Class = 'Silver') AS Silver,
    countIf(Class = 'Bronze') AS Bronze
FROM badges AS b
LEFT JOIN
(
    SELECT
        Id,
        DisplayName
    FROM users
    WHERE Id IN (
        SELECT UserId
        FROM badges
    )
) AS u ON b.UserId = u.Id
GROUP BY
    Day,
    b.UserId,
    u.DisplayName
```

Это не только ускоряет первоначальную вставку данных в таблицу `badges`:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

Но это также означает, что последующие вставки бейджей будут выполняться эффективно:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

В указанной выше операции из таблицы `users` извлекается только одна строка для идентификатора пользователя `2936484`. Этот запрос также оптимизирован за счёт использования ключа сортировки таблицы `Id`.


## materialized view и объединения {#materialized-views-and-unions}

Запросы с `UNION ALL` обычно используются для объединения данных из нескольких исходных таблиц в один результирующий набор.

Хотя `UNION ALL` напрямую не поддерживается в incremental materialized view, вы можете добиться того же результата, создав отдельную materialized view для каждой ветки `SELECT` и записывая их результаты в общую целевую таблицу.

В нашем примере мы будем использовать набор данных Stack Overflow. Рассмотрим таблицы `badges` и `comments` ниже, которые представляют награды, полученные пользователем, и комментарии, которые он оставляет к постам:

```sql
CREATE TABLE stackoverflow.comments
(
    `Id` UInt32,
    `PostId` UInt32,
    `Score` UInt16,
    `Text` String,
    `CreationDate` DateTime64(3, 'UTC'),
    `UserId` Int32,
    `UserDisplayName` LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY CreationDate

CREATE TABLE stackoverflow.badges
(
    `Id` UInt32,
    `UserId` Int32,
    `Name` LowCardinality(String),
    `Date` DateTime64(3, 'UTC'),
    `Class` Enum8('Gold' = 1, 'Silver' = 2, 'Bronze' = 3),
    `TagBased` Bool
)
ENGINE = MergeTree
ORDER BY UserId
```

Их можно заполнить с помощью следующих команд `INSERT INTO`:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

Предположим, что мы хотим создать единое представление активности пользователей, в котором для каждого пользователя будет показана его последняя активность, объединив эти две таблицы:

```sql
SELECT
 UserId,
 argMax(description, event_time) AS last_description,
 argMax(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
LIMIT 10
```

Предположим, у нас есть целевая таблица для записи результатов этого запроса. Обратите внимание на использование движка таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) и типа [AggregateFunction](/sql-reference/data-types/aggregatefunction), чтобы обеспечить корректное объединение результатов:

```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId
```

Поскольку мы хотим, чтобы эта таблица обновлялась по мере вставки новых строк в `badges` или `comments`, наивным подходом к решению этой задачи может быть попытка создать materialized view на основе предыдущего запроса с UNION:

```sql
CREATE MATERIALIZED VIEW user_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(description, event_time) AS last_description,
 argMaxState(activity_type, event_time) AS activity_type,
    max(event_time) AS last_activity
FROM
(
    SELECT
 UserId,
 CreationDate AS event_time,
        Text AS description,
        'comment' AS activity_type
    FROM stackoverflow.comments
    UNION ALL
    SELECT
 UserId,
        Date AS event_time,
        Name AS description,
        'badge' AS activity_type
    FROM stackoverflow.badges
)
GROUP BY UserId
ORDER BY last_activity DESC
```

Хотя это синтаксически корректно, оно приведёт к результатам, отличающимся от ожидаемых — представление будет срабатывать только на вставки в таблицу `comments`. Например:


```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

INSERT-запросы в таблицу `badges` не будут приводить к срабатыванию представления, поэтому `user_activity` не будет получать обновления:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

Чтобы решить эту задачу, достаточно создать отдельную materialized view для каждого запроса SELECT:

```sql
DROP TABLE user_activity_mv;
TRUNCATE TABLE user_activity;

CREATE MATERIALIZED VIEW comment_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Text, CreationDate) AS last_description,
 argMaxState('comment', CreationDate) AS activity_type,
    max(CreationDate) AS last_activity
FROM stackoverflow.comments
GROUP BY UserId;

CREATE MATERIALIZED VIEW badges_activity_mv TO user_activity AS
SELECT
 UserId,
 argMaxState(Name, Date) AS last_description,
 argMaxState('badge', Date) AS activity_type,
    max(Date) AS last_activity
FROM stackoverflow.badges
GROUP BY UserId;
```

Теперь вставка в любую из таблиц даёт корректный результат. Например, если мы выполним INSERT в таблицу `comments`:

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'The answer is 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

Аналогично, операции вставки в таблицу `badges` отражаются в таблице `user_activity`:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```


## Параллельная и последовательная обработка {#materialized-views-parallel-vs-sequential}

Как показано в предыдущем примере, таблица может служить источником для нескольких materialized view. Порядок их выполнения зависит от настройки [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing).

По умолчанию эта настройка имеет значение `0` (`false`), что означает, что materialized view выполняются последовательно в порядке их `uuid`.

Например, рассмотрим следующую исходную таблицу `source` и три materialized view, каждая из которых отправляет строки в таблицу `target`:

```sql
CREATE TABLE source
(
    `message` String
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE TABLE target
(
    `message` String,
    `from` String,
    `now` DateTime64(9),
    `sleep` UInt8
)
ENGINE = MergeTree
ORDER BY tuple();

CREATE MATERIALIZED VIEW mv_2 TO target
AS SELECT
    message,
    'mv2' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_3 TO target
AS SELECT
    message,
    'mv3' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;

CREATE MATERIALIZED VIEW mv_1 TO target
AS SELECT
    message,
    'mv1' AS from,
    now64(9) as now,
    sleep(1) as sleep
FROM source;
```

Обратите внимание, что каждое из представлений делает паузу в 1 секунду перед вставкой своих строк в таблицу `target`, при этом добавляя своё имя и время вставки.

Вставка строки в таблицу `source` занимает примерно 3 секунды, причём каждое представление выполняется последовательно:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

Мы можем проверить поступление строк с помощью запроса `SELECT`:

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

Это совпадает с `uuid` представлений:

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

Напротив, рассмотрим, что происходит, если мы вставим строку с включённым `parallel_view_processing=1`. При таком режиме представления выполняются параллельно, и порядок поступления строк в целевую таблицу никак не гарантируется:

```sql
TRUNCATE target;
SET parallel_view_processing = 1;

INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 1.588 sec.

SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```


Хотя в нашем случае порядок поступления строк из каждого представления одинаковый, это не гарантировано — что видно по близким значениям времени вставки каждой строки. Также обратите внимание на улучшенную производительность вставки.

### Когда использовать параллельную обработку {#materialized-views-when-to-use-parallel}

Включение `parallel_view_processing=1` может значительно повысить пропускную способность вставок, как показано выше, особенно когда к одной таблице привязано несколько Materialized Views. Однако важно понимать сопутствующие компромиссы:

- **Повышенная нагрузка при вставке**: Все Materialized Views выполняются одновременно, увеличивая использование CPU и памяти. Если каждый view выполняет тяжелые вычисления или JOIN, это может перегрузить систему.
- **Необходимость строгого порядка выполнения**: В редких сценариях, где порядок выполнения view имеет значение (например, при цепочках зависимостей), параллельное выполнение может приводить к неконсистентному состоянию или состояниям гонки. Хотя можно спроектировать систему с учетом этого, такие конфигурации хрупкие и могут перестать корректно работать в будущих версиях.

:::note Historical defaults and stability
Последовательное выполнение долгое время было значением по умолчанию, в том числе из‑за сложности обработки ошибок. Ранее сбой в одном materialized view мог помешать выполнению других. В новых версиях это улучшено за счет изоляции сбоев на уровне блока, но последовательное выполнение по‑прежнему обеспечивает более понятную семантику ошибок.
:::

В целом, включайте `parallel_view_processing=1`, когда:

- У вас есть несколько независимых Materialized Views
- Вы стремитесь максимизировать производительность вставок
- Вы понимаете, что система способна выдержать параллельное выполнение view

Оставляйте его выключенным, когда:

- Между Materialized Views существуют взаимные зависимости
- Вам требуется предсказуемое, упорядоченное выполнение
- Вы отлаживаете или аудируете поведение вставок и хотите детерминированное воспроизведение

## materialized view и общие табличные выражения (CTE) {#materialized-views-common-table-expressions-ctes}

**Нерекурсивные** общие табличные выражения (CTE) поддерживаются в materialized view.

:::note Common Table Expressions **не материализуются**
ClickHouse не материализует CTE; вместо этого он подставляет определение CTE непосредственно в запрос, что может приводить к многократному вычислению одного и того же выражения (если CTE используется более одного раза).
:::

Рассмотрим следующий пример, который вычисляет дневную активность для каждого типа поста.

```sql
CREATE TABLE daily_post_activity
(
    Day Date,
 PostType String,
 PostsCreated SimpleAggregateFunction(sum, UInt64),
 AvgScore AggregateFunction(avg, Int32),
 TotalViews SimpleAggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Day, PostType);

CREATE MATERIALIZED VIEW daily_post_activity_mv TO daily_post_activity AS
WITH filtered_posts AS (
    SELECT
 toDate(CreationDate) AS Day,
 PostTypeId,
 Score,
 ViewCount
    FROM posts
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- Question or Answer
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN 'Question'
        WHEN 2 THEN 'Answer'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

Хотя CTE здесь, строго говоря, не обязателен, в качестве примера представление будет работать как ожидается:

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
```

```sql
SELECT
    Day,
    PostType,
    avgMerge(AvgScore) AS AvgScore,
    sum(PostsCreated) AS PostsCreated,
    sum(TotalViews) AS TotalViews
FROM daily_post_activity
GROUP BY
    Day,
    PostType
ORDER BY Day DESC
LIMIT 10

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Question │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Answer   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Answer   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Question │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Question │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Answer   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Answer   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Question │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Question │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Answer   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

В ClickHouse CTE подставляются «на месте», то есть по сути копируются в запрос во время оптимизации и **не** материализуются. Это означает:

* Если ваш CTE ссылается на другую таблицу, отличную от исходной таблицы (то есть той, к которой привязан materialized view), и используется в `JOIN` или `IN` предложении, он будет вести себя как подзапрос или JOIN, а не как триггер.
* materialized view по-прежнему будет срабатывать только при вставках в основную исходную таблицу, но CTE будет выполняться повторно при каждой вставке, что может приводить к дополнительным накладным расходам, особенно если таблица, на которую он ссылается, большая.

Например,


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

В этом случае CTE users пересчитывается при каждом INSERT в posts, и materialized view не будет обновляться при добавлении новых пользователей — только при вставках в posts.

Как правило, используйте CTE для логики, которая работает с той же исходной таблицей, к которой привязана materialized view, или убедитесь, что таблицы, на которые есть ссылки, небольшие и маловероятно станут узким местом по производительности. В качестве альтернативы рассмотрите [те же оптимизации, что и для JOIN с Materialized Views](/materialized-view/incremental-materialized-view#join-best-practices).
