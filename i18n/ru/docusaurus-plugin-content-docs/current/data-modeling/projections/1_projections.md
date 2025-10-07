---
'slug': '/data-modeling/projections'
'title': 'Проекции'
'description': 'Страница, описывающая, что такое projections, как их можно использовать
  для улучшения производительности запросов и как они отличаются от materialized views.'
'keywords':
- 'projection'
- 'projections'
- 'query optimization'
'sidebar_order': 1
'doc_type': 'guide'
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Проекции

## Введение {#introduction}

ClickHouse предлагает различные механизмы ускорения аналитических запросов на больших объемах данных для сценариев в реальном времени. Одним из таких механизмов для ускорения ваших запросов является использование _Проекций_. Проекции помогают оптимизировать запросы, создавая переупорядочивание данных по интересующим атрибутам. Это может быть:

1. Полное переупорядочивание
2. Подмножество исходной таблицы с другим порядком
3. Предварительно рассчитанная агрегация (аналогично материализованному представлению), но с порядком, соответствующим агрегации.

<br/>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Как работают Проекции? {#how-do-projections-work}

Практически проекцию можно рассматривать как дополнительную, скрытую таблицу по отношению к оригинальной таблице. Проекция может иметь другой порядок строк и, следовательно, другой первичный индекс, чем у оригинальной таблицы, и она может автоматически и инкрементно предварительно вычислять агрегированные значения. В результате использование Проекций предоставляет два "регулятора настройки" для ускорения выполнения запросов:

- **Правильное использование первичных индексов**
- **Предварительное вычисление агрегатов**

Проекции отчасти аналогичны [Материализованным представлениям](/materialized-views), которые также позволяют иметь несколько порядков строк и предварительно вычислять агрегации во время вставки. Проекции автоматически обновляются и синхронизируются с оригинальной таблицей, в отличие от Материализованных представлений, которые обновляются явно. Когда запрос нацелен на оригинальную таблицу, ClickHouse автоматически выбирает первичные ключи и выбирает таблицу, которая может сгенерировать тот же правильный результат, но требует считывания наименьшего объема данных, как показано на рисунке ниже:

<Image img={projections_1} size="md" alt="Проекции в ClickHouse"/>

### Более умное хранение с `_part_offset` {#smarter_storage_with_part_offset}

Начиная с версии 25.5, ClickHouse поддерживает виртуальную колонку `_part_offset` в проекциях, что предлагает новый способ определения проекции.

Теперь существует два способа определения проекции:

- **Хранить полные колонки (исходное поведение)**: Проекция содержит полные данные и может читаться напрямую, обеспечивая лучшую производительность, когда фильтры совпадают с порядком сортировки проекции.

- **Хранить только ключ сортировки + `_part_offset`**: Проекция работает как индекс. ClickHouse использует первичный индекс проекции для нахождения совпадающих строк, но считывает фактические данные из базовой таблицы. Это снижает накладные расходы на хранение за счет немного большего ввода-вывода во время выполнения запроса.

Указанные подходы также могут быть комбинированы, храня некоторые колонки в проекции, а другие - косвенно через `_part_offset`.

## Когда использовать Проекции? {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, так как они автоматически поддерживаются по мере вставки данных. Более того, запросы могут быть отправлены в одну таблицу, где проекции используются, где это возможно, для ускорения времени отклика.

Это противоречит Материализованным Представлениям, где пользователю необходимо выбирать подходящую оптимизированную целевую таблицу или переписывать свой запрос, в зависимости от фильтров. Это увеличивает нагрузку на пользовательские приложения и увеличивает сложность на стороне клиента.

Несмотря на эти преимущества, у проекций есть некоторые неявные ограничения, о которых пользователи должны быть осведомлены и, следовательно, их следует развертывать экономно.

- Проекции не позволяют использовать разные TTL для исходной таблицы и (скрытой) целевой таблицы, тогда как материализованные представления допускают разные TTL.
- Легкие обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления могут быть связаны: целевая таблица одного материализованного представления может быть исходной таблицей другого материализованного представления и так далее. Это невозможно с проекциями.
- Проекции не поддерживают соединения, тогда как Материализованные Представления поддерживают.
- Проекции не поддерживают фильтры (оператор `WHERE`), тогда как Материализованные Представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полное переупорядочивание данных. Хотя выражение в проекции может теоретически использовать `GROUP BY`, материализованные представления более эффективны для поддержания агрегатов. Оптимизатор запросов также будет более склонен использовать проекции, которые используют простое переупорядочивание, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество колонок в этом выражении для уменьшения объема хранения.
- Пользователи готовы к потенциальному увеличению объема хранения и накладным расходам на запись данных дважды. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).

## Примеры {#examples}

### Фильтрация по колонкам, которые не входят в первичный ключ {#filtering-without-using-primary-keys}

В этом примере мы покажем, как добавить проекцию в таблицу. Мы также рассмотрим, как проекция может быть использована для ускорения запросов, которые фильтруют по колонкам, которые не находятся в первичном ключе таблицы.

Для этого примера мы будем использовать набор данных New York Taxi Data, доступный на [sql.clickhouse.com](https://sql.clickhouse.com/), который отсортирован по `pickup_datetime`.

Давайте напишем простой запрос, чтобы найти все идентификаторы поездок, за которые пассажиры дали водителям больше $200:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, что поскольку мы фильтруем по `tip_amount`, который не входит в `ORDER BY`, ClickHouse пришлось выполнить полное сканирование таблицы. Давайте ускорим этот запрос.

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

Необходимо после добавления проекции использовать оператор `MATERIALIZE PROJECTION`, чтобы данные в ней были физически упорядочены и переписаны в соответствии с указанным выше запросом:

```sql
ALTER TABLE nyc.trips_with_projection MATERIALIZE PROJECTION prj_tip_amount
```

Теперь давайте снова запустим запрос, теперь, когда мы добавили проекцию:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips_with_projection WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, насколько существенно мы смогли сократить время выполнения запроса и уменьшить количество просканированных строк.

Мы можем подтвердить, что наш запрос действительно использовал созданную нами проекцию, запросив таблицу `system.query_log`:

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

### Использование проекций для ускорения запросов по цене в Великобритании {#using-projections-to-speed-up-UK-price-paid}

Чтобы продемонстрировать, как проекции могут быть использованы для ускорения производительности запросов, давайте рассмотрим пример с использованием реального набора данных. Для этого примера мы будем использовать таблицу из нашего [учебника по цены на недвижимость в Великобритании](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) с 30.03 миллиона строк. Этот набор данных также доступен в нашей [sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS) среде.

Если вы хотите увидеть, как была создана таблица и вставлены данные, вы можете обратиться к странице ["Набор данных по ценам на недвижимость в Великобритании"](/getting-started/example-datasets/uk-price-paid).

Мы можем выполнить два простых запроса на этом наборе данных. Первый список графств в Лондоне, где самые высокие цены, а второй рассчитывает среднюю цену для графств:

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

Обратите внимание, что, несмотря на то, что оба запроса выполняются очень быстро, произошло полное сканирование всей таблицы из 30.03 миллиона строк, из-за того, что ни `town`, ни `price` не были в нашем операторе `ORDER BY`, когда мы создавали таблицу:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Давайте посмотрим, можем ли мы ускорить этот запрос, используя проекции.

Чтобы сохранить оригинальную таблицу и результаты, мы снова создадим новую таблицу и скопируем данные, используя `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

Мы создаем и заполняем проекцию `prj_oby_town_price`, которая производит добавочную (скрытую) таблицу с первичным индексом, упорядочивая по городу и цене, чтобы оптимизировать запрос, который перечисляет графства в конкретном городе для самых высоких цен:

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

Настройка [`mutations_sync`](/operations/settings/settings#mutations_sync) используется для принудительного выполнения синхронно.

Мы создаем и заполняем проекцию `prj_gby_county` – дополнительную (скрытую) таблицу, которая инкрементно предварительно вычисляет агрегированные значения avg(price) для всех 130 графств Великобритании:

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
Если в проекции, как в проекции `prj_gby_county` выше, используется оператор `GROUP BY`, то базовый движок хранения для (скрытой) таблицы становится `AggregatingMergeTree`, и все агрегатные функции преобразуются в `AggregateFunction`. Это гарантирует правильную инкрементную агрегацию данных.
:::

На рисунке ниже представлена визуализация основной таблицы `uk_price_paid_with_projections` и ее двух проекций:

<Image img={projections_2} size="md" alt="Визуализация основной таблицы uk_price_paid_with_projections и ее двух проекций"/>

Если мы теперь снова запустим запрос, который перечисляет графства в Лондоне для трех самых высоких оплаченных цен, мы увидим улучшение производительности запроса:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Аналогично, для запроса, который перечисляет графства Великобритании с тремя самыми высокими средними ценами:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Обратите внимание, что оба запроса нацелены на оригинальную таблицу и что оба запроса привели к полному сканированию таблицы (все 30.03 миллиона строк были считаны с диска) до того, как мы создали две проекции.

Также обратите внимание, что запрос, который перечисляет графства в Лондоне для трех самых высоких оплаченных цен, считывает 2.17 миллиона строк. Когда мы использовали напрямую вторую таблицу, оптимизированную для этого запроса, с диска было считано только 81.92 тысячи строк.

Причина различия в том, что в настоящее время оптимизация `optimize_read_in_order`, упомянутая выше, не поддерживается для проекций.

Мы проверяем таблицу `system.query_log`, чтобы видеть, что ClickHouse автоматически использовал две проекции для двух вышеприведенных запросов (см. столбец проекций ниже):

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

### Другие примеры {#further-examples}

Следующие примеры используют тот же набор данных по ценам в Великобритании, сравнивая запросы с проекциями и без них.

Чтобы сохранить нашу оригинальную таблицу (и производительность), мы снова создаем копию таблицы, используя `CREATE AS` и `INSERT INTO SELECT`.

```sql
CREATE TABLE uk.uk_price_paid_with_projections_v2 AS uk.uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections_v2 SELECT * FROM uk.uk_price_paid;
```

#### Создание Проекции {#build-projection}

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

Заполните проекцию для имеющихся данных. (Без материализации проекция будет создана только для вновь вставленных данных):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

Следующие запросы сравнивают производительность с проекциями и без. Чтобы отключить использование проекций, мы используем настройку [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), которая по умолчанию включена.

#### Запрос 1. Средняя цена за год {#average-price-projections}

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
Результаты должны быть одинаковыми, но производительность лучше во втором примере!

#### Запрос 2. Средняя цена за год в Лондоне {#average-price-london-projections}

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

Условие (date >= '2020-01-01') необходимо изменить так, чтобы оно соответствовало измерению проекции (`toYear(date) >= 2020)`:

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

Снова результат одинаковый, но обратите внимание на улучшение производительности запроса для второго запроса.

### Объединение проекций в одном запросе {#combining-projections}

Начиная с версии 25.6, основываясь на поддержке `_part_offset`, представленной в предыдущей версии, ClickHouse теперь может использовать несколько проекций для ускорения одного запроса с несколькими фильтрами.

Важно отметить, что ClickHouse все еще считывает данные только из одной проекции (или основной таблицы), но может использовать первичные индексы других проекций для отсечения ненужных частей перед считыванием. Это особенно полезно для запросов, которые фильтруют по нескольким колонкам, каждая из которых потенциально может совпадать с другой проекцией.

> В настоящее время этот механизм только отсекает целые части. Прореживание на уровне гранул еще не поддерживается.

Чтобы продемонстрировать это, мы определим таблицу (с проекциями, использующими колонки `_part_offset`) и вставим пять примерных строк, соответствующих диаграммам выше.

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
  index_granularity = 1, -- one row per granule
  max_bytes_to_merge_at_max_space_in_pool = 1; -- disable merge
```

Затем мы вставим данные в таблицу:

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
Примечание: таблица использует пользовательские настройки для иллюстрации, такие как гранулы на одну строку и отключенные слияния частей, которые не рекомендуются для использования в производственной среде.
:::

Эта настройка приводит к следующему:
- Пять отдельных частей (по одной на вставленную строку)
- Один первичный индексный записей на строку (в основной таблице и каждой проекции)
- Каждая часть содержит ровно одну строку

С этой настройкой мы выполняем запрос, фильтруя по как `region`, так и `user_id`. Поскольку первичный индекс базовой таблицы построен из `event_date` и `id`, он здесь неэффективен, поэтому ClickHouse использует:

- `region_proj` для отсечения частей по региону
- `user_id_proj` для дальнейшего отсечения по `user_id`

Это поведение видно при использовании `EXPLAIN projections = 1`, который показывает, как ClickHouse выбирает и применяет проекции.

```sql
EXPLAIN projections=1
SELECT * FROM page_views WHERE region = 'us_west' AND user_id = 107;
```

```response
    ┌─explain────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                              │
 2. │   Expression                                                                           │                                                                        
 3. │     ReadFromMergeTree (default.page_views)                                             │
 4. │     Projections:                                                                       │
 5. │       Name: region_proj                                                                │
 6. │         Description: Projection has been analyzed and is used for part-level filtering │
 7. │         Condition: (region in ['us_west', 'us_west'])                                  │
 8. │         Search Algorithm: binary search                                                │
 9. │         Parts: 3                                                                       │
10. │         Marks: 3                                                                       │
11. │         Ranges: 3                                                                      │
12. │         Rows: 3                                                                        │
13. │         Filtered Parts: 2                                                              │
14. │       Name: user_id_proj                                                               │
15. │         Description: Projection has been analyzed and is used for part-level filtering │
16. │         Condition: (user_id in [107, 107])                                             │
17. │         Search Algorithm: binary search                                                │
18. │         Parts: 1                                                                       │
19. │         Marks: 1                                                                       │
20. │         Ranges: 1                                                                      │
21. │         Rows: 1                                                                        │
22. │         Filtered Parts: 2                                                              │
    └────────────────────────────────────────────────────────────────────────────────────────┘
```

Результаты `EXPLAIN` (показаны выше) раскрывают логический план запроса, сверху вниз:

| Номер строки | Описание                                                                                                      |
|--------------|----------------------------------------------------------------------------------------------------------------|
| 3            | Планирует чтение из основной таблицы `page_views`                                                               |
| 5-13         | Использует `region_proj` для определения 3 частей, где region = 'us_west', отсеивая 2 из 5 частей            |
| 14-22        | Использует `user_id_proj` для определения 1 части, где `user_id = 107`, дополнительно отсеивая 2 из 3 оставшихся частей |

В итоге, всего **1 из 5 частей** считывается из основной таблицы. Объединяя анализ индексирования нескольких проекций, ClickHouse значительно сокращает объем считываемых данных, улучшая производительность при низких накладных расходах на хранение.

## Связанный контент {#related-content}
- [Практическое введение в Первичные Индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Материализованные представления](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
