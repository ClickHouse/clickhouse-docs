---
slug: /optimize/query-optimization
sidebar_label: 'Оптимизация запросов'
title: 'Руководство по оптимизации запросов'
description: 'Простое руководство по оптимизации запросов, описывающее общие способы улучшения производительности запросов'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# Простое руководство по оптимизации запросов

Этот раздел направлен на то, чтобы проиллюстрировать, через распространенные сценарии, как использовать различные техники повышения производительности и оптимизации, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) или [избежание Nullable Columns](/optimize/avoid-nullable-columns), чтобы улучшить производительность ваших запросов ClickHouse.
## Понимание производительности запросов {#understand-query-performance}

Лучший момент для размышлений об оптимизации производительности — это когда вы настраиваете свою [схему данных](/data-modeling/schema-design) перед тем, как впервые загрузить данные в ClickHouse.

Но давайте будем честными; сложно предсказать, насколько вырастут ваши данные или какие типы запросов будут выполняться.

Если у вас есть существующее развертывание с несколькими запросами, которые вы хотите улучшить, первый шаг — понять, как эти запросы выполняются и почему одни выполняются за несколько миллисекунд, в то время как другие занимают больше времени.

ClickHouse предлагает богатый набор инструментов, которые помогут вам понять, как выполняется ваш запрос и какие ресурсы потребляются для выполнения этого запроса.

В этом разделе мы рассмотрим эти инструменты и как ими пользоваться.
## Общие соображения {#general-considerations}

Чтобы понять производительность запроса, давайте взглянем на то, что происходит в ClickHouse, когда выполняется запрос.

Следующая часть намеренно упрощена и использует некоторые сокращения; идея здесь не затопить вас деталями, а помочь вам быстро освоить основные концепции. Для получения дополнительной информации вы можете ознакомиться с [анализатором запросов](/operations/analyzer).

С очень высокоуровневой точки зрения, когда ClickHouse выполняет запрос, происходит следующее:

  - **Парсинг и анализ запроса**

Запрос анализируется, создается общий план выполнения запроса.

  - **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отсекаются, и создается конвейер запросов на основе плана запроса.

  - **Выполнение конвейера запроса**

Данные считываются и обрабатываются параллельно. Это этап, на котором ClickHouse фактически выполняет операции запроса, такие как фильтрация, агрегация и сортировка.

  - **Финальная обработка**

Результаты объединяются, сортируются и форматируются в конечный результат перед отправкой клиенту.

На самом деле многие [оптимизации](/concepts/why-clickhouse-is-so-fast) происходят, и мы обсудим их немного подробнее в этом руководстве, но на данном этапе эти основные концепции дают нам хорошее понимание того, что происходит за кулисами, когда ClickHouse выполняет запрос.

С этим высокоуровневым пониманием давайте рассмотрим инструменты, которые предоставляет ClickHouse, и как мы можем использовать их для отслеживания метрик, влияющих на производительность запросов.
## Набор данных {#dataset}

Мы будем использовать реальный пример, чтобы проиллюстрировать, как мы подходим к производительности запросов.

Используем набор данных NYC Taxi, который содержит данные о поездках на такси в NYC. Сначала мы начинаем с загрузки набора данных NYC Taxi без оптимизации.

Ниже представлена команда для создания таблицы и вставки данных из S3. Обратите внимание, что мы сознательно выводим схему из данных, что не оптимизировано.

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

Давайте взглянем на автоматически выведенную схему таблицы.

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
## Определение медленных запросов {#spot-the-slow-queries}
### Журналы запросов {#query-logs}

По умолчанию ClickHouse собирает и регистрирует информацию о каждом выполненном запросе в [журналах запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`.

Для каждого выполненного запроса ClickHouse регистрирует статистику, такую как время выполнения запроса, количество прочитанных строк и использование ресурсов, таких как CPU, использование памяти или попадания в кэш файловой системы.

Таким образом, журнал запросов — это хорошее место для начала при расследовании медленных запросов. Вы можете легко определить запросы, которые требуют много времени для выполнения, и отобразить информацию о потреблении ресурсов для каждого из них.

Давайте найдем пять самых долгих запросов в нашем наборе данных о такси NYC.

```sql
-- Найти 5 самых долгих запросов из базы данных nyc_taxi за последние 1 час
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

Поле `query_duration_ms` указывает, сколько времени потребовалось для выполнения данного запроса. Судя по результатам из журналов запросов, мы видим, что первый запрос занимает 2967 мс на выполнение, что можно улучшить.

Вы также можете захотеть узнать, какие запросы нагружают систему, проверяя запрос, который потребляет больше всего памяти или CPU.

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

Давайте изолируем долгосрочные запросы, которые мы нашли, и повторно запустим их несколько раз, чтобы понять время отклика.

На этом этапе важно отключить кэш файловой системы, установив параметр `enable_filesystem_cache` в 0, чтобы улучшить воспроизводимость.

```sql
-- Отключение кэша файловой системы
set enable_filesystem_cache = 0;

-- Запуск запроса 1
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

-- Запуск запроса 2
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

-- Запуск запроса 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

Сводим в таблицу для удобства чтения.

| Имя     | Затраченное время | Обработанные строки | Пиковая память |
| ------- | ----------------- | ------------------- | -------------- |
| Запрос 1 | 1.699 сек         | 329.04 миллиона     | 440.24 MiB     |
| Запрос 2 | 1.419 сек         | 329.04 миллиона     | 546.75 MiB     |
| Запрос 3 | 1.414 сек         | 329.04 миллиона     | 451.53 MiB     |

Давайте немного лучше поймем, что достигают эти запросы.

- Запрос 1 вычисляет распределение расстояния в поездках со средней скоростью выше 30 миль в час.
- Запрос 2 находит количество и среднюю стоимость поездок за неделю.
- Запрос 3 вычисляет среднее время каждой поездки в наборе данных.

Ни один из этих запросов не выполняет очень сложной обработки, кроме первого запроса, который вычисляет время поездки на лету каждый раз, когда выполняется запрос. Тем не менее, каждый из этих запросов занимает более одной секунды на выполнение, что в мире ClickHouse является довольно долгим временем. Также можно отметить использование памяти этих запросов; около 400 Мб для каждого запроса — это довольно много памяти. Кроме того, каждый запрос, как видно, считывает одно и то же количество строк (т.е. 329,04 миллиона). Давайте быстро подтвердим, сколько строк в этой таблице.

```sql
-- Подсчет количества строк в таблице
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 миллиона
   └───────────┘
```

Таблица содержит 329,04 миллиона строк, следовательно, каждый запрос выполняет полный скан таблицы.
### Оператор EXPLAIN {#explain-statement}

Теперь, когда у нас есть несколько долгосрочных запросов, давайте поймем, как они выполняются. Для этого ClickHouse поддерживает [оператор EXPLAIN](/sql-reference/statements/explain). Это очень полезный инструмент, который предоставляет очень детальный обзор всех стадий выполнения запроса без фактического выполнения запроса. Хотя это может быть подавляющим для неэксперта ClickHouse, это остается важным инструментом для получения представления о том, как ваш запрос выполняется.

Документация предоставляет подробное [руководство](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как его использовать для анализа выполнения вашего запроса. Вместо того, чтобы повторять то, что указано в этом руководстве, давайте сосредоточимся на нескольких командах, которые помогут нам найти узкие места в производительности выполнения запроса.

**Explain indexes = 1**

Начнем с EXPLAIN indexes = 1, чтобы проверить план запроса. План запроса — это дерево, показывающее, как запрос будет выполнен. Здесь вы можете видеть, в каком порядке будут выполняться условия из запроса. План запроса, возвращаемый оператором EXPLAIN, можно читать снизу вверх.

Давайте попробуем использовать первый из наших долгосрочных запросов.

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
1. │ expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │     Expression (Before GROUP BY)                    │
4. │       Filter (WHERE)                                │
5. │         ReadFromMergeTree (nyc_taxi.trips_small_inferred) │
   └─────────────────────────────────────────────────────┘
```

Вывод простой. Запрос начинает с чтения данных из таблицы `nyc_taxi.trips_small_inferred`. Затем применяется условие WHERE для фильтрации строк на основе вычисленных значений. Отфильтрованные данные подготавливаются к агрегации, и вычисляются квантили. Наконец, результат сортируется и выводится.

Здесь мы можем отметить, что не используются первичные ключи, что имеет смысл, поскольку мы не определили никаких при создании таблицы. В результате ClickHouse выполняет полный скан таблицы для этого запроса.

**Explain Pipeline**

EXPLAIN Pipeline показывает конкретную стратегию выполнения запроса. Здесь вы можете увидеть, как ClickHouse фактически выполнял общий план запроса, который мы смотрели ранее.

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
 1. │ (expression)                                                                        │
 2. │ ExpressionTransform × 59                                                            │
 3. │   (Aggregating)                                                                     │
 4. │   Resize 59 → 59                                                                    │
 5. │     AggregatingTransform × 59                                                       │
 6. │       StrictResize 59 → 59                                                          │
 7. │         (expression)                                                                │
 8. │         ExpressionTransform × 59                                                    │
 9. │           (filter)                                                                  │
10. │           FilterTransform × 59                                                      │
11. │             (ReadFromMergeTree)                                                     │
12. │             MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
```

Здесь мы можем отметить количество потоков, используемых для выполнения запроса: 59 потоков, что указывает на высокую параллельность. Это ускоряет запрос, который занял бы больше времени для выполнения на меньшем оборудовании. Количество потоков, работающих параллельно, может объяснить высокое потребление памяти, используемой запросом.

В идеале, вы должны исследовать все ваши медленные запросы таким же образом, чтобы определить ненужные сложные планы запросов и понять, сколько строк считывается каждым запросом и какие ресурсы потребляются.
## Методология {#methodology}

Выявить проблемные запросы в развертывании в производственной среде может быть сложно, так как в любой момент времени на вашем развертывании ClickHouse, вероятно, выполняется много запросов.

Если вы знаете, какие пользователи, базы данных или таблицы имеют проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs`, чтобы сузить поиск.

Как только вы определили запросы, которые хотите оптимизировать, вы можете начать над ними работать. Одна из распространенных ошибок, которые делают разработчики на этом этапе, — это изменение нескольких вещей одновременно, проведение случайных экспериментов и, как правило, получение смешанных результатов, но, что более важно, отсутствие хорошего понимания того, что сделало запрос быстрее.

Оптимизация запросов требует структуры. Я не говорю о сложном бенчмаркинге, но наличие простого процесса, чтобы понять, как ваши изменения влияют на производительность запроса, может значительно упростить задачу.

Начните с выявления медленных запросов из журналов запросов, затем изучите возможные улучшения изолированно. При тестировании запроса убедитесь, что отключен кэш файловой системы.

> ClickHouse использует [кэширование](/operations/caches) для ускорения производительности запросов на различных стадиях. Это хорошо для производительности запросов, но во время устранения неполадок это может скрыть потенциальные узкие места ввода-вывода или плохую схему таблицы. По этой причине я советую отключить кэш файловой системы во время тестирования. Убедитесь, что он включен в производственном развертывании.

Как только вы определили возможные оптимизации, рекомендуется реализовать их по одной, чтобы лучше отслеживать, как они влияют на производительность. Ниже представлена диаграмма, описывающая общий подход.

<Image img={queryOptimizationDiagram1} size="lg" alt="Рабочий процесс оптимизации"/>

_Наконец, будьте внимательны к выбросам; довольно часто бывает, что запрос может выполняться медленно, либо потому, что пользователь попытался выполнить дорогостоящий запрос, либо потому, что система была под давлением по другой причине. Вы можете группировать по полю normalized_query_hash, чтобы определить дорогостоящие запросы, которые выполняются регулярно. Это, вероятно, те, которые вы хотите исследовать._
## Базовая оптимизация {#basic-optimization}

Теперь, когда у нас есть наша структура для тестирования, мы можем начать оптимизировать.

Лучшее место для начала — это посмотреть на то, как хранятся данные. Как и для любой базы данных, чем меньше данных мы читаем, тем быстрее будет выполнен запрос.

В зависимости от того, как вы загружали данные, вы могли воспользоваться [возможностями](/interfaces/schema-inference) ClickHouse для вывода схемы таблицы на основе загруженных данных. Хотя это очень удобно для начала, если вы хотите оптимизировать производительность своих запросов, вам нужно будет пересмотреть схему данных, чтобы лучше соответствовать вашему случаю использования.
### Nullable {#nullable}

Как описано в [документации по лучшим практикам](/cloud/bestpractices/avoid-nullable-columns), избегайте колонок nullable где это возможно. Упрощенно использовать их часто, так как они делают механизм загрузки данных более гибким, но они негативно влияют на производительность, так как каждуюжды обрабатывается дополнительная колонка.

Запуск SQL-запроса, который считает строки со значением NULL, может легко выявить колонки в ваших таблицах, которые на самом деле нуждаются в nullable значении.

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

У нас только две колонки с нулевыми значениями: `mta_tax` и `payment_type`. Остальные поля не должны использовать колонку `Nullable`.
### Низкая кардинальность {#low-cardinality}

Легкая оптимизация для строк — это наиболее эффективное использование типа данных LowCardinality. Как описано в [документации по низкой кардинальности](/sql-reference/data-types/lowcardinality), ClickHouse применяет кодирование словарей к колонкам LowCardinality, что значительно повышает производительность запросов.

Простое правило для определения того, какие колонки подходят для LowCardinality, заключается в том, что любая колонка с менее чем 10 000 уникальных значений является отличным кандидатом.

Вы можете использовать следующий SQL-запрос, чтобы найти колонки с низким количеством уникальных значений.

```sql
-- Определить колонки с низкой кардинальностью
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

С низкой кардинальностью эти четыре колонки, `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id`, хорошо подходят для типа данных LowCardinality.
### Оптимизация типа данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Убедитесь, что вы выбираете наименьший возможный тип данных, который подходит для вашего случая использования, чтобы оптимизировать производительность и уменьшить объем хранимых данных на диске.

Для чисел вы можете проверить минимальное/максимальное значение в вашем наборе данных, чтобы проверить, соответствует ли текущее значение точности реальности вашего набора данных.

```sql
-- Найти мин/макс значения для поля payment_type
SELECT
    min(payment_type),max(payment_type),
    min(passenger_count), max(passenger_count)
FROM trips_small_inferred

Query id: 4306a8e1-2a9c-4b06-97b4-4d902d2233eb

   ┌─min(payment_type)─┬─max(payment_type)─┐
1. │                 1 │                 4 │
   └───────────────────┴───────────────────┘
```

Для дат вы должны выбрать точность, которая соответствует вашему набору данных и лучше всего подходит для ответов на запросы, которые вы планируете выполнять.
### Применение оптимизаций {#apply-the-optimizations}

Давайте создадим новую таблицу с использованием оптимизированной схемы и повторно загрузим данные.

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

Мы снова запускаем запросы, используя новую таблицу, чтобы проверить улучшения.

| Имя     | Запуск 1 - Время | Время     | Обработанные строки | Пиковая память |
| ------- | ---------------- | --------- | ------------------- | -------------- |
| Запрос 1 | 1.699 сек        | 1.353 сек | 329.04 миллиона     | 337.12 MiB     |
| Запрос 2 | 1.419 сек        | 1.171 сек | 329.04 миллиона     | 531.09 MiB     |
| Запрос 3 | 1.414 сек        | 1.188 сек | 329.04 миллиона     | 265.05 MiB     |

Мы замечаем некоторые улучшения как в времени запроса, так и в использовании памяти. Благодаря оптимизации в схемe данных, мы уменьшаем общий объем данных, который представляют наши данные, что приводит к улучшению потребления памяти и сокращению времени обработки.

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

Новая таблица значительно меньше, чем предыдущая. Мы наблюдаем уменьшение примерно на 34% в дисковом пространстве для таблицы (7.38 GiB против 4.89 GiB).
## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем управления базами данных. В этих системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставить дублирующиеся значения первичных ключей отклоняется, и обычно создается индекс B-дерева или основанный на хэшах для быстрого поиска.

В ClickHouse [цель](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) первичного ключа отличается; он не обеспечивает уникальности или помощь в целостности данных. Вместо этого он предназначен для оптимизации производительности запросов. Первичный ключ определяет порядок, в котором данные хранятся на диске, и реализуется как разреженный индекс, хранящий указатели на первую строку каждой гранулы.

> Гранулы в ClickHouse — это наименьшие единицы данных, читаемые во время выполнения запроса. Они содержат до фиксированного количества строк, определяемого index_granularity, со значением по умолчанию 8192 строки. Гранулы хранятся последовательно и сортируются по первичному ключу.

Выбор хорошего набора первичных ключей важен для производительности, и на самом деле часто бывает так, что одно и то же данные хранятся в различных таблицах с использованием разных наборов первичных ключей, чтобы ускорить выполнение определенного набора запросов.

Другие опции, поддерживаемые ClickHouse, такие как Projection или Materialized view, позволяют использовать другой набор первичных ключей на тех же данных. Вторая часть этой серии блога рассмотрит это более подробно.
### Выбор первичных ключей {#choose-primary-keys}

Выбор правильного набора первичных ключей — это сложная задача, и может потребоваться балансировка и эксперименты для нахождения наилучшей комбинации. 

На данный момент мы собираемся следовать этим простым практикам:

- Используйте поля, которые используются для фильтрации в большинстве запросов.
- Сначала выбирайте колонки с низкой кардинальностью.
- Рассмотрите временной компонент в вашем первичном ключе, так как фильтрация по времени в наборах данных с метками времени довольно распространена.

В нашем случае мы будем экспериментировать с следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`.

Кардинальность для passenger_count мала (24 уникальных значения) и используется в наших медленных запросах. Мы также добавляем временные поля (`pickup_datetime` и `dropoff_datetime`), так как по ним часто происходит фильтрация.

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

-- Вставьте данные
INSERT INTO trips_small_pk SELECT * FROM trips_small_inferred
```

Затем мы повторно запускаем наши запросы. Мы собираем результаты трех экспериментов, чтобы увидеть улучшения во времени выполнения, обработанных строках и использовании памяти.

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

Мы видим значительное улучшение по всем показателям в времени выполнения и использовании памяти.

Запрос 2 получает наибольшую выгоду от первичного ключа. Давайте посмотрим, как план запроса, который был сгенерирован, отличается от предыдущего.

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

Благодаря первичному ключу был выбран только подмножество гранул таблицы. Это само по себе значительно улучшает производительность запроса, так как ClickHouse должен обрабатывать значительно меньше данных.
## Следующие шаги {#next-steps}

Надеюсь, этот гид даст хорошее понимание того, как исследовать медленные запросы с ClickHouse и как сделать их быстрее. Чтобы подробнее изучить эту тему, вы можете прочитать о [анализаторе запросов](/operations/analyzer) и [профилировании](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваш запрос.

По мере того как вы будете больше знакомиться с особенностями ClickHouse, я настоятельно рекомендую прочитать о [ключах партиционирования](/optimize/partitioning-key) и [индекса пропуска данных](/optimize/skipping-indexes), чтобы узнать о более сложных техниках, которые вы можете использовать для ускорения ваших запросов.
