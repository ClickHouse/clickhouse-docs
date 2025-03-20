---
slug: /optimize/query-optimization
sidebar_label: Оптимизация запросов
title: Руководство по оптимизации запросов
description: Простой гид по оптимизации запросов, который описывает общие пути повышения производительности запроса
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';

# Простой гид по оптимизации запросов

Этот раздел направлен на то, чтобы проиллюстрировать через общие сценарии, как использовать различные техники повышения производительности и оптимизации, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) или [избежание Nullable колонок](/optimize/avoid-nullable-columns), с целью улучшения производительности запросов ClickHouse.
## Понимание производительности запросов {#understand-query-performance}

Лучший момент для размышлений об оптимизации производительности – это когда вы настраиваете свою [схему данных](/data-modeling/schema-design) перед первой загрузкой данных в ClickHouse.

Но будем честными; трудно предсказать, насколько вырастут ваши данные или какие типы запросов будут выполняться.

Если у вас есть уже существующая развертка с несколькими запросами, которые вы хотите улучшить, первый шаг – понять, как выполняются эти запросы и почему некоторые из них выполняются за несколько миллисекунд, в то время как другие занимают больше времени.

ClickHouse предлагает широкий набор инструментов, которые помогут вам понять, как выполняется ваш запрос и какие ресурсы потребляются для его выполнения.

В этом разделе мы рассмотрим эти инструменты и как их использовать.
## Общие соображения {#general-considerations}

Чтобы понять производительность запросов, давайте посмотрим, что происходит в ClickHouse, когда выполняется запрос.

Следующая часть намеренно упрощена и использует некоторые ухищрения; цель здесь не утопить вас в деталях, а дать вам общее представление о базовых концепциях. Для получения дополнительной информации вы можете прочитать об [анализаторе запросов](/operations/analyzer).

С очень общей точки зрения, когда ClickHouse выполняет запрос, происходит следующее:

  - **Парсинг и анализ запроса**

Запрос разбирается и анализируется, после чего создается общий план выполнения запроса.

  - **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отсекаются, и строится конвейер запросов из плана запроса.

  - **Выполнение конвейера запроса**

Данные считываются и обрабатываются параллельно. Это этап, на котором ClickHouse фактически выполняет операции запроса, такие как фильтрация, агрегации и сортировки.

  - **Финальная обработка**

Результаты объединяются, сортируются и форматируются в финальный результат перед отправкой клиенту.

На самом деле происходит множество [оптимизаций](/concepts/why-clickhouse-is-so-fast), и мы обсудим их подробнее в этом руководстве, но для начала эти основные концепции дают нам хорошее понимание того, что происходит за кулисами, когда ClickHouse выполняет запрос.

С этим обобщенным пониманием давайте рассмотрим инструменты, которые предоставляет ClickHouse, и как мы можем использовать их для отслеживания метрик, которые влияют на производительность запросов.
## Набор данных {#dataset}

Мы используем реальный пример, чтобы проиллюстрировать, как мы подходим к производительности запросов.

Давайте используем набор данных о такси в Нью-Йорке, который содержит данные о поездках на такси в Нью-Йорке. Сначала мы начнем с загрузки набора данных о такси в Нью-Йорке без оптимизации.

Ниже приведена команда для создания таблицы и вставки данных из ведра S3. Обратите внимание, что мы намеренно выводим схему из данных, что не оптимизировано.

```sql
-- Создание таблицы с выведенной схемой
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Вставка данных в таблицу с выведенной схемой
INSERT INTO trips_small_inferred
SELECT * 
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

Давайте взглянем на схему таблицы, автоматически выведенную из данных.

```sql
--- Показать выведенную схему таблицы
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
### Журналы запросов {#query-logs}

По умолчанию ClickHouse собирает и записывает информацию о каждом выполненном запросе в [журналы запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`.

Для каждого выполненного запроса ClickHouse записывает статистику, такую как время выполнения запроса, количество прочитанных строк и использование ресурсов, таких как использование ЦП, памяти или попадания в кэш файловой системы.

Таким образом, журнал запросов – хорошее место для начала при исследовании медленных запросов. Вы можете легко увидеть запросы, которые требуют много времени для выполнения, и отобразить информацию о использовании ресурсов для каждого из них.

Давайте найдем пять самых долгих запросов в нашем наборе данных о такси в Нью-Йорке.

```sql
-- Найти 5 долгих запросов из базы данных nyc_taxi за последние 1 час
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

Поле `query_duration_ms` указывает, сколько времени потребовалось для выполнения данного запроса. Анализируя результаты из журналов запросов, мы можем увидеть, что первый запрос выполняется за 2967 мс, и его можно улучшить.

Вы также можете узнать, какие запросы нагружают систему, проверяя запрос, который потребляет больше всего памяти или ЦП.

```sql
-- Топ запросов по использованию памяти 
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

Давайте изолируем найденные долгие запросы и повторим их несколько раз, чтобы понять время отклика.

На этом этапе важно отключить кэш файловой системы, установив параметр `enable_filesystem_cache` в 0 для повышения воспроизводимости.

```sql
-- Отключение кэша файловой системы
set enable_filesystem_cache = 0;

-- Выполнение запроса 1
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

-- Выполнение запроса 2
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

-- Выполнение запроса 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

Сводим результаты в таблицу для удобства чтения.

| Название    | Затраченное время   | Обработано строк | Пиковая память |
| ----------- | ------------------- | ---------------- | -------------- |
| Запрос 1    | 1.699 сек           | 329.04 миллионов | 440.24 Мб      |
| Запрос 2    | 1.419 сек           | 329.04 миллионов | 546.75 Мб      |
| Запрос 3    | 1.414 сек           | 329.04 миллионов | 451.53 Мб      |

Давайте лучше поймем, что достигается с помощью запросов.

- Запрос 1 вычисляет распределение расстояний по поездкам со средней скоростью более 30 миль в час.
- Запрос 2 находит количество и среднюю стоимость поездок за неделю.
- Запрос 3 вычисляет среднее время каждой поездки в наборе данных.

Ни один из этих запросов не выполняет очень сложную обработку, кроме первого запроса, который вычисляет время поездки «на лету» каждый раз, когда выполняется запрос. Однако каждый из этих запросов занимает более одной секунды для выполнения, что в мире ClickHouse является довольно длительным временем. Также можно отметить, что использование памяти этих запросов составляет около 400 Мб для каждого запроса, что довольно много памяти. Кроме того, каждый запрос, похоже, считывает одно и то же количество строк (то есть 329.04 миллиона). Давайте быстро подтвердим, сколько строк в этой таблице.

```sql
-- Подсчет количества строк в таблице 
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 миллиона
   └───────────┘
```

Таблица содержит 329.04 миллиона строк, следовательно, каждый запрос выполняет полное сканирование таблицы.
### Оператор Explain {#explain-statement}

Теперь, когда у нас есть несколько долгих запросов, давайте разберемся, как они выполняются. Для этого ClickHouse поддерживает команду [EXPLAIN statement](/sql-reference/statements/explain). Это очень полезный инструмент, который предоставляет очень детальный обзор всех этапов выполнения запроса без фактического выполнения запроса. Хотя это может быть подавляющим для лиц, не являющихся специалистами по ClickHouse, это остается необходимым инструментом для понимания того, как выполняется ваш запрос.

Документация предоставляет подробный [гайд](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как использовать его для анализа выполнения вашего запроса. Вместо того, чтобы повторять, что содержится в этом руководстве, давайте сосредоточимся на нескольких командах, которые помогут нам выявить узкие места в производительности выполнения запросов.

**Explain indexes = 1**

Давайте начнем с EXPLAIN indexes = 1, чтобы проверить план запроса. План запроса – это дерево, показывающее, как будет выполняться запрос. Здесь вы можете увидеть, в каком порядке будут выполняться условия из запроса. План запроса, возвращаемый оператором EXPLAIN, можно читать снизу вверх.

Давайте попробуем использовать первый из наших долгих запросов.

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

Вывод понятен. Запрос начинается с чтения данных из таблицы `nyc_taxi.trips_small_inferred`. Затем к условию WHERE применяется фильтрация строк на основе вычисленных значений. Отфильтрованные данные подготавливаются для агрегации, и вычисляются квантили. Наконец, результат сортируется и выводится.

Здесь мы можем отметить, что первичные ключи не используются, что имеет смысл, поскольку мы их не определили при создании таблицы. В результате ClickHouse выполняет полное сканирование таблицы для этого запроса.

**Explain Pipeline**

EXPLAIN PIPELINE показывает конкретную стратегию выполнения запроса. Здесь вы можете увидеть, как ClickHouse на самом деле выполняет общий план запроса, который мы смотрели ранее.

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

Здесь мы можем отметить количество потоков, использованных для выполнения запроса: 59 потоков, что указывает на высокую параллелизацию. Это ускоряет запрос, который занял бы больше времени на более маленьком оборудовании. Количество потоков, работающих параллельно, может объяснить высокое использование памяти, которое используется запросом.

Идеально, если вы исследуете все ваши медленные запросы таким образом, чтобы выявить ненужные сложные планы запросов и понять количество строк, прочитанных каждым запросом, и ресурсы, которые они потребляют.
## Методология {#methodology}

Может быть сложно выявить проблемные запросы на развертке в продукции, поскольку в любой момент времени выполняется, вероятно, множество запросов на вашем развертывании ClickHouse.

Если вы знаете, какой пользователь, база данных или таблицы имеют проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs`, чтобы уточнить поиск.

После того как вы выявили запросы, которые хотите оптимизировать, вы можете начать работать над их улучшением. Одной из распространенных ошибок, которые совершают разработчики на этом этапе, является изменение нескольких вещей одновременно, проведение спонтанных экспериментов и, как правило, получение смешанных результатов, но, что более важно, отсутствие хорошего понимания того, что сделало запрос быстрее.

Оптимизация запроса требует структуры. Я не говорю о продвинутом бенчмаркинге, а о наличии простого процесса, который поможет вам понять, как ваши изменения влияют на производительность запросов.

Начните с выявления своих медленных запросов из журналов запросов, а затем исследуйте возможные улучшения в изоляции. При тестировании запроса убедитесь, что вы отключили кэш файловой системы.

> ClickHouse использует [кэширование](/operations/caches), чтобы ускорить производительность запросов на разных этапах. Это хорошо для производительности запросов, но во время решения проблем это может скрыть потенциальные узкие места ввода/вывода или плохую схему таблицы. По этой причине я рекомендую отключить кэш файловой системы во время тестирования. Убедитесь, что он включен в настройках в производстве.

Как только вы выявите потенциальные оптимизации, рекомендуется внедрять их по одной, чтобы лучше отслеживать, как они влияют на производительность. Ниже представлена диаграмма, описывающая общий подход.

<img src={queryOptimizationDiagram1} class="image" />

_Наконец, будьте осторожны с выбросами; довольно часто запрос может выполняться медленно, либо потому, что пользователь пытался выполнить спонтанный дорогой запрос, либо система была под давлением по другой причине. Вы можете группировать по полю normalized_query_hash, чтобы выявить дорогие запросы, которые выполняются регулярно. Скорее всего, это те запросы, которые вы хотите исследовать._
## Основная оптимизация {#basic-optimization}

Теперь, когда у нас есть наша база для тестирования, мы можем начать оптимизировать.

Лучшее место для начала – это посмотреть, как хранятся данные. Как и для любой базы данных, чем меньше данных мы считываем, тем быстрее будет исполнен запрос.

В зависимости от того, как вы загрузили свои данные, вы могли воспользоваться [возможностями](/interfaces/schema-inference) ClickHouse для выведения схемы таблицы на основе загруженных данных. Хотя это очень удобно для начала, если вы хотите оптимизировать производительность ваших запросов, вам нужно будет пересмотреть схему данных, чтобы она лучше соответствовала вашим требованиям.
### Nullable {#nullable}

Как описано в [документации по лучшим практикам](/cloud/bestpractices/avoid-nullable-columns), избегайте nullable колонок, где это возможно. Использовать их часто заманчиво, так как они делают механизм загрузки данных более гибким, однако они отрицательно влияют на производительность, так как каждый раз приходится обрабатывать дополнительную колонку.

Запуск SQL запроса, который подсчитывает строки с значением NULL, может легко выявить колонки в ваших таблицах, которые действительно нуждаются в значении Nullable.

```sql
-- Найти колонки с ненулевыми значениями 
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

У нас есть только две колонки со значениями NULL: `mta_tax` и `payment_type`. Остальные поля не должны использовать nullable колонку.
### Низкая кардинальность {#low-cardinality}

Легко применить к строкам оптимизацию с использованием типа данных LowCardinality. Как описано в [документации по низкой кардинальности](/sql-reference/data-types/lowcardinality), ClickHouse применяет кодирование словарей к колонкам LowCardinality, что значительно увеличивает производительность запросов.

Простое правило, которое поможет определить, какие колонки являются хорошими кандидатами на LowCardinality – это все колонки с менее чем 10,000 уникальными значениями являются идеальными кандидатами.

Вы можете использовать следующий SQL запрос для выявления колонок с низким количеством уникальных значений.

```sql
-- Идентификация колонок с низкой кардинальностью
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

С низкой кардинальностью эти четыре колонки, `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id`, являются хорошими кандидатами для типа поля LowCardinality.
### Оптимизация типа данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Убедитесь, что вы выбрали наименьший возможный тип данных, который соответствует вашему случаю, чтобы оптимизировать производительность и снизить пространство для хранения данных на диске.

Для чисел вы можете проверить минимальное/максимальное значение в вашем наборе данных, чтобы удостовериться, что текущая точность соответствует реальности вашего набора данных.

```sql
-- Найти мин/max значения для поля payment_type
SELECT
    min(payment_type), max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

Для дат вы должны выбрать степень точности, которая соответствует вашему набору данных и лучше всего подходит для обработки запросов, которые вы собираетесь выполнять.
### Применение оптимизаций {#apply-the-optimizations}

Давайте создадим новую таблицу для использования оптимизированной схемы и повторно загрузим данные.

```sql
-- Создание таблицы с оптимизированными данными 
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

-- Вставка данных 
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

Мы снова запускаем запросы, используя новую таблицу, чтобы проверить наличие улучшений.

| Название    | Запуск 1 - Затраченное время | Затраченное время | Обработано строк | Пиковая память |
| ----------- | ----------------------------- | ----------------- | ---------------- | -------------- |
| Запрос 1    | 1.699 сек                     | 1.353 сек         | 329.04 миллионов | 337.12 Мб      |
| Запрос 2    | 1.419 сек                     | 1.171 сек         | 329.04 миллионов | 531.09 Мб      |
| Запрос 3    | 1.414 сек                     | 1.188 сек         | 329.04 миллионов | 265.05 Мб      |

Мы замечаем некоторые улучшения как во времени выполнения, так и в использовании памяти. Благодаря оптимизации схемы данных мы сократили общий объем данных, что привело к улучшению использования памяти и снижению времени обработки.

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

Новая таблица значительно меньше, чем предыдущая. Мы видим уменьшение примерно на 34% в объеме дискового пространства для таблицы (7.38 GiB против 4.89 GiB).
## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем баз данных. В этих системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставить дубликаты значений первичного ключа отклоняется, и обычно создается индекс на основе B-дерева или хэш-индекс для быстрого поиска.

В ClickHouse [цель](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) первичного ключа отличается; он не обеспечивает уникальность или помогает с целостностью данных. Вместо этого он предназначен для оптимизации производительности запросов. Первичный ключ определяет порядок, в котором данные хранятся на диске, и реализуется как разреженный индекс, который хранит указатели на первую строку каждого гранулятора.

> Гранулы в ClickHouse являются наименьшими единицами данных, читаемыми во время выполнения запроса. Они содержат до фиксированного количества строк, определяемого index_granularity, со значением по умолчанию 8192 строки. Гранулы хранятся последовательно и отсортированы по первичному ключу.

Выбор хорошего набора первичных ключей важен для производительности, и на самом деле обычно хранить одни и те же данные в разных таблицах и использовать разные наборы первичных ключей для ускорения конкретного набора запросов.

Другие опции, поддерживаемые ClickHouse, такие как Projection или Materialized View, позволяют вам использовать другой набор первичных ключей на одних и тех же данных. Вторая часть этой серии блогов будет более подробно освещать это.
### Выбор первичных ключей {#choose-primary-keys}

Выбор правильного набора первичных ключей является сложной темой, и может потребоваться компромисс и эксперименты для нахождения наилучшей комбинации.

На данный момент мы будем придерживаться следующих простых практик:

- Используйте поля, которые используются для фильтрации в большинстве запросов
- Выбирайте колонки с более низкой кардинальностью в первую очередь
- Рассмотрите возможность добавления временного компонента в ваш первичный ключ, так как фильтрация по времени в наборе данных с метками времени довольно распространена.

В нашем случае мы будем экспериментировать с следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`.

Кардинальность для passenger_count небольшая (24 уникальных значения) и используется в наших медленных запросах. Мы также добавляем поля с метками времени (`pickup_datetime` и `dropoff_datetime`), так как они часто могут быть отфильтрованы.

Создайте новую таблицу с первичными ключами и повторно загрузите данные.

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

-- Вставить данные 
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

Затем мы повторно выполняем наши запросы. Мы компилируем результаты трех экспериментов, чтобы увидеть улучшения по времени выполнения, количеству обработанных строк и потреблению памяти.

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
      <td>329.04 миллионов</td>
      <td>329.04 миллионов</td>
      <td>329.04 миллионов</td>
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
      <td>329.04 миллионов</td>
      <td>329.04 миллионов</td>
      <td>41.46 миллионов</td>
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
      <td>329.04 миллионов</td>
      <td>329.04 миллионов</td>
      <td>276.99 миллионов</td>
    </tr>
    <tr>
      <td>Пиковая память</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

Мы можем увидеть значительное улучшение во всех аспектах по времени выполнения и использованию памяти.

Запрос 2 наиболее выигрывает от первичного ключа. Давайте взглянем, как план запроса, сгенерированный теперь, отличается от предыдущего.

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

Благодаря первичному ключу был выбран только подсет таблицы гранул. Это само по себе значительно улучшает производительность запроса, так как ClickHouse должен обрабатывать значительно меньше данных.
## Следующие шаги {#next-steps}

Надеюсь, этот гид дает хорошее представление о том, как исследовать медленные запросы с помощью ClickHouse и как сделать их быстрее. Чтобы более подробно изучить эту тему, вы можете прочитать больше о [анализаторе запросов](/operations/analyzer) и [профилировании](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваш запрос.

Когда вы ознакомитесь с особенностями ClickHouse, я бы рекомендовал прочитать о [ключах партиционирования](/optimize/partitioning-key) и [data skipping indexes](/optimize/skipping-indexes), чтобы ознакомиться с более продвинутыми техниками, которые вы можете использовать для ускорения ваших запросов.
