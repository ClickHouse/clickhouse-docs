---
slug: /optimize/query-optimization
sidebar_label: 'Оптимизация запросов'
title: 'Руководство по оптимизации запросов'
description: 'Простое руководство по оптимизации запросов, описывающее распространённые способы повышения производительности запросов'
doc_type: 'guide'
keywords: ['оптимизация запросов', 'производительность', 'лучшие практики', 'настройка запросов', 'эффективность']
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# Простое руководство по оптимизации запросов {#a-simple-guide-for-query-optimization}

В этом разделе на распространённых сценариях показано, как использовать различные методы повышения производительности и оптимизации, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) и [отказ от использования Nullable-столбцов](/optimize/avoid-nullable-columns), чтобы улучшить производительность выполнения запросов в ClickHouse.

## Понимание производительности запросов {#understand-query-performance}

Лучшее время задуматься об оптимизации производительности — когда вы настраиваете [схему данных](/data-modeling/schema-design) перед первым приёмом данных в ClickHouse. 

Но, по правде говоря, сложно предсказать, насколько вырастет объём данных и какие типы запросов будут выполняться. 

Если у вас уже есть развертывание с несколькими запросами, производительность которых вы хотите улучшить, первым шагом будет понять, как эти запросы выполняются и почему одни из них исполняются за несколько миллисекунд, а другие занимают больше времени.

ClickHouse предоставляет богатый набор инструментов, которые помогают понять, как выполняется ваш запрос и какие ресурсы он потребляет. 

В этом разделе мы рассмотрим эти инструменты и то, как их использовать. 

## Общие соображения {#general-considerations}

Чтобы понять производительность запросов, давайте рассмотрим, что происходит в ClickHouse при выполнении запроса. 

Следующая часть намеренно упрощена и местами опускает детали; цель здесь не в том, чтобы перегрузить вас информацией, а в том, чтобы быстро познакомить с базовыми концепциями. Более подробно об этом можно прочитать в разделе [анализатор запросов](/operations/analyzer). 

На очень высоком уровне, когда ClickHouse выполняет запрос, происходит следующее: 

- **Разбор и анализ запроса**

Запрос разбирается и анализируется, и создаётся общий план его выполнения. 

- **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отбрасываются, и на основе этого плана строится конвейер обработки запроса. 

- **Выполнение конвейера обработки запроса**

Данные считываются и обрабатываются параллельно. На этом этапе ClickHouse фактически выполняет операции с данными, такие как фильтрация, агрегации и сортировка. 

- **Финальная обработка**

Результаты объединяются, сортируются и форматируются в итоговый результат перед отправкой клиенту.

В действительности выполняется множество [оптимизаций](/concepts/why-clickhouse-is-so-fast), и мы обсудим их чуть подробнее в этом руководстве, но пока эти основные концепции дают нам хорошее понимание того, что происходит «под капотом», когда ClickHouse выполняет запрос. 

Имея это общее представление, давайте рассмотрим инструменты, которые предоставляет ClickHouse, и то, как мы можем использовать их для отслеживания метрик, влияющих на производительность запросов. 

## Набор данных {#dataset}

Мы используем реальный пример, чтобы проиллюстрировать наш подход к оптимизации производительности запросов. 

Возьмём набор данных NYC Taxi, который содержит данные о поездках на такси в Нью-Йорке. Для начала выполняем приём набора данных NYC Taxi без какой-либо оптимизации.

Ниже приведена команда для создания таблицы и вставки данных из S3‑бакета. Обратите внимание, что мы преднамеренно определяем схему по данным, что не является оптимальным с точки зрения производительности.

```sql
-- Создать таблицу с выведенной схемой
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Вставить данные в таблицу с выведенной схемой
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

Давайте рассмотрим схему таблицы, автоматически определённую по данным.

```sql
--- Отобразить выведенную схему таблицы
SHOW CREATE TABLE trips_small_inferred

Query id: d97361fd-c050-478e-b831-369469f0784d

CREATE TABLE nyc_taxi.trips_small_inferred
(
    `vendor_id` Nullable(String),
    `pickup_datetime` Nullable(DateTime64(6, 'UTC')),
    `dropoff_datetime` Nullable(DateTime64(6, 'UTC')),
    `passenger_count` Nullable(Int64),
    `trip_distance` Nullable(Float64),
    `ratecode_id` Nullable(String),
    `pickup_location_id` Nullable(String),
    `dropoff_location_id` Nullable(String),
    `payment_type` Nullable(Int64),
    `fare_amount` Nullable(Float64),
    `extra` Nullable(Float64),
    `mta_tax` Nullable(Float64),
    `tip_amount` Nullable(Float64),
    `tolls_amount` Nullable(Float64),
    `total_amount` Nullable(Float64)
)
ORDER BY tuple()
```

## Найдите медленные запросы {#spot-the-slow-queries}

### Журнал запросов {#query-logs}

По умолчанию ClickHouse собирает и записывает информацию о каждом выполненном запросе в [журналы запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`. 

Для каждого выполненного запроса ClickHouse записывает статистику, такую как время выполнения запроса, количество прочитанных строк и использование ресурсов, например использование CPU, памяти или попадания в кэш файловой системы. 

Поэтому журнал запросов — хорошая отправная точка при исследовании медленных запросов. Вы можете легко обнаружить запросы, выполнение которых занимает много времени, и вывести информацию об использовании ресурсов для каждого из них. 

Давайте найдём пять самых долго выполняющихся запросов в нашем датасете поездок нью-йоркского такси.

```sql
-- Найти топ-5 самых долгих запросов из базы данных nyc_taxi за последний час
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (event_time >= (now() - toIntervalMinute(60))) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL

Query id: e3d48c9f-32bb-49a4-8303-080f59ed1835

Row 1:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:36
query_duration_ms: 2967
query:             WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 2:
──────
type:              QueryFinish
event_time:        2024-11-27 11:11:33
query_duration_ms: 2026
query:             SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM
    nyc_taxi.trips_small_inferred
WHERE
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY
    payment_type
ORDER BY
    trip_count DESC;

read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 3:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:17
query_duration_ms: 1860
query:             SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 4:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:31
query_duration_ms: 690
query:             SELECT avg(total_amount) FROM nyc_taxi.trips_small_inferred WHERE trip_distance > 5
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']

Row 5:
──────
type:              QueryFinish
event_time:        2024-11-27 11:12:44
query_duration_ms: 634
query:             SELECT
vendor_id,
avg(total_amount),
avg(trip_distance),
FROM
nyc_taxi.trips_small_inferred
GROUP BY vendor_id
ORDER BY 1 DESC
FORMAT JSON
read_rows:         329044175
tables:            ['nyc_taxi.trips_small_inferred']
```

Поле `query_duration_ms` показывает, сколько времени потребовалось на выполнение конкретного запроса. Из результатов в журналах запросов видно, что первый запрос выполняется за 2967 мс, что можно улучшить. 

Также может быть полезно понять, какие запросы сильнее всего нагружают систему, проанализировав запросы с наибольшим потреблением памяти или CPU.

```sql
-- Топ-запросы по потреблению памяти
SELECT
    type,
    event_time,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    (ProfileEvents['CachedReadBufferReadFromCacheMicroseconds']) / 1000000 AS FromCacheSeconds,
    (ProfileEvents['CachedReadBufferReadFromSourceMicroseconds']) / 1000000 AS FromSourceSeconds,
    normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE has(databases, 'nyc_taxi') AND (type='QueryFinish') AND ((event_time >= (now() - toIntervalDay(2))) AND (event_time <= now())) AND (user NOT ILIKE '%internal%')
ORDER BY memory_usage DESC
LIMIT 30
```

Давайте выделим найденные нами долго выполняющиеся запросы и несколько раз запустим их повторно, чтобы оценить время отклика. 

На этом этапе важно отключить файловый кэш, установив параметр `enable_filesystem_cache` в 0, чтобы повысить воспроизводимость.

```sql
-- Отключить кэш файловой системы
set enable_filesystem_cache = 0;

-- Запрос 1
WITH
  dateDiff('s', pickup_datetime, dropoff_datetime) as trip_time,
  trip_distance / trip_time * 3600 AS speed_mph
SELECT
  quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM
  nyc_taxi.trips_small_inferred
WHERE
  speed_mph > 30
FORMAT JSON

----
1 строка в наборе. Время выполнения: 1.699 сек. Обработано 329.04 млн строк, 8.88 ГБ (193.72 млн строк/сек., 5.23 ГБ/сек.)
Пиковое использование памяти: 440.24 МиБ.

-- Запрос 2
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM
    nyc_taxi.trips_small_inferred
WHERE
    pickup_datetime >= '2009-01-01' AND pickup_datetime < '2009-04-01'
GROUP BY
    payment_type
ORDER BY
    trip_count DESC;

---
4 строки в наборе. Время выполнения: 1.419 сек. Обработано 329.04 млн строк, 5.72 ГБ (231.86 млн строк/сек., 4.03 ГБ/сек.)
Пиковое использование памяти: 546.75 МиБ.

-- Запрос 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 строка в наборе. Время выполнения: 1.414 сек. Обработано 329.04 млн строк, 8.88 ГБ (232.63 млн строк/сек., 6.28 ГБ/сек.)
Пиковое использование памяти: 451.53 МиБ.
```

Сведём результаты в таблицу для удобства чтения.

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

Давайте чуть лучше разберёмся, что именно делают эти запросы. 

* Query 1 вычисляет распределение расстояний в поездках со средней скоростью более 30 миль в час.
* Query 2 находит количество и среднюю стоимость поездок по неделям. 
* Query 3 вычисляет среднюю длительность каждой поездки в наборе данных.

Ни один из этих запросов не выполняет очень сложной обработки, за исключением первого, который каждый раз при выполнении запроса «на лету» рассчитывает время поездки. Однако выполнение каждого из этих запросов занимает больше одной секунды, что по меркам ClickHouse — очень долго. Мы также можем отметить потребление памяти этими запросами: примерно 400 МБ на каждый запрос — это довольно много. Кроме того, каждый запрос, по-видимому, читает одно и то же количество строк (то есть 329.04 миллиона). Давайте быстро проверим, сколько строк в этой таблице.

```sql
-- Подсчёт количества строк в таблице
SELECT count()
FROM nyc_taxi.trips_small_inferred
```

Query id: 733372c5-deaf-4719-94e3-261540933b23

┌───count()─┐

1. │ 329044175 │ -- 329,04 млн
   └───────────┘

````

Таблица содержит 329,04 миллиона строк, поэтому каждый запрос выполняет полное сканирование таблицы.

### Оператор EXPLAIN {#explain-statement}

Теперь, когда у нас есть несколько долго выполняющихся запросов, разберемся, как они выполняются. Для этого ClickHouse поддерживает [команду оператора EXPLAIN](/sql-reference/statements/explain). Это очень полезный инструмент, предоставляющий детальное представление всех этапов выполнения запроса без его фактического запуска. Хотя для неспециалиста по ClickHouse это может показаться сложным, он остается важнейшим инструментом для понимания того, как выполняется запрос.

Документация содержит подробное [руководство](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как использовать его для анализа выполнения запросов. Вместо повторения содержания этого руководства сосредоточимся на нескольких командах, которые помогут найти узкие места в производительности выполнения запросов. 

**EXPLAIN indexes = 1**

Начнем с EXPLAIN indexes = 1 для проверки плана запроса. План запроса — это дерево, показывающее, как будет выполнен запрос. В нем можно увидеть, в каком порядке будут выполнены конструкции запроса. План запроса, возвращаемый оператором EXPLAIN, читается снизу вверх.

Попробуем использовать первый из долго выполняющихся запросов.

```sql
EXPLAIN indexes = 1
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: f35c412a-edda-4089-914b-fa1622d69868

   ┌─explain─────────────────────────────────────────────┐
1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │     Expression (Before GROUP BY)                    │
4. │       Filter (WHERE)                                │
5. │         ReadFromMergeTree (nyc_taxi.trips_small_inferred) │
   └─────────────────────────────────────────────────────┘
````

Результат довольно прост. Запрос начинается с чтения данных из таблицы `nyc_taxi.trips_small_inferred`. Затем применяется предложение WHERE для фильтрации строк на основе вычисленных значений. Отфильтрованные данные подготавливаются для агрегации и вычисляются квантили. Наконец, результат сортируется и выводится. 

Здесь можно заметить, что первичные ключи не используются, что логично, так как мы не определяли их при создании таблицы. В результате ClickHouse выполняет полный скан таблицы для этого запроса. 

**Explain Pipeline**

EXPLAIN Pipeline показывает конкретную стратегию выполнения запроса. Здесь вы можете увидеть, как ClickHouse фактически исполнил общий план запроса, который мы рассмотрели ранее.

```sql
EXPLAIN PIPELINE
WITH
    dateDiff('s', pickup_datetime, dropoff_datetime) AS trip_time,
    (trip_distance / trip_time) * 3600 AS speed_mph
SELECT quantiles(0.5, 0.75, 0.9, 0.99)(trip_distance)
FROM nyc_taxi.trips_small_inferred
WHERE speed_mph > 30

Query id: c7e11e7b-d970-4e35-936c-ecfc24e3b879

    ┌─explain─────────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                        │
 2. │ ExpressionTransform × 59                                                            │
 3. │   (Aggregating)                                                                     │
 4. │   Resize 59 → 59                                                                    │
 5. │     AggregatingTransform × 59                                                       │
 6. │       StrictResize 59 → 59                                                          │
 7. │         (Expression)                                                                │
 8. │         ExpressionTransform × 59                                                    │
 9. │           (Filter)                                                                  │
10. │           FilterTransform × 59                                                      │
11. │             (ReadFromMergeTree)                                                     │
12. │             MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
```

Здесь мы можем отметить количество потоков, использованных для выполнения запроса: 59 потоков, что указывает на высокую степень параллелизма. Это ускоряет выполнение запроса, который занял бы больше времени на менее мощной машине. Количество потоков, работающих параллельно, может объяснить большой объём памяти, потребляемый запросом. 

В идеале вам следует анализировать все медленные запросы таким же образом, чтобы выявлять избыточно сложные планы выполнения запросов, понимать количество строк, читаемых каждым запросом, и ресурсы, которые они потребляют.

## Методология {#methodology}

В продуктивной среде может быть сложно выявить проблемные запросы, так как в каждый момент времени в вашем развертывании ClickHouse, вероятно, выполняется большое количество запросов. 

Если вы знаете, у какого пользователя, в какой базе данных или в каких таблицах есть проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs`, чтобы сузить поиск. 

После того как вы определили запросы, которые хотите оптимизировать, можно приступать к их доработке. Одна из распространённых ошибок на этом этапе — изменять сразу несколько вещей, запускать разовые эксперименты и в итоге получать неоднозначные результаты и, что ещё важнее, не понимать, что именно сделало запрос быстрее. 

Оптимизация запросов требует структурированного подхода. Речь не идёт о продвинутом бенчмаркинге, но наличие простого процесса, позволяющего понять, как ваши изменения влияют на производительность запроса, может дать существенный эффект. 

Начните с выявления медленных запросов по журналам запросов, затем по отдельности исследуйте возможные улучшения. При тестировании запроса обязательно отключите кэш файловой системы. 

> ClickHouse использует [кэширование](/operations/caches) для ускорения выполнения запросов на разных этапах. Это полезно для производительности запросов, но в процессе устранения неполадок оно может скрывать потенциальные узкие места ввода-вывода (I/O) или неудачную схему таблиц. По этой причине рекомендуется отключать кэш файловой системы во время тестирования. Убедитесь, что в продуктивной среде он включён.

После того как вы определили возможные оптимизации, рекомендуется внедрять их по одной, чтобы лучше отслеживать, как они влияют на производительность. Ниже приведена диаграмма, описывающая общий подход.

<Image img={queryOptimizationDiagram1} size="lg" alt="Процесс оптимизации"/>

_Наконец, будьте внимательны к выбросам: довольно часто бывает, что запрос выполняется медленно, потому что пользователь запустил разовый дорогой запрос или система находилась под нагрузкой по другой причине. Вы можете выполнять группировку по полю `normalized_query_hash`, чтобы выявить дорогие запросы, выполняющиеся регулярно. Именно их, вероятнее всего, стоит исследовать в первую очередь._

## Базовая оптимизация {#basic-optimization}

Теперь, когда у нас есть фреймворк для тестирования, можно приступать к оптимизации.

Лучше всего начать с анализа того, как хранятся данные. Как и для любой базы данных, чем меньше данных мы читаем, тем быстрее будет выполняться запрос. 

В зависимости от того, как вы осуществляли приём данных, вы могли использовать [возможности](/interfaces/schema-inference) ClickHouse для вывода схемы таблицы на основе принятых данных. Хотя это очень удобно на начальном этапе, если вы хотите оптимизировать производительность запросов, вам потребуется пересмотреть схему данных, чтобы она наилучшим образом соответствовала вашему сценарию применения.

### Nullable {#nullable}

Как описано в [документации по лучшим практикам](/best-practices/select-data-types#avoid-nullable-columns), по возможности избегайте столбцов с типом Nullable. Их часто хочется использовать, так как они делают механизм ингестии данных более гибким, но они негативно влияют на производительность, поскольку каждый раз приходится обрабатывать дополнительный столбец.

Выполнение SQL-запроса, который подсчитывает строки со значением NULL, может легко выявить столбцы в ваших таблицах, которым действительно нужен тип Nullable.

```sql
-- Поиск столбцов с ненулевыми значениями
SELECT
    countIf(vendor_id IS NULL) AS vendor_id_nulls,
    countIf(pickup_datetime IS NULL) AS pickup_datetime_nulls,
    countIf(dropoff_datetime IS NULL) AS dropoff_datetime_nulls,
    countIf(passenger_count IS NULL) AS passenger_count_nulls,
    countIf(trip_distance IS NULL) AS trip_distance_nulls,
    countIf(fare_amount IS NULL) AS fare_amount_nulls,
    countIf(mta_tax IS NULL) AS mta_tax_nulls,
    countIf(tip_amount IS NULL) AS tip_amount_nulls,
    countIf(tolls_amount IS NULL) AS tolls_amount_nulls,
    countIf(total_amount IS NULL) AS total_amount_nulls,
    countIf(payment_type IS NULL) AS payment_type_nulls,
    countIf(pickup_location_id IS NULL) AS pickup_location_id_nulls,
    countIf(dropoff_location_id IS NULL) AS dropoff_location_id_nulls
FROM trips_small_inferred
FORMAT VERTICAL

ID запроса: 4a70fc5b-2501-41c8-813c-45ce241d85ae

Строка 1:
──────
vendor_id_nulls:           0
pickup_datetime_nulls:     0
dropoff_datetime_nulls:    0
passenger_count_nulls:     0
trip_distance_nulls:       0
fare_amount_nulls:         0
mta_tax_nulls:             137946731
tip_amount_nulls:          0
tolls_amount_nulls:        0
total_amount_nulls:        0
payment_type_nulls:        69305
pickup_location_id_nulls:  0
dropoff_location_id_nulls: 0
```

У нас есть только два столбца со значениями NULL: `mta_tax` и `payment_type`. Остальные поля не должны использовать тип столбца `Nullable`.

### Низкая кардинальность {#low-cardinality}

Простая оптимизация для строковых типов — максимально эффективно использовать тип данных LowCardinality. Как описано в [документации по низкой кардинальности](/sql-reference/data-types/lowcardinality), ClickHouse применяет словарное кодирование к столбцам LowCardinality, что значительно повышает производительность запросов. 

Простое эмпирическое правило для определения, какие столбцы хорошо подходят для LowCardinality: любой столбец с менее чем 10 000 уникальных значений является идеальным кандидатом.

Вы можете использовать следующий SQL-запрос, чтобы найти столбцы с небольшим количеством уникальных значений.

```sql
-- Определение столбцов с низкой кардинальностью
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

ID запроса: d502c6a1-c9bc-4415-9d86-5de74dd6d932

Строка 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

Благодаря низкой кардинальности эти четыре столбца — `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id` — являются хорошими кандидатами для типа данных LowCardinality.

### Оптимизируйте тип данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Для оптимизации производительности и уменьшения объёма занимаемого на диске пространства данных убедитесь, что вы выбираете наименьший возможный тип данных, подходящий для вашего сценария использования. 

Для числовых значений вы можете проверить минимальное и максимальное значения в своём наборе данных, чтобы убедиться, что текущая разрядность/точность выбранного типа соответствует реальным данным вашего набора.

```sql
-- Найти минимальные/максимальные значения для поля payment_type
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

Для дат следует выбирать такую точность, которая соответствует вашему набору данных и лучше всего подходит для выполнения запросов, которые вы планируете запускать.

### Применим оптимизации {#apply-the-optimizations}

Давайте создадим новую таблицу, чтобы использовать оптимизированную схему и повторно выполнить приём данных.

```sql
-- Создать таблицу с оптимизированными данными
CREATE TABLE trips_small_no_pk
(
    `vendor_id` LowCardinality(String),
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` LowCardinality(String),
    `dropoff_location_id` LowCardinality(String),
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
ORDER BY tuple();

-- Вставить данные
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

Мы снова запускаем запросы, используя новую таблицу, чтобы оценить улучшения. 

| Name    | Run 1 - Elapsed | Elapsed   | Rows processed | Peak memory |
| ------- | --------------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

Мы видим улучшения как по времени выполнения запросов, так и по использованию памяти. Благодаря оптимизации схемы данных мы уменьшаем общий объём данных, которые представляют наш набор данных, что приводит к снижению потребления памяти и сокращению времени обработки. 

Давайте проверим размер таблиц, чтобы увидеть разницу.

```sql
SELECT
    `table`,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    sum(rows) AS rows
FROM system.parts
WHERE (active = 1) AND ((`table` = 'trips_small_no_pk') OR (`table` = 'trips_small_inferred'))
GROUP BY
    database,
    `table`
ORDER BY size DESC

Идентификатор запроса: 72b5eb1c-ff33-4fdb-9d29-dd076ac6f532

   ┌─table────────────────┬─compressed─┬─uncompressed─┬──────rows─┐
1. │ trips_small_inferred │ 7.38 ГиБ   │ 37.41 ГиБ    │ 329044175 │
2. │ trips_small_no_pk    │ 4.89 ГиБ   │ 15.31 ГиБ    │ 329044175 │
   └──────────────────────┴────────────┴──────────────┴───────────┘
```

Новая таблица значительно меньше предыдущей. Мы наблюдаем сокращение объёма дискового пространства, занимаемого таблицей, примерно на 34% (7,38 GiB против 4,89 GiB).

## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем управления базами данных. В таких системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставки дублирующихся значений первичного ключа отклоняется, а для быстрого поиска обычно создаётся индекс на основе B-tree или хэша. 

В ClickHouse [цель первичного ключа](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) иная: он не обеспечивает уникальность и не помогает с целостностью данных. Вместо этого он предназначен для оптимизации производительности запросов. Первичный ключ определяет порядок, в котором данные хранятся на диске, и реализован как разреженный индекс, который хранит указатели на первую строку каждого гранула.

> Гранулы в ClickHouse — это наименьшие единицы данных, считываемые при выполнении запроса. Они содержат до фиксированного числа строк, определяемого параметром index&#95;granularity, со значением по умолчанию 8192 строки. Гранулы хранятся последовательно и отсортированы по первичному ключу. 

Выбор хорошего набора первичных ключей важен для производительности, и на практике довольно часто одни и те же данные хранятся в разных таблицах с использованием разных наборов первичных ключей для ускорения конкретных наборов запросов. 

Другие возможности, поддерживаемые ClickHouse, такие как проекция (Projection) или материализованное представление, позволяют использовать другой набор первичных ключей для тех же данных. Во второй части этой серии статей в блоге это будет рассмотрено подробнее. 

### Выбор первичных ключей {#choose-primary-keys}

Выбор корректного набора первичных ключей — сложная тема, и для нахождения наилучшей комбинации могут потребоваться компромиссы и эксперименты. 

Пока что мы будем следовать таким простым рекомендациям: 

* Использовать поля, по которым выполняется фильтрация в большинстве запросов
* Сначала выбирать столбцы с более низкой кардинальностью 
* Учитывать временную составляющую в первичном ключе, так как фильтрация по времени в наборах данных с метками времени довольно распространена. 

В нашем случае мы поэкспериментируем со следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`. 

Кардинальность для `passenger_count` невелика (24 уникальных значения), и это поле используется в наших медленных запросах. Мы также добавляем поля с метками времени (`pickup_datetime` и `dropoff_datetime`), так как по ним часто выполняется фильтрация.

Создайте новую таблицу с первичными ключами и повторно выполните приём данных.

```sql
CREATE TABLE trips_small_pk
(
    `vendor_id` UInt8,
    `pickup_datetime` DateTime,
    `dropoff_datetime` DateTime,
    `passenger_count` UInt8,
    `trip_distance` Float32,
    `ratecode_id` LowCardinality(String),
    `pickup_location_id` UInt16,
    `dropoff_location_id` UInt16,
    `payment_type` Nullable(UInt8),
    `fare_amount` Decimal32(2),
    `extra` Decimal32(2),
    `mta_tax` Nullable(Decimal32(2)),
    `tip_amount` Decimal32(2),
    `tolls_amount` Decimal32(2),
    `total_amount` Decimal32(2)
)
PRIMARY KEY (passenger_count, pickup_datetime, dropoff_datetime);

-- Вставка данных
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

Затем повторно выполняем наши запросы. Сводим результаты трёх экспериментов, чтобы увидеть улучшения по времени выполнения, числу обработанных строк и потреблению памяти. 

<table>
  <thead>
    <tr>
      <th colspan="4">Запрос 1</th>
    </tr>

    <tr>
      <th />

      <th>Запуск 1</th>
      <th>Запуск 2</th>
      <th>Запуск 3</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Время выполнения</td>
      <td>1.699 sec</td>
      <td>1.353 sec</td>
      <td>0.765 sec</td>
    </tr>

    <tr>
      <td>Обработано строк</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
      <td>329.04 million</td>
    </tr>

    <tr>
      <td>Пиковое потребление памяти</td>
      <td>440.24 MiB</td>
      <td>337.12 MiB</td>
      <td>444.19 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">Запрос 2</th>
    </tr>

    <tr>
      <th />

      <th>Запуск 1</th>
      <th>Запуск 2</th>
      <th>Запуск 3</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Время выполнения</td>
      <td>1.419 сек</td>
      <td>1.171 сек</td>
      <td>0.248 сек</td>
    </tr>

    <tr>
      <td>Обработано строк</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
      <td>41.46 миллиона</td>
    </tr>

    <tr>
      <td>Пиковое использование памяти</td>
      <td>546.75 МиБ</td>
      <td>531.09 МиБ</td>
      <td>173.50 МиБ</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">Запрос 3</th>
    </tr>

    <tr>
      <th />

      <th>Запуск 1</th>
      <th>Запуск 2</th>
      <th>Запуск 3</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Время выполнения</td>
      <td>1.414 сек</td>
      <td>1.188 сек</td>
      <td>0.431 сек</td>
    </tr>

    <tr>
      <td>Обработано строк</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
      <td>276.99 миллиона</td>
    </tr>

    <tr>
      <td>Пиковое использование памяти</td>
      <td>451.53 МиБ</td>
      <td>265.05 МиБ</td>
      <td>197.38 МиБ</td>
    </tr>
  </tbody>
</table>

Во всех случаях заметно улучшилось время выполнения и использование памяти.

Запрос 2 в наибольшей степени выигрывает от использования первичного ключа. Давайте посмотрим, чем сгенерированный план запроса отличается от прежнего.

```sql
EXPLAIN indexes = 1
SELECT
    payment_type,
    COUNT() AS trip_count,
    formatReadableQuantity(SUM(trip_distance)) AS total_distance,
    AVG(total_amount) AS total_amount_avg,
    AVG(tip_amount) AS tip_amount_avg
FROM nyc_taxi.trips_small_pk
WHERE (pickup_datetime >= '2009-01-01') AND (pickup_datetime < '2009-04-01')
GROUP BY payment_type
ORDER BY trip_count DESC

Query id: 30116a77-ba86-4e9f-a9a2-a01670ad2e15

    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY [lifted up part]))                                                     │
 2. │   Sorting (Sorting for ORDER BY)                                                                                 │
 3. │     Expression (Before ORDER BY)                                                                                 │
 4. │       Aggregating                                                                                                │
 5. │         Expression (Before GROUP BY)                                                                             │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             Indexes:                                                                                             │
 9. │               PrimaryKey                                                                                         │
10. │                 Keys:                                                                                            │
11. │                   pickup_datetime                                                                                │
12. │                 Condition: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 Parts: 9/9                                                                                       │
14. │                 Granules: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Благодаря первичному ключу была отобрана только часть гранул таблицы. Это само по себе значительно улучшает производительность запроса, поскольку ClickHouse должен обрабатывать существенно меньший объём данных.

## Дальнейшие шаги {#next-steps}

Надеемся, это руководство помогло вам лучше понять, как анализировать медленные запросы в ClickHouse и как ускорять их. Чтобы глубже изучить эту тему, вы можете подробнее ознакомиться с [анализатором запросов](/operations/analyzer) и [профилированием](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваш запрос.

По мере того как вы будете лучше разбираться в особенностях ClickHouse, рекомендуется прочитать о [ключах партиционирования](/optimize/partitioning-key) и [индексах пропуска данных](/optimize/skipping-indexes), чтобы узнать о более продвинутых методах, которые можно использовать для ускорения ваших запросов.
