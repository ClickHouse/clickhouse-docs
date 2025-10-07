---
'slug': '/optimize/query-parallelism'
'sidebar_label': 'Параллелизм запросов'
'sidebar_position': 20
'description': 'ClickHouse параллелизирует выполнение запроса, используя процессинговые
  каналы и настройку max_threads.'
'title': 'Как ClickHouse выполняет запрос в параллельном режиме'
'doc_type': 'guide'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';


# Как ClickHouse выполняет запрос параллельно

ClickHouse [создан для скорости](/concepts/why-clickhouse-is-so-fast). Он выполняет запросы в высокопараллельном режиме, используя все доступные ядра CPU, распределяя данные по обработчикам и зачастую приближая оборудование к его пределам.

Этот гид объясняет, как работает параллелизм запросов в ClickHouse и как вы можете настроить или контролировать его для улучшения производительности на больших нагрузках.

Мы используем запрос агрегации на наборе данных [uk_price_paid_simple](/parts), чтобы проиллюстрировать ключевые концепции.

## Пошагово: Как ClickHouse параллелизует запрос агрегации {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

Когда ClickHouse ① выполняет запрос агрегации с фильтром по первичному ключу таблицы, он ② загружает первичный индекс в память, чтобы ③ определить, какие гранулы нужно обработать, а какие можно безопасно пропустить:

<Image img={visual01} size="md" alt="Анализ индекса"/>

### Распределение работы по обработчикам {#distributing-work-across-processing-lanes}

Выбранные данные затем [динамически](#load-balancing-across-processing-lanes) распределяются по `n` параллельным [обработчикам](/academic_overview#4-2-multi-core-parallelization), которые поточно обрабатывают данные [блок](/development/architecture#block) за блоком и формируют итоговый результат:

<Image img={visual02} size="md" alt="4 параллельных обработчика"/>

<br/><br/>
Количество `n` параллельных обработчиков контролируется настройкой [max_threads](/operations/settings/settings#max_threads), которая по умолчанию соответствует количеству доступных ядер CPU на сервере с ClickHouse. В приведенном примере мы предполагаем `4` ядра.

На машине с `8` ядрами пропускная способность обработки запроса примерно удвоится (но использование памяти также увеличится соответственно), так как большее количество обработчиков одновременно обрабатывают данные:

<Image img={visual03} size="md" alt="8 параллельных обработчиков"/>

<br/><br/>
Эффективное распределение нагрузки между обработчиками является ключевым для максимизации использования CPU и сокращения общего времени выполнения запроса.

### Обработка запросов к шардам {#processing-queries-on-sharded-tables}

Когда данные таблицы распределены по нескольким серверам в виде [шардов](/shards), каждый сервер обрабатывает свою шарду параллельно. Внутри каждого сервера локальные данные обрабатываются с использованием параллельных обработчиков, как описано выше:

<Image img={visual04} size="md" alt="Распределенные обработчики"/>

<br/><br/>
Сервер, который изначально получает запрос, собирает все подрезультаты из шардов и объединяет их в финальный глобальный результат.

Распределение нагрузки запросов между шардом позволяет горизонтально масштабировать параллелизм, особенно в средах с высокой пропускной способностью.

:::note ClickHouse Cloud использует параллельные реплики вместо шардов
В ClickHouse Cloud этот же параллелизм достигается с помощью [параллельных реплик](https://clickhouse.com/docs/deployment-guides/parallel-replicas), которые функционируют аналогично шардам в кластерах без общей памяти. Каждая реплика ClickHouse Cloud — это статeless вычислительный узел — обрабатывает часть данных параллельно и вносит вклад в финальный результат, как это сделала бы независимая шарда.
:::

## Мониторинг параллелизма запросов {#monitoring-query-parallelism}

Используйте эти инструменты, чтобы проверить, что ваш запрос полностью использует доступные ресурсы CPU и диагностировать случаи, когда это не так.

Мы запускаем это на тестовом сервере с 59 ядрами CPU, что позволяет ClickHouse полностью продемонстрировать свой параллелизм запросов.

Чтобы наблюдать, как выполняется пример запроса, мы можем указать серверу ClickHouse возвращать все записи журналов уровня трассировки во время запроса агрегации. Для этой демонстрации мы убрали предикат запроса — в противном случае обрабатывались бы только 3 гранулы, что недостаточно для ClickHouse, чтобы использовать большее количество параллельных обработчиков:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 marks to read from 3 ranges
② <Trace> ...: Spreading mark ranges among streams
② <Debug> ...: Reading approx. 29564928 rows with 59 streams
```

Мы можем видеть, что

* ① ClickHouse необходимо прочитать 3,609 гранул (указанных как метки в журналах трассировки) по 3 диапазонам данных.
* ② С 59 ядрами CPU он распределяет эту работу по 59 параллельным потокам обработки — по одному на каждый обработчик.

В качестве альтернативы, мы можем использовать [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) для инспекции [физического плана операторов](/academic_overview#4-2-multi-core-parallelization) — также известного как "конвейер запросов" — для запроса агрегации:
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

Примечание: Читайте план операторов выше снизу вверх. Каждая строка представляет собой стадию в физическом плане выполнения, начиная с чтения данных из хранилища внизу и заканчивая финальными этапами обработки вверху. Операторы с отметкой `× 59` выполняются одновременно над неперекрывающимися регионами данных по 59 параллельным обработчикам. Это отражает значение `max_threads` и иллюстрирует, как каждая стадия запроса параллелизована по ядрам CPU.

Веб-интерфейс ClickHouse [встроенный](/interfaces/http) (доступный по конечной точке `/play`) может отрисовать физический план из выше в виде графической визуализации. В этом примере мы установили `max_threads` в `4`, чтобы сохранить компактность визуализации, показывая только 4 параллельных обработчика:

<Image img={visual05} alt="Конвейер запроса"/>

Примечание: Читайте визуализацию слева направо. Каждая строка представляет собой параллельный обработчик, который обрабатывает данные блок за блоком, применяя преобразования такие как фильтрация, агрегация и финальные этапы обработки. В этом примере вы можете увидеть четыре параллельные линии, соответствующие настройке `max_threads = 4`.

### Балансировка нагрузки между обработчиками {#load-balancing-across-processing-lanes}

Обратите внимание, что операторы `Resize` в физическом плане выше [перераспределяют и перераспределяют](/academic_overview#4-2-multi-core-parallelization) потоки блоков данных между обработчиками, чтобы поддерживать их равномерное использование. Эта сбалансировка особенно важна, когда диапазоны данных варьируются по количеству строк, соответствующих предикатам запроса, в противном случае некоторые обработчики могут перегружаться, а другие оставаться бездействующими. Путем перераспределения нагрузки более быстрые обработчики эффективно помогают более медленным, оптимизируя общее время выполнения запроса.

## Почему max_threads не всегда учитывается {#why-max-threads-isnt-always-respected}

Как упоминалось выше, количество `n` параллельных обработчиков контролируется настройкой `max_threads`, которая по умолчанию соответствует количеству доступных ядер CPU на сервере с ClickHouse:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

Однако значение `max_threads` может быть проигнорировано в зависимости от объема данных, выбранных для обработки:
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

Как показано в извлечении из плана операторов выше, хотя `max_threads` установлено на `59`, ClickHouse использует только **30** параллельных потоков для сканирования данных.

Теперь давайте запустим запрос:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30 million
   └────────────┘

1 row in set. Elapsed: 0.013 sec. Processed 2.31 million rows, 13.66 MB (173.12 million rows/s., 1.02 GB/s.)
Peak memory usage: 27.24 MiB.   
```

Как показано в вышеуказанном выводе, запрос обработал 2.31 миллиона строк и прочитал 13.66MB данных. Это происходит потому, что во время фазы анализа индекса ClickHouse выбрал **282 гранулы** для обработки, каждая из которых содержит 8,192 строки, в общей сложности примерно 2.31 миллиона строк:

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

Независимо от сконфигурированного значения `max_threads`, ClickHouse выделяет дополнительные параллельные обработчики только тогда, когда достаточно данных, чтобы это оправдать. "max" в `max_threads` относится к верхнему пределу, а не к гарантированному количеству используемых потоков.

Что означает "достаточно данных", в первую очередь определяется двумя настройками, которые определяют минимальное количество строк (по умолчанию 163,840) и минимальное количество байтов (по умолчанию 2,097,152), которые каждый обработчик должен обрабатывать:

Для кластеров без общей памяти:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

Для кластеров с общим хранилищем (например, ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Дополнительно существует жесткий нижний предел для размера задачи чтения, контролируемый:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Не изменяйте эти настройки
Мы не рекомендуем изменять эти настройки в производственной среде. Они приведены здесь только для иллюстрации того, почему `max_threads` не всегда определяет фактический уровень параллелизма.
:::

Для демонстрационных целей давайте проверим физический план с этими настройками, переопределенными, чтобы заставить максимальную степень параллелизма:
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

Теперь ClickHouse использует 59 параллельных потоков для сканирования данных, полностью соблюдая сконфигурированный `max_threads`.

Это подтверждает, что для запросов на небольших наборах данных ClickHouse намеренно ограничит параллелизм. Используйте переопределение настроек только для тестирования — не в производственной среде — так как это может привести к неэффективному выполнению или конкуренции за ресурсы.

## Основные выводы {#key-takeaways}

* ClickHouse параллелизует запросы, используя обработчики, связанные с `max_threads`.
* Фактическое количество обработчиков зависит от размера данных, выбранных для обработки.
* Используйте `EXPLAIN PIPELINE` и журналы трассировки для анализа использования обработчиков.

## Где найти больше информации {#where-to-find-more-information}

Если вы хотите глубже понять, как ClickHouse выполняет запросы параллельно и как он достигает высокой производительности в больших масштабах, изучите следующие ресурсы:

* [Слой обработки запросов – статья VLDB 2024 (веб-издание)](/academic_overview#4-query-processing-layer) - Подробное описание внутренней модели выполнения ClickHouse, включая планирование, конвейеризацию и проектирование операторов.

* [Объяснение частичных состояний агрегации](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - Техническое глубокое погружение в то, как частичные состояния агрегации позволяют эффективное параллельное выполнение через обработчики.

* Видеоурок, подробно разбирающий все шаги обработки запросов ClickHouse:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
