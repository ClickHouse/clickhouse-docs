---
slug: /data-modeling/projections
title: 'Проекции'
description: 'Страница, объясняющая, что такое проекции, как использовать их для повышения
производительности запросов и чем они отличаются от материализованных представлений.'
keywords: ['projection', 'projections', 'query optimization']
sidebar_order: 1
doc_type: 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Проекции



## Введение {#introduction}

ClickHouse предлагает различные механизмы ускорения аналитических запросов по большим
объёмам данных в сценариях реального времени. Одним из таких механизмов ускорения
запросов является использование _проекций_. Проекции помогают оптимизировать
запросы путём создания переупорядочивания данных по интересующим атрибутам. Это может быть:

1. Полное переупорядочивание
2. Подмножество исходной таблицы с другим порядком сортировки
3. Предварительно вычисленная агрегация (аналогично материализованному представлению) с упорядочиванием,
   согласованным с агрегацией.

<br />
<iframe
  width='560'
  height='315'
  src='https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse'
  title='Видеоплеер YouTube'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>


## Как работают проекции? {#how-do-projections-work}

На практике проекцию можно рассматривать как дополнительную скрытую таблицу к
исходной таблице. Проекция может иметь другой порядок строк и, следовательно,
другой первичный индекс по сравнению с исходной таблицей, а также может автоматически
и инкрементально предварительно вычислять агрегированные значения. В результате использование проекций
предоставляет два «инструмента настройки» для ускорения выполнения запросов:

- **Правильное использование первичных индексов**
- **Предварительное вычисление агрегатов**

Проекции в некотором смысле похожи на [материализованные представления](/materialized-views),
которые также позволяют иметь несколько порядков строк и предварительно вычислять агрегации
во время вставки.
Проекции автоматически обновляются и
поддерживаются в синхронизации с исходной таблицей, в отличие от материализованных представлений, которые
обновляются явно. Когда запрос обращается к исходной таблице,
ClickHouse автоматически анализирует первичные ключи и выбирает таблицу, которая может
сгенерировать тот же корректный результат, но требует минимального объема данных для
чтения, как показано на рисунке ниже:

<Image img={projections_1} size='md' alt='Проекции в ClickHouse' />

### Более эффективное хранение с `_part_offset` {#smarter_storage_with_part_offset}

Начиная с версии 25.5, ClickHouse поддерживает виртуальную колонку `_part_offset` в
проекциях, что предоставляет новый способ определения проекции.

Теперь существует два способа определения проекции:

- **Хранение полных колонок (исходное поведение)**: Проекция содержит полные
  данные и может быть прочитана напрямую, обеспечивая более высокую производительность, когда фильтры соответствуют
  порядку сортировки проекции.

- **Хранение только ключа сортировки + `_part_offset`**: Проекция работает как индекс.
  ClickHouse использует первичный индекс проекции для поиска соответствующих строк, но читает
  фактические данные из базовой таблицы. Это снижает накладные расходы на хранение за счет
  немного большего количества операций ввода-вывода во время выполнения запроса.

Вышеуказанные подходы также можно комбинировать, храня некоторые колонки в проекции, а
другие косвенно через `_part_offset`.


## Когда использовать проекции? {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, поскольку они автоматически
поддерживаются при вставке данных. Кроме того, запросы можно отправлять в одну
таблицу, где проекции используются при возможности для ускорения
времени отклика.

В отличие от материализованных представлений, где пользователь должен выбрать
соответствующую оптимизированную целевую таблицу или переписать запрос в зависимости от
фильтров. Это создаёт дополнительную нагрузку на пользовательские приложения и увеличивает
сложность на стороне клиента.

Несмотря на эти преимущества, проекции имеют ряд присущих им ограничений, о которых
пользователи должны знать, и поэтому их следует применять с осторожностью.

- Проекции не позволяют использовать разные TTL для исходной таблицы и
  (скрытой) целевой таблицы, материализованные представления позволяют использовать разные TTL.
- Лёгкие обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления можно объединять в цепочки: целевая таблица одного материализованного представления
  может быть исходной таблицей другого материализованного представления и так далее. С проекциями
  это невозможно.
- Проекции не поддерживают соединения (JOIN), но материализованные представления поддерживают.
- Проекции не поддерживают фильтры (условие `WHERE`), но материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полная переупорядочивание данных. Хотя выражение в
  проекции теоретически может использовать `GROUP BY`, материализованные представления более
  эффективны для поддержания агрегатов. Оптимизатор запросов также с большей вероятностью
  будет использовать проекции с простым переупорядочиванием, то есть `SELECT * ORDER BY x`.
  Пользователи могут выбрать подмножество столбцов в этом выражении для уменьшения объёма
  хранилища.
- Пользователи готовы к потенциальному увеличению объёма хранилища и
  накладным расходам на двойную запись данных. Протестируйте влияние на скорость вставки и
  [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).


## Примеры {#examples}

### Фильтрация по столбцам, не входящим в первичный ключ {#filtering-without-using-primary-keys}

В этом примере мы покажем, как добавить проекцию к таблице.
Также мы рассмотрим, как проекция может использоваться для ускорения запросов с фильтрацией
по столбцам, не входящим в первичный ключ таблицы.

Для этого примера мы будем использовать набор данных New York Taxi Data,
доступный на [sql.clickhouse.com](https://sql.clickhouse.com/), который упорядочен
по `pickup_datetime`.

Напишем простой запрос для поиска всех идентификаторов поездок, в которых пассажиры
оставили водителю чаевые более $200:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, что поскольку мы фильтруем по `tip_amount`, который не входит в `ORDER BY`, ClickHouse
пришлось выполнить полное сканирование таблицы. Давайте ускорим этот запрос.

Чтобы сохранить исходную таблицу и результаты, создадим новую таблицу и скопируем данные с помощью `INSERT INTO SELECT`:

```sql
CREATE TABLE nyc_taxi.trips_with_projection AS nyc_taxi.trips;
INSERT INTO nyc_taxi.trips_with_projection SELECT * FROM nyc_taxi.trips;
```

Для добавления проекции используем оператор `ALTER TABLE` вместе с оператором `ADD PROJECTION`:

```sql
ALTER TABLE nyc_taxi.trips_with_projection
ADD PROJECTION prj_tip_amount
(
    SELECT *
    ORDER BY tip_amount, dateDiff('minutes', pickup_datetime, dropoff_datetime)
)
```

После добавления проекции необходимо использовать оператор `MATERIALIZE PROJECTION`,
чтобы данные в ней были физически упорядочены и перезаписаны в соответствии
с указанным выше запросом:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Выполним запрос снова теперь, когда мы добавили проекцию:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, как нам удалось существенно сократить время выполнения запроса и уменьшить количество
просканированных строк.

Мы можем подтвердить, что наш запрос действительно использовал созданную нами проекцию,
выполнив запрос к таблице `system.query_log`:

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

### Использование проекций для ускорения запросов к данным о ценах на недвижимость в Великобритании {#using-projections-to-speed-up-UK-price-paid}

Чтобы продемонстрировать, как проекции могут использоваться для ускорения выполнения запросов, давайте
рассмотрим пример с использованием реального набора данных. Для этого примера мы будем
использовать таблицу из нашего руководства [UK Property Price Paid](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid)
с 30,03 миллионами строк. Этот набор данных также доступен в нашей
среде [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS).

Если вы хотите узнать, как была создана таблица и загружены данные, вы можете
обратиться к странице [«Набор данных о ценах на недвижимость в Великобритании»](/getting-started/example-datasets/uk-price-paid).

Мы можем выполнить два простых запроса к этому набору данных. Первый выводит графства в Лондоне с
наивысшими уплаченными ценами, а второй вычисляет среднюю цену для графств:

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

Обратите внимание, что, несмотря на очень высокую скорость, для обоих запросов было выполнено полное сканирование таблицы по всем 30,03 миллионам строк, поскольку ни `town`, ни `price` не были указаны в выражении `ORDER BY` при создании таблицы:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Давайте посмотрим, удастся ли нам ускорить этот запрос с помощью проекций.

Чтобы сохранить исходную таблицу и результаты, создадим новую таблицу и скопируем данные с помощью `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

Мы создаём и заполняем проекцию `prj_oby_town_price`, которая формирует
дополнительную (скрытую) таблицу с первичным индексом, упорядоченную по town и price,
для оптимизации запроса, который выводит округа (`county`) в заданном town с
наибольшими значениями price:

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

Настройка [`mutations_sync`](/operations/settings/settings#mutations_sync)
используется для принудительного синхронного выполнения.

Мы создаём и заполняем проекцию `prj_gby_county` — дополнительную (скрытую) таблицу,
которая по мере поступления данных предварительно вычисляет агрегированные значения avg(price) для всех
130 графств Великобритании:

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
становится `AggregatingMergeTree`, а все агрегатные функции преобразуются в
`AggregateFunction`. Это обеспечивает корректную поэтапную агрегацию данных.
:::

На рисунке ниже показана основная таблица `uk_price_paid_with_projections`
и две её проекции:

<Image img={projections_2} size="md" alt="Визуализация основной таблицы uk_price_paid_with_projections и её двух проекций" />

Если теперь снова выполнить запрос, который выводит графства в Лондоне для трёх
наиболее высоких оплаченных цен, мы увидим улучшение производительности запроса:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Аналогично, для запроса, который выводит графства Великобритании с тремя
наибольшими средними ценами сделок:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Обратите внимание, что оба запроса обращаются к исходной таблице и что оба запроса привели
к полному сканированию таблицы (все 30,03 миллиона строк были прочитаны с диска) до того, как мы
создали две проекции.

Также обратите внимание, что запрос, который перечисляет графства в Лондоне для трёх самых высоких
цен продажи, обрабатывает 2,17 миллиона строк. Когда мы напрямую использовали вторую таблицу,
оптимизированную под этот запрос, с диска было прочитано только 81,92 тысячи строк.

Причина этой разницы в том, что в настоящее время оптимизация `optimize_read_in_order`,
упомянутая выше, не поддерживается для проекций.

Мы анализируем таблицу `system.query_log`, чтобы увидеть, что ClickHouse
автоматически использовал две проекции для двух запросов выше (см. столбец
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
Row 1:
──────
tables:         ['uk.uk_price_paid_with_projections']
query:          SELECT
    county,
    avg(price)
FROM uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
query_duration: 5 ms
read_rows:      132.00
projections:    ['uk.uk_price_paid_with_projections.prj_gby_county']

Row 2:
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
query_duration: 11 ms
read_rows:      2.29 million
projections:    ['uk.uk_price_paid_with_projections.prj_obj_town_price']

2 rows in set. Elapsed: 0.006 sec.
```

### Дополнительные примеры {#further-examples}

В следующих примерах используется тот же набор данных о ценах в Великобритании, сравнивая запросы с проекциями и без них.

Чтобы сохранить исходную таблицу (и производительность), снова создадим копию таблицы с помощью `CREATE AS` и `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Создание проекции {#build-projection}

Создадим агрегатную проекцию по измерениям `toYear(date)`, `district` и `town`:

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

Заполним проекцию для существующих данных. (Без материализации проекция будет создаваться только для вновь вставляемых данных):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

Следующие запросы сравнивают производительность с проекциями и без них. Для отключения использования проекций применяется настройка [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), которая включена по умолчанию.

#### Запрос 1. Средняя цена по годам {#average-price-projections}

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

Результаты должны быть одинаковыми, но производительность во втором примере будет выше!

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

Условие (date >= '2020-01-01') необходимо изменить так, чтобы оно соответствовало измерению проекции (`toYear(date) >= 2020`):

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

Результат снова тот же, но обратите внимание на улучшение производительности второго запроса.

### Комбинирование проекций в одном запросе {#combining-projections}

Начиная с версии 25.6, на основе поддержки `_part_offset`, добавленной в
предыдущей версии, ClickHouse теперь может использовать несколько проекций для ускорения
одного запроса с несколькими фильтрами.

Важно отметить, что ClickHouse по-прежнему читает данные только из одной проекции (или базовой таблицы),
но может использовать первичные индексы других проекций для отсечения ненужных кусков перед чтением.
Это особенно полезно для запросов с фильтрацией по нескольким столбцам, каждый из которых
потенциально соответствует отдельной проекции.

> В настоящее время этот механизм отсекает только целые куски. Отсечение на уровне гранул
> пока не поддерживается.

Для демонстрации определим таблицу (с проекциями, использующими столбцы `_part_offset`)
и вставим пять примеров строк, соответствующих приведенным выше диаграммам.

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
Примечание: Таблица использует специальные настройки для демонстрации, такие как гранулы из одной строки
и отключенное слияние кусков, что не рекомендуется для использования в продакшене.
:::

Эта конфигурация создает:

- Пять отдельных кусков (по одному на каждую вставленную строку)
- Одну запись первичного индекса на строку (в базовой таблице и каждой проекции)
- Каждый кусок содержит ровно одну строку

С такой конфигурацией выполним запрос с фильтрацией по `region` и `user_id`.
Поскольку первичный индекс базовой таблицы построен на основе `event_date` и `id`, он
здесь бесполезен, поэтому ClickHouse использует:

- `region_proj` для отсечения кусков по региону
- `user_id_proj` для дальнейшего отсечения по `user_id`

Это поведение можно увидеть с помощью `EXPLAIN projections = 1`, который показывает, как
ClickHouse выбирает и применяет проекции.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```


```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Выражение ((Проекция имен + Проекция))                                                  │
 2. │   Выражение                                                                            │                                                                        
 3. │     ЧтениеИзMergeTree (default.page_views)                                             │
 4. │     Проекции:                                                                          │
 5. │       Имя: region_proj                                                                 │
 6. │         Описание: Проекция была проанализирована и используется для фильтрации на уровне частей │
 7. │         Условие: (region in ['us_west', 'us_west'])                                    │
 8. │         Алгоритм поиска: бинарный поиск                                                │
 9. │         Части: 3                                                                       │
10. │         Метки: 3                                                                       │
11. │         Диапазоны: 3                                                                   │
12. │         Строки: 3                                                                      │
13. │         Отфильтрованные части: 2                                                       │
14. │       Имя: user_id_proj                                                                │
15. │         Описание: Проекция была проанализирована и используется для фильтрации на уровне частей │
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

| Row number | Description                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 3          | Планирует чтение из базовой таблицы `page_views`                                                                               |
| 5-13       | Использует `region_proj` для определения 3 партиций, где region = &#39;us&#95;west&#39;, отбрасывая 2 из 5 партиций            |
| 14-22      | Использует `user_id_proj` для определения 1 партиции, где `user_id = 107`, дополнительно отбрасывая 2 из 3 оставшихся партиций |

В итоге из базовой таблицы читается только **1 из 5 партиций**.
Комбинируя анализ индексов нескольких проекций, ClickHouse значительно сокращает объём сканируемых данных,
повышая производительность при низких затратах на хранение.


## Связанный контент {#related-content}

- [Практическое введение в первичные индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Материализованные представления](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
