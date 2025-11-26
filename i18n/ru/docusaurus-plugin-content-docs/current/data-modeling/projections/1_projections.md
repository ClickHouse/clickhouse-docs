---
slug: /data-modeling/projections
title: 'Проекции'
description: 'Страница, посвящённая тому, что такое проекции, как их можно использовать для повышения производительности запросов и чем они отличаются от материализованных представлений.'
keywords: ['проекция', 'проекции', 'оптимизация запросов']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Проекции



## Введение {#introduction}

ClickHouse предлагает различные механизмы ускорения выполнения аналитических запросов по большим
объёмам данных в сценариях реального времени. Один из таких механизмов —
использование _Projections_. Projections помогают оптимизировать
запросы за счёт переупорядочивания данных по интересующим атрибутам. Это может быть:

1. Полное переупорядочивание данных
2. Подмножество исходной таблицы с иным порядком строк
3. Предварительно вычислённая агрегация (аналогично материализованному представлению), но с порядком,
   согласованным с этой агрегацией.

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



## Как работают Projections? {#how-do-projections-work}

Практически Projection можно рассматривать как дополнительную, скрытую таблицу
к исходной таблице. Проекция может иметь иной порядок строк и, следовательно, 
другой первичный индекс по сравнению с исходной таблицей, а также может 
автоматически и по мере вставки данных предварительно вычислять агрегированные значения. 
В результате использование Projections дает два «рычага настройки» для 
ускорения выполнения запросов:

- **Корректное использование первичных индексов**
- **Предварительное вычисление агрегатов**

Projections в некотором смысле похожи на [Materialized Views](/materialized-views),
которые также позволяют иметь несколько порядков строк и предварительно
вычислять агрегации во время вставки. 
Projections автоматически обновляются и
поддерживаются в актуальном состоянии и синхронизированными с исходной таблицей,
в отличие от Materialized Views, которые обновляются явно. Когда запрос направлен
к исходной таблице, ClickHouse автоматически сэмплирует первичные ключи и
выбирает таблицу, которая может сгенерировать тот же корректный результат, но
требует чтения наименьшего объема данных, как показано на рисунке ниже:

<Image img={projections_1} size="md" alt="Projections в ClickHouse"/>

### Более умное хранение с `_part_offset` {#smarter_storage_with_part_offset}

Начиная с версии 25.5, ClickHouse поддерживает виртуальный столбец `_part_offset`
в проекциях, который предлагает новый способ определения проекции.

Теперь есть два способа определить проекцию:

- **Хранить полные столбцы (исходное поведение)**: проекция содержит полные 
  данные и может читаться напрямую, обеспечивая более высокую производительность,
  когда фильтры соответствуют порядку сортировки проекции.

- **Хранить только ключ сортировки + `_part_offset`**: проекция работает как индекс. 
  ClickHouse использует первичный индекс проекции для поиска соответствующих строк,
  но читает фактические данные из базовой таблицы. Это снижает накладные расходы
  на хранение ценой немного большего объема операций ввода-вывода во время выполнения запроса.

Указанные подходы также можно комбинировать, храня часть столбцов в проекции, а
остальные — косвенно через `_part_offset`.



## Когда использовать проекции? {#when-to-use-projections}

Проекции являются привлекательной возможностью для новых пользователей, поскольку они автоматически 
поддерживаются по мере вставки данных. Кроме того, запросы могут отправляться просто к 
одной таблице, где проекции при возможности используются для ускорения 
времени отклика.

В отличие от этого, при использовании материализованных представлений пользователю необходимо выбирать 
подходящую оптимизированную целевую таблицу или переписывать запрос в зависимости от 
фильтров. Это создает большую нагрузку на пользовательские приложения и увеличивает 
сложность на стороне клиента.

Несмотря на эти преимущества, у проекций есть ряд встроенных ограничений, о которых
пользователям следует знать, поэтому их следует использовать избирательно.

- Проекции не позволяют использовать разные TTL для исходной таблицы и 
  (скрытой) целевой таблицы, тогда как материализованные представления допускают разные TTL.
- Легковесные операции обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления можно выстраивать в цепочки: целевая таблица одного материализованного представления 
  может быть исходной таблицей для другого материализованного представления и так далее. Это 
  невозможно для проекций.
- Проекции не поддерживают `JOIN`, тогда как материализованные представления поддерживают.
- Проекции не поддерживают фильтры (клауза `WHERE`), тогда как материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полная переупорядоченная организация данных. Хотя выражение в 
  проекции теоретически может использовать `GROUP BY`, материализованные представления более 
  эффективны для поддержки агрегатов. Оптимизатор запросов также с большей вероятностью
  будет использовать проекции, выполняющие простое переупорядочивание, то есть `SELECT * ORDER BY x`.
  Пользователи могут выбрать подмножество столбцов в этом выражении, чтобы уменьшить 
  объем хранимых данных.
- Пользователи готовы к возможному увеличению объема хранимых данных и 
  накладным расходам на двойную запись данных. Протестируйте влияние на скорость вставки и 
  [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).



## Примеры

### Фильтрация по столбцам, которые не входят в первичный ключ

В этом примере мы покажем, как добавить проекцию к таблице.
Мы также рассмотрим, как можно использовать проекцию для ускорения запросов, которые фильтруют
по столбцам, не входящим в первичный ключ таблицы.

В этом примере мы будем использовать набор данных New York Taxi Data,
доступный на [sql.clickhouse.com](https://sql.clickhouse.com/), который упорядочен
по `pickup_datetime`.

Напишем простой запрос, чтобы найти все идентификаторы поездок, в которых пассажиры
дали водителю чаевые свыше 200 $:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, что поскольку мы фильтруем по `tip_amount`, который не участвует в `ORDER BY`, ClickHouse
вынужден выполнить полное сканирование таблицы. Ускорим этот запрос.

Чтобы сохранить исходную таблицу и результаты, мы создадим новую таблицу и скопируем данные с помощью `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

Чтобы добавить проекцию, мы используем оператор `ALTER TABLE` вместе с оператором `ADD PROJECTION`:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

После добавления проекции необходимо выполнить оператор `MATERIALIZE PROJECTION`,
чтобы данные в ней были физически упорядочены и перезаписаны
в соответствии с указанным выше запросом:

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

Обратите внимание, что нам удалось существенно сократить время выполнения запроса и при этом сканировать меньше строк.

Мы можем подтвердить, что приведённый выше запрос действительно использовал созданную нами проекцию, обратившись к таблице `system.query_log`:

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

### Использование проекций для ускорения запросов к данным UK Price Paid

Чтобы продемонстрировать, как проекции могут использоваться для ускорения выполнения запросов, рассмотрим пример с использованием реального набора данных. В этом примере мы будем
использовать таблицу из нашего руководства [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
с 30,03 миллионами строк. Этот набор данных также доступен в нашей среде
[sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS).

Если вы хотите посмотреть, как была создана таблица и как в неё были вставлены данные, вы можете
обратиться к разделу [«The UK property prices dataset»](/getting-started/example-datasets/uk-price-paid).

Мы можем выполнить два простых запроса к этому набору данных. Первый выводит список графств Лондона,
в которых были заплачены самые высокие цены, а второй вычисляет среднюю цену по этим графствам:

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

Обратите внимание, что, несмотря на очень высокую скорость выполнения, для обоих запросов был выполнен полный скан всей таблицы с 30,03 миллионами строк из‑за того, что ни `town`, ни `price` не были указаны в нашем операторе `ORDER BY` при создании таблицы:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Давайте посмотрим, удастся ли нам ускорить выполнение этого запроса с помощью проекций.

Чтобы сохранить исходную таблицу и результаты, мы создадим новую таблицу и скопируем данные с помощью оператора `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

Мы создаём и заполняем проекцию `prj_oby_town_price`, которая создаёт
дополнительную (скрытую) таблицу с первичным индексом и сортировкой по городу и цене,
чтобы оптимизировать запрос, возвращающий графства в конкретном городе по наивысшим ценам:

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

Параметр [`mutations_sync`](/operations/settings/settings#mutations_sync)
используется для принудительного синхронного выполнения.

Мы создаём и заполняем проекцию `prj_gby_county` — дополнительную (скрытую) таблицу,
которая инкрементально предварительно вычисляет агрегатные значения avg(price) для всех 130 существующих
графств Великобритании:

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
Если в проекции, как в `prj_gby_county` выше, используется предложение `GROUP BY`,
то базовым движком хранения для (скрытой) таблицы становится `AggregatingMergeTree`,
а все агрегатные функции преобразуются в `AggregateFunction`. Это обеспечивает
корректную инкрементальную агрегацию данных.
:::

Рисунок ниже представляет собой визуализацию основной таблицы `uk_price_paid_with_projections`
и её двух проекций:

<Image img={projections_2} size="md" alt="Визуализация основной таблицы uk_price_paid_with_projections и её двух проекций" />

Если теперь снова выполнить запрос, который выводит округа Лондона с тремя
наибольшими ценами покупки, мы увидим улучшение производительности запроса:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Аналогично для запроса, выводящего графства Великобритании с тремя наибольшими средними ценами покупки:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Обратите внимание, что оба запроса обращаются к исходной таблице и что оба
запроса привели к полному сканированию таблицы (все 30,03 миллиона строк были
прочитаны с диска) до того, как мы создали две проекции.

Также обратите внимание, что запрос, который перечисляет графства в Лондоне по
трём самым высоким ценам продажи, считывает (стримит) 2,17 миллиона строк. Когда мы
напрямую использовали вторую таблицу, специально оптимизированную под этот запрос, с диска
было прочитано всего 81,92 тысячи строк.

Причина этой разницы в том, что в данный момент оптимизация
`optimize_read_in_order`, упомянутая выше, не поддерживается для проекций.

Мы проверяем таблицу `system.query_log`, чтобы увидеть, что ClickHouse
автоматически использовал две проекции для двух приведённых выше запросов
(см. столбец projections ниже):

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
─────────
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
─────────
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

Получено 2 строки. Прошло: 0.006 сек.
```

### Дополнительные примеры

В следующих примерах используется тот же набор данных по ценам в Великобритании, чтобы сравнить запросы с проекциями и без них.

Чтобы сохранить нашу исходную таблицу (и производительность), мы снова создаём копию таблицы с помощью `CREATE AS` и `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Создание проекции

Создадим агрегирующую проекцию по измерениям `toYear(date)`, `district` и `town`:

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

Заполните проекцию для существующих данных. (Если не выполнять материализацию, проекция будет создаваться только для вновь вставляемых данных):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

Следующие запросы сравнивают производительность с проекциями и без них. Для отключения использования проекций используется настройка [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), которая включена по умолчанию.

#### Запрос 1. Средняя цена по годам

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

Результаты должны совпадать, но во втором примере производительность будет лучше!

#### Запрос 2. Средняя цена по годам для Лондона

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

#### Запрос 3. Самые дорогие районы

Условие (date &gt;= &#39;2020-01-01&#39;) необходимо изменить так, чтобы оно соответствовало измерению проекции (`toYear(date) >= 2020)`:

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

Снова результат тот же, но обратите внимание на улучшение производительности второго запроса.

### Комбинирование проекций в одном запросе

Начиная с версии 25.6, на основе поддержки `_part_offset`,
появившейся в предыдущей версии, ClickHouse теперь может использовать несколько
проекций для ускорения одного запроса с несколькими фильтрами.

Важно, что ClickHouse по-прежнему читает данные только из одной проекции (или базовой таблицы),
но может использовать первичные индексы других проекций, чтобы отбросить ненужные парты до чтения.
Это особенно полезно для запросов, фильтрующих по нескольким столбцам, каждый из которых
может соответствовать своей проекции.

> В настоящее время этот механизм позволяет отбрасывать только целые парты. Фильтрация
> на уровне гранул пока не поддерживается.

Чтобы продемонстрировать это, мы определим таблицу (с проекциями, использующими столбцы `_part_offset`)
и вставим пять примерных строк, соответствующих диаграммам выше.

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
Примечание: в таблице используются специальные настройки для иллюстрации,
например гранулы размером в одну строку и отключённые слияния частей данных, что не рекомендуется для использования в продакшене.
:::

Эта конфигурация приводит к следующему:

* Пяти отдельным частям (по одной на каждую вставленную строку)
* По одной записи в первичном индексе на строку (в базовой таблице и в каждой проекции)
* Каждая часть содержит ровно одну строку

С такой конфигурацией мы выполняем запрос с фильтрацией сразу по `region` и `user_id`.
Поскольку первичный индекс базовой таблицы построен по `event_date` и `id`, он
здесь бесполезен, поэтому ClickHouse использует:

* `region_proj` для отсечения частей по региону
* `user_id_proj` для дополнительного отсечения по `user_id`

Это поведение видно с помощью `EXPLAIN projections = 1`, который показывает,
как ClickHouse выбирает и применяет проекции.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```


```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Имена проектов + Проекция))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Проекции:                                                                          │
 5. │       Имя: region_proj                                                                 │
 6. │         Описание: Проекция проанализирована и используется для фильтрации на уровне частей │
 7. │         Условие: (region in ['us_west', 'us_west'])                                    │
 8. │         Алгоритм поиска: бинарный поиск                                                │
 9. │         Части: 3                                                                       │
10. │         Метки: 3                                                                       │
11. │         Диапазоны: 3                                                                   │
12. │         Строки: 3                                                                      │
13. │         Отфильтрованные части: 2                                                       │
14. │       Имя: user_id_proj                                                                │
15. │         Описание: Проекция проанализирована и используется для фильтрации на уровне частей │
16. │         Условие: (user_id in [107, 107])                                               │
17. │         Алгоритм поиска: бинарный поиск                                                │
18. │         Части: 1                                                                       │
19. │         Метки: 1                                                                       │
20. │         Диапазоны: 1                                                                   │
21. │         Строки: 1                                                                      │
22. │         Отфильтрованные части: 2                                                       │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

Вывод `EXPLAIN` (показан выше) показывает логический план запроса сверху вниз:

| Row number | Description                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| 3          | План чтения из базовой таблицы `page_views`                                                                              |
| 5-13       | Использует `region_proj`, чтобы определить 3 части, где `region = &#39;us&#95;west&#39;`, отсекая 2 из 5 частей          |
| 14-22      | Использует `user_id_proj`, чтобы определить 1 часть, где `user_id = 107`, дополнительно отсекая 2 из 3 оставшихся частей |

В итоге из базовой таблицы читается только **1 часть из 5**.
Комбинируя анализ индексов нескольких проекций, ClickHouse значительно сокращает объём сканируемых данных,
повышая производительность при низких накладных расходах на хранение.


## Связанные материалы {#related-content}
- [Практическое введение в первичные индексы ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Материализованные представления](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
