---
slug: /optimize/query-parallelism
sidebar_label: 'Параллелизм запросов'
sidebar_position: 20
description: 'ClickHouse выполняет запросы параллельно, используя конвейеры обработки (processing lanes) и параметр max_threads.'
title: 'Как ClickHouse выполняет запросы параллельно'
doc_type: 'guide'
keywords: ['параллельная обработка', 'оптимизация запросов', 'производительность', 'многопоточность', 'лучшие практики']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';

# Как ClickHouse выполняет запросы параллельно {#how-clickhouse-executes-a-query-in-parallel}

ClickHouse [создан для высокой скорости](/concepts/why-clickhouse-is-so-fast). Он выполняет запросы в высокопараллельном режиме, используя все доступные ядра CPU, распределяя данные по потокам обработки и часто подводя оборудование к пределам его возможностей.
 
В этом руководстве рассматривается, как устроен параллелизм выполнения запросов в ClickHouse и как вы можете настраивать или отслеживать его, чтобы повысить производительность при больших нагрузках.

Для иллюстрации ключевых концепций мы используем агрегирующий запрос к набору данных [uk_price_paid_simple](/parts).

## Пошагово: как ClickHouse параллелизует агрегирующий запрос {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

Когда ClickHouse ① выполняет агрегирующий запрос с фильтром по первичному ключу таблицы, он ② загружает первичный индекс в память, чтобы ③ определить, какие гранулы нужно обработать, а какие можно безопасно пропустить:

<Image img={visual01} size="md" alt="Анализ индекса"/>

### Распределение работы по линиям обработки {#distributing-work-across-processing-lanes}

Затем выбранные данные [динамически](#load-balancing-across-processing-lanes) распределяются по `n` параллельным [линиям обработки](/academic_overview#4-2-multi-core-parallelization), которые потоково читают и обрабатывают данные [блок](/development/architecture#block) за блоком, формируя итоговый результат:

<Image img={visual02} size="md" alt="4 параллельные линии обработки"/>

<br/><br/>
Количество `n` параллельных линий обработки контролируется настройкой [max_threads](/operations/settings/settings#max_threads), которая по умолчанию соответствует числу ядер CPU, доступных ClickHouse на сервере. В примере выше предполагается наличие `4` ядер. 

На машине с `8` ядрами пропускная способность обработки запросов примерно удвоится (но использование памяти соответственно возрастет), так как больше линий обрабатывают данные параллельно:

<Image img={visual03} size="md" alt="8 параллельных линий обработки"/>

<br/><br/>
Эффективное распределение по линиям является ключом к максимизации загрузки CPU и сокращению общего времени выполнения запроса.

### Обработка запросов на шардированных таблицах {#processing-queries-on-sharded-tables}

Когда данные таблицы распределены по нескольким серверам в виде [шардов](/shards), каждый сервер обрабатывает свой шард параллельно. На каждом сервере локальные данные обрабатываются с использованием параллельных линий обработки так же, как описано выше:

<Image img={visual04} size="md" alt="Распределённые линии обработки"/>

<br/><br/>
Сервер, который изначально получает запрос, собирает все частичные результаты с шардов и объединяет их в итоговый глобальный результат.

Распределение нагрузки запросов по шардам позволяет горизонтально масштабировать параллелизм, особенно в средах с высокой пропускной способностью.

:::note ClickHouse Cloud использует параллельные реплики вместо шардов
В ClickHouse Cloud тот же параллелизм достигается с помощью [параллельных реплик](https://clickhouse.com/docs/deployment-guides/parallel-replicas), которые работают аналогично шардам в кластерах с архитектурой shared-nothing. Каждая реплика ClickHouse Cloud — вычислительный узел без сохранения состояния — обрабатывает часть данных параллельно и вносит вклад в итоговый результат, так же как это делал бы независимый шард.
:::

## Мониторинг параллелизма запросов {#monitoring-query-parallelism}

Используйте эти инструменты, чтобы убедиться, что ваш запрос полностью задействует доступные ресурсы CPU и диагностировать случаи, когда это не так.

Мы выполняем это на тестовом сервере с 59 ядрами CPU, что позволяет ClickHouse в полной мере продемонстрировать параллелизм выполнения запросов.

Чтобы увидеть, как выполняется пример запроса, мы можем настроить сервер ClickHouse так, чтобы он возвращал все записи журнала уровня trace во время агрегирующего запроса. Для этой демонстрации мы убрали условие в запросе — в противном случае было бы обработано только 3 гранулы, чего недостаточно, чтобы ClickHouse смог задействовать более чем несколько параллельных потоков обработки:

```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: чтение 3609 гранул из 3 диапазонов
② <Trace> ...: распределение диапазонов гранул по потокам
② <Debug> ...: чтение примерно 29564928 строк в 59 потоков
```

We can see that

* ① ClickHouse needs to read 3,609 granules (indicated as marks in the trace logs) across 3 data ranges.
* ② With 59 CPU cores, it distributes this work across 59 parallel processing streams—one per lane.

Alternatively, we can use the [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) clause to inspect the [physical operator plan](/academic_overview#4-2-multi-core-parallelization)—also known as the "query pipeline"—for the aggregation query:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                      │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (Aggregating)                                                                   │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (Expression)                                                              │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

Note: Read the operator plan above from bottom to top. Each line represents a stage in the physical execution plan, starting with reading data from storage at the bottom and ending with the final processing steps at the top. Operators marked with `× 59` are executed concurrently on non-overlapping data regions across 59 parallel processing lanes. This reflects the value of `max_threads` and illustrates how each stage of the query is parallelized across CPU cores.

ClickHouse's [embedded web UI](/interfaces/http) (available at the `/play` endpoint) can render the physical plan from above as a graphical visualization. In this example, we set `max_threads` to `4` to keep the visualization compact, showing just 4 parallel processing lanes:

<Image img={visual05} alt="Query pipeline"/>

Note: Read the visualization from left to right. Each row represents a parallel processing lane that streams data block by block, applying transformations such as filtering, aggregation, and final processing stages. In this example, you can see four parallel lanes corresponding to the `max_threads = 4` setting.

### Load balancing across processing lanes {#load-balancing-across-processing-lanes}

Note that the `Resize` operators in the physical plan above [repartition and redistribute](/academic_overview#4-2-multi-core-parallelization) data block streams across processing lanes to keep them evenly utilized. This rebalancing is especially important when data ranges vary in how many rows match the query predicates, otherwise, some lanes may become overloaded while others sit idle. By redistributing the work, faster lanes effectively help out slower ones, optimizing overall query runtime.

## Why max_threads isn't always respected {#why-max-threads-isnt-always-respected}

As mentioned above, the number of `n` parallel processing lanes is controlled by the `max_threads` setting, which by default matches the number of CPU cores available to ClickHouse on the server:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

However, the `max_threads` value may be ignored depending on the amount of data selected for processing:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 30
```

As shown in the operator plan extract above, even though `max_threads` is set to `59`, ClickHouse uses only **30** concurrent streams to scan the data.

Now let's run the query:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594,30 миллиона
   └────────────┘
   
1 строка в наборе. Затрачено: 0,013 сек. Обработано 2,31 млн строк, 13,66 МБ (173,12 млн строк/сек., 1,02 ГБ/сек.)
Пиковое использование памяти: 27,24 МиБ.   
```

As shown in the output above, the query processed 2.31 million rows and read 13.66MB of data. This is because, during the index analysis phase, ClickHouse selected **282 granules** for processing, each containing 8,192 rows, totaling approximately 2.31 million rows:

```sql runnable=false
EXPLAIN indexes = 1
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 3/3                                │
12. │             Granules: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

Regardless of the configured `max_threads` value, ClickHouse only allocates additional parallel processing lanes when there's enough data to justify them. The "max" in `max_threads` refers to an upper limit, not a guaranteed number of threads used.

What "enough data" means is primarily determined by two settings, which define the minimum number of rows (163,840 by default) and the minimum number of bytes (2,097,152 by default) that each processing lane should handle:

For shared-nothing clusters:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

For clusters with shared storage (e.g. ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Additionally, there's a hard lower limit for read task size, controlled by:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Don't modify these settings
We don't recommend modifying these settings in production. They're shown here solely to illustrate why `max_threads` doesn't always determine the actual level of parallelism.
:::

For demonstration purposes, let's inspect the physical plan with these settings overridden to force maximum concurrency:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON'
SETTINGS
  max_threads = 59,
  merge_tree_min_read_task_size = 0,
  merge_tree_min_rows_for_concurrent_read_for_remote_filesystem = 0, 
  merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem = 0;
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59
```

Теперь ClickHouse использует 59 одновременных потоков для сканирования данных, строго соблюдая значение параметра `max_threads`.

Это показывает, что для запросов к небольшим наборам данных ClickHouse намеренно ограничивает уровень параллелизма. Используйте переопределения настроек только для тестирования — не в продакшене, — поскольку они могут приводить к неэффективному выполнению или конфликтам за ресурсы.

## Основные выводы {#key-takeaways}

* ClickHouse параллелизует запросы с помощью линий обработки, количество которых привязано к `max_threads`.
* Фактическое число линий зависит от объёма данных, выбранных для обработки.
* Используйте `EXPLAIN PIPELINE` и трассировочные логи для анализа использования линий.

## Где найти дополнительную информацию  {#where-to-find-more-information}

Если вы хотите глубже разобраться в том, как ClickHouse выполняет запросы параллельно и достигает высокой производительности при масштабировании, ознакомьтесь со следующими материалами: 

* [Слой обработки запросов – статья VLDB 2024 (веб-версия)](/academic_overview#4-query-processing-layer) — подробный разбор внутренней модели исполнения ClickHouse, включая планирование, конвейерную обработку и конструирование операторов.

* [Состояния частичной агрегации: подробное объяснение](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) — подробный технический разбор того, как состояния частичной агрегации обеспечивают эффективное параллельное выполнение по нескольким потокам обработки.

* Видеоурок с подробным разбором всех шагов обработки запросов в ClickHouse:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
