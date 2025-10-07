---
slug: '/optimize/query-optimization'
sidebar_label: 'Оптимизация запросов'
description: 'Простое руководство по оптимизации запросов, которое описывает общий'
title: 'Руководство по оптимизации запросов'
doc_type: guide
---
import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# Простой гид по оптимизации запросов

Этот раздел предназначен для иллюстрации на общих примерах того, как использовать различные методы повышения производительности и оптимизации, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) или [избежание Nullable колонок](/optimize/avoid-nullable-columns), чтобы улучшить производительность запросов ClickHouse.

## Понимание производительности запроса {#understand-query-performance}

Лучшее время для размышлений об оптимизации производительности - это момент, когда вы настраиваете свою [схему данных](/data-modeling/schema-design) перед загрузкой данных в ClickHouse в первый раз.

Но давайте будем честными; трудно предсказать, насколько ваши данные вырастут или какие типы запросов будут выполняться.

Если у вас есть существующее развертывание с несколькими запросами, которые вы хотите улучшить, первым шагом является понимание того, как эти запросы выполняются и почему некоторые выполняются за несколько миллисекунд, в то время как другие занимают больше времени.

ClickHouse предлагает богатый набор инструментов, чтобы помочь вам понять, как выполняется ваш запрос и какие ресурсы потребляются для выполнения.

В этом разделе мы рассмотрим эти инструменты и как их использовать.

## Общие соображения {#general-considerations}

Чтобы понять производительность запроса, давайте посмотрим, что происходит в ClickHouse, когда запрос выполняется.

Следующая часть намеренно упрощена и делает некоторые сокращения; идея здесь не в том, чтобы загрузить вас деталями, а в том, чтобы познакомить вас с основными понятиями. Для получения дополнительной информации вы можете прочитать о [анализаторе запросов](/operations/analyzer).

С очень высокой точки зрения, когда ClickHouse выполняет запрос, происходит следующее:

- **Парсинг и анализ запроса**

Запрос разбирается и анализируется, и создается общий план выполнения запроса.

- **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отбрасываются, и строится конвейер запросов из плана запроса.

- **Выполнение конвейера запроса**

Данные считываются и обрабатываются параллельно. Это этап, на котором ClickHouse фактически выполняет операции запроса, такие как фильтрация, агрегация и сортировка.

- **Финальная обработка**

Результаты объединяются, сортируются и форматируются в окончательный результат перед отправкой клиенту.

На самом деле происходит множество [оптимизаций](/concepts/why-clickhouse-is-so-fast), и мы обсудим их немного подробнее в этом руководстве, но пока эти основные концепции дают нам хорошее представление о том, что происходит за кулисами, когда ClickHouse выполняет запрос.

С этим пониманием на высоком уровне давайте рассмотрим инструменты, которые предоставляет ClickHouse, и как мы можем использовать их для отслеживания метрик, которые влияют на производительность запроса.

## Набор данных {#dataset}

Мы будем использовать реальный пример, чтобы проиллюстрировать, как мы подходим к производительности запросов.

Давайте используем набор данных такси NYC, который содержит данные о поездках на такси в Нью-Йорке. Сначала мы начнем с загрузки набора данных такси NYC без оптимизации.

Ниже приведена команда для создания таблицы и вставки данных из корзины S3. Обратите внимание, что мы намеренно выводим схему из данных, что не оптимизировано.

```sql
-- Create table with inferred schema
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Insert data into table with inferred schema
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

Давайте посмотрим на схему таблицы, автоматически выведенную из данных.

```sql
--- Display inferred table schema
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

## Поиск медленных запросов {#spot-the-slow-queries}

### Журналы запросов {#query-logs}

По умолчанию ClickHouse собирает и регистрирует информацию о каждом выполненном запросе в [журналах запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`.

Для каждого выполненного запроса ClickHouse записывает статистику, такую как время выполнения запроса, количество прочитанных строк и использование ресурсов, таких как CPU, использование памяти или попадания в кеш файловой системы.

Таким образом, журнал запросов - хорошее место для начала, когда вы исследуете медленные запросы. Вы можете легко выявить запросы, которые требуют много времени для выполнения, и отобразить информацию о расходах ресурсов для каждого из них.

Давайте найдем пятерку самых длительных запросов в нашем наборе данных такси NYC.

```sql
-- Find top 5 long running queries from nyc_taxi database in the last 1 hour
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

Поле `query_duration_ms` указывает, сколько времени заняло выполнение данного запроса. Смотрев на результаты из журналов запросов, мы можем увидеть, что первый запрос выполняется 2967мс, что можно улучшить.

Вам также может быть интересно узнать, какие запросы нагнетают систему, изучив запрос, который потребляет больше всего памяти или CPU.

```sql
-- Top queries by memory usage
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

Давайте изолируем длительные запросы, которые мы нашли, и повторим их несколько раз, чтобы понять время отклика.

На этом этапе важно отключить кеш файловой системы, установив параметр `enable_filesystem_cache` в 0 для улучшения воспроизводимости.

```sql
-- Disable filesystem cache
set enable_filesystem_cache = 0;

-- Run query 1
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
1 row in set. Elapsed: 1.699 sec. Processed 329.04 million rows, 8.88 GB (193.72 million rows/s., 5.23 GB/s.)
Peak memory usage: 440.24 MiB.

-- Run query 2
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
4 rows in set. Elapsed: 1.419 sec. Processed 329.04 million rows, 5.72 GB (231.86 million rows/s., 4.03 GB/s.)
Peak memory usage: 546.75 MiB.

-- Run query 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

Сводим в таблице для удобства чтения.

| Имя    | Время выполнения | Обработанные строки | Пиковая память |
| ------- | --------------- | ------------------- | -------------- |
| Запрос 1 | 1.699 сек       | 329.04 миллиона     | 440.24 MiB     |
| Запрос 2 | 1.419 сек       | 329.04 миллиона     | 546.75 MiB     |
| Запрос 3 | 1.414 сек       | 329.04 миллиона     | 451.53 MiB     |

Давайте немного лучше поймем, что достигают запросы.

- Запрос 1 вычисляет распределение расстояний в поездках со средней скоростью более 30 миль в час.
- Запрос 2 находит количество и среднюю стоимость поездок за неделю.
- Запрос 3 рассчитывает среднее время каждой поездки в наборе данных.

Ни один из этих запросов не производит очень сложную обработку, кроме первого запроса, который вычисляет время поездки на лету каждый раз, когда запрос выполняется. Однако каждый из этих запросов занимает более одной секунды для выполнения, что в мире ClickHouse является очень долгим временем. Мы также можем отметить использование памяти этих запросов; около 400 Мб для каждого запроса - это довольно много памяти. Также каждый запрос, похоже, читает одно и то же количество строк (329.04 миллиона). Давайте быстро подтвердим, сколько строк в этой таблице.

```sql
-- Count number of rows in table
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 million
   └───────────┘
```

Таблица содержит 329.04 миллиона строк, поэтому каждый запрос выполняет полное сканирование таблицы.

### Оператор Explain {#explain-statement}

Теперь, когда у нас есть несколько длительных запросов, давайте поймем, как они выполняются. Для этого ClickHouse поддерживает команду [EXPLAIN](/sql-reference/statements/explain). Это очень полезный инструмент, который предоставляет очень подробный обзор всех этапов выполнения запроса без фактического выполнения запроса. Хотя это может быть подавляющим для неподготовленного пользователя ClickHouse, это все же необходимый инструмент для получения информации о том, как выполняется ваш запрос.

Документация предоставляет подробный [гид](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как его использовать для анализа выполнения вашего запроса. Вместо того, чтобы повторять то, что содержится в этом руководстве, давайте сосредоточимся на нескольких командах, которые помогут нам выявить узкие места в производительности выполнения запросов.

**Explain indexes = 1**

Давайте начнем с EXPLAIN indexes = 1, чтобы просмотреть план запроса. План запроса - это дерево, показывающее, как будет выполнен запрос. Здесь вы можете увидеть, в каком порядке будут выполняться операторы из запроса. План запроса, возвращаемый оператором EXPLAIN, можно читать снизу вверх.

Давайте попробуем использовать первый из наших длительных запросов.

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
```

Вывод прост. Запрос начинает с считывания данных из таблицы `nyc_taxi.trips_small_inferred`. Затем применяется оператор WHERE для фильтрации строк на основе вычисленных значений. Отфильтрованные данные подготавливаются для агрегации, и вычисляются квантильные значения. В конце результат сортируется и выводится.

Здесь мы можем отметить, что первичные ключи не используются, что имеет смысл, так как мы не определили их при создании таблицы. В результате ClickHouse выполняет полное сканирование таблицы для запроса.

**Explain Pipeline**

EXPLAIN Pipeline показывает конкретную стратегию выполнения запроса. Здесь вы можете увидеть, как ClickHouse фактически выполнил общий план запроса, который мы смотрели ранее.

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

Здесь мы можем отметить количество потоков, используемых для выполнения запроса: 59 потоков, что указывает на высокую степень параллелизма. Это ускоряет выполнение запроса, который занял бы больше времени на меньшей машине. Количество потоков, работающих параллельно, может объяснить высокое потребление памяти запросом.

В идеале вам следует исследовать все ваши медленные запросы таким же образом, чтобы выявить ненужные сложные планы запросов и понять количество строк, прочитанных каждым запросом, и потребляемые ресурсы.

## Методология {#methodology}

Может быть сложно определить проблемные запросы на развертывании в производственной среде, так как в любой момент времени в вашем развертывании ClickHouse выполняется, вероятно, большое количество запросов.

Если вы знаете, какой пользователь, база данных или таблицы имеют проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs`, чтобы сузить поиск.

Как только вы определите, какие запросы хотите оптимизировать, вы можете начать работать над ними. Одна распространенная ошибка, которую делают разработчики на этом этапе, - это одновременно менять несколько вещей, проводить экспериментальные тесты и, как правило, в конечном итоге получать смешанные результаты, но, что более важно, не понимая, что сделало запрос быстрее.

Оптимизация запросов требует структуры. Я не говорю о сложном бенчмаркинге, но наличие простого процесса, который поможет понять, как ваши изменения влияют на производительность запросов, может значительно повлиять.

Начните с выявления ваших медленных запросов из журналов запросов, затем исследуйте потенциальные улучшения в изоляции. При тестировании запроса убедитесь, что вы отключили кеш файловой системы.

> ClickHouse использует [кэширование](/operations/caches), чтобы ускорить производительность запросов на различных этапах. Это хорошо для производительности запросов, но при устранении неполадок это может скрыть потенциальные узкие места ввода-вывода или плохую схему таблицы. По этой причине я рекомендую отключить кеш файловой системы во время тестирования. Убедитесь, что он включен в производственной среде.

Как только вы определите потенциальные оптимизации, рекомендуется реализовывать их одну за другой, чтобы лучше отслеживать, как они влияют на производительность. Ниже представлена схема, описывающая общий подход.

<Image img={queryOptimizationDiagram1} size="lg" alt="Рабочий процесс оптимизации"/>

_Наконец, будьте осторожны с выбросами; довольно часто запрос может выполняться медленно, либо потому, что пользователь пытался выполнить дорогой запрос, либо по другой причине, связанной с нагрузкой на систему. Вы можете сгруппировать данные по полю normalized_query_hash, чтобы идентифицировать дорогие запросы, которые выполняются регулярно. Именно их вам, вероятно, следует изучить._

## Базовая оптимизация {#basic-optimization}

Теперь, когда у нас есть наша структура для тестирования, мы можем начать оптимизацию.

Лучшее место для начала - это посмотреть, как хранятся данные. Как и для любой базы данных, чем меньше данных мы читаем, тем быстрее будет выполняться запрос.

В зависимости от того, как вы загрузили свои данные, вы могли использовать возможности ClickHouse [для вывода схемы](/interfaces/schema-inference) на основе загруженных данных. Хотя это очень удобно для начала, если вы хотите оптимизировать производительность своего запроса, вам нужно будет пересмотреть схему данных, чтобы лучше соответствовать вашему случаю использования.

### Nullable {#nullable}

Как описано в [документации по лучшим практикам](/best-practices/select-data-types#avoid-nullable-columns), избегайте nullable-колонок, где это возможно. Искушение использовать их часто велико, так как они делают механизм загрузки данных более гибким, но они негативно влияют на производительность, так как каждый раз нужно обрабатывать дополнительную колонку.

Запуск SQL-запроса, который подсчитывает строки с NULL значением, может легко выявить колонки в ваших таблицах, которые на самом деле нуждаются в Nullable значении.

```sql
-- Find non-null values columns
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

Query id: 4a70fc5b-2501-41c8-813c-45ce241d85ae

Row 1:
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

У нас есть только две колонки с null значениями: `mta_tax` и `payment_type`. Остальные поля не должны использовать `Nullable` колонку.

### Низкая кардинальность {#low-cardinality}

Легкая оптимизация, которую можно применять к строкам, - это наиболее эффективное использование типа данных LowCardinality. Как описано в [документации по низкой кардинальности](/sql-reference/data-types/lowcardinality), ClickHouse применяет кодирование словаря к колонкам LowCardinality, что значительно увеличивает производительность запросов.

Простое правило для определения, какие колонки являются хорошими кандидатами для LowCardinality, заключается в том, что любую колонку с менее чем 10 000 уникальными значениями можно считать идеальным кандидатом.

Вы можете использовать следующий SQL-запрос, чтобы найти колонки с небольшим количеством уникальных значений.

```sql
-- Identify low cardinality columns
SELECT
    uniq(ratecode_id),
    uniq(pickup_location_id),
    uniq(dropoff_location_id),
    uniq(vendor_id)
FROM trips_small_inferred
FORMAT VERTICAL

Query id: d502c6a1-c9bc-4415-9d86-5de74dd6d932

Row 1:
──────
uniq(ratecode_id):         6
uniq(pickup_location_id):  260
uniq(dropoff_location_id): 260
uniq(vendor_id):           3
```

С низкой кардинальностью, эти четыре колонки, `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id`, являются хорошими кандидатами для типа поля LowCardinality.

### Оптимизация типа данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Убедитесь, что вы выбрали наименьший возможный тип данных, который подходит для вашего случая использования, чтобы оптимизировать производительность и сократить место хранения данных на диске.

Для чисел вы можете проверить минимальное/максимальное значение в вашем наборе данных, чтобы убедиться, что текущее значение точности соответствует действительности вашего набора данных.

```sql
-- Find min/max values for the payment_type field
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

Для дат вам следует выбрать точность, которая соответствует вашему набору данных и лучше всего подходит для ответов на запросы, которые вы собираетесь выполнять.

### Применение оптимизаций {#apply-the-optimizations}

Давайте создадим новую таблицу, чтобы использовать оптимизированную схему и вновь загрузим данные.

```sql
-- Create table with optimized data
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

-- Insert the data
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

Мы снова запускаем запросы, используя новую таблицу, чтобы проверить улучшения.

| Имя    | Запуск 1 - Время | Время выполнения | Обработанные строки | Пиковая память |
| ------- | ---------------- | ---------------- | ------------------- | -------------- |
| Запрос 1 | 1.699 сек       | 1.353 сек        | 329.04 миллиона     | 337.12 MiB     |
| Запрос 2 | 1.419 сек       | 1.171 сек        | 329.04 миллиона     | 531.09 MiB     |
| Запрос 3 | 1.414 сек       | 1.188 сек        | 329.04 миллиона     | 265.05 MiB     |

Мы замечаем некоторые улучшения как в времени запроса, так и в использовании памяти. Благодаря оптимизации в схеме данных мы сокращаем общий объем данных, представляющих наши данные, что ведет к улучшенному потреблению памяти и сокращению времени обработки.

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

Query id: 72b5eb1c-ff33-4fdb-9d29-dd076ac6f532

   ┌─table────────────────┬─compressed─┬─uncompressed─┬──────rows─┐
1. │ trips_small_inferred │ 7.38 GiB   │ 37.41 GiB    │ 329044175 │
2. │ trips_small_no_pk    │ 4.89 GiB   │ 15.31 GiB    │ 329044175 │
   └──────────────────────┴────────────┴──────────────┴───────────┘
```

Новая таблица значительно меньше, чем предыдущая. Мы видим сокращение примерно на 34% в дисковом пространстве для таблицы (7.38 GiB против 4.89 GiB).

## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем управления базами данных. В этих системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставить дублирующиеся значения первичного ключа отклоняется, и обычно создается индекс на основе B-дерева или хэш-таблицы для быстрого поиска.

В ClickHouse [цель](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) первичного ключа иная; он не обеспечивает уникальность или помогает с целостностью данных. Вместо этого он предназначен для оптимизации производительности запросов. Первичный ключ определяет порядок, в котором данные хранятся на диске, и реализуется как разреженный индекс, который хранит указатели на первую строку каждого гранулы.

> Гранулы в ClickHouse - это наименьшие единицы данных, читаемые во время выполнения запроса. Они содержат до фиксированного количества строк, определяемого index_granularity, с умолчательным значением 8192 строки. Гранулы хранятся последовательно и сортируются по первичному ключу.

Выбор хорошего набора первичных ключей важен для производительности, и на самом деле обычно хранится одни и те же данные в разных таблицах и используются разные наборы первичных ключей для ускорения определенного набора запросов.

Другие опции, поддерживаемые ClickHouse, такие как проекция или материализованное представление, позволяют использовать другой набор первичных ключей на одних и тех же данных. Вторая часть этой серии блогов освятит эту тему более подробно.

### Выбор первичных ключей {#choose-primary-keys}

Выбор правильного набора первичных ключей - это сложная задача, и для нахождения лучшей комбинации могут потребоваться компромиссы и эксперименты.

На данный момент мы будем следовать этим простым практикам:

- Используйте поля, которые используются для фильтрации в большинстве запросов
- Сначала выбирайте колонки с низкой кардинальностью
- Учитывайте временной компонент в своем первичном ключе, так как фильтрация по времени для набора данных с временными метками довольно распространена.

В нашем случае мы будем экспериментировать с следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`.

Кардинальность для passenger_count мала (24 уникальных значения) и используется в наших медленных запросах. Мы также добавляем временные поля (`pickup_datetime` и `dropoff_datetime`), так как они могут часто фильтроваться.

Создайте новую таблицу с первичными ключами и снова загрузите данные.

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

-- Insert the data
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

Затем мы повторно запустим наши запросы. Мы собираем результаты из трех экспериментов, чтобы посмотреть улучшения в времени выполнения, обработанных строках и потреблении памяти.

<table>
  <thead>
    <tr>
      <th colspan="4">Запрос 1</th>
    </tr>
    <tr>
      <th></th>
      <th>Запуск 1</th>
      <th>Запуск 2</th>
      <th>Запуск 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Время выполнения</td>
      <td>1.699 сек</td>
      <td>1.353 сек</td>
      <td>0.765 сек</td>
    </tr>
    <tr>
      <td>Обработанные строки</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
    </tr>
    <tr>
      <td>Пиковая память</td>
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
      <th></th>
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
      <td>Обработанные строки</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
      <td>41.46 миллиона</td>
    </tr>
    <tr>
      <td>Пиковая память</td>
      <td>546.75 MiB</td>
      <td>531.09 MiB</td>
      <td>173.50 MiB</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="4">Запрос 3</th>
    </tr>
    <tr>
      <th></th>
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
      <td>Обработанные строки</td>
      <td>329.04 миллиона</td>
      <td>329.04 миллиона</td>
      <td>276.99 миллиона</td>
    </tr>
    <tr>
      <td>Пиковая память</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

Мы можем увидеть значительное улучшение по всем фронтам в времени выполнения и использованию памяти.

Запрос 2 получает наибольшую выгоду от первичного ключа. Давайте посмотрим, как план запроса, сгенерированный до и после, отличается.

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

Благодаря первичному ключу был выбран только поднабор гранул таблицы. Это значительно улучшает производительность запроса, так как ClickHouse должен обрабатывать значительно меньше данных.

## Следующие шаги {#next-steps}

Надеюсь, этот гид дает хорошее понимание того, как исследовать медленные запросы с помощью ClickHouse и как делать их быстрее. Чтобы узнать больше о данной теме, вы можете прочитать больше о [анализаторе запросов](/operations/analyzer) и [профилировании](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваш запрос.

По мере того как вы становитесь более знакомыми с особенностями ClickHouse, я бы порекомендовал прочитать о [ключах партиционирования](/optimize/partitioning-key) и [индексах пропуска данных](/optimize/skipping-indexes), чтобы узнать о более продвинутых техниках, которые вы можете использовать для ускорения своих запросов.