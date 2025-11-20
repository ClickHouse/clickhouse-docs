---
slug: /materialized-view/incremental-materialized-view
title: 'Инкрементальное материализованное представление'
description: 'Как использовать инкрементальные материализованные представления для ускорения запросов'
keywords: ['incremental materialized views', 'speed up queries', 'query optimization']
score: 10000
doc_type: 'guide'
---

import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import Image from '@theme/IdealImage';


## Общие сведения {#background}

Инкрементные материализованные представления (Materialized Views) позволяют пользователям перенести вычислительную нагрузку с момента выполнения запроса на момент вставки данных, что обеспечивает более быстрое выполнение запросов `SELECT`.

В отличие от транзакционных баз данных, таких как Postgres, материализованное представление в ClickHouse — это триггер, который выполняет запрос над блоками данных по мере их вставки в таблицу. Результат этого запроса вставляется во вторую «целевую» таблицу. При вставке новых строк результаты снова отправляются в целевую таблицу, где промежуточные результаты обновляются и объединяются. Этот объединённый результат эквивалентен выполнению запроса над всеми исходными данными.

Основное назначение материализованных представлений состоит в том, что результаты, вставляемые в целевую таблицу, представляют собой результаты агрегации, фильтрации или преобразования строк. Эти результаты зачастую являются более компактным представлением исходных данных (частичным эскизом в случае агрегаций). Это, в сочетании с простотой результирующего запроса для чтения данных из целевой таблицы, обеспечивает более быстрое выполнение запросов по сравнению с выполнением тех же вычислений над исходными данными, перенося вычислительную нагрузку (и, следовательно, задержку запроса) с момента выполнения запроса на момент вставки данных.

Материализованные представления в ClickHouse обновляются в реальном времени по мере поступления данных в таблицу, на которой они основаны, функционируя скорее как постоянно обновляемые индексы. Это отличается от других баз данных, где материализованные представления обычно являются статическими снимками запроса, которые необходимо обновлять вручную (аналогично [обновляемым материализованным представлениям](/sql-reference/statements/create/view#refreshable-materialized-view) в ClickHouse).

<Image
  img={materializedViewDiagram}
  size='md'
  alt='Диаграмма материализованного представления'
/>


## Пример {#example}

В качестве примера мы будем использовать набор данных Stack Overflow, описанный в разделе [«Проектирование схемы»](/data-modeling/schema-design).

Предположим, мы хотим получить количество положительных и отрицательных голосов в день для публикации.

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

Этот запрос уже выполняется быстро благодаря ClickHouse, но можем ли мы добиться ещё большей производительности?

Если мы хотим выполнять вычисления во время вставки с помощью материализованного представления, нам потребуется таблица для получения результатов. Эта таблица должна хранить только одну строку на день. Если поступает обновление для существующего дня, значения других столбцов должны быть объединены со строкой этого дня. Чтобы такое слияние инкрементных состояний происходило, для других столбцов необходимо хранить частичные состояния.

Для этого в ClickHouse используется специальный тип движка: [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). Он заменяет все строки с одинаковым ключом сортировки одной строкой, содержащей суммированные значения числовых столбцов. Следующая таблица будет объединять строки с одинаковой датой, суммируя числовые столбцы:

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

Для демонстрации работы материализованного представления предположим, что таблица votes пуста и ещё не содержит данных. Наше материализованное представление выполняет указанный выше запрос `SELECT` для данных, вставляемых в `votes`, а результаты направляются в `up_down_votes_per_day`:

```sql
CREATE MATERIALIZED VIEW up_down_votes_per_day_mv TO up_down_votes_per_day AS
SELECT toStartOfDay(CreationDate)::Date AS Day,
       countIf(VoteTypeId = 2) AS UpVotes,
       countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY Day
```

Здесь ключевым является предложение `TO`, которое указывает, куда будут направлены результаты, то есть в `up_down_votes_per_day`.


Мы можем повторно заполнить таблицу votes из предыдущей вставки:

```sql
INSERT INTO votes SELECT toUInt32(Id) AS Id, toInt32(PostId) AS PostId, VoteTypeId, CreationDate, UserId, BountyAmount
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/votes/*.parquet')

0 rows in set. Elapsed: 111.964 sec. Processed 477.97 million rows, 3.89 GB (4.27 million rows/s., 34.71 MB/s.)
Peak memory usage: 283.49 MiB.
```

После завершения можно проверить размер таблицы `up_down_votes_per_day` — должна быть 1 строка на каждый день:

```sql
SELECT count()
FROM up_down_votes_per_day
FINAL

┌─count()─┐
│    5723 │
└─────────┘
```

Мы эффективно сократили количество строк с 238 миллионов (в таблице `votes`) до 5000, сохранив результат запроса. Ключевой момент здесь в том, что при вставке новых голосов в таблицу `votes` новые значения будут отправлены в `up_down_votes_per_day` для соответствующего дня, где они будут автоматически объединены асинхронно в фоновом режиме, сохраняя только одну строку на день. Таким образом, таблица `up_down_votes_per_day` всегда будет компактной и актуальной.

Поскольку объединение строк происходит асинхронно, при выполнении запроса может быть более одной строки на день. Чтобы гарантировать объединение всех необработанных строк во время выполнения запроса, есть два варианта:

- Использовать модификатор `FINAL` для имени таблицы. Мы использовали его для запроса подсчета выше.
- Агрегировать по ключу сортировки, используемому в целевой таблице, то есть `CreationDate`, и суммировать метрики. Обычно это более эффективно и гибко (таблицу можно использовать для других целей), но первый вариант может быть проще для некоторых запросов. Ниже показаны оба варианта:

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

Это ускорило запрос с 0.133 с до 0.004 с — улучшение более чем в 25 раз!

:::important Важно: `ORDER BY` = `GROUP BY`
В большинстве случаев столбцы, используемые в предложении `GROUP BY` преобразования материализованных представлений, должны соответствовать столбцам, используемым в предложении `ORDER BY` целевой таблицы при использовании движков таблиц `SummingMergeTree` или `AggregatingMergeTree`. Эти движки используют столбцы `ORDER BY` для объединения строк с идентичными значениями во время фоновых операций слияния. Несоответствие между столбцами `GROUP BY` и `ORDER BY` может привести к неэффективной производительности запросов, неоптимальным слияниям или даже расхождениям в данных.
:::

### Более сложный пример {#a-more-complex-example}


В приведённом выше примере используются материализованные представления для вычисления и ведения двух сумм по дням. Суммы представляют собой самую простую форму агрегации для поддержания частичных состояний — мы можем просто добавлять новые значения к существующим по мере их поступления. Однако материализованные представления в ClickHouse могут использоваться для агрегаций любого типа.

Предположим, мы хотим вычислять некоторые статистики по постам за каждый день: 99,9-й перцентиль для `Score` и среднее значение `CommentCount`. Запрос для вычисления этого может выглядеть следующим образом:

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

Получено 10 строк. Время выполнения: 0.113 сек. Обработано 59.82 млн строк, 777.65 МБ (528.48 млн строк/сек., 6.87 ГБ/сек.)
Пиковое потребление памяти: 658.84 МиБ.
```

Как и ранее, мы можем создать материализованное представление, которое будет выполнять приведённый выше запрос при вставке новых постов в таблицу `posts`.

В учебных целях и чтобы избежать загрузки данных постов из S3, мы создадим дубликат таблицы `posts_null` с той же схемой, что и у `posts`. Однако эта таблица не будет хранить данные и будет использоваться только материализованным представлением при вставке строк. Чтобы предотвратить хранение данных, мы можем использовать [движок таблицы `Null`](/engines/table-engines/special/null).

```sql
CREATE TABLE posts_null AS posts ENGINE = Null
```

Движок таблицы Null — это мощная оптимизация — думайте о нем как о `/dev/null`. Наша материализованная представление будет вычислять и сохранять сводную статистику, когда таблица `posts_null` получает строки при вставке — это всего лишь триггер. Однако исходные данные сохраняться не будут. Хотя в нашем случае мы, вероятно, все же хотим хранить исходные посты, этот подход можно использовать для вычисления агрегатов, избегая накладных расходов на хранение «сырых» данных.

Материализованная представление, таким образом, становится:

```sql
CREATE MATERIALIZED VIEW post_stats_mv TO post_stats_per_day AS
       SELECT toStartOfDay(CreationDate) AS Day,
       quantileState(0.999)(Score) AS Score_quantiles,
       avgState(CommentCount) AS AvgCommentCount
FROM posts_null
GROUP BY Day
```

Обратите внимание, что мы добавляем суффикс `State` к именам наших агрегатных функций. Это гарантирует, что будет возвращено агрегатное состояние функции, а не окончательный результат. Оно будет содержать дополнительную информацию, позволяющую этому частичному состоянию объединяться с другими состояниями. Например, в случае среднего значения оно будет включать количество и сумму значений столбца.

> Частичные агрегатные состояния необходимы для получения корректных результатов. Например, при вычислении среднего простое усреднение средних значений по поддиапазонам даёт некорректный результат.

Теперь создадим целевую таблицу для этого представления `post_stats_per_day`, которая будет хранить эти частичные агрегатные состояния:


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

Ранее для хранения счетчиков нам было достаточно движка `SummingMergeTree`, но для других функций требуется более продвинутый тип: [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree).
Чтобы ClickHouse «знал», что будут храниться состояния агрегатных функций, мы определяем `Score_quantiles` и `AvgCommentCount` с типом `AggregateFunction`, указывая функцию, формирующую частичные состояния, и тип исходных столбцов. Как и в `SummingMergeTree`, строки с одинаковым значением ключа `ORDER BY` будут объединяться (в приведенном выше примере — по `Day`).

Чтобы заполнить таблицу `post_stats_per_day` через материализованное представление, мы можем просто вставить все строки из `posts` в `posts_null`:

```sql
INSERT INTO posts_null SELECT * FROM posts

0 rows in set. Elapsed: 13.329 sec. Processed 119.64 million rows, 76.99 GB (8.98 million rows/s., 5.78 GB/s.)
```

> В продакшене вы, скорее всего, будете привязывать материализованное представление к таблице `posts`. Здесь мы использовали `posts_null`, чтобы продемонстрировать таблицу `null`.

В нашем финальном запросе необходимо использовать суффикс `Merge` для функций (так как столбцы хранят состояния частичной агрегации):

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

Обратите внимание, что здесь мы используем `GROUP BY`, а не `FINAL`.


## Другие применения {#other-applications}

Выше основное внимание уделялось использованию материализованных представлений для инкрементального обновления частичных агрегатов данных, что позволяет перенести вычисления с момента выполнения запроса на момент вставки. Помимо этого распространенного сценария использования, материализованные представления имеют ряд других применений.

### Фильтрация и преобразование {#filtering-and-transformation}

В некоторых ситуациях может потребоваться вставлять только подмножество строк и столбцов при вставке данных. В этом случае таблица `posts_null` может получать вставки, при этом запрос `SELECT` фильтрует строки перед вставкой в таблицу `posts`. Например, предположим, что необходимо преобразовать столбец `Tags` в таблице `posts`. Он содержит список имен тегов, разделенных символом вертикальной черты. Преобразовав их в массив, можно легче агрегировать данные по отдельным значениям тегов.

> Это преобразование можно выполнить при выполнении `INSERT INTO SELECT`. Материализованное представление позволяет инкапсулировать эту логику в DDL ClickHouse и сохранить простоту `INSERT`, при этом преобразование будет применяться к любым новым строкам.

Материализованное представление для этого преобразования показано ниже:

```sql
CREATE MATERIALIZED VIEW posts_mv TO posts AS
        SELECT * EXCEPT Tags, arrayFilter(t -> (t != ''), splitByChar('|', Tags)) as Tags FROM posts_null
```

### Таблица поиска {#lookup-table}

При выборе ключа сортировки ClickHouse следует учитывать паттерны доступа к данным. Необходимо использовать столбцы, которые часто применяются в условиях фильтрации и агрегации. Это может быть ограничением для сценариев, где паттерны доступа более разнообразны и не могут быть охвачены одним набором столбцов. Например, рассмотрим следующую таблицу `comments`:

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

Предположим, необходимо отфильтровать данные по конкретному `UserId` и вычислить средний `Score`:

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

Хотя запрос выполняется быстро (данные небольшие для ClickHouse), по количеству обработанных строк — 90,38 миллиона — видно, что требуется полное сканирование таблицы. Для больших наборов данных можно использовать материализованное представление для поиска значений ключа сортировки `PostId` по столбцу фильтрации `UserId`. Эти значения затем можно использовать для выполнения эффективного поиска.

В этом примере материализованное представление может быть очень простым, выбирая только `PostId` и `UserId` из `comments` при вставке. Эти результаты, в свою очередь, отправляются в таблицу `comments_posts_users`, которая упорядочена по `UserId`. Создадим null-версию таблицы `Comments` и используем её для заполнения представления и таблицы `comments_posts_users`:

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

Теперь можно использовать это представление в подзапросе для ускорения предыдущего запроса:

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

```


1 строка в наборе. Время: 0.012 сек. Обработано 88.61 тыс. строк, 771.37 КБ (7.09 млн строк/с, 61.73 МБ/с.)

```

### Цепочки / каскадные материализованные представления {#chaining}

Материализованные представления можно объединять в цепочки (или каскады), что позволяет создавать сложные рабочие процессы.
Подробнее см. руководство ["Каскадные материализованные представления"](https://clickhouse.com/docs/guides/developer/cascading-materialized-views).
```


## Материализованные представления и JOIN {#materialized-views-and-joins}

:::note Обновляемые материализованные представления
Следующее относится только к инкрементным материализованным представлениям. Обновляемые материализованные представления периодически выполняют свой запрос по всему целевому набору данных и полностью поддерживают JOIN. Рассмотрите возможность их использования для сложных JOIN, если допустимо снижение актуальности результатов.
:::

Инкрементные материализованные представления в ClickHouse полностью поддерживают операции `JOIN`, но с одним важным ограничением: **материализованное представление срабатывает только при вставке данных в исходную таблицу (крайнюю левую таблицу в запросе).** Таблицы с правой стороны JOIN не вызывают обновления, даже если их данные изменяются. Это поведение особенно важно при создании **инкрементных** материализованных представлений, где данные агрегируются или преобразуются во время вставки.

Когда инкрементное материализованное представление определяется с использованием `JOIN`, крайняя левая таблица в запросе `SELECT` выступает в качестве источника. При вставке новых строк в эту таблицу ClickHouse выполняет запрос материализованного представления _только_ с этими вновь вставленными строками. Таблицы с правой стороны JOIN читаются полностью во время этого выполнения, но изменения только в них не вызывают срабатывание представления.

Такое поведение делает JOIN в материализованных представлениях похожими на соединение со снимком статических справочных данных.

Это хорошо работает для обогащения данных справочными таблицами или таблицами измерений. Однако любые обновления таблиц с правой стороны (например, метаданных пользователей) не будут ретроактивно обновлять материализованное представление. Чтобы увидеть обновленные данные, в исходную таблицу должны поступить новые вставки.

### Пример {#materialized-views-and-joins-example}

Рассмотрим конкретный пример с использованием [набора данных Stack Overflow](/data-modeling/schema-design). Мы используем материализованное представление для вычисления **ежедневного количества значков на пользователя**, включая отображаемое имя пользователя из таблицы `users`.

Напомним, что схемы наших таблиц следующие:

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

Предположим, что наша таблица `users` уже заполнена:

```sql
INSERT INTO users
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/users.parquet');
```

Материализованное представление и связанная с ним целевая таблица определяются следующим образом:

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
Предложение `GROUP BY` в материализованном представлении должно включать `DisplayName`, `UserId` и `Day`, чтобы соответствовать `ORDER BY` в целевой таблице `SummingMergeTree`. Это обеспечивает корректную агрегацию и слияние строк. Пропуск любого из этих полей может привести к неправильным результатам или неэффективным слияниям.
:::

Если теперь заполнить таблицу значков, представление сработает и заполнит нашу таблицу `daily_badges_by_user`.

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

0 rows in set. Elapsed: 433.762 sec. Processed 1.16 billion rows, 28.50 GB (2.67 million rows/s., 65.70 MB/s.)
```

Предположим, мы хотим просмотреть значки, полученные конкретным пользователем. Можно написать следующий запрос:


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

Получено 8 строк. Прошло: 0.018 сек. Обработано 32.77 тыс. строк, 642.14 КБ (1.86 млн строк/с., 36.44 МБ/с.)
```

Теперь, если этот пользователь получит новый бейдж и будет вставлена новая строка, наше представление обновится:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

Получена 1 строка. Прошло: 7.517 сек.

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

Получено 9 строк. Прошло: 0.017 сек. Обработано 32.77 тыс. строк, 642.27 КБ (1.96 млн строк/сек., 38.50 МБ/сек.)
```

:::warning
Обратите внимание на задержку вставки. Вставляемая строка пользователя соединяется со всей таблицей `users`, что существенно влияет на производительность вставки. Ниже мы предлагаем подходы для решения этой проблемы в разделе [&quot;Использование исходной таблицы в фильтрах и JOIN-ах&quot;](/materialized-view/incremental-materialized-view#using-source-table-in-filters-and-joins-in-materialized-views).
:::

Напротив, если мы сначала вставим значок для нового пользователя, а затем строку для самого пользователя, наше материализованное представление не сможет корректно зафиксировать метрики этого пользователя.

```sql
INSERT INTO badges VALUES (53505059, 23923286, 'Good Answer', now(), 'Bronze', 0);
INSERT INTO users VALUES (23923286, 1, now(),  'brand_new_user', now(), 'UK', 1, 1, 0);
```


```sql
SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user';

0 строк в наборе. Затрачено: 0.017 сек. Обработано 32.77 тыс. строк, 644.32 КБ (1.98 млн строк/с., 38.94 МБ/с.)
```

В данном случае представление выполняется только для вставки значка до того, как существует строка пользователя. Если мы вставим еще один значок для пользователя, строка будет вставлена, как и ожидалось:

```sql
INSERT INTO badges VALUES (53505060, 23923286, 'Teacher', now(), 'Bronze', 0);

SELECT *
FROM daily_badges_by_user
FINAL
WHERE DisplayName = 'brand_new_user'

┌────────Day─┬───UserId─┬─DisplayName────┬─Gold─┬─Silver─┬─Bronze─┐
│ 2025-04-13 │ 23923286 │ brand_new_user │    0 │      0 │      1 │
└────────────┴──────────┴────────────────┴──────┴────────┴────────┘

1 строка в наборе. Затрачено: 0.018 сек. Обработано 32.77 тыс. строк, 644.48 КБ (1.87 млн строк/с., 36.72 МБ/с.)
```

Обратите внимание, однако, что этот результат неверен.

### Рекомендации по использованию JOIN в материализованных представлениях {#join-best-practices}

- **Используйте крайнюю левую таблицу в качестве триггера.** Только таблица в левой части оператора `SELECT` запускает материализованное представление. Изменения в таблицах справа не будут запускать обновления.

- **Предварительно вставляйте объединяемые данные.** Убедитесь, что данные в объединяемых таблицах существуют до вставки строк в исходную таблицу. JOIN вычисляется во время вставки, поэтому отсутствующие данные приведут к несопоставленным строкам или значениям null.

- **Ограничивайте количество столбцов из объединений.** Выбирайте только необходимые столбцы из объединяемых таблиц, чтобы минимизировать использование памяти и снизить задержку при вставке (см. ниже).

- **Оценивайте производительность при вставке.** JOIN увеличивает стоимость вставок, особенно при больших таблицах справа. Проводите тестирование скорости вставки с использованием репрезентативных производственных данных.

- **Предпочитайте словари для простых поисков**. Используйте [словари](/dictionary) для поиска по ключу-значению (например, ID пользователя в имя), чтобы избежать дорогостоящих операций JOIN.

- **Согласуйте `GROUP BY` и `ORDER BY` для эффективного слияния.** При использовании `SummingMergeTree` или `AggregatingMergeTree` убедитесь, что `GROUP BY` соответствует выражению `ORDER BY` в целевой таблице для обеспечения эффективного слияния строк.

- **Используйте явные псевдонимы столбцов.** Когда таблицы имеют совпадающие имена столбцов, используйте псевдонимы для предотвращения неоднозначности и обеспечения корректных результатов в целевой таблице.

- **Учитывайте объем и частоту вставок.** JOIN хорошо работает при умеренных нагрузках вставки. Для высокопроизводительной загрузки данных рассмотрите использование промежуточных таблиц, предварительных объединений или других подходов, таких как словари и [обновляемые материализованные представления](/materialized-view/refreshable-materialized-view).

### Использование исходной таблицы в фильтрах и объединениях {#using-source-table-in-filters-and-joins-in-materialized-views}

При работе с материализованными представлениями в ClickHouse важно понимать, как обрабатывается исходная таблица во время выполнения запроса материализованного представления. В частности, исходная таблица в запросе материализованного представления заменяется вставляемым блоком данных. Такое поведение может привести к неожиданным результатам, если его не понимать должным образом.

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

В приведенном выше примере у нас есть два материализованных представления `mvw1` и `mvw2`, которые выполняют похожие операции, но с небольшим различием в способе обращения к исходной таблице `t0`.

В `mvw1` таблица `t0` напрямую указывается внутри подзапроса `(SELECT * FROM t0)` в правой части JOIN. Когда данные вставляются в `t0`, запрос материализованного представления выполняется с заменой `t0` на вставленный блок данных. Это означает, что операция JOIN выполняется только для вновь вставленных строк, а не для всей таблицы.

Во втором случае при соединении с `vt0` представление читает все данные из `t0`. Это гарантирует, что операция JOIN учитывает все строки в `t0`, а не только вновь вставленный блок.

Ключевое различие заключается в том, как ClickHouse обрабатывает исходную таблицу в запросе материализованного представления. Когда материализованное представление срабатывает при вставке, исходная таблица (`t0` в данном случае) заменяется вставленным блоком данных. Это поведение можно использовать для оптимизации запросов, но оно также требует внимательного подхода, чтобы избежать неожиданных результатов.

### Варианты использования и предостережения {#use-cases-and-caveats}

На практике вы можете использовать это поведение для оптимизации материализованных представлений, которым необходимо обрабатывать только подмножество данных исходной таблицы. Например, вы можете использовать подзапрос для фильтрации исходной таблицы перед её соединением с другими таблицами. Это может помочь сократить объем обрабатываемых материализованным представлением данных и повысить производительность.

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

В этом примере набор, построенный из подзапроса `IN (SELECT id FROM t0)`, содержит только вновь вставленные строки, что позволяет отфильтровать `t1` по нему.

#### Пример с переполнением стека {#example-with-stack-overflow}

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

Используя описанный выше подход, мы можем оптимизировать это представление. Мы добавим фильтр к таблице `users`, используя идентификаторы пользователей из вставленных строк значков:

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

Это не только ускоряет первоначальную вставку значков:

```sql
INSERT INTO badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')

```


0 строк в наборе. Время выполнения: 132.118 сек. Обработано 323.43 млн строк, 4.69 GB (2.45 млн строк/с, 35.49 MB/s.)
Пиковое потребление памяти: 1.99 GiB.

````

Но это также означает, что будущие вставки значков будут эффективными:

```sql
INSERT INTO badges VALUES (53505058, 2936484, 'gingerwizard', now(), 'Gold', 0);

Обработана 1 строка. Затрачено: 0.583 сек.
````

В приведённой выше операции из таблицы users извлекается только одна строка с идентификатором пользователя `2936484`. Этот поиск также оптимизирован благодаря ключу упорядочивания таблицы `Id`.


## Материализованные представления и объединения {#materialized-views-and-unions}

Запросы `UNION ALL` обычно используются для объединения данных из нескольких исходных таблиц в единый результирующий набор.

Хотя `UNION ALL` не поддерживается напрямую в инкрементальных материализованных представлениях, того же результата можно достичь, создав отдельное материализованное представление для каждой ветви `SELECT` и записывая их результаты в общую целевую таблицу.

В нашем примере мы будем использовать набор данных Stack Overflow. Рассмотрим таблицы `badges` и `comments` ниже, которые представляют значки, полученные пользователем, и комментарии, которые он оставляет к публикациям:

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

Эти таблицы можно заполнить следующими командами `INSERT INTO`:

```sql
INSERT INTO stackoverflow.badges SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/badges.parquet')
INSERT INTO stackoverflow.comments SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/comments/*.parquet')
```

Предположим, мы хотим создать единое представление активности пользователей, показывающее последнюю активность каждого пользователя путем объединения этих двух таблиц:

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

Предположим, у нас есть целевая таблица для получения результатов этого запроса. Обратите внимание на использование движка таблиц [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) и типа данных [AggregateFunction](/sql-reference/data-types/aggregatefunction) для обеспечения корректного слияния результатов:

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

Чтобы эта таблица обновлялась при вставке новых строк в `badges` или `comments`, наивным подходом к решению этой задачи может быть попытка создать материализованное представление с предыдущим запросом объединения:

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

Хотя это синтаксически корректно, это приведет к непредвиденным результатам — представление будет срабатывать только при вставках в таблицу `comments`. Например:

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

```


┌─UserId──┬─description──────┬─activity&#95;type─┬───────────last&#95;activity─┐
│ 2936484 │ Ответ — 42       │ comment       │ 2025-04-15 09:56:19.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 строка в наборе. Прошло: 0.005 сек.

````

Вставки в таблицу `badges` не будут активировать представление, поэтому `user_activity` не будет получать обновления:

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

1 строка в наборе. Время выполнения: 0,005 с.
````

Чтобы решить эту задачу, мы просто создаём материализованное представление для каждого запроса SELECT:

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

Вставка в любую из таблиц теперь дает правильный результат. Например, если мы вставим в таблицу `comments`:

```sql
INSERT INTO comments VALUES (99999999, 23121, 1, 'Ответ — 42', now(), 2936484, 'gingerwizard');

SELECT
 UserId,
 argMaxMerge(last_description) AS description,
 argMaxMerge(activity_type) AS activity_type,
    max(last_activity) AS last_activity
FROM user_activity
WHERE UserId = '2936484'
GROUP BY UserId;

┌─UserId──┬─description──────┬─activity_type─┬───────────last_activity─┐
│ 2936484 │ Ответ — 42       │ comment       │ 2025-04-15 10:18:47.000 │
└─────────┴──────────────────┴───────────────┴─────────────────────────┘

1 строка в наборе. Время выполнения: 0.006 сек.
```

Аналогично, вставки в таблицу `badges` отображаются в таблице `user_activity`:

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

1 строка в выборке. Затрачено: 0.006 сек.
```


## Параллельная и последовательная обработка {#materialized-views-parallel-vs-sequential}

Как показано в предыдущем примере, таблица может служить источником для нескольких материализованных представлений. Порядок их выполнения зависит от настройки [`parallel_view_processing`](/operations/settings/settings#parallel_view_processing).

По умолчанию эта настройка равна `0` (`false`), что означает последовательное выполнение материализованных представлений в порядке `uuid`.

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

Обратите внимание, что каждое из представлений делает паузу в 1 секунду перед вставкой строк в таблицу `target`, а также включает своё имя и время вставки.

Вставка строки в таблицу `source` занимает ~3 секунды, при этом каждое представление выполняется последовательно:

```sql
INSERT INTO source VALUES ('test')

1 row in set. Elapsed: 3.786 sec.
```

Мы можем подтвердить поступление строк от каждого представления с помощью `SELECT`:

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

Это соответствует `uuid` представлений:

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

Напротив, рассмотрим, что происходит при вставке строки с включённой настройкой `parallel_view_processing=1`. При её включении представления выполняются параллельно, не давая гарантий относительно порядка поступления строк в целевую таблицу:

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


Хотя в нашем случае порядок поступления строк из каждого представления одинаков, это не гарантируется — на что указывает схожесть времени вставки каждой строки. Также обратите внимание на улучшенную производительность вставки.

### Когда использовать параллельную обработку {#materialized-views-when-to-use-parallel}

Включение `parallel_view_processing=1` может значительно повысить пропускную способность вставки, как показано выше, особенно когда к одной таблице подключено несколько материализованных представлений. Однако важно понимать компромиссы:

- **Повышенная нагрузка при вставке**: Все материализованные представления выполняются одновременно, увеличивая использование CPU и памяти. Если каждое представление выполняет тяжёлые вычисления или JOIN-операции, это может перегрузить систему.
- **Необходимость строгого порядка выполнения**: В редких сценариях, где порядок выполнения представлений имеет значение (например, при цепочках зависимостей), параллельное выполнение может привести к несогласованному состоянию или условиям гонки. Хотя можно спроектировать решение с учётом этого, такие конфигурации хрупки и могут перестать работать в будущих версиях.

:::note Исторические значения по умолчанию и стабильность
Последовательное выполнение долгое время было значением по умолчанию, отчасти из-за сложностей обработки ошибок. Исторически сбой в одном материализованном представлении мог препятствовать выполнению других. Новые версии улучшили это, изолируя сбои на уровне блоков, но последовательное выполнение по-прежнему обеспечивает более чёткую семантику обработки сбоев.
:::

В общем случае включайте `parallel_view_processing=1`, когда:

- У вас есть несколько независимых материализованных представлений
- Вы стремитесь максимизировать производительность вставки
- Вы осведомлены о возможностях системы обрабатывать параллельное выполнение представлений

Оставьте параметр отключённым, когда:

- Материализованные представления имеют зависимости друг от друга
- Вам требуется предсказуемое упорядоченное выполнение
- Вы выполняете отладку или аудит поведения вставки и хотите детерминированного воспроизведения


## Материализованные представления и обобщённые табличные выражения (CTE) {#materialized-views-common-table-expressions-ctes}

**Нерекурсивные** обобщённые табличные выражения (CTE) поддерживаются в материализованных представлениях.

:::note Обобщённые табличные выражения **не** материализуются
ClickHouse не материализует CTE; вместо этого он подставляет определение CTE непосредственно в запрос, что может привести к многократному вычислению одного и того же выражения (если CTE используется более одного раза).
:::

Рассмотрим следующий пример, который вычисляет ежедневную активность для каждого типа публикации.

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
        WHEN 1 THEN 'Question'
        WHEN 2 THEN 'Answer'
    END AS PostType,
    count() AS PostsCreated,
    avgState(Score) AS AvgScore,
    sum(ViewCount) AS TotalViews
FROM filtered_posts
GROUP BY Day, PostTypeId;
```

Хотя CTE здесь не является обязательным, для целей примера представление будет работать как ожидается:

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

В ClickHouse CTE встраиваются, что означает их фактическое копирование в запрос во время оптимизации, и они **не** материализуются. Это означает:

- Если ваше CTE ссылается на таблицу, отличную от исходной таблицы (т.е. той, к которой привязано материализованное представление), и используется в условии `JOIN` или `IN`, оно будет вести себя как подзапрос или соединение, а не как триггер.
- Материализованное представление по-прежнему будет срабатывать только при вставках в основную исходную таблицу, но CTE будет повторно выполняться при каждой вставке, что может вызвать ненужные накладные расходы, особенно если таблица, на которую ссылается CTE, имеет большой размер.

Например,


```sql
WITH recent_users AS (
  SELECT Id FROM stackoverflow.users WHERE CreationDate > now() - INTERVAL 7 DAY
)
SELECT * FROM stackoverflow.posts WHERE OwnerUserId IN (SELECT Id FROM recent_users)
```

В этом случае CTE `users` вычисляется заново при каждой вставке в `posts`, и материализованное представление не будет обновляться при добавлении новых записей в `users` — только при вставках в `posts`.

В целом используйте CTE для логики, которая работает с той же исходной таблицей, к которой привязано материализованное представление, или убедитесь, что задействованные таблицы невелики и с низкой вероятностью станут узким местом по производительности. В качестве альтернативы рассмотрите [те же оптимизации, что и для JOIN в материализованных представлениях](/materialized-view/incremental-materialized-view#join-best-practices).
