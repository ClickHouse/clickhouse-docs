---
slug: /materialized-view/incremental-materialized-view
title: 'Инкрементное Материализованное Представление'
description: 'Как использовать инкрементные материализованные представления для ускорения запросов'
keywords: ['инкрементные материализованные представления', 'ускорение запросов', 'оптимизация запросов']
score: 10000
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';

## Обзор {#background}

Инкрементные Материализованные Представления (Материализованные Представления) позволяют пользователям перенести стоимость вычислений с времени выполнения запроса на время вставки, что приводит к более быстрым `SELECT` запросам.

В отличие от транзакционных баз данных, таких как Postgres, Материализованное Представление ClickHouse — это всего лишь триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результат этого запроса вставляется во вторую "целевую" таблицу. При вставке дополнительных строк результаты снова будут отправлены в целевую таблицу, где промежуточные результаты будут обновлены и объединены. Этот объединённый результат эквивалентен выполнению запроса над всеми исходными данными.

Основная мотивация использования Материализованных Представлений заключается в том, что результаты, вставленные в целевую таблицу, представляют собой результаты агрегации, фильтрации или преобразования строк. Эти результаты часто являются меньшей репрезентацией исходных данных (частичным чертежом в случае агрегации). Это, наряду с тем, что запрос для чтения результатов из целевой таблицы является простым, гарантирует, что время выполнения запросов будет быстрее, чем если бы те же вычисления выполнялись над исходными данными, перенос вычислений (а значит, и задержку запроса) с времени запроса на время вставки.

Материализованные представления в ClickHouse обновляются в реальном времени, по мере поступления данных в таблицу, на основе которой они созданы, функционируя скорее как постоянно обновляемые индексы. Это в контрасте с другими базами данных, где Материализованные Представления обычно представляют собой статические снимки запроса, которые необходимо обновлять (аналогично [Обновляемым Материализованным Представлениям](/sql-reference/statements/create/view#refreshable-materialized-view) в ClickHouse).

<Image img={materializedViewDiagram} size="md" alt="Схема материализованного представления"/>
## Пример {#example}

Для примера мы воспользуемся набором данных Stack Overflow, описанным в ["Дизайн схемы"](/data-modeling/schema-design).

Предположим, мы хотим получить количество голосов вверх и вниз за день по посту.

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

Это достаточно простой запрос в ClickHouse благодаря функции [`toStartOfDay`](/sql-reference/functions/date-time-functions#tostartofday):

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

Этот запрос уже быстр благодаря ClickHouse, но можем ли мы сделать лучше?

Если мы хотим вычислять это во время вставки с помощью Материализованного Представления, нам нужна таблица для получения результатов. Эта таблица должна хранить только 1 строку на день. Если обновление поступает для существующего дня, другие столбцы должны быть объединены в строку соответствующего дня. Для того чтобы это объединение инкрементальных состояний произошло, частичные состояния должны храниться для остальных столбцов.

Это требует специального типа движка в ClickHouse: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Он заменяет все строки с одинаковым ключом сортировки одной строкой, которая содержит суммы для числовых столбцов. Следующая таблица будет объединять любые строки с одинаковой датой, суммируя все числовые столбцы:

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

Чтобы продемонстрировать наше Материализованное Представление, предположим, что наша таблица votes пуста и ещё не получила никаких данных. Наше Материализованное Представление выполняет вышеприведённый `SELECT` на данные, вставляемые в `votes`, с результатами, отправляемыми в `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

Клаузула `TO` здесь является ключевой, указывая, куда будут отправляться результаты, т.е. `up_down_votes_per_day`.

Мы можем повторно заполнить нашу таблицу votes, используя ранее сделанную вставку:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

По завершении мы можем подтвердить размер нашей таблицы `up_down_votes_per_day` — у нас должно быть 1 строка на день:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

Мы эффективно снизили количество строк здесь с 238 миллионов (в `votes`) до 5000, сохранив результат нашего запроса. Однако ключевым моментом здесь является то, что если новые голоса будут вставлены в таблицу `votes`, новые значения будут отправлены в `up_down_votes_per_day` для их соответствующего дня, где они будут автоматически объединены асинхронно в фоновом режиме — сохраняя только одну строку на день. Таким образом, `up_down_votes_per_day` всегда будет и небольшой, и актуальной.

Поскольку объединение строк происходит асинхронно, может быть более одного голоса за день, когда пользователь запрашивает. Чтобы гарантировать, что все ожидающие строки объединены на момент выполнения запроса, у нас есть два варианта:

- Использовать модификатор `FINAL` в названии таблицы. Мы сделали это для запроса подсчета выше.
- Аггрегировать по ключу сортировки, использованному в нашей конечной таблице, т.е. `CreationDate` и суммировать метрики. Обычно это более эффективно и гибко (таблицу можно использовать для других вещей), но первый вариант может быть проще для некоторых запросов. Мы показываем оба ниже:

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

Это ускорило наш запрос с 0.133с до 0.004с — улучшение более чем в 25 раз!

:::important Важно: `ORDER BY` = `GROUP BY`
В большинстве случаев столбцы, используемые в клаузе `GROUP BY` трансформации Материализованных Представлений, должны соответствовать столбцам, используемым в клаузе `ORDER BY` целевой таблицы, если используются движки таблиц `SummingMergeTree` или `AggregatingMergeTree`. Эти движки полагаются на столбцы `ORDER BY` для объединения строк с одинаковыми значениями во время фоновых операций объединения. Несоответствие между столбцами `GROUP BY` и `ORDER BY` может привести к неэффективной производительности запросов, неоптимальным объединениям или даже к несоответствиям данных.
:::
### Более сложный пример {#a-more-complex-example}

Предыдущий пример использует Материализованные Представления для вычисления и поддержания двух сумм за день. Суммы представляют собой простейшую форму агрегации для сохранения частичных состояний — мы можем просто добавлять новые значения к существующим значениям по мере их поступления. Однако Материализованные Представления ClickHouse могут использоваться для любого типа агрегации.

Предположим, мы хотим вычислить некоторые статистические данные для постов за каждый день: 99.9-й процентиль для `Score` и среднее значение `CommentCount`. Запрос для вычисления этого может выглядеть так:

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

Как и прежде, мы можем создать Материализованное Представление, которое выполняет вышеупомянутый запрос, как только новые посты будут вставлены в нашу таблицу `posts`.

Для целей примера и чтобы избежать загрузки данных постов из S3, мы создадим дубликат таблицы `posts_null` с такой же схемой, как и `posts`. Однако эта таблица не будет хранить никаких данных и будет использоваться Материализованным Представлением при вставке строк. Чтобы предотвратить хранение данных, мы можем использовать тип движка [`Null`](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Движок таблицы Null является мощной оптимизацией — думайте об этом как о `/dev/null`. Наше Материализованное Представление будет вычислять и хранить наши сводные статистики, когда таблица `posts_null` получает строки во время вставки — это всего лишь триггер. Однако сырые данные не будут храниться. Хотя в нашем случае, мы, вероятно, все же хотим хранить оригинальные посты, этот подход может быть использован для вычисления агрегатов, избегая затрат на хранение сырых данных.

Таким образом, Материализованное Представление становится:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Обратите внимание, как мы добавляем суффикс `State` в конец наших агрегатных функций. Это гарантирует, что агрегатное состояние функции возвращается вместо окончательного результата. Это будет содержать дополнительную информацию, чтобы позволить этому частичному состоянию объединиться с другими состояниями. Например, в случае средней величины это будет включать количество и сумму столбца.

> Частичные состояния агрегации необходимы для вычисления корректных результатов. Например, для вычисления средней величины, простое усреднение средних значений поддиапазонов дает неправильные результаты.

Теперь мы создадим целевую таблицу для этого представления `post_stats_per_day`, которая будет хранить эти частичные агрегатные состояния:

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

Хотя ранее `SummingMergeTree` был достаточен для хранения количеств, мы требуем более продвинутый тип движка для других функций: [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
Чтобы убедиться, что ClickHouse знает, что агрегатные состояния будут храниться, мы определяем `Score_quantiles` и `AvgCommentCount` как тип `AggregateFunction`, указывая источник функции частичных состояний и тип их исходных столбцов. Как и в случае `SummingMergeTree`, строки с тем же значением ключа `ORDER BY` будут объединяться (`Day` в приведенном выше примере).

Чтобы заполнить нашу `post_stats_per_day` через наше Материализованное Представление, мы можем просто вставить все строки из `posts` в `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> В производственной среде, вы, вероятно, прикрепите Материализованное Представление к таблице `posts`. Мы использовали `posts_null` здесь, чтобы продемонстрировать таблицу null.

Наш окончательный запрос должен использовать суффикс `Merge` для наших функций (поскольку столбцы хранят частичные состояния агрегации):

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

Обратите внимание, что мы используем `GROUP BY` здесь вместо использования `FINAL`.
## Другие приложения {#other-applications}

Вышеописанное сосредоточено в основном на использовании Материализованных Представлений для инкрементного обновления частичных агрегатов данных, тем самым перемещая вычисления с времени запроса на время вставки. За пределами этого общего сценария Материализованные Представления имеют ряд других применений.
### Фильтрация и преобразование {#filtering-and-transformation}

В некоторых ситуациях мы можем захотеть вставить только подсет строк и столбцов при вставке. В этом случае наша таблица `posts_null` могла бы получать вставки с запросом `SELECT`, фильтрующим строки перед вставкой в таблицу `posts`. Например, предположим, что мы хотели бы преобразовать столбец `Tags` в нашей таблице `posts`. Он содержит список имен тегов, разделенных символом " | ". Преобразуя их в массив, мы можем легче агрегировать по отдельным значениям тегов.

> Мы могли бы выполнить это преобразование при выполнении `INSERT INTO SELECT`. Материализованное Представление позволяет нам инкапсулировать эту логику в DDL ClickHouse и сохранять наши `INSERT` простыми, с преобразованием, применяемым к любым новым строкам.

Наше Материализованное Представление для этого преобразования показано ниже:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```
### Таблица справочников {#lookup-table}

Пользователи должны учитывать свои шаблоны доступа при выборе ключа сортировки ClickHouse. Столбцы, которые часто используются в фильтрах и агрегационных клаузах, должны использоваться. Это может быть ограничивающим для сценариев, где пользователи имеют более разнообразные шаблоны доступа, которые не могут быть инкапсулированы в одном наборе столбцов. Например, рассмотрим следующую таблицу `comments`:

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

Предположим, что пользователь желает фильтровать по конкретному `UserId` и вычислить среднее значение `Score`:

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

Хотя это быстро (данные невелики для ClickHouse), мы можем видеть, что это требует полной проверки таблицы из-за количества обработанных строк — 90.38 миллиона. Для более крупных наборов данных мы можем использовать Материализованное Представление для поиска значений ключей сортировки `PostId` для фильтрации по столбцу `UserId`. Эти значения впоследствии могут быть использованы для выполнения эффективного поиска.

В этом примере наше Материализованное Представление может быть очень простым, выбирая только `PostId` и `UserId` из `comments` при вставке. Эти результаты затем отправляются в таблицу `comments_posts_users`, которая отсортирована по `UserId`. Мы создаем нулевую версию таблицы `Comments` ниже и используем это для заполнения нашего представления и таблицы `comments_posts_users`:

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

Теперь мы можем использовать это представление в подзапросе для ускорения нашего предыдущего запроса:

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
### Цепочки {#chaining}

Материализованные представления могут быть связаны, что позволяет устанавливать сложные рабочие процессы. Для практического примера мы рекомендуем прочитать этот [блог-пост](https://clickhouse.com/blog/chaining-materialized-views).
## Материализованные Представления и JOINs {#materialized-views-and-joins}

:::note Обновляемые Материализованные Представления
Следующее применимо только к Инкрементным Материализованным Представлениям. Обновляемые Материализованные Представления периодически выполняют свой запрос по всей целевой выборке данных и полностью поддерживают JOINs. Рассматривайте их использование для сложных JOINs, если снижение свежести результата можно будет допустить.
:::

Инкрементные Материализованные Представления в ClickHouse полностью поддерживают операции `JOIN`, но с одним важным ограничением: **Материализованное Представление срабатывает только при вставках в исходную таблицу (самую левую таблицу в запросе).** Таблицы правой стороны в JOIN не вызывают обновления, даже если их данные меняются. Это поведение особенно важно при создании **Инкрементных** Материализованных Представлений, где данные агрегируются или преобразуются во время вставки.

Когда Инкрементное Материализованное Представление определяется с использованием `JOIN`, самая левая таблица в запросе `SELECT` выступает в качестве источника. Когда в эту таблицу вставляются новые строки, ClickHouse выполняет запрос Материализованного Представления *только* с недавно вставленных строк. Таблицы правой стороны в JOIN считываются полностью во время этого выполнения, но изменения в них сами по себе не вызывают обновление представления.

Такое поведение делает JOINs в Материализованных Представлениях похожими на снимок соединения с статичными данными измерений. 

Это хорошо работает для обогащения данных с помощью справочных или измерительных таблиц. Однако любые обновления таблиц правой стороны (например, метаданные пользователей) не будут ретроактивно обновляться в Материализованном Представлении. Чтобы увидеть обновленные данные, новые вставки должны поступить из исходной таблицы.
### Пример {#materialized-views-and-joins-example}

Давайте пройдёмся по конкретному примеру с использованием набора данных [Stack Overflow](/data-modeling/schema-design). Мы будем использовать Материализованное Представление, чтобы вычислить **ежедневные медали для пользователей**, включая отображаемое имя пользователя из таблицы `users`.

В качестве напоминания, наши схемы таблиц таковы:

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

Мы предполагаем, что таблица `users` предварительно заполнена:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

Материализованное Представление и связанная с ним целевая таблица определены как:

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

:::note Согласование Группировки и Сортировки
Клаузула `GROUP BY` в Материализованном Представлении должна включать `DisplayName`, `UserId` и `Day`, чтобы соответствовать `ORDER BY` в целевой таблице `SummingMergeTree`. Это гарантирует правильную агрегацию и объединение строк. Пропуск любого из этих может привести к неправильным результатам или неэффективным объединениям.
:::

Теперь, если мы заполним медали, представление будет активировано — заполнив нашу таблицу `daily_badges_by_user`.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

Предположим, что мы хотим увидеть медали, полученные конкретным пользователем, мы можем написать следующий запрос:

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

Теперь, если этот пользователь получает новую медаль и вставляется строка, наше представление будет обновлено:

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
Обратите внимание на задержку вставки здесь. Вставленная строка пользователя соединяется с полной таблицей `users`, что значительно влияет на производительность вставки. Мы предлагаем подходы для решения этой проблемы ниже в разделе ["Использование исходной таблицы в фильтрах и соединениях"](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::

С другой стороны, если мы вставляем медаль для нового пользователя, а затем строку для пользователя, наше Материализованное Представление не сможет зафиксировать метрики пользователей. 

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

В этом случае представление выполняется только для вставки медали до того, как строка пользователя существует. Если мы вставим другую медаль для этого пользователя, строка вставляется, как и ожидалось:

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

Обратите внимание, однако, что этот результат неверен.
### Лучшие практики для JOINs в Материализованных Представлениях {#join-best-practices}

- **Используйте самую левую таблицу как триггер.** Только таблица с левой стороны оператора `SELECT` вызывает Материализованное Представление. Изменения в таблицах правой стороны не вызовут обновления.

- **Предварительно вставьте соединенные данные.** Убедитесь, что данные в объединенных таблицах существуют перед вставкой строк в исходную таблицу. JOIN вычисляется во время вставки, поэтому недостающие данные приведут к несоответствующим строкам или нулям.

- **Ограничьте столбцы, извлекаемые из соединений.** Выбирайте только необходимые столбцы из объединенных таблиц, чтобы минимизировать использование памяти и уменьшить задержку при вставке (см. ниже).

- **Оцените производительность вставки.** JOINs увеличивают стоимость вставок, особенно с большими таблицами правой стороны. Проведите тестирование скорости вставок, используя репрезентативные производственные данные.

- **Предпочитайте словари для простых запросов**. Используйте [Словари](/dictionary) для поиска по ключу-значению (например, ID пользователя к имени), чтобы избежать дорогостоящих JOIN операций.

- **Согласуйте `GROUP BY` и `ORDER BY` для эффективности объединений.** При использовании `SummingMergeTree` или `AggregatingMergeTree` убедитесь, что `GROUP BY` совпадает с клаузой `ORDER BY` в целевой таблице, чтобы обеспечить эффективное объединение строк.

- **Используйте явные имена столбцов.** Когда таблицы имеют перекрывающиеся имена столбцов, используйте псевдонимы, чтобы предотвратить двусмысленность и обеспечить правильные результаты в целевой таблице.

- **Учитывайте объем и частоту вставок.** JOINs хорошо работают при умеренной нагрузке вставки. Для интенсивного потока ввода данных рассмотрите возможность использования промежуточных таблиц, предварительных соединений или других подходов, таких как Словари и [Обновляемые Материализованные Представления](/materialized-view/refreshable-materialized-view).
### Использование исходной таблицы в фильтрах и соединениях {#using-source-table-in-filters-and-joins-in-materialized-views}

При работе с Материализованными Представлениями в ClickHouse важно понимать, как исходная таблица обрабатывается во время выполнения запроса Материализованного Представления. В частности, исходная таблица в запросе Материализованного Представления заменяется вставленным блоком данных. Это поведение может привести к некоторым неожиданным результатам, если его не понимать должным образом.
#### Пример сценария {#example-scenario}

Рассмотрим следующую настройку:

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

В приведенном выше примере у нас есть два Материализованных Представления `mvw1` и `mvw2`, которые выполняют похожие операции, но с небольшим различием в том, как они ссылаются на исходную таблицу `t0`.

В `mvw1` таблица `t0` напрямую ссылается внутри подзапроса `(SELECT * FROM t0)` с правой стороны JOIN. Когда данные вставляются в `t0`, запрос Материализованного Представления выполняется с вставленным блоком данных, заменяющим `t0`. Это означает, что операция JOIN выполняется только над вновь вставленными строками, а не над всей таблицей.

Во втором случае, когда присоединяется `vt0`, представление считывает все данные из `t0`. Это гарантирует, что операция JOIN учитывает все строки в `t0`, а не только вновь вставленный блок.

Ключевое различие заключается в том, как ClickHouse обрабатывает исходную таблицу в запросе Материализованного Представления. Когда Материализованное Представление вызывается вставкой, исходная таблица (`t0` в данном случае) заменяется вставленным блоком данных. Это поведение можно использовать для оптимизации запросов, но оно также требует тщательного рассмотрения, чтобы избежать неожиданного результата.
```yaml
title: 'Сценарии использования и предостережения'
sidebar_label: 'Сценарии использования и предостережения'
keywords: ['materialized views', 'use cases', 'performance']
description: 'Обзор сценариев использования материализованных представлений и способов их оптимизации.'
```

### Сценарии использования и предостережения {#use-cases-and-caveats}

На практике вы можете использовать это поведение для оптимизации материализованных представлений, которые необходимо обрабатывать только для подмножества данных исходной таблицы. Например, вы можете использовать подзапрос для фильтрации исходной таблицы перед объединением ее с другими таблицами. Это может помочь сократить объем обрабатываемых данных и улучшить производительность.

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

В этом примере множество, построенное из подзапроса `IN (SELECT id FROM t0)`, содержит только новые вставленные строки, что может помочь отфильтровать `t1`.

#### Пример со Stack Overflow {#example-with-stack-overflow}

Рассмотрим наш [предыдущий пример материализованного представления](/materialized-view/incremental-materialized-view#example) для вычисления **ежедневных значков на пользователя**, включая отображаемое имя пользователя из таблицы `users`.

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

Это представление значительно повлияло на задержку вставки в таблицу `badges`, например:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 7.517 sec.
```

Используя вышеуказанный подход, мы можем оптимизировать это представление. Мы добавим фильтр к таблице `users`, используя идентификаторы пользователей в вставленных строках значков:

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

Это не только ускоряет первую вставку значков:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 132.118 sec. Processed 323.43 million rows, 4.69 GB (2.45 million rows/s., 35.49 MB/s.)
Peak memory usage: 1.99 GiB.
```

Но также делает будущие вставки значков эффективными:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

1 row in set. Elapsed: 0.583 sec.
```

В вышеуказанной операции только одна строка извлекается из таблицы users для идентификатора пользователя `2936484`. Этот поиск также оптимизируется с учетом ключа сортировки `Id`.

## Материализованные представления и объединения {#materialized-views-and-unions}

`UNION ALL` запросы часто используются для объединения данных из нескольких исходных таблиц в один результирующий набор.

Хотя `UNION ALL` не поддерживается напрямую в инкрементных материализованных представлениях, вы можете добиться того же результата, создав отдельное материализованное представление для каждого `SELECT` узла и записывая их результаты в общую целевую таблицу.

Для нашего примера мы будем использовать набор данных Stack Overflow. Рассмотрим таблицы `badges` и `comments` ниже, которые представляют собой знаки, заработанные пользователем, и комментарии, которые они оставляют к постам:

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
ORDER BY CreationDate;

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
ORDER BY UserId;
```

Эти таблицы можно заполнить следующими командами `INSERT INTO`:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet');
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet');
```

Предположим, что мы хотим создать объединенное представление активности пользователя, показывающее последнюю активность каждого пользователя, объединив эти две таблицы:

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
LIMIT 10;
```

Предположим, что у нас есть целевая таблица, чтобы получить результаты этого запроса. Обратите внимание на использование [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) движка таблицы и [AggregateFunction](/sql-reference/data-types/aggregatefunction), чтобы гарантировать правильное объединение результатов:

```sql
CREATE TABLE user_activity
(
    `UserId` String,
    `last_description` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `activity_type` AggregateFunction(argMax, String, DateTime64(3, 'UTC')),
    `last_activity` SimpleAggregateFunction(max, DateTime64(3, 'UTC'))
)
ENGINE = AggregatingMergeTree
ORDER BY UserId;
```

Хотя мы хотим, чтобы эта таблица обновлялась при вставке новых строк как в `badges`, так и в `comments`, наивный подход к этой проблеме может заключаться в попытке создать материализованное представление с предыдущим запросом объединения:

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
ORDER BY last_activity DESC;
```

Хотя это валидно с синтаксической точки зрения, это приведет к нежелательным результатам - представление будет вызывать вставки только в таблицу `comments`. Например:

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
│ 2936484 │ The answer is 42 │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.005 sec.
```

Вставки в таблицу `badges` не вызовут обновления представления, что приводит к тому, что `user_activity` не получает обновления:

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

Чтобы решить эту проблему, мы просто создаем материализованное представление для каждого оператора SELECT:

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

Теперь вставка в любую из таблиц приводит к получению правильных результатов. Например, если мы вставим в таблицу `comments`:

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

Аналогично, вставки в таблицу `badges` отражаются в таблице `user_activity`:

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

┌─UserId──┬─description──┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ gingerwizard │ badge         │ 2025-04-15 10:20:18.000 │
└─────────┴──────────────┴───────────────┴─────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

## Параллельная обработка против последовательной обработки {#materialized-views-parallel-vs-sequential}

Как показано в предыдущем примере, таблица может выступать в качестве источника для нескольких материализованных представлений. Порядок их выполнения зависит от настройки [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing).

По умолчанию эта настройка равна `0` (`false`), что означает, что материализованные представления выполняются последовательно в порядке `uuid`.

Например, рассмотрим следующую таблицу `source` и 3 материализованных представления, каждое из которых отправляет строки в таблицу `target`:

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

Обратите внимание, что каждое из представлений приостанавливается на 1 секунду перед вставкой своих строк в таблицу `target`, а также включает свое имя и время вставки.

Вставка строки в таблицу `source` занимает ~3 секунды, при этом каждое представление выполняется последовательно:

```sql
INSERT INTO source VALUES ('test');

1 row in set. Elapsed: 3.786 sec.
```

Мы можем подтвердить приход строк из каждого представления с помощью `SELECT`:

```sql
SELECT
    message,
    from,
    now
FROM target
ORDER BY now ASC;

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 14:52:01.306162309 │
│ test    │ mv1  │ 2025-04-15 14:52:02.307693521 │
│ test    │ mv2  │ 2025-04-15 14:52:03.309250283 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.015 sec.
```

Это соответствует `uuid` представлений:

```sql
SELECT
    name,
 uuid
FROM system.tables
WHERE name IN ('mv_1', 'mv_2', 'mv_3')
ORDER BY uuid ASC;

┌─name─┬─uuid─────────────────────────────────┐
│ mv_3 │ ba5e36d0-fa9e-4fe8-8f8c-bc4f72324111 │
│ mv_1 │ b961c3ac-5a0e-4117-ab71-baa585824d43 │
│ mv_2 │ e611cc31-70e5-499b-adcc-53fb12b109f5 │
└──────┴──────────────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

Напротив, рассмотрим, что произойдет, если мы вставим строку с включенной настройкой `parallel_view_processing=1`. С включенной этой настройкой представления выполняются параллельно, не давая гарантий порядка, в котором строки попадают в таблицу `target`:

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
ORDER BY now ASC;

┌─message─┬─from─┬───────────────────────────now─┐
│ test    │ mv3  │ 2025-04-15 19:47:32.242937372 │
│ test    │ mv1  │ 2025-04-15 19:47:32.243058183 │
│ test    │ mv2  │ 2025-04-15 19:47:32.337921800 │
└─────────┴──────┴───────────────────────────────┘

3 rows in set. Elapsed: 0.004 sec.
```

Хотя порядок поступления строк из каждого представления остается тем же, это не гарантируется, как показывает схожесть времени вставки каждой строки. Также стоит отметить улучшенную производительность вставки.

### Когда использовать параллельную обработку {#materialized-views-when-to-use-parallel}

Включение `parallel_view_processing=1` может значительно улучшить throughput вставки, как показано выше, особенно когда несколько материализованных представлений подключены к одной таблице. Тем не менее, важно понимать компромиссы:

- **Увеличенное давление на вставки**: Все материализованные представления выполняются одновременно, увеличивая использование CPU и памяти. Если каждое представление выполняет тяжелые вычисления или JOIN, это может перегрузить систему.
- **Необходимость строгого порядка выполнения**: В редких рабочих процессах, где порядок выполнения представлений имеет значение (например, связанные зависимости), параллельное выполнение может привести к несогласованному состоянию или условиям гонки. Хотя это возможно обойти, такие настройки хрупки и могут сломаться с будущими версиями.

:::note Исторические значения по умолчанию и стабильность
Последовательное выполнение долгое время было значением по умолчанию, отчасти из-за сложности обработки ошибок. Исторически сбой в одном материализованном представлении мог предотвратить выполнение других. Новые версии улучшили это, изолируя сбои по блокам, но последовательное выполнение все еще предоставляет более четкие семантики ошибок.
:::

В общем, включайте `parallel_view_processing=1`, когда:

- У вас есть несколько независимых материализованных представлений
- Вы хотите максимизировать производительность вставки
- Вы осведомлены о способности системы обрабатывать параллельное выполнение представлений

Оставляйте его выключенным, когда:
- Материализованные представления зависят друг от друга
- Вам требуется предсказуемое, упорядоченное выполнение
- Вы отлаживаете или проверяете поведение вставки и хотите детерминированное воспроизведение

## Материализованные представления и общие табличные выражения (CTEs) {#materialized-views-common-table-expressions-ctes}

**Некоррекционные** общие табличные выражения (CTEs) поддерживаются в материализованных представлениях.

:::note Общие табличные выражения **не материализуются**
ClickHouse не материализует CTE; вместо этого он напрямую вставляет определение CTE в запрос, что может привести к нескольким evaluations одного и того же выражения (если CTE используется более одного раза).
:::

Рассмотрим следующий пример, который вычисляет ежедневную активность для каждого типа поста.

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
    WHERE Score > 0 AND PostTypeId IN (1, 2)  -- Вопрос или Ответ
)
SELECT
    Day,
    CASE PostTypeId
        WHEN 1 THEN 'Вопрос'
        WHEN 2 THEN 'Ответ'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

Хотя CTE здесь строго не необходим, для примера представление будет работать, как и ожидалось:

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet');
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
LIMIT 10;

┌────────Day─┬─PostType─┬───────────AvgScore─┬─PostsCreated─┬─TotalViews─┐
│ 2024-03-31 │ Вопрос   │ 1.3317757009345794 │          214 │       9728 │
│ 2024-03-31 │ Ответ    │ 1.4747191011235956 │          356 │          0 │
│ 2024-03-30 │ Ответ    │ 1.4587912087912087 │          364 │          0 │
│ 2024-03-30 │ Вопрос   │ 1.2748815165876777 │          211 │       9606 │
│ 2024-03-29 │ Вопрос   │ 1.2641509433962264 │          318 │      14552 │
│ 2024-03-29 │ Ответ    │ 1.4706927175843694 │          563 │          0 │
│ 2024-03-28 │ Ответ    │  1.601637107776262 │          733 │          0 │
│ 2024-03-28 │ Вопрос   │ 1.3530864197530865 │          405 │      24564 │
│ 2024-03-27 │ Вопрос   │ 1.3225806451612903 │          434 │      21346 │
│ 2024-03-27 │ Ответ    │ 1.4907539118065434 │          703 │          0 │
└────────────┴──────────┴────────────────────┴──────────────┴────────────┘

10 rows in set. Elapsed: 0.013 sec. Processed 11.45 thousand rows, 663.87 KB (866.53 thousand rows/s., 50.26 MB/s.)
Peak memory usage: 989.53 KiB.
```

В ClickHouse CTE встраиваются, что означает, что они фактически копируются в запрос во время оптимизации и **не** материализуются. Это означает, что:

- Если ваш CTE ссылается на другую таблицу, отличную от исходной таблицы (то есть той, к которой прикреплено материализованное представление), и используется в условии `JOIN` или `IN`, он будет вести себя как подзапрос или соединение, а не как триггер.
- Материализованное представление все еще будет вызывать вставки только в основную исходную таблицу, но CTE будет повторно выполняться на каждой вставке, что может вызвать ненужные затраты, особенно если запрашиваемая таблица велика.

Например,

```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users);
```

В этом случае CTE пользователей повторно оценивается при каждой вставке в посты, а материализованное представление не будет обновляться при вставке новых пользователей - только при вставке постов.

В общем, используйте CTE для логики, которая работает с той же исходной таблицей, к которой прикреплено материализованное представление, или убедитесь, что запрашиваемые таблицы малы и вряд ли вызовут узкие места производительности. В качестве альтернативы рассмотрите [те же оптимизации, что и для JOIN с материализованными представлениями](/materialized-view/incremental-materialized-view#join-best-practices).
