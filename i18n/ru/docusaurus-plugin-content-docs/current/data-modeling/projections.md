---
slug: /data-modeling/projections
title: 'Проекции'
description: 'Страница, описывающая, что такое проекции, как они могут быть использованы для улучшения производительности запросов и как они отличаются от материализованных представлений.'
keywords: ['проекция', 'проекции', 'оптимизация запросов']
---

import projections_1 from '@site/static/images/data-modeling/projections_1.png';
import projections_2 from '@site/static/images/data-modeling/projections_2.png';
import Image from '@theme/IdealImage';


# Проекции

## Введение {#introduction}

ClickHouse предлагает различные механизмы для ускорения аналитических запросов на больших объемах данных в сценариях реального времени. Одним из таких механизмов для ускорения ваших запросов является использование _Проекций_. Проекции помогают оптимизировать запросы, создавая переупорядочение данных по интересующим атрибутам. Это может быть:

1. Полное переупорядочение
2. Подмножество оригинальной таблицы с другим порядком
3. Предварительно вычисленная агрегация (аналогично материализованному представлению), но с порядком, согласованным с агрегацией.

## Как работают Проекции? {#how-do-projections-work}

Практически, проекцию можно рассматривать как дополнительную, скрытую таблицу к оригинальной таблице. Проекция может иметь другой порядок строк и, следовательно, другой первичный индекс, чем у оригинальной таблицы, и она может автоматически и инкрементно предварительно вычислять агрегированные значения. В результате использование Проекций предоставляет два "регулятора" для ускорения выполнения запроса:

- **Правильное использование первичных индексов**
- **Предварительное вычисление агрегатов**

Проекции отчасти схожи с [Материализованными Представлениями](/materialized-views), которые также позволяют вам иметь несколько порядков строк и предварительно вычислять агрегации во время вставки. Проекции автоматически обновляются и синхронизируются с оригинальной таблицей, в отличие от материализованных представлений, которые обновляются явно. Когда запрос нацелен на оригинальную таблицу, ClickHouse автоматически выбирает первичные ключи и выбирает таблицу, которая может сгенерировать тот же правильный результат, но требует чтения наименьшего количества данных, как показано на рисунке ниже:

<Image img={projections_1} size="lg" alt="Проекции в ClickHouse"/>

## Когда использовать Проекции? {#when-to-use-projections}

Проекции являются привлекательной функцией для новых пользователей, так как они автоматически поддерживаются в процессе вставки данных. Более того, запросы могут быть отправлены только в одну таблицу, где проекции используются, где это возможно, для ускорения времени отклика.

Это контрастирует с материализованными представлениями, где пользователю необходимо выбирать соответствующую оптимизированную целевую таблицу или переписывать свой запрос в зависимости от фильтров. Это увеличивает нагрузку на клиентские приложения и усложняет работу на стороне клиента.

Несмотря на эти преимущества, у проекций есть некоторые присущие ограничения, которые пользователи должны учитывать и, следовательно, они должны использоваться с осторожностью.

- Проекции не позволяют использовать разные TTL для исходной таблицы и (скрытой) целевой таблицы, материализованные представления позволяют разные TTL.
- Проекции в настоящее время не поддерживают `optimize_read_in_order` для (скрытой) целевой таблицы.
- Легковесные обновления и удаления не поддерживаются для таблиц с проекциями.
- Материализованные представления могут связываться: целевая таблица одного материализованного представления может быть исходной таблицей другого материализованного представления и т. д. Это невозможно с проекциями.
- Проекции не поддерживают соединения, но материализованные представления поддерживают.
- Проекции не поддерживают фильтры (клауза `WHERE`), но материализованные представления поддерживают.

Мы рекомендуем использовать проекции, когда:

- Требуется полное переупорядочение данных. Хотя выражение в проекции может в теории использовать `GROUP BY`, материализованные представления более эффективны для поддержания агрегатов. Оптимизатор запросов также с большей вероятностью будет использовать проекции, которые используют простое переупорядочение, т.е. `SELECT * ORDER BY x`. Пользователи могут выбрать подмножество колонок в этом выражении, чтобы уменьшить занимаемое место.
- Пользователи готовы принять сопутствующее увеличение занимаемого места и накладные расходы на запись данных дважды. Проверьте влияние на скорость вставки и [оцените накладные расходы на хранение](/data-compression/compression-in-clickhouse).

## Примеры {#examples}

### Фильтрация по колонкам, которые не входят в первичный ключ {#filtering-without-using-primary-keys}

В этом примере мы покажем, как добавить проекцию в таблицу. Мы также рассмотрим, как проекция может быть использована для ускорения запросов, которые фильтруют по колонкам, которые не входят в первичный ключ таблицы.

Для этого примера мы будем использовать набор данных New York Taxi Data, доступный на [sql.clickhouse.com](https://sql.clickhouse.com/), который отсортирован по `pickup_datetime`.

Давайте напишем простой запрос, чтобы найти все идентификаторы поездок, для которых пассажиры оставили чаевые водителю больше $200:

```sql runnable
SELECT
  tip_amount,
  trip_id,
  dateDiff('minutes', pickup_datetime, dropoff_datetime) AS trip_duration_min
FROM nyc_taxi.trips WHERE tip_amount > 200 AND trip_duration_min > 0
ORDER BY tip_amount, trip_id ASC
```

Обратите внимание, что поскольку мы фильтруем по `tip_amount`, который не входит в `ORDER BY`, ClickHouse должен был выполнить полное сканирование таблицы. Давайте ускорим этот запрос.

Чтобы сохранить оригинальную таблицу и результаты, мы создадим новую таблицу и скопируем данные, используя `INSERT INTO SELECT`:

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

После того как проекция добавлена, необходимо воспользоваться оператором `MATERIALIZE PROJECTION`, чтобы данные в ней физически упорядочивались и переписывались в соответствии с указанным выше запросом:

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

Обратите внимание, как нам удалось существенно уменьшить время выполнения запроса и необходимо было просмотреть меньше строк.

Мы можем подтвердить, что наш вышеуказанный запрос действительно использовал проекцию, которую мы создали, запросив таблицу `system.query_log`:

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

### Использование проекций для ускорения запросов по ценам в Великобритании {#using-projections-to-speed-up-UK-price-paid}

Чтобы продемонстрировать, как проекции могут быть использованы для ускорения производительности запросов, давайте посмотрим на пример, использующий набор данных из реальной жизни. Для этого примера мы будем использовать таблицу из нашего [учебника по ценам на недвижимость в Великобритании](https://clickhouse.com/docs/getting-started/example-datasets/uk-price-paid) с 30,03 миллиона строк. Этот набор данных также доступен в нашей [среде sql.clickhouse.com](https://sql.clickhouse.com/?query_id=6IDMHK3OMR1C97J6M9EUQS).

Если вы хотите увидеть, как таблица была создана и данные вставлены, вы можете обратиться к странице ["Набор данных по ценам на недвижимость в Великобритании"](/getting-started/example-datasets/uk-price-paid).

Мы можем запустить два простых запроса на этом наборе данных. Первый перечисляет округа в Лондоне, которые имеют самые высокие цены, а второй вычисляет среднюю цену для округов:

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

Обратите внимание, что, несмотря на очень быструю работу, оба запроса выполнены с полным сканированием всей таблицы из 30,03 миллиона строк из-за того, что ни `town`, ни `price` не были в нашем операторе `ORDER BY`, когда мы создавали таблицу:

```sql
CREATE TABLE uk.uk_price_paid
(
  ...
)
ENGINE = MergeTree
--highlight-next-line
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Давайте посмотрим, сможем ли мы ускорить этот запрос с помощью проекций.

Чтобы сохранить оригинальную таблицу и результаты, мы создадим новую таблицу и скопируем данные, используя `INSERT INTO SELECT`:

```sql
CREATE TABLE uk.uk_price_paid_with_projections AS uk_price_paid;
INSERT INTO uk.uk_price_paid_with_projections SELECT * FROM uk.uk_price_paid;
```

Мы создаем и заполняем проекцию `prj_oby_town_price`, которая создает дополнительную (скрытую) таблицу с первичным индексом, упорядоченным по городу и цене, чтобы оптимизировать запрос, который перечисляет округа в конкретном городе для самых высоких цен:

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

Настройка [`mutations_sync`](/operations/settings/settings#mutations_sync) используется для принудительного выполнения синхронной операции.

Мы создаем и заполняем проекцию `prj_gby_county` – дополнительную (скрытую) таблицу, которая инкрементально предварительно вычисляет агрегированные значения avg(price) для всех существующих 130 округов Великобритании:

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
Если в проекции, как в проекции `prj_gby_county` выше, используется клауза `GROUP BY`, то основе хранения (скрытой) таблицы становится `AggregatingMergeTree`, и все агрегатные функции преобразуются в `AggregateFunction`. Это обеспечивает правильную инкрементную агрегацию данных.
:::

На рисунке ниже представлена визуализация основной таблицы `uk_price_paid_with_projections` и ее двух проекций:

<Image img={projections_2} size="lg" alt="Визуализация основной таблицы uk_price_paid_with_projections и её двух проекций"/>

Если мы снова выполним запрос, который перечисляет округа в Лондоне для трех самых высоких цен, мы увидим улучшение в производительности запроса:

```sql runnable
SELECT
  county,
  price
FROM uk.uk_price_paid_with_projections
WHERE town = 'LONDON'
ORDER BY price DESC
LIMIT 3
```

Аналогично, для запроса, который перечисляет округа Великобритании с тремя самыми высокими средними ценами:

```sql runnable
SELECT
    county,
    avg(price)
FROM uk.uk_price_paid_with_projections
GROUP BY county
ORDER BY avg(price) DESC
LIMIT 3
```

Обратите внимание, что оба запроса нацелены на оригинальную таблицу и что оба запроса привели к полному сканированию таблицы (все 30,03 миллиона строк были считаны с диска) до того, как мы создали две проекции.

Также обратите внимание, что запрос, который перечисляет округа в Лондоне для трех самых высоких цен, обрабатывает 2,17 миллиона строк. Когда мы напрямую использовали вторую таблицу, оптимизированную для этого запроса, только 81,92 тысячи строк были считаны с диска.

Причина разницы в том, что в настоящее время оптимизация `optimize_read_in_order`, упомянутая выше, не поддерживается для проекций.

Мы проверяем таблицу `system.query_log`, чтобы увидеть, что ClickHouse автоматически использовал две проекции для двух вышеуказанных запросов (смотрите столбец проекций ниже):

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

Следующие примеры используют тот же набор данных по ценам в Великобритании, сопоставляя запросы с проекциями и без них.

Для сохранения нашей оригинальной таблицы (и производительности) мы снова создадим копию таблицы, используя `CREATE AS` и `INSERT INTO SELECT`.

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

Заполним проекцию для существующих данных. (Без материализации она будет создана только для вновь вставленных данных):

```sql
ALTER TABLE uk.uk_price_paid_with_projections_v2
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1
```

Следующие запросы сопоставляют производительность с проекциями и без них. Чтобы отключить использование проекций, мы используем настройку [`optimize_use_projections`](/operations/settings/settings#optimize_use_projections), которая включена по умолчанию.

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
Результаты должны быть одинаковыми, но производительность во втором примере лучше!


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

Условие (date >= '2020-01-01') нужно модифицировать, чтобы оно соответствовало размерности проекции (`toYear(date) >= 2020`):

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

Снова результат одинаковый, но отметьте улучшение в производительности запросов для второго запроса.


## Связанный контент {#related-content}
- [Практическое введение в первичные индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes#option-3-projections)
- [Материализованные Представления](/docs/materialized-views)
- [ALTER PROJECTION](/sql-reference/statements/alter/projection)
