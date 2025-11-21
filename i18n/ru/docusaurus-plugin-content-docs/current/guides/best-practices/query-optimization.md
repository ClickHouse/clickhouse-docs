---
slug: /optimize/query-optimization
sidebar_label: 'Оптимизация запросов'
title: 'Руководство по оптимизации запросов'
description: 'Простое руководство по оптимизации запросов, описывающее типовые подходы к повышению производительности запросов'
doc_type: 'guide'
keywords: ['оптимизация запросов', 'производительность', 'лучшие практики', 'настройка запросов', 'эффективность']
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';


# Простой справочник по оптимизации запросов

В этом разделе на распространённых сценариях показано, как использовать различные приёмы оптимизации и повышения производительности, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) или [избегание Nullable-столбцов](/optimize/avoid-nullable-columns), чтобы повысить эффективность ваших запросов в ClickHouse.



## Понимание производительности запросов {#understand-query-performance}

Лучший момент для размышлений об оптимизации производительности — это этап настройки [схемы данных](/data-modeling/schema-design) перед первой загрузкой данных в ClickHouse.

Но будем честны: сложно предсказать, насколько вырастут ваши данные или какие типы запросов будут выполняться.

Если у вас есть существующее развёртывание с несколькими запросами, которые вы хотите оптимизировать, первый шаг — понять, как эти запросы выполняются и почему одни выполняются за несколько миллисекунд, а другие занимают больше времени.

ClickHouse располагает обширным набором инструментов, которые помогают понять, как выполняется ваш запрос и какие ресурсы потребляются для его выполнения.

В этом разделе мы рассмотрим эти инструменты и способы их использования. 


## Общие сведения {#general-considerations}

Чтобы понять производительность запросов, рассмотрим, что происходит в ClickHouse при выполнении запроса.

Следующая часть намеренно упрощена и содержит некоторые сокращения; цель здесь не в том, чтобы перегрузить вас деталями, а в том, чтобы познакомить вас с базовыми концепциями. Для получения дополнительной информации вы можете прочитать об [анализаторе запросов](/operations/analyzer).

На высоком уровне при выполнении запроса в ClickHouse происходит следующее:

- **Разбор и анализ запроса**

Запрос разбирается и анализируется, создается общий план выполнения запроса.

- **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отсекаются, и на основе плана запроса строится конвейер выполнения.

- **Выполнение конвейера запроса**

Данные читаются и обрабатываются параллельно. На этом этапе ClickHouse фактически выполняет операции запроса, такие как фильтрация, агрегация и сортировка.

- **Финальная обработка**

Результаты объединяются, сортируются и форматируются в окончательный результат перед отправкой клиенту.

В действительности происходит множество [оптимизаций](/concepts/why-clickhouse-is-so-fast), и мы обсудим их более подробно в этом руководстве, но пока эти основные концепции дают нам хорошее понимание того, что происходит за кулисами при выполнении запроса в ClickHouse.

Имея это общее понимание, давайте рассмотрим инструменты, которые предоставляет ClickHouse, и то, как мы можем использовать их для отслеживания метрик, влияющих на производительность запросов. 


## Набор данных {#dataset}

Мы используем реальный пример, чтобы проиллюстрировать наш подход к оптимизации производительности запросов.

Давайте используем набор данных NYC Taxi, который содержит данные о поездках такси в Нью-Йорке. Сначала мы загрузим набор данных NYC Taxi без какой-либо оптимизации.

Ниже приведена команда для создания таблицы и вставки данных из корзины S3. Обратите внимание, что мы намеренно выводим схему из данных, что не является оптимизированным подходом.

```sql
-- Создание таблицы с автоматически выведенной схемой
CREATE TABLE trips_small_inferred
ORDER BY () EMPTY
AS SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');

-- Вставка данных в таблицу с автоматически выведенной схемой
INSERT INTO trips_small_inferred
SELECT *
FROM s3Cluster
('default','https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/clickhouse-academy/nyc_taxi_2009-2010.parquet');
```

Давайте посмотрим на схему таблицы, автоматически выведенную из данных.

```sql
--- Отображение автоматически выведенной схемы таблицы
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


## Выявление медленных запросов {#spot-the-slow-queries}

### Журналы запросов {#query-logs}

По умолчанию ClickHouse собирает и записывает информацию о каждом выполненном запросе в [журналы запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`. 

Для каждого выполненного запроса ClickHouse записывает статистику, включающую время выполнения запроса, количество прочитанных строк и использование ресурсов, таких как процессор, память или попадания в кэш файловой системы. 

Таким образом, журнал запросов — хорошая отправная точка при анализе медленных запросов. Вы можете легко выявить запросы, которые выполняются долго, и просмотреть информацию об использовании ресурсов для каждого из них. 

Найдём пять самых долго выполняющихся запросов в нашем наборе данных NYC taxi.

```sql
-- Найти 5 самых долго выполняющихся запросов из базы данных nyc_taxi за последний час
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

Поле `query_duration_ms` показывает, сколько времени потребовалось для выполнения конкретного запроса. Анализируя результаты из журналов запросов, мы видим, что первый запрос выполняется 2967 мс, что можно оптимизировать. 

Вы также можете определить, какие запросы создают наибольшую нагрузку на систему, проанализировав запросы, потребляющие больше всего памяти или процессорного времени. 


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

Давайте изолируем найденные нами долго выполняющиеся запросы и несколько раз перезапустим их, чтобы оценить время отклика. 

На этом этапе важно отключить кэш файловой системы, установив параметр `enable_filesystem_cache` в 0, чтобы повысить воспроизводимость.

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
1 строка. Затрачено: 1.699 сек. Обработано 329.04 млн строк, 8.88 ГБ (193.72 млн строк/сек., 5.23 ГБ/сек.)
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
4 строки. Затрачено: 1.419 сек. Обработано 329.04 млн строк, 5.72 ГБ (231.86 млн строк/сек., 4.03 ГБ/сек.)
Пиковое использование памяти: 546.75 МиБ.

-- Запрос 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 строка. Затрачено: 1.414 сек. Обработано 329.04 млн строк, 8.88 ГБ (232.63 млн строк/сек., 6.28 ГБ/сек.)
Пиковое использование памяти: 451.53 МиБ.
```

Сведём результаты в таблицу для наглядности.

| Name    | Elapsed   | Rows processed | Peak memory |
| ------- | --------- | -------------- | ----------- |
| Query 1 | 1.699 sec | 329.04 million | 440.24 MiB  |
| Query 2 | 1.419 sec | 329.04 million | 546.75 MiB  |
| Query 3 | 1.414 sec | 329.04 million | 451.53 MiB  |

Давайте немного лучше разберёмся, что делают эти запросы. 

* Query 1 вычисляет распределение расстояний в поездках со средней скоростью более 30 миль в час.
* Query 2 находит количество и среднюю стоимость поездок за неделю. 
* Query 3 вычисляет среднюю продолжительность каждой поездки в наборе данных.

Ни один из этих запросов не выполняет сколь‑нибудь сложную обработку, за исключением первого запроса, который вычисляет время поездки «на лету» при каждом выполнении. Однако каждый из этих запросов выполняется более одной секунды, что в мире ClickHouse является очень долгим временем. Отметим также потребление памяти этими запросами: примерно 400 МБ для каждого запроса — это довольно много памяти. Кроме того, каждый запрос читает одинаковое количество строк (т. е. 329,04 миллиона). Быстро проверим, сколько строк в этой таблице.

```sql
-- Подсчитать количество строк в таблице
SELECT count()
FROM nyc_taxi.trips_small_inferred
```


ID запроса: 733372c5-deaf-4719-94e3-261540933b23

┌───count()─┐

1. │ 329044175 │ -- 329,04 млн
   └───────────┘

````

Таблица содержит 329,04 миллиона строк, поэтому каждый запрос выполняет полное сканирование таблицы.

### Оператор EXPLAIN {#explain-statement}

Теперь, когда у нас есть несколько долго выполняющихся запросов, давайте разберемся, как они выполняются. Для этого ClickHouse поддерживает [команду EXPLAIN](/sql-reference/statements/explain). Это очень полезный инструмент, который предоставляет детальное представление всех этапов выполнения запроса без его фактического запуска. Хотя для неспециалиста по ClickHouse это может показаться сложным, он остается важным инструментом для понимания того, как выполняется ваш запрос.

Документация содержит подробное [руководство](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как использовать его для анализа выполнения запросов. Вместо того чтобы повторять содержание этого руководства, давайте сосредоточимся на нескольких командах, которые помогут нам найти узкие места в производительности выполнения запросов. 

**EXPLAIN indexes = 1**

Начнем с EXPLAIN indexes = 1 для проверки плана запроса. План запроса представляет собой дерево, показывающее, как будет выполняться запрос. В нем можно увидеть, в каком порядке будут выполняться условия запроса. План запроса, возвращаемый оператором EXPLAIN, следует читать снизу вверх.

Попробуем использовать первый из наших долго выполняющихся запросов.

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

Результат довольно прост. Запрос начинается с чтения данных из таблицы `nyc_taxi.trips_small_inferred`. Затем применяется предложение WHERE для фильтрации строк на основе вычисленных значений. Отфильтрованные данные подготавливаются к агрегированию, и вычисляются квантили. Наконец, результат сортируется и выводится. 

Здесь мы можем отметить, что первичные ключи не используются, что логично, так как мы не задавали их при создании таблицы. В результате ClickHouse выполняет полное сканирование таблицы для этого запроса. 

**Explain Pipeline**

EXPLAIN Pipeline показывает конкретную стратегию выполнения запроса. В нём можно увидеть, как ClickHouse фактически выполнил общий план запроса, который мы рассматривали ранее.

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


Здесь мы можем отметить количество потоков, использованных для выполнения запроса: 59 потоков, что указывает на высокую степень параллелизма. Это ускоряет выполнение запроса, который на менее мощной машине занял бы больше времени. Количество потоков, выполняющихся параллельно, может объяснить большой объём памяти, потребляемый запросом. 

В идеале вы должны анализировать все медленные запросы таким же образом, чтобы выявлять излишне сложные планы выполнения, а также понимать количество строк, читаемых каждым запросом, и потребляемые ресурсы.



## Методология {#methodology}

Выявление проблемных запросов в производственном развёртывании может быть затруднительным, поскольку в любой момент времени в вашем развёртывании ClickHouse, вероятно, выполняется большое количество запросов.

Если вы знаете, у какого пользователя, базы данных или таблиц возникают проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs` для сужения области поиска.

После того как вы определите запросы, которые хотите оптимизировать, можно приступать к работе над ними. Одна из распространённых ошибок, которую допускают разработчики на этом этапе, — это одновременное изменение нескольких параметров и проведение разовых экспериментов, что обычно приводит к неоднозначным результатам и, что более важно, к отсутствию чёткого понимания того, что именно ускорило запрос.

Оптимизация запросов требует структурированного подхода. Речь идёт не о продвинутом бенчмаркинге, а о наличии простого процесса для понимания того, как ваши изменения влияют на производительность запросов — это может принести значительную пользу.

Начните с выявления медленных запросов из журналов запросов, затем исследуйте потенциальные улучшения изолированно. При тестировании запроса обязательно отключите кеш файловой системы.

> ClickHouse использует [кеширование](/operations/caches) для ускорения выполнения запросов на различных этапах. Это положительно влияет на производительность запросов, но во время диагностики может скрывать потенциальные узкие места ввода-вывода или неоптимальную схему таблицы. По этой причине рекомендуется отключать кеш файловой системы во время тестирования. Убедитесь, что он включён в производственной конфигурации.

После того как вы определили потенциальные оптимизации, рекомендуется внедрять их по одной, чтобы лучше отслеживать их влияние на производительность. Ниже представлена диаграмма, описывающая общий подход.

<Image img={queryOptimizationDiagram1} size='lg' alt='Процесс оптимизации' />

_Наконец, будьте внимательны к выбросам: довольно часто запрос может выполняться медленно либо потому, что пользователь попробовал разовый ресурсоёмкий запрос, либо потому, что система находилась под нагрузкой по другой причине. Вы можете сгруппировать данные по полю normalized_query_hash, чтобы выявить ресурсоёмкие запросы, которые выполняются регулярно. Вероятно, именно их стоит исследовать._


## Базовая оптимизация {#basic-optimization}

Теперь, когда у нас есть среда для тестирования, можно приступить к оптимизации.

Лучше всего начать с анализа того, как хранятся данные. Как и в любой базе данных, чем меньше данных мы читаем, тем быстрее выполняется запрос.

В зависимости от способа загрузки данных вы могли воспользоваться [возможностями](/interfaces/schema-inference) ClickHouse для автоматического определения схемы таблицы на основе загружаемых данных. Хотя это очень удобно для начала работы, для оптимизации производительности запросов необходимо пересмотреть схему данных, чтобы она наилучшим образом соответствовала вашему сценарию использования.

### Nullable {#nullable}

Как описано в [документации с рекомендациями](/best-practices/select-data-types#avoid-nullable-columns), по возможности избегайте nullable-столбцов. Соблазнительно использовать их часто, поскольку они делают механизм загрузки данных более гибким, но они негативно влияют на производительность, так как каждый раз приходится обрабатывать дополнительный столбец.

Выполнение SQL-запроса, подсчитывающего строки со значением NULL, легко покажет, какие столбцы в ваших таблицах действительно требуют типа Nullable.

```sql
-- Поиск столбцов без null-значений
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

У нас есть только два столбца с null-значениями: `mta_tax` и `payment_type`. Остальные поля не должны использовать тип `Nullable`.

### Низкая кардинальность {#low-cardinality}

Простая оптимизация для строковых типов — эффективное использование типа данных LowCardinality. Как описано в [документации](/sql-reference/data-types/lowcardinality) по низкой кардинальности, ClickHouse применяет словарное кодирование к столбцам LowCardinality, что значительно повышает производительность запросов.

Простое практическое правило для определения столбцов, подходящих для LowCardinality: любой столбец с менее чем 10 000 уникальных значений является отличным кандидатом.

Вы можете использовать следующий SQL-запрос для поиска столбцов с небольшим количеством уникальных значений.

```sql
-- Определение столбцов с низкой кардинальностью
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

При низкой кардинальности эти четыре столбца — `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id` — являются хорошими кандидатами для типа поля LowCardinality.

### Оптимизация типа данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Обязательно выбирайте наименьший возможный тип данных, соответствующий вашему сценарию использования, чтобы оптимизировать производительность и сократить объем хранилища данных на диске.

Для числовых данных вы можете проверить минимальное и максимальное значения в вашем наборе данных, чтобы убедиться, что текущая точность соответствует реальным данным вашего набора. 


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

Для дат следует выбирать точность, которая соответствует вашему набору данных и лучше всего подходит для выполнения планируемых запросов.

### Применение оптимизаций {#apply-the-optimizations}

Создадим новую таблицу с оптимизированной схемой и повторно загрузим данные.

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

Выполним запросы снова, используя новую таблицу, чтобы проверить улучшения. 

| Название | Запуск 1 - Время | Время     | Обработано строк | Пиковая память |
| -------- | ---------------- | --------- | ---------------- | -------------- |
| Query 1 | 1.699 sec       | 1.353 sec | 329.04 million | 337.12 MiB  |
| Query 2 | 1.419 sec       | 1.171 sec | 329.04 million | 531.09 MiB  |
| Query 3 | 1.414 sec       | 1.188 sec | 329.04 million | 265.05 MiB  |

Мы наблюдаем улучшения как во времени выполнения запросов, так и в использовании памяти. Благодаря оптимизации схемы данных мы сокращаем общий объем данных, что приводит к снижению потребления памяти и сокращению времени обработки. 

Проверим размер таблиц, чтобы увидеть разницу. 

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

Новая таблица значительно меньше предыдущей. Мы наблюдаем сокращение дискового пространства для таблицы примерно на 34% (7.38 ГиБ против 4.89 ГиБ).


## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем управления базами данных. В таких системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставить дублирующиеся значения первичного ключа отклоняется, и обычно создается индекс на основе B-дерева или хеш-таблицы для быстрого поиска.

В ClickHouse [назначение](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) первичного ключа другое: он не обеспечивает уникальность и не гарантирует целостность данных. Вместо этого он предназначен для оптимизации производительности запросов. Первичный ключ определяет порядок хранения данных на диске и реализован в виде разреженного индекса, который хранит указатели на первую строку каждой гранулы.

> Гранулы в ClickHouse — это минимальные единицы данных, считываемые при выполнении запроса. Они содержат до фиксированного количества строк, определяемого параметром index_granularity, со значением по умолчанию 8192 строки. Гранулы хранятся последовательно и отсортированы по первичному ключу.

Выбор правильного набора первичных ключей важен для производительности, и на практике часто одни и те же данные хранятся в разных таблицах с использованием различных наборов первичных ключей для ускорения определенных запросов.

Другие возможности, поддерживаемые ClickHouse, такие как проекции или материализованные представления, позволяют использовать различные наборы первичных ключей для одних и тех же данных. Вторая часть этой серии статей рассмотрит это более подробно.

### Выбор первичных ключей {#choose-primary-keys}

Выбор правильного набора первичных ключей — сложная задача, которая может потребовать компромиссов и экспериментов для нахождения оптимальной комбинации.

Пока что мы будем следовать этим простым рекомендациям:

- Используйте поля, которые применяются для фильтрации в большинстве запросов
- Выбирайте сначала столбцы с меньшей кардинальностью
- Рассмотрите возможность включения временного компонента в первичный ключ, поскольку фильтрация по времени в наборах данных с временными метками довольно распространена.

В нашем случае мы будем экспериментировать со следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`.

Кардинальность для passenger_count невелика (24 уникальных значения), и это поле используется в наших медленных запросах. Мы также добавляем поля временных меток (`pickup_datetime` и `dropoff_datetime`), поскольку они часто используются для фильтрации.

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

-- Вставка данных
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

Затем мы повторно выполняем наши запросы. Мы собираем результаты трех экспериментов, чтобы увидеть улучшения во времени выполнения, количестве обработанных строк и потреблении памяти. 

<table>
  <thead>
    <tr>
      <th colspan='4'>Запрос 1</th>
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
      <td>Обработано строк</td>
      <td>329.04 млн</td>
      <td>329.04 млн</td>
      <td>329.04 млн</td>
    </tr>
    <tr>
      <td>Пиковое потребление памяти</td>
      <td>440.24 МиБ</td>
      <td>337.12 МиБ</td>
      <td>444.19 МиБ</td>
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
      <td>329.04 млн</td>
      <td>329.04 млн</td>
      <td>41.46 млн</td>
    </tr>

    <tr>
      <td>Пиковое потребление памяти</td>
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
      <td>329.04 млн</td>
      <td>329.04 млн</td>
      <td>276.99 млн</td>
    </tr>

    <tr>
      <td>Пиковое потребление памяти</td>
      <td>451.53 MiB</td>
      <td>265.05 MiB</td>
      <td>197.38 MiB</td>
    </tr>
  </tbody>
</table>

Мы видим существенное улучшение по всем запускам во времени выполнения и потреблении памяти. 

Запрос 2 получает наибольший выигрыш от использования первичного ключа. Давайте посмотрим, чем сформированный план запроса отличается от прежнего.

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
 1. │ Выражение ((проекция + до ORDER BY [вынесенная часть]))                                                     │
 2. │   Сортировка (для ORDER BY)                                                                                 │
 3. │     Выражение (до ORDER BY)                                                                                 │
 4. │       Агрегирование                                                                                                │
 5. │         Выражение (до GROUP BY)                                                                             │
 6. │           Expression                                                                                             │
 7. │             ReadFromMergeTree (nyc_taxi.trips_small_pk)                                                          │
 8. │             Индексы:                                                                                             │
 9. │               Первичный ключ                                                                                         │
10. │                 Ключи:                                                                                            │
11. │                   pickup_datetime                                                                                │
12. │                 Условие: and((pickup_datetime in (-Inf, 1238543999]), (pickup_datetime in [1230768000, +Inf))) │
13. │                 Части: 9/9                                                                                       │
14. │                 Гранулы: 5061/40167                                                                             │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Благодаря первичному ключу отбирается только часть гранул таблицы. Уже это значительно повышает производительность запроса, так как ClickHouse нужно обработать существенно меньший объём данных.


## Следующие шаги {#next-steps}

Надеемся, что данное руководство помогло вам разобраться в том, как исследовать медленные запросы в ClickHouse и как их ускорить. Для более глубокого изучения этой темы вы можете прочитать подробнее об [анализаторе запросов](/operations/analyzer) и [профилировании](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваши запросы.

По мере того как вы будете лучше знакомиться с особенностями ClickHouse, рекомендуем прочитать о [ключах партиционирования](/optimize/partitioning-key) и [индексах пропуска данных](/optimize/skipping-indexes), чтобы узнать о более продвинутых методах, которые можно использовать для ускорения запросов.
