---
slug: /data-modeling/projections
title: 'Проекции'
description: 'Страница, на которой объясняется, что такое проекции, как их использовать для повышения производительности запросов и чем они отличаются от материализованных представлений.'
keywords: ['projection', 'projections', 'query optimization']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';

# Проекции {#projections}

## Введение {#introduction}

ClickHouse предлагает различные механизмы для ускорения аналитических запросов по большим
объёмам данных в режимах реального времени. Один из таких механизмов
— использование _проекций (Projections)_. Проекции помогают оптимизировать
запросы за счёт переупорядочивания данных по нужным атрибутам. Это может быть:

1. Полное переупорядочивание
2. Подмножество исходной таблицы с другим порядком
3. Предварительно вычисленная агрегация (аналогично материализованному представлению), но с порядком,
   согласованным с агрегацией.

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Как работают Projections? {#how-do-projections-work}

На практике Projection можно рассматривать как дополнительную скрытую таблицу для
исходной таблицы. Projection может иметь иной порядок строк и, следовательно,
другой первичный индекс по сравнению с исходной таблицей, а также может автоматически
и инкрементально предварительно вычислять агрегированные значения. В результате использование Projections
предоставляет два механизма оптимизации для ускорения выполнения запросов:

- **Корректное использование первичных индексов**
- **Предварительное вычисление агрегатов**

Projections в некотором смысле похожи на [Materialized Views](/materialized-views),
которые также позволяют иметь несколько порядков строк и предварительно вычислять агрегации
в момент вставки. 
Projections автоматически обновляются и
остаются синхронизированными с исходной таблицей, в отличие от Materialized Views, которые
обновляются явно. Когда запрос направлен к исходной таблице,
ClickHouse автоматически выбирает первичные ключи и таблицу, которая может
сгенерировать тот же корректный результат, но требует чтения наименьшего объема данных, как показано на рисунке ниже:

<Image img={projections_1} size="md" alt="Projections в ClickHouse"/>

### Более эффективное хранение с `_part_offset` {#smarter_storage_with_part_offset}

Начиная с версии 25.5, ClickHouse поддерживает виртуальный столбец `_part_offset` в 
проекциях, что предоставляет новый способ определения проекций.

Теперь есть два способа определения проекции:

- **Хранить полные столбцы (исходное поведение)**: проекция содержит полные 
  данные и может читаться напрямую, обеспечивая более высокую производительность, когда фильтры соответствуют порядку сортировки проекции.

- **Хранить только ключ сортировки + `_part_offset`**: проекция работает как индекс. 
  ClickHouse использует первичный индекс проекции, чтобы найти подходящие строки, но читает
  фактические данные из базовой таблицы. Это снижает накладные расходы на хранение ценой 
  немного большего объёма операций ввода-вывода во время выполнения запроса.

Эти подходы также можно комбинировать, храня часть столбцов в проекции, а
остальные — косвенно через `_part_offset`.

## Когда использовать проекции? {#when-to-use-projections}

Проекции — привлекательная возможность для новых пользователей, так как они автоматически 
поддерживаются по мере вставки данных. Более того, запросы могут отправляться 
к одной таблице, где проекции по возможности используются для ускорения 
времени отклика.

В отличие от материализованных представлений, где пользователю необходимо выбирать 
соответствующую оптимизированную целевую таблицу или переписывать запрос в зависимости 
от фильтров. Это накладывает больше требований на пользовательские приложения и увеличивает 
сложность на стороне клиента.

Несмотря на эти преимущества, у проекций есть некоторые присущие им ограничения, 
о которых пользователям следует знать, поэтому применять их стоит выборочно.

- Проекции не позволяют использовать разные TTL для исходной таблицы и 
  (скрытой) целевой таблицы, тогда как материализованные представления позволяют задавать разные TTL.
- Легковесные операции обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления можно выстраивать в цепочку: целевая таблица одного материализованного представления 
  может быть исходной таблицей другого материализованного представления и так далее. Это 
  невозможно для проекций.
- Определения проекций не поддерживают соединения (JOIN), тогда как материализованные представления их поддерживают. Однако запросы к таблицам с проекциями могут свободно использовать соединения.
- Определения проекций не поддерживают фильтры (оператор `WHERE`), тогда как материализованные представления их поддерживают. Однако запросы к таблицам с проекциями могут свободно использовать фильтрацию.

Мы рекомендуем использовать проекции, когда:

- Требуется полное переупорядочивание данных. Хотя выражение в 
  проекции теоретически может использовать `GROUP BY`, материализованные представления более 
  эффективны для поддержки агрегатов. Оптимизатор запросов также с большей вероятностью
  будет использовать проекции, выполняющие простое переупорядочивание, то есть `SELECT * ORDER BY x`.
  Пользователи могут выбрать подмножество столбцов в этом выражении, чтобы уменьшить 
  занимаемый объём хранения.
- Пользователи готовы к потенциальному увеличению занимаемого объёма хранения и 
  накладным расходам на двукратную запись данных. Протестируйте влияние на скорость вставки и 
  [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).

## Примеры {#examples}

### Фильтрация по столбцам, которые не входят в первичный ключ {#filtering-without-using-primary-keys}

В этом примере мы покажем, как добавить проекцию к таблице.
Мы также рассмотрим, как проекция может использоваться для ускорения запросов, которые фильтруют
по столбцам, не входящим в первичный ключ таблицы.

В этом примере мы будем использовать набор данных New York Taxi Data,
доступный на [sql.clickhouse.com](https://sql.clickhouse.com/), который упорядочен
по `pickup_datetime`.

Напишем простой запрос, чтобы найти все идентификаторы поездок, для которых пассажиры
дали водителю чаевые свыше $200:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice that because we are filtering on `tip_amount` which is not in the `ORDER BY`, ClickHouse 
had to do a full table scan. Let's speed this query up.

So as to preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

To add a projection we use the `ALTER TABLE` statement together with the `ADD PROJECTION`
statement:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

It is necessary after adding a projection to use the `MATERIALIZE PROJECTION` 
statement so that the data in it is physically ordered and rewritten according
to the specified query above:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Let's run the query again now that we've added the projection:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Notice how we were able to decrease the query time substantially, and needed to scan
less rows.

We can confirm that our query above did indeed use the projection we made by
querying the `system.query_log` table:

```sql
SELECT query, projections 
FROM system.query_log 
WHERE query_id='<query_id>'
```

```response
   ┌─query─────────────────────────────────────────────────────────────────────────┬─projections──────────────────────┐
   │ SELECT                                                                       ↴│ ['default.trips.prj_tip_amount'] │
   │↳  tip_amount,                                                                ↴│                                  │
   │↳  trip_id,                                                                   ↴│                                  │
   │↳  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min↴│                                  │
   │↳FROM trips WHERE tip_amount > 200 AND trip_duration_min > 0                   │                                  │
   └───────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘
```

### Using projections to speed up UK price paid queries {#using-projections-to-speed-up-UK-price-paid}

To demonstrate how projections can be used to speed up query performance, let's
take a look at an example using a real life dataset. For this example we'll be 
using the table from our [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
tutorial with 30.03 million rows. This dataset is also available within our 
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS)
environment.

If you would like to see how the table was created and data inserted, you can
refer to ["The UK property prices dataset"](/getting-started/example-datasets/uk-price-paid)
page.

We can run two simple queries on this dataset. The first lists the counties in London which
have the highest prices paid, and the second calculates the average price for the counties:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Notice that despite being very fast how a full table scan of all 30.03 million rows occurred for both queries, due 
to the fact that neither `town` nor `price` were in our `ORDER BY` statement when we
created the table:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Let's see if we can speed this query up using projections.

To preserve the original table and results, we'll create a new table and copy the data using an `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

We create and populate projection `prj_oby_town_price` which produces an 
additional (hidden) table with a primary index, ordering by town and price, to 
optimize the query that lists the counties in a specific town for the highest 
paid prices:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_obj_town_price
  (
    SELECT *
    ORDER BY
        town,
        price
  ))
```

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_obj_town_price)
SETTINGS mutations_sync = 1
```

The [`mutations_sync`](/operations/settings/settings#mutations_sync) setting is
used to force synchronous execution.

We create and populate projection `prj_gby_county` – an additional (hidden) table
that incrementally pre-computes the avg(price) aggregate values for all existing
130 UK counties:

```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (ADD PROJECTION prj_gby_county
  (
    SELECT
        county,
        avg(price)
    GROUP BY county
  ))
```
```sql
ALTER TABLE uk.uk_price_paid_with_projections
  (MATERIALIZE PROJECTION prj_gby_county)
SETTINGS mutations_sync = 1
```

:::note
If there is a `GROUP BY` clause used in a projection like in the `prj_gby_county`
projection above, then the underlying storage engine for the (hidden) table 
becomes `AggregatingMergeTree`, and all aggregate functions are converted to 
`AggregateFunction`. This ensures proper incremental data aggregation.
:::

The figure below is a visualization of the main table `uk_price_paid_with_projections`
and its two projections:

<Image img={projections_2} size="md" alt="Visualization of the main table uk_price_paid_with_projections and its two projections"/>

If we now run the query that lists the counties in London for the three highest 
paid prices again, we see an improvement in query performance:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Likewise, for the query that lists the U.K. counties with the three highest 
average-paid prices:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Note that both queries target the original table, and that both queries resulted
in a full table scan (all 30.03 million rows got streamed from disk) before we 
created the two projections.

Also, note that the query that lists the counties in London for the three highest
paid prices is streaming 2.17 million rows. When we directly used a second table
optimized for this query, only 81.92 thousand rows were streamed from disk.

The reason for the difference is that currently, the `optimize_read_in_order` 
optimization mentioned above isn't supported for projections.

We inspect the `system.query_log` table to see that ClickHouse 
automatically used the two projections for the two queries above (see the 
projections column below):

```sql
SELECT
  tables,
  query,
  query_duration_ms::String ||  ' ms' AS query_duration,
        formatReadableQuantity(read_rows) AS read_rows,
  projections
FROM clusterAllReplicas(default, system.query_log)
WHERE (type = 'QueryFinish') AND (tables = ['default.uk_price_paid_with_projections'])
ORDER BY initial_query_start_time DESC
  LIMIT 2
FORMAT Vertical
```

```response
Строка 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 мс
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

Строка 2:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
  county,
  price
FROM uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
SETTINGS log_queries=1
query_duration: 11 мс
read_rows:      2.29 млн
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2 строки. Затрачено: 0.006 сек.
```

### Further examples {#further-examples}

The following examples use the same UK price dataset, contrasting queries with and without projections.

In order to preserve our original table (and performance), we again create a copy of the table using `CREATE AS` and `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Build a Projection {#build-projection}

Let's create an aggregate projection by the dimensions `toYear(date)`, `district`, and `town`:

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    )
```

Populate the projection for existing data. (Without materializing it, the projection will be created for only newly inserted data):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

The following queries contrast performance with and without projections. To disable projection use we use the setting [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), which is enabled by default.

#### Query 1. Average price per year {#average-price-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk.uk_price_paid_with_projections_v2
GROUP BY year
ORDER BY year ASC

```
The results should be the same, but the performance better on the latter example!

#### Query 2. Average price per year in London {#average-price-london-projections}

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC
```

#### Query 3. The most expensive neighborhoods {#most-expensive-neighborhoods-projections}

The condition (date >= '2020-01-01') needs to be modified so that it matches the projection dimension (`toYear(date) >= 2020)`:

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
SETTINGS optimize_use_projections=0
```

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid_with_projections_v2
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

Again, the result is the same but notice the improvement in query performance for the 2nd query.

### Combining projections in one query {#combining-projections}

Starting in version 25.6, building on the `_part_offset` support introduced in 
the previous version, ClickHouse can now use multiple projections to accelerate 
a single query with multiple filters.

Importantly, ClickHouse still reads data from only one projection (or the base table), 
but can use other projections' primary indexes to prune unnecessary parts before reading.
This is especially useful for queries that filter on multiple columns, each 
potentially matching a different projection.

> Currently, this mechanism only prunes entire parts. Granule-level pruning is 
  not yet supported.

To demonstrate this, we define the table (with projections using `_part_offset` columns)
and insert five example rows matching the diagrams above.

```sql
CREATE TABLE page_views
(
    id UInt64,
    event_date Date,
    user_id UInt32,
    url String,
    region String,
    PROJECTION region_proj
    (
        SELECT _part_offset ORDER BY region
    ),
    PROJECTION user_id_proj
    (
        SELECT _part_offset ORDER BY user_id
    )
)
ENGINE = MergeTree
ORDER BY (event_date, id)
SETTINGS
  index_granularity = 1, -- одна строка на гранулу
  max_bytes_to_merge_at_max_space_in_pool = 1; -- отключить слияние
```

Then we insert data into the table:

```sql
INSERT INTO page_views VALUES (
1, '2025-07-01', 101, 'https://example.com/page1', 'europe');
INSERT INTO page_views VALUES (
2, '2025-07-01', 102, 'https://example.com/page2', 'us_west');
INSERT INTO page_views VALUES (
3, '2025-07-02', 106, 'https://example.com/page3', 'us_west');
INSERT INTO page_views VALUES (
4, '2025-07-02', 107, 'https://example.com/page4', 'us_west');
INSERT INTO page_views VALUES (
5, '2025-07-03', 104, 'https://example.com/page5', 'asia');
```

:::note
Note: The table uses custom settings for illustration, such as one-row granules 
and disabled part merges, which are not recommended for production use.
:::

This setup produces:
- Five separate parts (one per inserted row)
- One primary index entry per row (in the base table and each projection)
- Each part contains exactly one row

With this setup, we run a query filtering on both `region` and `user_id`. 
Since the base table’s primary index is built from `event_date` and `id`, it
is unhelpful here, ClickHouse therefore uses:

- `region_proj` to prune parts by region
- `user_id_proj` to further prune by `user_id`

This behavior is visible using `EXPLAIN projections = 1`, which shows how 
ClickHouse selects and applies projections.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```

```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Выражение ((Project names + Projection))                                               │
 2. │   Выражение                                                                            │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Проекции:                                                                          │
 5. │       Название: region_proj                                                                │
 6. │         Описание: проекция проанализирована и используется для фильтрации на уровне частей │
 7. │         Условие: (region in ['us_west', 'us_west'])                                  │
 8. │         Алгоритм поиска: двоичный поиск                                                │
 9. │         Части: 3                                                                       │
10. │         Метки: 3                                                                       │
11. │         Диапазоны: 3                                                                      │
12. │         Строки: 3                                                                        │
13. │         Filtered Части: 2                                                              │
14. │       Название: user_id_proj                                                               │
15. │         Описание: проекция проанализирована и используется для фильтрации на уровне частей │
16. │         Условие: (user_id in [107, 107])                                             │
17. │         Алгоритм поиска: двоичный поиск                                                │
18. │         Части: 1                                                                       │
19. │         Метки: 1                                                                       │
20. │         Диапазоны: 1                                                                      │
21. │         Строки: 1                                                                        │
22. │         Filtered Части: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

Вывод `EXPLAIN` (показан выше) отображает логический план запроса, сверху вниз:

| Номер строки | Описание                                                                                               |
|--------------|--------------------------------------------------------------------------------------------------------|
| 3            | Планирует чтение из базовой таблицы `page_views`                                                       |
| 5-13         | Использует `region_proj` для определения 3 частей, где `region = 'us_west'`, отбрасывая 2 из 5 частей  |
| 14-22        | Использует `user_id_proj` для определения 1 части, где `user_id = 107`, дополнительно отбрасывая 2 из 3 оставшихся частей |

В итоге из базовой таблицы читается только **1 из 5 частей**.
За счет комбинированного анализа индексов нескольких проекций ClickHouse существенно снижает объем сканируемых данных, 
повышая производительность при низких накладных расходах на хранение.

## Связанные материалы {#related-content}

- [Практическое введение в первичные индексы ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Материализованные представления](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)