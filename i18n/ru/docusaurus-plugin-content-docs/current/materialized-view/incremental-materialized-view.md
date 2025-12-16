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


## Предпосылки {#background}

Incremental Materialized Views (Materialized Views) позволяют перенести стоимость вычислений с момента выполнения запроса на момент вставки данных, что приводит к более быстрым `SELECT`-запросам.

В отличие от транзакционных баз данных, таких как Postgres, materialized view в ClickHouse по сути является триггером, который запускает запрос над блоками данных по мере их вставки в таблицу. Результат этого запроса вставляется во вторую, «целевую» таблицу. При вставке новых строк результаты снова будут отправлены в целевую таблицу, где промежуточные результаты будут обновляться и сливаться. Этот объединённый результат эквивалентен выполнению запроса над всеми исходными данными.

Основная причина использования Materialized Views заключается в том, что результаты, вставляемые в целевую таблицу, представляют собой итог агрегации, фильтрации или трансформации строк. Эти результаты часто являются более компактным представлением исходных данных (частичным «наброском» в случае агрегаций). Это, вместе с тем, что итоговый запрос для чтения данных из целевой таблицы получается простым, обеспечивает более быстрое выполнение запроса по сравнению с выполнением тех же вычислений над исходными данными, перенося вычисления (и, соответственно, задержку запроса) с момента выполнения запроса на момент вставки.

Materialized views в ClickHouse обновляются в режиме реального времени по мере поступления данных в таблицу, на которой они основаны, и функционируют скорее как постоянно обновляемые индексы. В отличие от этого, в других базах данных Materialized Views обычно являются статичными снимками результата запроса, которые необходимо периодически обновлять (аналогично ClickHouse [Refreshable Materialized Views](/sql-reference/statements/create/view#refreshable-materialized-view)).

<Image img={materializedViewDiagram} size="md" alt="Схема materialized view"/>

## Пример {#example}

В качестве примера мы будем использовать набор данных Stack Overflow, описанный в разделе [&quot;Проектирование схемы&quot;](/data-modeling/schema-design).

Предположим, что мы хотим получить количество голосов &quot;за&quot; и &quot;против&quot; по дням для поста.

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

Это довольно простой запрос в ClickHouse благодаря функции [`toStartOfDay`](/sql-reference/functions/date-time-functions#toStartOfDay):

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

Этот запрос уже выполняется быстро благодаря ClickHouse, но можем ли мы сделать ещё лучше?

Если мы хотим выполнять эти вычисления во время вставки с использованием materialized view, нам нужна таблица для приёма результатов. Эта таблица должна хранить только одну строку в день. Если получено обновление для существующего дня, остальные столбцы должны быть объединены со строкой этого дня. Чтобы произошло такое слияние инкрементальных состояний, для остальных столбцов необходимо хранить частичные состояния.

Для этого в ClickHouse требуется специальный тип движка: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммированные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы:

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

Чтобы продемонстрировать нашу materialized view, предположим, что таблица `votes` пуста и еще не содержит данных. Наша materialized view выполняет указанный выше `SELECT` для данных, вставляемых в `votes`, а результаты записываются в `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

Ключевым здесь является предложение `TO`, которое определяет, куда будут отправляться результаты, т.е. в `up_down_votes_per_day`.

Мы можем повторно заполнить нашу таблицу голосов из ранее выполненной вставки данных:


```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

По завершении мы можем убедиться в размере таблицы `up_down_votes_per_day`: у нас должна быть по одной строке на каждый день.

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

Мы фактически сократили количество строк здесь с 238 миллионов (в `votes`) до 5000, сохранив результат нашего запроса. Однако важно то, что если в таблицу `votes` вставляются новые голоса, новые значения будут отправлены в `up_down_votes_per_day` для соответствующего дня, где они будут автоматически асинхронно объединены в фоновом режиме — останется только одна строка на день. Таким образом, `up_down_votes_per_day` всегда будет и небольшой, и актуальной.

Поскольку объединение строк происходит асинхронно, при выполнении запроса пользователем в таблице может оказаться более одной строки с голосами за день. Чтобы гарантировать, что все оставшиеся строки будут объединены во время выполнения запроса, у нас есть два варианта:

* Использовать модификатор `FINAL` в имени таблицы. Мы сделали это для запроса на подсчёт выше.
* Агрегировать по ключу сортировки, использованному в нашей итоговой таблице, т. е. по `CreationDate`, и суммировать метрики. Обычно это более эффективно и гибко (таблица может использоваться и для других целей), но первый вариант может быть проще для некоторых запросов. Ниже мы показываем оба подхода:

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

Это ускорило наш запрос с 0.133 с до 0.004 с — улучшение более чем в 25 раз!

:::important Важно: `ORDER BY` = `GROUP BY`
В большинстве случаев столбцы, используемые в выражении `GROUP BY` преобразования materialized view, должны соответствовать столбцам, используемым в выражении `ORDER BY` целевой таблицы при использовании движков таблиц `SummingMergeTree` или `AggregatingMergeTree`. Эти движки полагаются на столбцы `ORDER BY` для слияния строк с идентичными значениями во время операций фонового слияния. Несоответствие между столбцами `GROUP BY` и `ORDER BY` может привести к неэффективной производительности запросов, неоптимальным слияниям или даже к расхождениям в данных.
:::


### Более сложный пример {#a-more-complex-example}

В приведённом выше примере используются Materialized Views для вычисления и поддержания двух сумм за каждый день. Суммы представляют собой простейшую форму агрегации для поддержания частичных состояний — мы можем просто добавлять новые значения к существующим по мере их поступления. Однако Materialized Views в ClickHouse могут использоваться для любых типов агрегирования.

Предположим, мы хотим вычислить некоторые статистические показатели по постам за каждый день: 99,9-й перцентиль для `Score` и среднее значение `CommentCount`. Запрос для вычисления этого может выглядеть следующим образом:

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

В рамках этого примера, а также чтобы избежать загрузки данных постов из S3, мы создадим дублирующую таблицу `posts_null` с той же схемой, что и у `posts`. Однако эта таблица не будет хранить данные и будет использоваться materialized view только при вставке строк. Чтобы предотвратить хранение данных, мы можем использовать [тип движка таблицы `Null`](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Движок таблицы Null — это мощная оптимизация: можно думать о нём как о `/dev/null`. Наш materialized view будет вычислять и сохранять сводную статистику, когда таблица `posts_null` получает строки при вставке — это всего лишь триггер. Однако «сырые» данные сохраняться не будут. Хотя в нашем случае мы, вероятно, всё же захотим хранить исходные посты, этот подход можно использовать для вычисления агрегатов без накладных расходов на хранение сырых данных.

Таким образом, materialized view имеет следующий вид:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Обратите внимание, что мы добавляем суффикс `State` к именам наших агрегатных функций. Это гарантирует, что возвращается агрегатное состояние функции, а не окончательный результат. Оно будет содержать дополнительную информацию, которая позволяет впоследствии объединять это частичное состояние с другими состояниями. Например, в случае среднего значения оно будет включать количество и сумму по столбцу.

> Частичные агрегатные состояния необходимы для вычисления корректных результатов. Например, при вычислении среднего простое усреднение средних значений по поддиапазонам приводит к некорректным результатам.

Теперь мы создаём целевую таблицу `post_stats_per_day` для этого представления, которая хранит эти частичные агрегатные состояния:


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

Ранее для хранения счетчиков было достаточно движка `SummingMergeTree`, но для других функций нам требуется более продвинутый тип движка — [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
Чтобы ClickHouse знал, что будут сохраняться агрегатные состояния, мы определяем `Score_quantiles` и `AvgCommentCount` как тип `AggregateFunction`, указывая функцию‑источник частичных состояний и тип их исходных столбцов. Как и в случае с `SummingMergeTree`, строки с одинаковым значением ключа `ORDER BY` будут объединяться (в приведённом выше примере — по `Day`).

Чтобы заполнить нашу таблицу `post_stats_per_day` через materialized view, мы можем просто вставить все строки из `posts` в `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> В продуктивной среде (production) вы, вероятно, привяжете materialized view к таблице `posts`. Здесь мы использовали `posts_null`, чтобы продемонстрировать null-таблицу.

Наш итоговый запрос должен использовать суффикс `Merge` для функций (так как столбцы хранят промежуточные состояния агрегации):

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


## Другие области применения {#other-applications}

Выше основное внимание уделялось использованию Materialized Views для инкрементального обновления частичных агрегатов данных, тем самым перенося вычисления с момента выполнения запроса на момент вставки данных. Помимо этого распространённого варианта использования, Materialized Views имеют ряд других областей применения.

### Фильтрация и преобразование {#filtering-and-transformation}

В некоторых ситуациях может потребоваться вставлять только подмножество строк и столбцов. В этом случае наша таблица `posts_null` может принимать вставки, а запрос `SELECT` будет фильтровать строки перед вставкой в таблицу `posts`. Например, предположим, что мы хотим преобразовать столбец `Tags` в нашей таблице `posts`. Он содержит список имён тегов, разделённых вертикальной чертой. Преобразовав их в массив, мы сможем проще агрегировать данные по отдельным значениям тегов.

> Мы могли бы выполнять это преобразование при запуске `INSERT INTO SELECT`. materialized view позволяет инкапсулировать эту логику в DDL ClickHouse и оставить наш `INSERT` простым, при этом преобразование будет применяться ко всем новым строкам.

Наш materialized view для этого преобразования показан ниже:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```


### Справочная таблица {#lookup-table}

При выборе ключа сортировки в ClickHouse следует учитывать модели доступа. Следует использовать столбцы, которые часто встречаются в условиях фильтрации и агрегации. Это может создавать ограничения в сценариях, когда у пользователей более разнообразные модели доступа, которые нельзя описать одним набором столбцов. Например, рассмотрим следующую таблицу `comments`:

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

Ключ сортировки здесь оптимизирует таблицу для запросов, которые фильтруют по `PostId`.

Предположим, пользователь хочет отфильтровать записи по конкретному `UserId` и вычислить среднее значение его `Score`:

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

Хотя запрос выполняется быстро (объём данных небольшой для ClickHouse), по числу обработанных строк — 90,38 миллиона — видно, что выполняется полное сканирование таблицы. Для более крупных наборов данных мы можем использовать materialized view для поиска значений нашего ключа упорядочивания `PostId` при фильтрации по столбцу `UserId`. Эти значения затем можно использовать для эффективного поиска.

В этом примере наша materialized view может быть очень простой, выбирающей только `PostId` и `UserId` из `comments` при вставке. Эти результаты, в свою очередь, отправляются в таблицу `comments_posts_users`, которая упорядочена по `UserId`. Ниже мы создаём пустую версию таблицы `comments` и используем её для заполнения нашей materialized view и таблицы `comments_posts_users`:

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

Теперь мы можем использовать это представление в подзапросе, чтобы ускорить выполнение нашего предыдущего запроса:

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


### Цепочки / каскадирование materialized views {#chaining}

Materialized views можно объединять в цепочки (или каскадировать), что позволяет выстраивать сложные рабочие процессы.
Дополнительную информацию см. в руководстве «Каскадирование materialized views» (https://clickhouse.com/docs/guides/developer/cascading-materialized-views).

## materialized view и JOIN {#materialized-views-and-joins}

:::note Refreshable Materialized Views
Нижеописанное относится только к Incremental Materialized Views. Refreshable Materialized Views периодически выполняют свой запрос над всем целевым набором данных и полностью поддерживают JOIN. Рассмотрите возможность их использования для сложных JOIN, если допустимо небольшое снижение актуальности результатов.
:::

Incremental Materialized Views в ClickHouse полностью поддерживают операции `JOIN`, но с одним ключевым ограничением: **materialized view срабатывает только при вставках в исходную таблицу (самую левую таблицу в запросе).** Таблицы справа в JOIN не инициируют обновления, даже если их данные меняются. Это поведение особенно важно при создании **Incremental** Materialized Views, где данные агрегируются или трансформируются на этапе вставки.

Когда Incremental materialized view определяется с использованием `JOIN`, самой левой таблицей в запросе `SELECT` считается источник. При вставке новых строк в эту таблицу ClickHouse выполняет запрос materialized view *только* для этих вновь вставленных строк. Таблицы справа в JOIN при этом читаются целиком, но изменения только в них сами по себе не приводят к пересчёту представления.

Такое поведение делает JOIN в materialized views аналогичным «снапшотному» join по статическим данным измерений (dimension data). 

Это хорошо подходит для обогащения данных с помощью справочных таблиц или таблиц-измерений. Однако любые обновления таблиц справа (например, метаданных пользователей) не будут ретроспективно обновлять materialized view. Чтобы увидеть обновлённые данные, в исходную таблицу должны поступить новые вставки.

### Пример {#materialized-views-and-joins-example}

Рассмотрим конкретный пример на основе [набора данных Stack Overflow](/data-modeling/schema-design). Мы будем использовать materialized view для вычисления **ежедневных значков по пользователям**, включая отображаемое имя пользователя из таблицы `users`.

Напомним, схемы наших таблиц:

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

materialized view и связанная с ней целевая таблица задаются следующим образом:

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

:::note Выравнивание группировки и сортировки
Предложение `GROUP BY` в materialized view должно включать `DisplayName`, `UserId` и `Day`, чтобы соответствовать `ORDER BY` в целевой таблице с движком `SummingMergeTree`. Это обеспечивает корректную агрегацию и слияние строк. Пропуск любого из этих полей может привести к неверным результатам или неэффективным слияниям.
:::

Если теперь мы заполним данные по бейджам, materialized view будет срабатывать и заполнять нашу таблицу `daily_badges_by_user`.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

Предположим, мы хотим посмотреть значки, полученные конкретным пользователем. Тогда можно написать следующий запрос:


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

Теперь, если этот пользователь получит новый значок и в таблицу будет добавлена строка, наше представление будет обновлено:

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
Обратите внимание на задержку при вставке. Вставленная строка пользователя соединяется со всей таблицей `users`, что существенно влияет на производительность вставки. Ниже мы предлагаем подходы к решению этой проблемы в разделе [&quot;Использование исходной таблицы в фильтрах и соединениях&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::

Наоборот, если мы сначала вставим badge для нового пользователя, а затем строку для этого пользователя, наша materialized view не сможет зафиксировать метрики этого пользователя.

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

В этом случае представление срабатывает только при вставке badge до появления строки пользователя. Если мы вставим для пользователя ещё один badge, строка будет вставлена, как и должно быть:

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

Однако следует иметь в виду, что этот результат некорректен.


### Рекомендации по использованию JOIN в materialized views {#join-best-practices}

- **Используйте левую таблицу как триггер.** Только таблица слева в операторе `SELECT` инициирует срабатывание materialized view. Изменения в таблицах справа не будут вызывать обновления.

- **Предварительно вставляйте данные для JOIN.** Убедитесь, что данные в таблицах, участвующих в JOIN, существуют до вставки строк в исходную таблицу. JOIN вычисляется во время вставки, поэтому отсутствие данных приведёт к несовпадающим строкам или значениям null.

- **Ограничивайте количество столбцов из JOIN.** Выбирайте только необходимые столбцы из присоединяемых таблиц, чтобы минимизировать использование памяти и снизить задержку при вставке (см. ниже).

- **Оценивайте производительность вставки.** JOIN увеличивает стоимость операций вставки, особенно при больших таблицах справа. Оцените скорость вставки, используя репрезентативные продакшен-данные.

- **Предпочитайте словари для простых поисков.** Используйте [Dictionaries](/dictionary) для key-value-поиска (например, соответствие user ID имени), чтобы избежать ресурсоёмких операций JOIN.

- **Согласовывайте `GROUP BY` и `ORDER BY` для эффективности слияния.** При использовании `SummingMergeTree` или `AggregatingMergeTree` убедитесь, что `GROUP BY` соответствует выражению `ORDER BY` в целевой таблице, чтобы обеспечить эффективное слияние строк.

- **Используйте явные псевдонимы столбцов.** Если в таблицах есть пересекающиеся имена столбцов, используйте псевдонимы, чтобы избежать неоднозначности и обеспечить корректные результаты в целевой таблице.

- **Учитывайте объём и частоту вставок.** JOIN хорошо работает при умеренных нагрузках на вставку. Для высокопроизводительной ингестии рассмотрите использование промежуточных таблиц, предварительных JOIN или других подходов, таких как Dictionaries и [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view).

### Использование исходной таблицы в фильтрах и соединениях {#using-source-table-in-filters-and-joins-in-materialized-views}

При работе с materialized view в ClickHouse важно понимать, как обрабатывается исходная таблица при выполнении запроса materialized view. В частности, исходная таблица в запросе materialized view заменяется на вставляемый блок данных. Такое поведение может приводить к неожиданным результатам, если его не учитывать.

#### Пример сценария {#example-scenario}

Рассмотрим следующую конфигурацию:

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


#### Объяснение {#explanation}

В приведённом выше примере у нас есть два materialized view `mvw1` и `mvw2`, которые выполняют похожие операции, но с небольшим отличием в том, как они ссылаются на исходную таблицу `t0`.

В `mvw1` таблица `t0` используется напрямую внутри подзапроса `(SELECT * FROM t0)` в правой части JOIN. Когда данные вставляются в `t0`, запрос materialized view выполняется с блоком вставленных данных, подставленным вместо `t0`. Это означает, что операция JOIN выполняется только над вновь вставленными строками, а не над всей таблицей.

Во втором случае, при соединении с `vt0`, представление читает все данные из `t0`. Это гарантирует, что операция JOIN учитывает все строки в `t0`, а не только вновь вставленный блок.

Ключевое отличие заключается в том, как ClickHouse обрабатывает исходную таблицу в запросе materialized view. Когда materialized view срабатывает при вставке, исходная таблица (в данном случае `t0`) заменяется блоком вставляемых данных. Это поведение можно использовать для оптимизации запросов, но оно также требует тщательного внимания, чтобы избежать неожиданных результатов.

### Варианты использования и ограничения {#use-cases-and-caveats}

На практике вы можете использовать это поведение для оптимизации materialized view, которым нужно обрабатывать только подмножество данных исходной таблицы. Например, вы можете использовать подзапрос для фильтрации исходной таблицы перед её объединением с другими таблицами. Это может помочь сократить объём данных, обрабатываемых materialized view, и улучшить производительность.

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

В этом примере множество, построенное из подзапроса `IN (SELECT id FROM t0)`, содержит только что вставленные строки, что позволяет использовать его для фильтрации таблицы `t1`.


#### Пример со Stack Overflow {#example-with-stack-overflow}

Рассмотрим наш [предыдущий пример materialized view](/materialized-view/incremental-materialized-view#example) для вычисления **ежедневных бейджей для каждого пользователя**, включая отображаемое имя пользователя из таблицы `users`.

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

Это представление существенно увеличило задержку вставки данных в таблицу `badges`, например:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

Используя описанный выше подход, мы можем оптимизировать это представление. Добавим фильтр для таблицы `users`, используя идентификаторы пользователей из вставленных строк таблицы `badge`:

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

Это не только ускоряет начальную вставку бейджей:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

Но это также означает, что последующие вставки в badge будут выполняться эффективно:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

В приведённой выше операции из таблицы `users` выбирается только одна строка для пользователя с идентификатором `2936484`. Эта выборка также оптимизирована за счёт ключа сортировки таблицы `Id`.


## materialized views и объединения {#materialized-views-and-unions}

Запросы с `UNION ALL` обычно используют для объединения данных из нескольких исходных таблиц в один результирующий набор.

Хотя `UNION ALL` напрямую не поддерживается в Incremental Materialized Views, того же результата можно добиться, создав отдельную materialized view для каждой ветки `SELECT` и записывая их результаты в общую целевую таблицу.

В качестве примера мы будем использовать датасет Stack Overflow. Рассмотрим таблицы `badges` и `comments` ниже, которые отражают значки, полученные пользователем, и комментарии, которые он оставляет к постам:

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

Предположим, мы хотим создать единое представление пользовательской активности, показывающее последнюю активность каждого пользователя за счёт объединения этих двух таблиц:

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

Предположим, у нас есть целевая таблица для получения результатов этого запроса. Обратите внимание на использование движка таблицы [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) и типа данных [AggregateFunction](/sql-reference/data-types/aggregatefunction), чтобы обеспечить корректное слияние результатов:

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

Если вы хотите, чтобы эта таблица обновлялась по мере вставки новых строк в `badges` или `comments`, наивным решением этой задачи может быть попытка создать materialized view с предыдущим запросом с UNION:

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

Хотя это синтаксически корректно, оно приведёт к нежелательным результатам — представление будет срабатывать только при вставках в таблицу `comments`. Например:


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

Вставки в таблицу `badges` не будут вызывать срабатывание представления, поэтому `user_activity` не будет обновляться:

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

Чтобы решить эту задачу, мы просто создаём materialized view для каждого запроса SELECT:

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

Запись в любую из таблиц теперь даёт корректный результат. Например, если мы запишем в таблицу `comments`:

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

Как показано в предыдущем примере, таблица может служить источником для нескольких Materialized Views. Порядок их выполнения зависит от настройки [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing).

По умолчанию эта настройка равна `0` (`false`), что означает, что Materialized Views выполняются последовательно в порядке их `uuid`.

Например, рассмотрим следующую таблицу `source` и 3 Materialized Views, каждая из которых отправляет строки в таблицу `target`:

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

Обратите внимание, что каждое из представлений делает паузу в 1 секунду перед вставкой своих строк в таблицу `target`, при этом также добавляя своё имя и время вставки.

Вставка строки в таблицу `source` занимает около 3 секунд, при этом каждое представление выполняется последовательно:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

Мы можем подтвердить поступление строк с помощью запроса `SELECT`:

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

Напротив, рассмотрим, что произойдёт, если мы вставим строку при включённом параметре `parallel_view_processing=1`. В этом случае представления выполняются параллельно, и порядок, в котором строки поступают в целевую таблицу, никак не гарантируется:

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


Хотя сейчас порядок поступления строк из каждого представления совпадает, это не гарантируется, как видно из почти одинакового времени вставки каждой строки. Также обратите внимание на улучшенную производительность вставки.

### Когда использовать параллельную обработку {#materialized-views-when-to-use-parallel}

Включение `parallel_view_processing=1` может существенно повысить пропускную способность вставок, как показано выше, особенно когда к одной таблице привязано несколько Materialized Views. Однако важно понимать связанные с этим издержки:

- **Повышенная нагрузка при вставке**: Все Materialized Views выполняются одновременно, увеличивая использование CPU и памяти. Если каждое представление выполняет ресурсоёмкие вычисления или JOIN'ы, это может перегрузить систему.
- **Необходимость строгого порядка выполнения**: В редких рабочих процессах, где порядок выполнения представлений имеет значение (например, при цепочечных зависимостях), параллельное выполнение может приводить к неконсистентному состоянию или состояниям гонки. Хотя можно спроектировать систему с учётом этого, такие конфигурации хрупкие и могут перестать корректно работать в будущих версиях.

:::note Исторические значения по умолчанию и стабильность
Последовательное выполнение долгое время было значением по умолчанию, отчасти из-за сложности обработки ошибок. Исторически сбой в одном materialized view мог помешать выполнению других. В новых версиях это улучшено за счёт изоляции сбоев на уровне блока, но последовательное выполнение по-прежнему обеспечивает более прозрачную семантику ошибок.
:::

В общем случае включайте `parallel_view_processing=1`, когда:

- У вас несколько независимых Materialized Views
- Вы стремитесь максимизировать производительность вставок
- Вы учитываете возможности системы по обработке одновременного выполнения представлений

Оставляйте его выключенным, когда:

- Между Materialized Views существуют взаимозависимости
- Вам требуется предсказуемое, упорядоченное выполнение
- Вы отлаживаете или проводите аудит поведения вставок и хотите детерминированное воспроизведение

## materialized views и Common Table Expressions (CTE) {#materialized-views-common-table-expressions-ctes}

В materialized views поддерживаются **нерекурсивные** Common Table Expressions (CTE).

:::note Common Table Expressions **не являются** материализованными
ClickHouse не материализует CTE; вместо этого он подставляет определение CTE непосредственно в запрос, что может приводить к многократному вычислению одного и того же выражения (если CTE используется несколько раз).
:::

Рассмотрим следующий пример, который вычисляет ежедневную активность по каждому типу поста.

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

Хотя CTE здесь, строго говоря, и не требуется, представление для примера будет работать как ожидается:

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

В ClickHouse CTE встраиваются, то есть фактически копируются в текст запроса на этапе оптимизации и **не** материализуются. Это означает:

* Если ваш CTE ссылается на другую таблицу, отличную от исходной таблицы (то есть той, к которой привязан materialized view), и используется в `JOIN`- или `IN`-выражении, он будет вести себя как подзапрос или `JOIN`, а не как триггер.
* materialized view по-прежнему будет срабатывать только при вставках в основную исходную таблицу, но CTE будет выполняться заново при каждой вставке, что может приводить к избыточным накладным расходам, особенно если таблица, на которую он ссылается, большая.

Например,


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

В этом случае CTE users пересчитывается при каждой вставке в posts, и materialized view не будет обновляться при добавлении новых users — только при вставке в posts.

В общем случае используйте CTE для логики, которая работает с той же исходной таблицей, к которой привязан materialized view, или убедитесь, что таблицы, на которые он ссылается, небольшие и маловероятно станут причиной узких мест по производительности. В качестве альтернативы рассмотрите [те же оптимизации, что и для JOIN в Materialized Views](/materialized-view/incremental-materialized-view#join-best-practices).
