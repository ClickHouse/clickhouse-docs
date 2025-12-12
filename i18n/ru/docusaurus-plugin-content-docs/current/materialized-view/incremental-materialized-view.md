---
slug: /materialized-view/incremental-materialized-view
title: 'Инкрементное материализованное представление'
description: 'Как использовать инкрементные материализованные представления для ускорения выполнения запросов'
keywords: ['инкрементные материализованные представления', 'ускорение выполнения запросов', 'оптимизация запросов']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## Общие сведения {#background}

Инкрементальные материализованные представления (Materialized Views) позволяют перенести вычислительные затраты с момента выполнения запроса на момент вставки данных, что приводит к более быстрым запросам `SELECT`.

В отличие от транзакционных баз данных, таких как Postgres, материализованное представление в ClickHouse — это по сути триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результат этого запроса вставляется во вторую, «целевую» таблицу. При вставке новых строк результаты снова отправляются в целевую таблицу, где промежуточные результаты обновляются и объединяются. Этот объединённый результат эквивалентен выполнению запроса над всеми исходными данными.

Основная идея использования материализованных представлений заключается в том, что результаты, вставляемые в целевую таблицу, представляют собой результаты агрегации, фильтрации или трансформации строк. Эти результаты часто являются более компактным представлением исходных данных (частичным «эскизом» в случае агрегаций). Это, вместе с простотой итогового запроса для чтения результатов из целевой таблицы, обеспечивает более быстрое выполнение запросов по сравнению с выполнением тех же вычислений над исходными данными, перенося вычисления (и, следовательно, задержку запроса) с момента выполнения запроса на момент вставки.

Материализованные представления в ClickHouse обновляются в режиме реального времени по мере поступления данных в базовую таблицу, функционируя скорее как постоянно обновляемые индексы. В отличие от этого, в других базах данных материализованные представления обычно представляют собой статические снимки результата запроса, которые необходимо обновлять (аналогично ClickHouse [обновляемым материализованным представлениям](/sql-reference/statements/create/view#refreshable-materialized-view)).

<Image img={materializedViewDiagram} size="md" alt="Схема материализованного представления"/>

## Пример {#example}

В качестве примера мы будем использовать датасет Stack Overflow, описанный в разделе [&quot;Проектирование схемы&quot;](/data-modeling/schema-design).

Предположим, что мы хотим получить количество голосов «за» и «против» по дням для записи.

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

Этот запрос уже выполняется быстро благодаря ClickHouse, но можно ли сделать ещё лучше?

Если мы хотим выполнять этот расчёт на момент вставки с использованием материализованного представления, нам нужна таблица, которая будет принимать результаты. Эта таблица должна содержать только одну строку на каждый день. Если для уже существующего дня поступает обновление, остальные столбцы должны быть объединены с существующей строкой за этот день. Чтобы такое объединение инкрементальных состояний было возможным, для остальных столбцов необходимо хранить частичные состояния.

Для этого в ClickHouse требуется специальный тип движка таблицы: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммарные значения для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя значения во всех числовых столбцах:

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

Чтобы продемонстрировать наше материализованное представление, предположим, что таблица `votes` пуста и в нее еще не было вставлено ни одной строки. Наше материализованное представление выполняет указанный выше запрос `SELECT` по данным, вставляемым в `votes`, а результаты отправляются в `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

Здесь ключевую роль играет предложение `TO`, которое определяет, куда будут отправлены результаты — в `up_down_votes_per_day`.

Мы можем заново заполнить нашу таблицу `votes`, повторив предыдущий оператор `INSERT`:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

По завершении мы можем проверить количество строк в таблице `up_down_votes_per_day` — у нас должна быть одна строка на каждый день:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

Мы фактически сократили количество строк здесь с 238 миллионов (в `votes`) до 5000, сохранив результат нашего запроса. Однако важно то, что если в таблицу `votes` вставляются новые голоса, новые значения будут записаны в `up_down_votes_per_day` для соответствующего дня, где они будут автоматически асинхронно слиты в фоновом режиме — при этом сохраняется только одна строка на день. Таким образом, `up_down_votes_per_day` всегда будет и небольшой по размеру, и актуальной.

Поскольку слияние строк выполняется асинхронно, при выполнении запроса пользователем может существовать более одной строки с голосами за день. Чтобы гарантировать, что все несведённые строки будут объединены во время запроса, у нас есть два варианта:

* Использовать модификатор `FINAL` в запросе к таблице. Мы сделали это для запроса `COUNT`, приведённого выше.
* Агрегировать по ключу сортировки, используемому в нашей итоговой таблице, т.е. по `CreationDate`, и суммировать метрики. Как правило, это более эффективно и гибко (таблицу можно использовать и для других задач), но первый вариант может быть проще для некоторых запросов. Ниже мы приводим оба подхода:

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

Это ускорило выполнение нашего запроса с 0,133 с до 0,004 с — более чем в 25 раз!

:::important Важно: `ORDER BY` = `GROUP BY`
В большинстве случаев столбцы, используемые в предложении `GROUP BY` при трансформации материализованного представления, должны совпадать со столбцами, указанными в предложении `ORDER BY` целевой таблицы при использовании движков таблиц `SummingMergeTree` или `AggregatingMergeTree`. Эти движки полагаются на столбцы `ORDER BY` для объединения строк с идентичными значениями во время фоновых операций слияния данных. Несоответствие между столбцами `GROUP BY` и `ORDER BY` может привести к неэффективному выполнению запросов, неоптимальным слияниям или даже несоответствиям в данных.
:::

### Более сложный пример {#a-more-complex-example}

В приведённом выше примере используются материализованные представления для вычисления и ведения двух дневных сумм. Суммы представляют собой простейшую форму агрегирования для поддержания частичных состояний — мы можем просто добавлять новые значения к существующим по мере их поступления. Однако материализованные представления ClickHouse могут использоваться для любых типов агрегирования.

Предположим, мы хотим вычислить некоторые статистические показатели по постам за каждый день: 99.9-й перцентиль для поля `Score` и среднее значение по `CommentCount`. Запрос для вычисления этого может выглядеть следующим образом:

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

Как и раньше, мы можем создать материализованное представление, которое будет выполнять приведённый выше запрос при вставке новых постов в таблицу `posts`.

В качестве примера и чтобы избежать загрузки данных о постах из S3, мы создадим дублирующую таблицу `posts_null` с той же схемой, что и `posts`. Однако эта таблица не будет хранить никакие данные и будет использоваться материализованным представлением только при вставке строк. Чтобы предотвратить хранение данных, мы можем использовать [тип движка таблицы `Null`](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Движок таблиц Null — это мощная оптимизация — думайте о нём как о `/dev/null`. Наше материализованное представление будет вычислять и сохранять сводную статистику, когда таблица `posts_null` получает строки при вставке — по сути, это триггер. Однако сырые данные сохраняться не будут. Хотя в нашем случае мы, вероятно, всё же захотим хранить исходные записи, такой подход можно использовать для вычисления агрегатов, избегая накладных расходов на хранение сырых данных.

Таким образом, материализованное представление приобретает следующий вид:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Обратите внимание, что мы добавляем суффикс `State` в конец наших агрегатных функций. Это гарантирует, что возвращается агрегатное состояние функции, а не конечный результат. Это состояние будет содержать дополнительную информацию, позволяющую объединить его с другими частичными состояниями. Например, в случае вычисления среднего сюда войдут количество и сумма по столбцу.

> Частичные состояния агрегации необходимы для вычисления корректных результатов. Например, при вычислении среднего простое усреднение средних значений по поддиапазонам даёт некорректный результат.

Теперь мы создаём целевую таблицу для этого представления `post_stats_per_day`, которая будет хранить эти частичные агрегатные состояния:

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

Хотя ранее `SummingMergeTree` было достаточно для хранения счётчиков, для других функций нам нужен более продвинутый тип движка: [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
Чтобы ClickHouse знал, что будут храниться состояния агрегатных функций, мы определяем `Score_quantiles` и `AvgCommentCount` как тип `AggregateFunction`, указывая функцию, формирующую частичные состояния, и тип их исходных столбцов. Как и в случае с `SummingMergeTree`, строки с одинаковым значением ключа `ORDER BY` будут объединяться (в приведённом выше примере — по `Day`).

Чтобы заполнить таблицу `post_stats_per_day` через наше материализованное представление, мы можем просто вставить все строки из `posts` в `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> В продакшене вы, скорее всего, создавали бы материализованное представление для таблицы `posts`. Здесь мы использовали `posts_null`, чтобы продемонстрировать null-таблицу.

Наш итоговый запрос должен использовать суффикс `Merge` в функциях (так как столбцы хранят состояния частичной агрегации):

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

## Другие применения {#other-applications}

Выше основное внимание уделялось использованию материализованных представлений для инкрементального обновления частичных агрегатов данных, тем самым перенося вычисления с момента выполнения запроса на момент вставки. Помимо этого распространённого варианта использования, материализованные представления имеют ряд других применений.

### Фильтрация и преобразование {#filtering-and-transformation}

В некоторых ситуациях нам может потребоваться при вставке записывать только подмножество строк и столбцов. В этом случае наша таблица `posts_null` может принимать вставки, а запрос `SELECT` будет фильтровать строки перед вставкой в таблицу `posts`. Например, предположим, что мы хотим преобразовать столбец `Tags` в нашей таблице `posts`. Он содержит разделённый вертикальной чертой список имён тегов. Преобразовав его в массив, мы сможем проще выполнять агрегацию по отдельным значениям тегов.

> Мы могли бы выполнить это преобразование при выполнении `INSERT INTO SELECT`. Материализованное представление позволяет инкапсулировать эту логику в ClickHouse DDL и сделать наш `INSERT` простым, с применением преобразования ко всем новым строкам.

Наше материализованное представление для этого преобразования показано ниже:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### Таблица соответствий {#lookup-table}

Пользователям следует учитывать свои шаблоны доступа при выборе ключа сортировки в ClickHouse. Следует использовать столбцы, которые часто используются в предложениях фильтрации и агрегации. Это может стать ограничением в сценариях, когда у пользователей более разнообразные шаблоны доступа, которые нельзя выразить одним набором столбцов. Например, рассмотрим следующую таблицу `comments`:

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

Предположим, что пользователь хочет отфильтровать данные по конкретному `UserId` и вычислить его среднее значение `Score`:

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

Хотя запрос выполняется быстро (объём данных для ClickHouse небольшой), по количеству обработанных строк — 90,38 млн — мы видим, что требуется полное сканирование таблицы. Для более крупных наборов данных мы можем использовать материализованное представление, чтобы получать значения нашего ключа сортировки `PostId` для фильтрации по столбцу `UserId`. Затем эти значения можно использовать для эффективного поиска.

В этом примере наше материализованное представление может быть очень простым: оно выбирает только `PostId` и `UserId` из `comments` при вставке. Затем эти результаты записываются в таблицу `comments_posts_users`, которая упорядочена по `UserId`. Ниже мы создаём пустую версию таблицы `Comments` и используем её для заполнения нашего представления и таблицы `comments_posts_users`:

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

Теперь мы можем использовать это представление во вложенном запросе, чтобы ускорить выполнение нашего предыдущего запроса:

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

1 строка в наборе. Время: 0.012 сек. Обработано 88.61 тыс. строк, 771.37 КБ (7.09 млн строк/с, 61.73 МБ/с.)

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

## Материализованные представления и JOIN {#materialized-views-and-joins}

:::note Обновляемые материализованные представления
Следующее относится только к инкрементным материализованным представлениям (Incremental Materialized Views). Обновляемые материализованные представления (Refreshable Materialized Views) периодически выполняют свой запрос по всему целевому набору данных и полностью поддерживают JOIN. Рассмотрите возможность их использования для сложных JOIN, если допустимо снижение актуальности результатов.
:::

Инкрементные материализованные представления в ClickHouse полностью поддерживают операции `JOIN`, но с одним ключевым ограничением: **материализованное представление срабатывает только при вставках в исходную таблицу (самую левую таблицу в запросе).** Таблицы справа в JOIN не инициируют обновления, даже если их данные изменяются. Это поведение особенно важно при построении **инкрементных** материализованных представлений, где данные агрегируются или трансформируются во время вставки.

Когда инкрементное материализованное представление определяется с использованием `JOIN`, самая левая таблица в запросе `SELECT` выступает в роли источника. Когда в эту таблицу вставляются новые строки, ClickHouse выполняет запрос материализованного представления *только* с этими новыми строками. Таблицы справа в JOIN читаются целиком во время этого выполнения, но изменения только в них не инициируют обновление представления.

Такое поведение делает операции JOIN в материализованных представлениях похожими на snapshot-join по статическим таблицам измерений.

Это хорошо подходит для обогащения данных с помощью справочных или таблиц измерений. Однако любые обновления таблиц справа (например, пользовательских метаданных) не будут задним числом обновлять материализованное представление. Чтобы увидеть обновлённые данные, в исходную таблицу должны поступить новые вставки.

### Пример {#materialized-views-and-joins-example}

Рассмотрим конкретный пример с использованием [набора данных Stack Overflow](/data-modeling/schema-design). Мы будем использовать материализованное представление для вычисления **ежедневного количества бейджей для каждого пользователя**, включая отображаемое имя пользователя из таблицы `users`.

Напомним, наши схемы таблиц выглядят так:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

Предположим, что таблица `users` уже заполнена:

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

Материализованное представление и связанная с ним целевая таблица определяются так:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

:::note Согласование группировки и сортировки
Предложение `GROUP BY` в материализованном представлении должно включать `DisplayName`, `UserId` и `Day`, чтобы соответствовать `ORDER BY` в целевой таблице `SummingMergeTree`. Это обеспечивает корректную агрегацию и объединение строк. Пропуск любого из этих столбцов может привести к некорректным результатам или неэффективным слияниям.
:::

Если теперь заполнить бейджи, представление будет срабатывать и заполнять нашу таблицу `daily_badges_by_user`.

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

Предположим, мы хотим просмотреть бейджи, полученные конкретным пользователем, — для этого можно выполнить следующий запрос:

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

Теперь, если этот пользователь получит новый бейдж и будет вставлена новая строка, наше представление будет обновлено:

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```

:::warning
Обратите внимание на задержку вставки. Вставленная строка пользователя соединяется со всей таблицей `users`, что существенно снижает производительность вставки. Ниже мы предлагаем подходы к решению этой проблемы в разделе [&quot;Использование исходной таблицы в фильтрах и соединениях&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::

Напротив, если мы сначала вставим бейдж для нового пользователя, а затем строку для этого пользователя, наше материализованное представление не сможет зафиксировать метрики этого пользователя.

```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 rows in set. Elapsed: 0.017 sec. Processed 32.77 thousand rows, 644.32 KB (1.98 million rows/s., 38.94 MB/s.)
```

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

Представление в этом случае выполняется только при вставке бейджа до того, как будет создана строка пользователя. Если мы вставим ещё один бейдж для пользователя, строка будет вставлена, как и ожидалось:

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

Однако обратите внимание, что этот результат некорректен.

### Рекомендуемые практики использования JOIN в материализованных представлениях {#join-best-practices}

* **Используйте самую левую таблицу как триггер.** Только таблица слева в операторе `SELECT` инициирует материализованное представление. Изменения в таблицах справа не будут вызывать обновления.

* **Предварительно вставляйте объединённые данные.** Убедитесь, что данные в таблицах, участвующих в JOIN, уже существуют до вставки строк в исходную таблицу. JOIN вычисляется в момент вставки, поэтому отсутствие данных приведёт к несовпадающим строкам или значениям null.

* **Ограничивайте набор колонок, получаемых из JOIN.** Выбирайте только необходимые колонки из присоединённых таблиц, чтобы минимизировать использование памяти и сократить задержку вставки (см. ниже).

* **Оценивайте производительность вставки.** JOIN увеличивает стоимость операций вставки, особенно при больших таблицах справа. Проводите тестирование скоростей вставки на репрезентативных production-данных.

* **Предпочитайте словари для простых поисков.** Используйте [Dictionaries](/dictionary) для key-value-поиска (например, сопоставления user ID и имени), чтобы избежать дорогостоящих операций JOIN.

* **Согласуйте `GROUP BY` и `ORDER BY` для эффективности слияний.** При использовании `SummingMergeTree` или `AggregatingMergeTree` убедитесь, что `GROUP BY` совпадает с выражением `ORDER BY` в целевой таблице, чтобы обеспечить эффективное слияние строк.

* **Используйте явные псевдонимы колонок.** Когда в таблицах есть совпадающие имена колонок, используйте псевдонимы, чтобы устранить неоднозначность и гарантировать корректные результаты в целевой таблице.

* **Учитывайте объём и частоту вставок.** JOIN хорошо работает при умеренной нагрузке на вставку. Для высокопроизводительной ингестии рассмотрите использование промежуточных таблиц, предварительного объединения (pre-join) или других подходов, таких как Dictionaries и [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view).

### Использование исходной таблицы в фильтрах и JOIN {#using-source-table-in-filters-and-joins-in-materialized-views}

При работе с материализованными представлениями в ClickHouse важно понимать, как исходная таблица обрабатывается во время выполнения запроса материализованного представления. В частности, исходная таблица в запросе материализованного представления заменяется вставляемым блоком данных. Если не учитывать эту особенность, такое поведение может приводить к неожиданным результатам.

#### Пример сценария {#example-scenario}

Рассмотрим следующую конфигурацию:

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

#### Пояснение {#explanation}

В приведённом выше примере у нас есть два материализованных представления `mvw1` и `mvw2`, которые выполняют схожие операции, но с небольшим отличием в том, как они ссылаются на исходную таблицу `t0`.

В `mvw1` таблица `t0` напрямую используется во вложенном запросе `(SELECT * FROM t0)` в правой части JOIN. Когда данные вставляются в `t0`, запрос материализованного представления выполняется с блоком вставленных данных вместо `t0`. Это означает, что операция JOIN выполняется только над вновь вставленными строками, а не над всей таблицей.

Во втором случае, при соединении с `vt0`, представление читает все данные из `t0`. Это гарантирует, что операция JOIN учитывает все строки в `t0`, а не только вновь вставленный блок.

Ключевое отличие заключается в том, как ClickHouse обрабатывает исходную таблицу в запросе материализованного представления. Когда материализованное представление срабатывает при вставке данных, исходная таблица (в данном случае `t0`) заменяется блоком вставленных данных. Это поведение можно использовать для оптимизации запросов, но при этом необходимо внимательно его учитывать, чтобы избежать неожиданных результатов.

### Сценарии использования и ограничения {#use-cases-and-caveats}

На практике вы можете использовать это поведение для оптимизации материализованных представлений, которым нужно обрабатывать лишь подмножество данных исходной таблицы. Например, можно использовать подзапрос для фильтрации исходной таблицы перед её соединением с другими таблицами. Это может помочь сократить объём данных, обрабатываемых материализованным представлением, и улучшить производительность.

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

В этом примере множество, построенное из подзапроса `IN (SELECT id FROM t0)`, содержит только вновь вставленные строки, что может помочь при фильтрации `t1` по этому множеству.

#### Пример со Stack Overflow {#example-with-stack-overflow}

Рассмотрим наш [предыдущий пример с материализованным представлением](/materialized-view/incremental-materialized-view#example) для вычисления **ежедневных бейджей для каждого пользователя**, включая отображаемое имя пользователя из таблицы `users`.

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

Это представление значительно увеличивало задержку вставки в таблицу `badges`, например:

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

Используя описанный выше подход, мы можем оптимизировать данное представление. Мы добавим фильтр к таблице `users`, используя идентификаторы пользователей из вставленных строк с бейджами:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

Это не только ускоряет первоначальную вставку бейджей:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

0 строк в наборе. Затрачено: 132,118 с. Обработано 323,43 млн строк, 4,69 ГБ (2,45 млн строк/с, 35,49 МБ/с).
Пиковое использование памяти: 1,99 ГиБ.

````sql
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
```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

Добавлена 1 строка. Затрачено: 0.583 сек.
````sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
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
```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
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
```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'Ответ — 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId
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
````

Вставки в таблицу `badges` не будут запускать представление, из-за чего `user_activity` не получит обновлений:

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
````

Чтобы решить эту задачу, мы просто создаём материализованное представление для каждого запроса SELECT:

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

Теперь вставка в любую из таблиц даёт корректные результаты. Например, если вставить данные в таблицу `comments`:

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

Аналогично, операции INSERT в таблицу `badges` отражаются в таблице `user_activity`:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

## Параллельная и последовательная обработка {#materialized-views-parallel-vs-sequential}

Как показано в предыдущем примере, таблица может использоваться как источник для нескольких материализованных представлений. Порядок их выполнения зависит от настройки [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing).

По умолчанию значение этой настройки равно `0` (`false`), что означает, что материализованные представления выполняются последовательно в порядке их `uuid`.

Например, рассмотрим следующую таблицу `source` и три материализованных представления, каждое из которых отправляет строки в таблицу `target`:

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

Обратите внимание, что каждое представление делает паузу на 1 секунду перед вставкой своих строк в таблицу `target`, одновременно добавляя свое имя и время вставки.

Вставка строки в таблицу `source` занимает примерно 3 секунды, при этом каждое представление выполняется последовательно:

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

Мы можем подтвердить поступление строк из каждого источника с помощью запроса `SELECT`:

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

Это соответствует значению `uuid` представлений:

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

Для сравнения рассмотрим, что произойдет, если мы вставим строку при включенном `parallel_view_processing=1`. В этом режиме представления выполняются параллельно, и порядок, в котором строки поступают в целевую таблицу, не гарантируется:

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
```

Хотя порядок поступления строк из каждого представления у нас одинаковый, это не гарантируется — что видно по близким значениям времени вставки для каждой строки. Также обратите внимание на улучшившуюся производительность вставки.

### Когда использовать параллельную обработку {#materialized-views-when-to-use-parallel}

Включение `parallel_view_processing=1` может существенно повысить пропускную способность вставки, как показано выше, особенно когда к одной таблице прикреплено несколько материализованных представлений. Однако важно понимать существующие компромиссы:

- **Повышенная нагрузка при вставке**: Все материализованные представления выполняются одновременно, что увеличивает использование CPU и памяти. Если каждое представление выполняет ресурсоёмкие вычисления или JOIN-операции, это может перегрузить систему.
- **Необходимость строгого порядка выполнения**: В редких рабочих процессах, где порядок выполнения представлений имеет значение (например, каскадные зависимости), параллельное выполнение может привести к несогласованному состоянию или гонкам. Хотя можно спроектировать систему в обход этой проблемы, такие конфигурации хрупки и могут сломаться в будущих версиях.

:::note Исторические значения по умолчанию и стабильность
Последовательное выполнение долгое время было значением по умолчанию, частично из-за сложности обработки ошибок. Исторически сбой в одном материализованном представлении мог помешать выполнению остальных. В новых версиях это улучшено за счёт изоляции сбоев на уровне блоков, но последовательное выполнение по-прежнему обеспечивает более понятную семантику отказов.
:::

В общем случае включайте `parallel_view_processing=1`, когда:

- У вас есть несколько независимых материализованных представлений
- Вы стремитесь максимизировать производительность вставки
- Вы учитываете возможности системы по обработке одновременного выполнения представлений

Оставляйте его выключенным, когда:
- Между материализованными представлениями есть взаимозависимости
- Вам требуется предсказуемое, упорядоченное выполнение
- Вы отлаживаете или проверяете поведение вставки и хотите детерминированное воспроизведение

## Материализованные представления и Common Table Expressions (CTE) {#materialized-views-common-table-expressions-ctes}

**Нерекурсивные** Common Table Expressions (CTE) поддерживаются в материализованных представлениях.

:::note Common Table Expressions **не материализуются**
ClickHouse не материализует CTE; вместо этого он подставляет определение CTE непосредственно в запрос, что может приводить к многократному выполнению одного и того же выражения (если CTE используется более одного раза).
:::

Рассмотрим следующий пример, который вычисляет ежедневную активность для каждого типа поста.

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

Хотя CTE здесь, строго говоря, не требуется, для примера представление будет работать как ожидается:

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
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
│ 2024-03-31 │ Вопрос │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Ответ   │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Ответ   │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Вопрос │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Вопрос │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Ответ   │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Ответ   │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Вопрос │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Вопрос │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Ответ   │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

Получено 10 строк. Прошло: 0.013 сек. Обработано 11.45 тыс. строк, 663.87 КБ (866.53 тыс. строк/сек., 50.26 МБ/сек.)
Пиковое потребление памяти: 989.53 КиБ.
```

В ClickHouse CTE подставляются *инлайн*, то есть фактически копируются и вставляются в запрос во время оптимизации и **не** материализуются. Это означает:

* Если ваш CTE ссылается на другую таблицу, отличную от исходной таблицы (то есть той, к которой привязано материализованное представление), и используется в выражении `JOIN` или `IN`, он будет вести себя как подзапрос или соединение, а не как триггер.
* Материализованное представление по‑прежнему будет срабатывать только при вставках в основную исходную таблицу, но CTE будет выполняться заново при каждой вставке, что может приводить к лишним накладным расходам, особенно если таблица, на которую идёт ссылка, большая.

Например,

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

В этом случае CTE `users` повторно вычисляется при каждой вставке в `posts`, и материализованное представление не будет обновляться при добавлении новых записей в `users` — только при добавлении записей в `posts`.

Как правило, используйте CTE для логики, которая работает с той же исходной таблицей, к которой привязано материализованное представление, или убедитесь, что участвующие таблицы небольшие и вряд ли станут узким местом производительности. В качестве альтернативы рассмотрите [те же оптимизации, что и для JOIN в материализованных представлениях](/materialized-view/incremental-materialized-view#join-best-practices).
