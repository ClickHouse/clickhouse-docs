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

Обратите внимание, что из‑за того, что мы фильтруем по `tip_amount`, который не входит в `ORDER BY`, ClickHouse
приходится выполнять полное сканирование таблицы. Давайте ускорим этот запрос.

Чтобы сохранить исходную таблицу и результаты, мы создадим новую таблицу и скопируем данные с помощью `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

Чтобы добавить проекцию, используем оператор `ALTER TABLE` вместе с оператором `ADD PROJECTION`:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

После добавления проекции необходимо использовать оператор `MATERIALIZE PROJECTION`,
чтобы данные в ней были физически отсортированы и перезаписаны в соответствии
с приведённым выше запросом:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Теперь, когда мы добавили проекцию, давайте снова выполним запрос:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, что нам удалось существенно сократить время выполнения запроса и при этом просканировать меньше строк.

Мы можем подтвердить, что наш запрос выше действительно использовал созданную нами проекцию, обратившись к таблице `system.query_log`:

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

### Использование проекций для ускорения запросов к данным UK price paid {#using-projections-to-speed-up-UK-price-paid}

Чтобы продемонстрировать, как проекции могут использоваться для ускорения выполнения запросов,
рассмотрим пример на реальном наборе данных. В этом примере мы будем
использовать таблицу из руководства [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid),
содержащую 30,03 миллиона строк. Этот набор данных также доступен в
среде [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS).

Если вы хотите узнать, как была создана таблица и загружены данные, обратитесь к странице [&quot;Набор данных о ценах на недвижимость в Великобритании&quot;](/getting-started/example-datasets/uk-price-paid).

Мы можем выполнить два простых запроса к этому набору данных. Первый выводит список районов Лондона с наибольшими суммами оплаты, а второй вычисляет среднюю цену по районам:

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

Обратите внимание, что несмотря на высокую скорость выполнения, для обоих запросов было выполнено полное сканирование всех 30,03 миллионов строк, так как ни `town`, ни `price` не были включены в ORDER BY при создании таблицы:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Проверим, можно ли ускорить этот запрос с помощью проекций.

Чтобы сохранить исходную таблицу и результаты, создадим новую таблицу и скопируем данные с помощью `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

Создаём и заполняем проекцию `prj_oby_town_price`, которая создаёт
дополнительную (скрытую) таблицу с первичным индексом, упорядоченную по городу и цене, для
оптимизации запроса, который выводит список округов в указанном городе с максимальными
ценами:

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

Настройка [`mutations_sync`](/operations/settings/settings#mutations_sync) используется для принудительного синхронного выполнения.

Создаём и заполняем проекцию `prj_gby_county` — дополнительную (скрытую) таблицу,
которая инкрементно предвычисляет агрегированные значения avg(price) для всех существующих
130 округов Великобритании:

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
Если в проекции используется предложение `GROUP BY`, как в проекции `prj_gby_county`
выше, то базовым движком хранения для (скрытой) таблицы
становится `AggregatingMergeTree`, и все агрегатные функции преобразуются в
`AggregateFunction`. Это обеспечивает правильную инкрементную агрегацию данных.
:::

На рисунке ниже показана визуализация основной таблицы `uk_price_paid_with_projections`
и двух её проекций:

<Image img={projections_2} size="md" alt="Визуализация основной таблицы uk_price_paid_with_projections и двух её проекций" />

Если теперь снова выполнить запрос, который выводит районы Лондона с тремя самыми высокими ценами продажи, мы увидим улучшение производительности запроса:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Аналогично для запроса, который выводит три округа Великобритании с наибольшими
средними ценами:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Обратите внимание, что оба запроса обращаются к исходной таблице, и оба запроса привели к полному сканированию таблицы (все 30,03 миллиона строк были считаны с диска) до создания двух проекций.

Также обратите внимание, что запрос, который выводит графства Лондона с тремя
наиболее высокими ценами, считывает в потоковом режиме 2,17 миллиона строк. Когда мы использовали вторую таблицу,
оптимизированную под этот запрос, с диска было прочитано только 81,92 тысячи строк.

Причина этой разницы в том, что в настоящее время оптимизация `optimize_read_in_order`,
упомянутая выше, не поддерживается для проекций.

Мы анализируем таблицу `system.query_log` и видим, что ClickHouse
автоматически использовал две проекции для двух приведённых выше запросов (см. столбец
projections ниже):

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

### Дополнительные примеры {#further-examples}

В следующих примерах используется тот же набор данных с ценами в Великобритании, и сравниваются запросы с использованием проекций и без них.

Чтобы сохранить нашу исходную таблицу (и производительность), мы снова создадим копию таблицы с помощью `CREATE AS` и `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Построим проекцию {#build-projection}

Давайте создадим агрегатную проекцию по измерениям `toYear(date)`, `district` и `town`:

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

Заполните проекцию для существующих данных. (Без материализации проекция будет создаваться только для данных, вставляемых после этого):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

Следующие запросы сравнивают производительность при использовании проекций и без них. Чтобы отключить использование проекций, мы используем настройку [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), которая включена по умолчанию.

#### Запрос 1. Средняя годовая цена {#average-price-projections}

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

Результат должен быть таким же, но производительность во втором примере будет лучше!

#### Запрос 2. Средняя цена по годам в Лондоне {#average-price-london-projections}

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

#### Запрос 3. Самые дорогие районы {#most-expensive-neighborhoods-projections}

Условие (date &gt;= &#39;2020-01-01&#39;) нужно изменить так, чтобы оно соответствовало измерению проекции (`toYear(date) >= 2020)`:

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

Результат по-прежнему тот же, но обратите внимание на улучшение производительности второго запроса.

### Комбинирование проекций в одном запросе {#combining-projections}

Начиная с версии 25.6, на основе поддержки `_part_offset`, добавленной в
предыдущей версии, ClickHouse теперь может использовать несколько проекций для ускорения
одного запроса с несколькими фильтрами.

Важно, что ClickHouse по‑прежнему считывает данные только из одной проекции (или базовой таблицы),
но может использовать первичные индексы других проекций для отсечения ненужных кусков данных (parts) перед чтением.
Это особенно полезно для запросов, которые фильтруют по нескольким столбцам, при этом каждый из них
может соответствовать своей проекции.

> В настоящее время этот механизм отсекает только целые части (parts). Отсечение на уровне гранул
> пока не поддерживается.

Чтобы продемонстрировать это, мы определим таблицу (с проекциями, использующими столбцы `_part_offset`)
и вставим пять примерных строк, соответствующих приведённым выше диаграммам.

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

Затем вставим данные в таблицу:

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
Примечание: в таблице для наглядности используются нестандартные настройки, такие как гранулы по одной строке
и отключённое слияние частей (parts), что не рекомендуется для использования в продакшене.
:::

Эта конфигурация даёт следующий результат:

* Пять отдельных частей (по одной на каждую вставленную строку)
* По одной записи первичного индекса на строку (в базовой таблице и в каждой проекции)
* Каждая часть содержит ровно одну строку

С такой конфигурацией мы выполняем запрос с фильтрацией и по `region`, и по `user_id`.
Поскольку первичный индекс базовой таблицы построен по `event_date` и `id`, он
здесь бесполезен, поэтому ClickHouse использует:

* `region_proj` для отсечения частей по региону
* `user_id_proj` для дополнительного отсечения по `user_id`

Это поведение видно при использовании `EXPLAIN projections = 1`, который показывает,
как ClickHouse выбирает и применяет проекции.

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