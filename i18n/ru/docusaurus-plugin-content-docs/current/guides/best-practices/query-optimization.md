---
slug: /optimize/query-optimization
sidebar_label: 'Оптимизация запросов'
title: 'Руководство по оптимизации запросов'
description: 'Простое руководство по оптимизации запросов, которое описывает общий путь к улучшению производительности запросов'
---

import queryOptimizationDiagram1 from '@site/static/images/guides/best-practices/query_optimization_diagram_1.png';
import Image from '@theme/IdealImage';

# Простое руководство по оптимизации запросов

Этот раздел направлен на иллюстрацию через распространенные сценарии того, как использовать различные техники повышения производительности и оптимизации, такие как [анализатор](/operations/analyzer), [профилирование запросов](/operations/optimizing-performance/sampling-query-profiler) или [избежание Nullable Columns](/optimize/avoid-nullable-columns), с целью улучшения производительности ваших запросов ClickHouse.
## Понимание производительности запросов {#understand-query-performance}

Лучший момент для размышления о оптимизации производительности – это когда вы настраиваете свою [схему данных](/data-modeling/schema-design) перед первой загрузкой данных в ClickHouse.

Но давайте будем честными; трудно предсказать, насколько ваши данные вырастут или какие типы запросов будут выполняться.

Если у вас есть существующий развертывание с несколькими запросами, которые вы хотите улучшить, первый шаг – понять, как эти запросы выполняются и почему некоторые выполняются за несколько миллисекунд, а другие требуют больше времени.

ClickHouse имеет богатый набор инструментов, которые помогают вам понять, как выполняется ваш запрос и какие ресурсы потребляются для его выполнения.

В этом разделе мы рассмотрим эти инструменты и то, как их использовать.
## Общие соображения {#general-considerations}

Чтобы понять производительность запросов, давайте рассмотрим, что происходит в ClickHouse при выполнении запроса.

Следующая часть преднамеренно упрощена и использует некоторые сокращения; идея здесь не в том, чтобы утомить вас деталями, а в том, чтобы ознакомить с базовыми концепциями. Для получения дополнительной информации вы можете прочитать о [анализаторе запросов](/operations/analyzer).

С очень высокой точки зрения, когда ClickHouse выполняет запрос, происходит следующее:

  - **Парсинг и анализ запроса**

Запрос анализируется и разбирается, и создается общий план выполнения запроса.

  - **Оптимизация запроса**

План выполнения запроса оптимизируется, ненужные данные отсекаются, и из запроса строится конвейер исполнения.

  - **Исполнение конвейера запроса**

Данные читаются и обрабатываются параллельно. Это тот этап, на котором ClickHouse фактически выполняет операции запросов, такие как фильтрация, агрегации и сортировка.

  - **Финальная обработка**

Результаты сливаются, сортируются и форматируются в окончательный результат перед отправкой клиенту.

На самом деле, происходит множество [оптимизаций](/concepts/why-clickhouse-is-so-fast), и мы обсудим их более подробно в этом руководстве, но пока главные концепции дают нам хорошее понимание того, что происходит за кулисами, когда ClickHouse выполняет запрос.

С этим высоким уровнем понимания давайте рассмотрим инструменты, которые предоставляет ClickHouse, и как мы можем их использовать для отслеживания метрик, влияющих на производительность запросов.
## Набор данных {#dataset}

Мы будем использовать реальный пример, чтобы проиллюстрировать, как мы подходим к производительности запросов.

Давайте воспользуемся набором данных такси NYC, который содержит данные поездок на такси в NYC. Сначала мы начинаем с загрузки набора данных такси NYC без оптимизации.

Ниже представлен код для создания таблицы и вставки данных из S3-хранилища. Обратите внимание, что мы сознательно выводим схему из данных, что не оптимизировано.

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
## Обнаружение медленных запросов {#spot-the-slow-queries}
### Журналы запросов {#query-logs}

По умолчанию ClickHouse собирает и регистрирует информацию о каждом выполненном запросе в [журналах запросов](/operations/system-tables/query_log). Эти данные хранятся в таблице `system.query_log`.

Для каждого выполненного запроса ClickHouse ведет статистику, такую как время выполнения запроса, количество прочитанных строк и использование ресурсов, таких как CPU, использование памяти или попадания в кэш файловой системы.

Поэтому журнал запросов – это хорошее место для начала при расследовании медленных запросов. Вы можете легко выявить запросы, которые требуют много времени для выполнения, и отобразить информацию об использовании ресурсов для каждого из них.

Давайте найдем пять самых долгих запросов в нашем наборе данных такси NYC.

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

Поле `query_duration_ms` указывает, сколько времени потребовалось для выполнения конкретного запроса. Смотрим на результаты из журналов запросов, мы видим, что первый запрос занимает 2967 мс, что можно улучшить.

Вы также можете захотеть выяснить, какие запросы нагружают систему, исследуя запрос, который потребляет больше всего памяти или CPU.

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

Давайте изолируем долго работающие запросы, которые мы нашли, и повторно запустим их несколько раз, чтобы понять время ответа.

На этом этапе важно отключить кэш файловой системы, установив параметр `enable_filesystem_cache` в 0, чтобы улучшить воспроизводимость.

```sql
-- Отключить кэш файловой системы
set enable_filesystem_cache = 0;

-- Выполнить запрос 1
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

-- Выполнить запрос 2
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

-- Выполнить запрос 3
SELECT
  avg(dateDiff('s', pickup_datetime, dropoff_datetime))
FROM nyc_taxi.trips_small_inferred
WHERE passenger_count = 1 or passenger_count = 2
FORMAT JSON

---
1 row in set. Elapsed: 1.414 sec. Processed 329.04 million rows, 8.88 GB (232.63 million rows/s., 6.28 GB/s.)
Peak memory usage: 451.53 MiB.
```

Подводя итог в таблице для удобства чтения.

| Имя     | Затраченное время | Обработанные строки | Пиковая память |
| ------- | ------------------ | ------------------- |---------------- |
| Запрос 1| 1.699 сек          | 329.04 миллионов    | 440.24 MiB     |
| Запрос 2| 1.419 сек          | 329.04 миллионов    | 546.75 MiB     |
| Запрос 3| 1.414 сек          | 329.04 миллионов    | 451.53 MiB     |

Давайте лучше поймем, что выполняют запросы.

- Запрос 1 вычисляет распределение расстояния в поездках со средней скоростью выше 30 миль в час.
- Запрос 2 находит количество и среднюю стоимость поездок за неделю.
- Запрос 3 вычисляет среднее время каждой поездки в наборе данных.

Ни один из этих запросов не выполняет очень сложную обработку, кроме первого запроса, который вычисляет время поездки на лету каждый раз, когда выполняется запрос. Однако каждый из этих запросов занимает больше одной секунды для выполнения, что в мире ClickHouse является очень долгим временем. Мы также можем отметить, что использование памяти этих запросов составляет больше или менее 400 Мб для каждого запроса, что довольно много. Кроме того, каждый запрос, похоже, читает одно и то же количество строк (т.е. 329.04 миллиона). Давайте быстро подтвердим, сколько строк в этой таблице.

```sql
-- Подсчитать количество строк в таблице
SELECT count()
FROM nyc_taxi.trips_small_inferred

Query id: 733372c5-deaf-4719-94e3-261540933b23

   ┌───count()─┐
1. │ 329044175 │ -- 329.04 миллиона
   └───────────┘
```

В таблице содержится 329.04 миллионов строк, следовательно, каждый запрос выполняет полное сканирование таблицы.
### Оператор Explain {#explain-statement}

Теперь, когда у нас есть несколько долгих запросов, давайте поймем, как они выполняются. Для этого в ClickHouse поддерживается команда [EXPLAIN statement](/sql-reference/statements/explain). Это очень полезный инструмент, который предоставляет очень подробный обзор всех этапов выполнения запроса, не выполняя фактически запрос. Хотя это может быть подавляющим для неэксперта ClickHouse, это остается важным инструментом для получения представления о том, как выполняется ваш запрос.

Документация содержит подробное [руководство](/guides/developer/understanding-query-execution-with-the-analyzer) о том, что такое оператор EXPLAIN и как использовать его для анализа выполнения вашего запроса. Вместо того чтобы повторять то, что содержится в этом руководстве, давайте сосредоточимся на нескольких командах, которые помогут нам найти узкие места в производительности выполнения запросов.

**Explain indexes = 1**

Давайте начнем с EXPLAIN indexes = 1, чтобы исследовать план запроса. План запроса – это дерево, показывающее, как будет выполнен запрос. Там вы можете увидеть, в каком порядке будут выполняться условия из запроса. План запроса, возвращаемый оператором EXPLAIN, можно прочитать снизу вверх.

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

Вывод простой. Запрос начинается с чтения данных из таблицы `nyc_taxi.trips_small_inferred`. Затем условие WHERE применяется для фильтрации строк на основе вычисленных значений. Отфильтрованные данные подготавливаются для агрегации, и вычисляются квантилы. Наконец, результат сортируется и выводится.

Здесь мы можем заметить, что никаких первичных ключей не используется, что имеет смысл, так как мы не определяли никакие при создании таблицы. В результате ClickHouse делает полное сканирование таблицы для запроса.

**Explain Pipeline**

EXPLAIN PIPELINE показывает конкретную стратегию выполнения запроса. Там вы можете увидеть, как ClickHouse фактически выполнил общий план запроса, который мы смотрели ранее.

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

Здесь мы можем заметить количество потоков, использованных для выполнения запроса: 59 потоков, что указывает на высокую параллельность. Это ускоряет запрос, который занял бы больше времени для выполнения на меньшей машине. Количество потоков, работающих параллельно, может объяснить высокое использование памяти, которое использует запрос.

В идеале, вы бы исследовали все свои медленные запросы таким образом, чтобы выявить ненужные сложные планы запросов и понять количество строк, прочитанных каждым запросом и потребляемые ресурсы.
## Методология {#methodology}

Выявить проблемные запросы в рабочем развертывании может быть сложно, поскольку вероятно одновременно выполняется большое количество запросов на вашем развертывании ClickHouse.

Если вы знаете, какой пользователь, база данных или таблицы вызывают проблемы, вы можете использовать поля `user`, `tables` или `databases` из `system.query_logs`, чтобы сузить поиск.

Как только вы определите запросы, которые хотите оптимизировать, вы можете начать с работы над ними для оптимизации. Одной из распространенных ошибок, которые делают разработчики на этом этапе, является изменение нескольких вещей одновременно, проведение произвольных экспериментов и, как правило, получение смешанных результатов, но, что более важно, отсутствие хорошего понимания того, что сделало запрос более быстрым.

Оптимизация запросов требует структуры. Я не говорю о сложном бенчмаркинге, но наличие простого процесса для понимания того, как ваши изменения влияют на производительность запросов, может многое изменить.

Начните с выявления медленных запросов из журналов запросов, затем исследуйте потенциальные улучшения в изоляции. При тестировании запроса убедитесь, что вы отключили кэш файловой системы.

> ClickHouse использует [кэширование](/operations/caches) для ускорения производительности запросов на различных этапах. Это хорошо для производительности запросов, но во время устранения неполадок это может скрывать потенциальные узкие места ввода-вывода или плохую схему таблицы. По этой причине я рекомендую отключить кэш файловой системы во время тестирования. Убедитесь, что он включен в производственном развертывании.

Как только вы определили потенциальные оптимизации, рекомендуется реализовать их по одному, чтобы лучше отслеживать, как они влияют на производительность. Ниже приведена схема, описывающая общий подход.

<Image img={queryOptimizationDiagram1} size="lg" alt="Оптимизационный процесс"/>

_Наконец, будьте осторожны с выбросами; довольно часто запрос может выполняться медленно, либо потому, что пользователь попытался выполнить дорогой по ресурсоемкости запрос, либо система испытывала нагрузку по другой причине. Вы можете группировать по полю normalized_query_hash, чтобы определить дорогие запросы, которые выполняются регулярно. Вероятно, это те запросы, которые стоит исследовать._
## Базовая оптимизация {#basic-optimization}

Теперь, когда у нас есть наша основа для тестирования, мы можем начать оптимизацию.

Лучшее место для начала – это посмотреть, как хранятся данные. Как и для любой базы данных, чем меньше данных мы читаем, тем быстрее будет выполнен запрос.

В зависимости от того, как вы загрузили свои данные, вы могли воспользоваться [возможностями]( /interfaces/schema-inference) ClickHouse для вывода схемы таблицы на основе загруженных данных. Хотя это очень удобно для начала, если вы хотите оптимизировать производительность своего запроса, вам нужно будет проверить схему данных, чтобы лучше соответствовать вашему случаю использования.
### Nullable {#nullable}

Как описано в [документации по лучшим практикам](/best-practices/select-data-types#avoid-nullable-columns), избегайте nullable-колонок где возможно. Использовать их часто очень соблазнительно, так как они делают механизм загрузки данных более гибким, но они негативно влияют на производительность, так как дополнительную колонку приходится обрабатывать каждый раз.

Выполнение SQL-запроса, который подсчитывает строки с значением NULL, может легко выявить колонки в ваших таблицах, которые действительно нуждаются в Nullable-значении.

```sql
-- Найти колонки без значений null
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

У нас есть только два столбца с нулевыми значениями: `mta_tax` и `payment_type`. Остальные поля не должны использовать `Nullable`-колонку.
### Низкая кардинальность {#low-cardinality}

Легкая оптимизация для строк – это максимально эффективное использование типа данных LowCardinality. Как описано в [документации по низкой кардинальности](/sql-reference/data-types/lowcardinality), ClickHouse применяет словарное кодирование к колонкам LowCardinality, что значительно повышает производительность запросов.

Легкое правило для определения колонок, являющихся хорошими кандидатами на LowCardinality, состоит в том, что любой столбец с менее чем 10 000 уникальных значений является идеальным кандидатом.

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

С низкой кардинальностью, эти четыре столбца, `ratecode_id`, `pickup_location_id`, `dropoff_location_id` и `vendor_id`, являются хорошими кандидатами для типа поля LowCardinality.
### Оптимизация типа данных {#optimize-data-type}

ClickHouse поддерживает большое количество типов данных. Убедитесь, что вы выбираете возможно самый маленький тип данных, который соответствует вашему случаю использования, чтобы оптимизировать производительность и уменьшить пространство для хранения данных на диске. 

Для чисел вы можете проверить минимальное/максимальное значение в вашем наборе данных, чтобы убедиться, что текущее значение точности соответствует реальности вашего набора данных.

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

Для дат вы должны выбрать точность, соответствующую вашему набору данных и наиболее подходящую для ответов на запросы, которые вы планируете выполнять.
### Применение оптимизаций {#apply-the-optimizations}

Давайте создадим новую таблицу, чтобы использовать оптимизированную схему и заново загрузить данные.

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

-- Вставьте данные
INSERT INTO trips_small_no_pk SELECT * FROM trips_small_inferred
```

Мы снова выполняем запросы с использованием новой таблицы, чтобы проверить улучшения.

| Имя     | Запуск 1 - Затраченное время | Затраченное время | Обработанные строки | Пиковая память |
| ------- | ------------------------------ | ----------------- | ------------------- |---------------- |
| Запрос 1| 1.699 сек                      | 1.353 сек         | 329.04 миллионов    | 337.12 MiB     |
| Запрос 2| 1.419 сек                      | 1.171 сек         | 329.04 миллионов    | 531.09 MiB     |
| Запрос 3| 1.414 сек                      | 1.188 сек         | 329.04 миллионов    | 265.05 MiB     |

Мы замечаем некоторые улучшения как в времени выполнения, так и в использовании памяти. Благодаря оптимизации в схеме данных мы уменьшаем общий объем данных, который представляет наши данные, что приводит к улучшению потребления памяти и снижению времени обработки.

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

Новая таблица значительно меньше, чем предыдущая. Мы видим снижение примерно на 34% в объеме дискового пространства для таблицы (7.38 GiB против 4.89 GiB).
## Важность первичных ключей {#the-importance-of-primary-keys}

Первичные ключи в ClickHouse работают иначе, чем в большинстве традиционных систем баз данных. В этих системах первичные ключи обеспечивают уникальность и целостность данных. Любая попытка вставить дублирующие значения первичного ключа отклоняется, и обычно создается индекс на основе B-дерева или хеш-таблицы для быстрого поиска.

В ClickHouse цель [первичного ключа](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) отличается; он не обеспечивает уникальность и не помогает с целостностью данных. Вместо этого он разработан для оптимизации производительности запросов. Первичный ключ определяет порядок, в котором данные хранятся на диске и реализуется в качестве разреженного индекса, который хранит указатели на первую строку каждой гранулы.

> Гранулы в ClickHouse – это самые маленькие единицы данных, читаемые во время выполнения запроса. Они содержат до фиксированного числа строк, определяемого index_granularity, со значением по умолчанию 8192 строки. Гранулы хранятся непрерывно и сортируются по первичному ключу.

Выбор хорошего набора первичных ключей важен для производительности, и на самом деле часто бывает, что данные хранятся в разных таблицах и используются разные наборы первичных ключей для ускорения конкретного набора запросов.

Другие варианты, поддерживаемые ClickHouse, такие как پروекция или материализованное представление, позволяют использовать другой набор первичных ключей на одних и тех же данных. Вторая часть этой серии статей будет более подробно освещать этот вопрос.
```
### Выбор первичных ключей {#choose-primary-keys}

Выбор правильного набора первичных ключей — это сложная тема, и может потребоваться балансировка и эксперименты, чтобы найти наилучшую комбинацию.

На данный момент мы будем следовать этим простым практикам:

- Используйте поля, которые используются для фильтрации в большинстве запросов
- Сначала выбирайте колонки с низкой кардинальностью
- Рассмотрите временной компонент в вашем первичном ключе, так как фильтрация по времени в наборе данных с меткой времени довольно распространена.

В нашем случае мы будем экспериментировать с следующими первичными ключами: `passenger_count`, `pickup_datetime` и `dropoff_datetime`.

Кардинальность для passenger_count небольшая (24 уникальных значения) и используется в наших медленных запросах. Мы также добавляем временные поля (`pickup_datetime` и `dropoff_datetime`), так как они часто могут быть отфильтрованы.

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

Затем мы повторно запускаем наши запросы. Мы компилируем результаты из трех экспериментов, чтобы увидеть улучшения в затраченном времени, обработанных строках и использовании памяти.

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
      <td>Затраченное время</td>
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
      <td>Затраченное время</td>
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
      <td>Затраченное время</td>
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

Мы видим значительное улучшение во всех аспектах по времени выполнения и использованию памяти.

Запрос 2 наиболее выигрывает от первичного ключа. Давайте посмотрим, как план запроса изменился по сравнению с предыдущим.

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

Благодаря первичному ключу, был выбран только подмножество гранул таблицы. Это само по себе значительно улучшает производительность запроса, поскольку ClickHouse обрабатывает значительно меньше данных.
## Следующие шаги {#next-steps}

Надеюсь, это руководство даёт хорошее понимание того, как исследовать медленные запросы с помощью ClickHouse и как сделать их быстрее. Чтобы узнать больше по этой теме, вы можете прочитать о [анализаторе запросов](/operations/analyzer) и [профилировании](/operations/optimizing-performance/sampling-query-profiler), чтобы лучше понять, как именно ClickHouse выполняет ваш запрос.

По мере того как вы становитесь более знакомыми со специфическими особенностями ClickHouse, я бы рекомендовал прочитать о [ключах партиционирования](/optimize/partitioning-key) и [индексах пропуска данных](/optimize/skipping-indexes), чтобы узнать о более сложных техниках, которые вы можете использовать для ускорения ваших запросов.
