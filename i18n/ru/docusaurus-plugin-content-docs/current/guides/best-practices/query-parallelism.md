---
slug: /optimize/query-parallelism
sidebar_label: 'Параллелизм запросов'
sidebar_position: 20
description: 'ClickHouse выполняет запросы параллельно, используя каналы обработки (processing lanes) и настройку max_threads.'
title: 'Как ClickHouse выполняет запрос параллельно'
doc_type: 'guide'
keywords: ['параллельная обработка', 'оптимизация запросов', 'производительность', 'потоки', 'передовые практики']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';


# Как ClickHouse выполняет запрос в параллельном режиме

ClickHouse [создан для высокой скорости](/concepts/why-clickhouse-is-so-fast). Он выполняет запросы в высокопараллельном режиме, используя все доступные ядра CPU, распределяя данные по потокам обработки и часто нагружая оборудование почти до предела.
 
В этом руководстве рассматривается, как работает параллелизм выполнения запросов в ClickHouse, а также как его можно настраивать и отслеживать для повышения производительности при больших нагрузках.

Для иллюстрации ключевых концепций мы используем агрегирующий запрос к набору данных [uk_price_paid_simple](/parts).



## Пошаговое описание: Как ClickHouse распараллеливает агрегационный запрос {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

Когда ClickHouse ① выполняет агрегационный запрос с фильтром по первичному ключу таблицы, он ② загружает первичный индекс в память, чтобы ③ определить, какие гранулы необходимо обработать, а какие можно безопасно пропустить:

<Image img={visual01} size='md' alt='Анализ индекса' />

### Распределение работы по потокам обработки {#distributing-work-across-processing-lanes}

Выбранные данные затем [динамически](#load-balancing-across-processing-lanes) распределяются по `n` параллельным [потокам обработки](/academic_overview#4-2-multi-core-parallelization), которые обрабатывают данные в потоковом режиме [блок](/development/architecture#block) за блоком до получения итогового результата:

<Image img={visual02} size='md' alt='4 параллельных потока обработки' />

<br />
<br />
Количество `n` параллельных потоков обработки контролируется настройкой
[max_threads](/operations/settings/settings#max_threads), которая по
умолчанию соответствует количеству ядер CPU, доступных ClickHouse на сервере.
В приведенном выше примере предполагается `4` ядра.

На машине с `8` ядрами пропускная способность обработки запросов примерно удвоится (но использование памяти также соответственно увеличится), поскольку больше потоков обрабатывают данные параллельно:

<Image img={visual03} size='md' alt='8 параллельных потоков обработки' />

<br />
<br />
Эффективное распределение по потокам является ключевым фактором для максимального использования CPU и сокращения
общего времени выполнения запроса.

### Обработка запросов к шардированным таблицам {#processing-queries-on-sharded-tables}

Когда данные таблицы распределены по нескольким серверам в виде [шардов](/shards), каждый сервер обрабатывает свой шард параллельно. Внутри каждого сервера локальные данные обрабатываются с использованием параллельных потоков обработки, как описано выше:

<Image img={visual04} size='md' alt='Распределенные потоки' />

<br />
<br />
Сервер, который изначально получает запрос, собирает все промежуточные результаты от
шардов и объединяет их в итоговый глобальный результат.

Распределение нагрузки запросов по шардам позволяет горизонтально масштабировать параллелизм, особенно в средах с высокой пропускной способностью.

:::note ClickHouse Cloud использует параллельные реплики вместо шардов
В ClickHouse Cloud такой же параллелизм достигается с помощью [параллельных реплик](https://clickhouse.com/docs/deployment-guides/parallel-replicas), которые функционируют аналогично шардам в кластерах с разделенным хранилищем. Каждая реплика ClickHouse Cloud — вычислительный узел без сохранения состояния — обрабатывает часть данных параллельно и вносит вклад в итоговый результат, точно так же, как это делал бы независимый шард.
:::


## Мониторинг параллелизма запросов {#monitoring-query-parallelism}

Используйте эти инструменты для проверки полного использования доступных ресурсов процессора вашим запросом и диагностики ситуаций, когда этого не происходит.

Мы запускаем это на тестовом сервере с 59 ядрами процессора, что позволяет ClickHouse в полной мере продемонстрировать параллелизм выполнения запросов.

Чтобы наблюдать за выполнением примера запроса, мы можем указать серверу ClickHouse возвращать все записи журнала уровня трассировки во время выполнения агрегирующего запроса. Для этой демонстрации мы удалили предикат запроса — в противном случае было бы обработано только 3 гранулы, чего недостаточно для того, чтобы ClickHouse задействовал более нескольких параллельных потоков обработки:

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

Мы видим, что

- ① ClickHouse необходимо прочитать 3 609 гранул (обозначенных как marks в журналах трассировки) из 3 диапазонов данных.
- ② При наличии 59 ядер процессора он распределяет эту работу по 59 параллельным потокам обработки — по одному на каждый поток.

В качестве альтернативы мы можем использовать оператор [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) для проверки [плана физических операторов](/academic_overview#4-2-multi-core-parallelization) — также известного как «конвейер запроса» — для агрегирующего запроса:

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

Примечание: Читайте план операторов выше снизу вверх. Каждая строка представляет собой этап в плане физического выполнения, начиная с чтения данных из хранилища внизу и заканчивая финальными этапами обработки вверху. Операторы, помеченные `× 59`, выполняются одновременно на непересекающихся областях данных в 59 параллельных потоках обработки. Это отражает значение `max_threads` и иллюстрирует, как каждый этап запроса распараллеливается по ядрам процессора.

[Встроенный веб-интерфейс](/interfaces/http) ClickHouse (доступный по адресу `/play`) может отобразить приведенный выше физический план в виде графической визуализации. В этом примере мы установили `max_threads` равным `4`, чтобы визуализация была компактной и показывала только 4 параллельных потока обработки:

<Image img={visual05} alt='Конвейер запроса' />

Примечание: Читайте визуализацию слева направо. Каждая строка представляет собой параллельный поток обработки, который передает данные блок за блоком, применяя преобразования, такие как фильтрация, агрегация и финальные этапы обработки. В этом примере вы можете видеть четыре параллельных потока, соответствующих настройке `max_threads = 4`.

### Балансировка нагрузки между потоками обработки {#load-balancing-across-processing-lanes}

Обратите внимание, что операторы `Resize` в приведенном выше физическом плане [перераспределяют](/academic_overview#4-2-multi-core-parallelization) потоки блоков данных между потоками обработки для поддержания их равномерной загрузки. Эта перебалансировка особенно важна, когда диапазоны данных различаются по количеству строк, соответствующих предикатам запроса, иначе некоторые потоки могут оказаться перегруженными, в то время как другие будут простаивать. Перераспределяя работу, более быстрые потоки эффективно помогают более медленным, оптимизируя общее время выполнения запроса.


## Почему max_threads не всегда учитывается {#why-max-threads-isnt-always-respected}

Как упоминалось выше, количество `n` параллельных потоков обработки контролируется параметром `max_threads`, который по умолчанию соответствует количеству ядер процессора, доступных ClickHouse на сервере:

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

Однако значение `max_threads` может не учитываться в зависимости от объема данных, выбранных для обработки:

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

Как показано в приведенном выше фрагменте плана операторов, несмотря на то что `max_threads` установлен в `59`, ClickHouse использует только **30** параллельных потоков для сканирования данных.

Теперь выполним запрос:

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

1 строка в наборе. Затрачено: 0.013 сек. Обработано 2,31 миллиона строк, 13,66 МБ (173,12 миллиона строк/с., 1,02 ГБ/с.)
Пиковое использование памяти: 27,24 МиБ.
```

Как показано в выводе выше, запрос обработал 2,31 миллиона строк и прочитал 13,66 МБ данных. Это связано с тем, что на этапе анализа индекса ClickHouse выбрал для обработки **282 гранулы**, каждая из которых содержит 8 192 строки, что в сумме составляет приблизительно 2,31 миллиона строк:

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

Независимо от настроенного значения `max_threads`, ClickHouse выделяет дополнительные параллельные потоки обработки только при наличии достаточного объема данных для их использования. Префикс «max» в `max_threads` означает верхний предел, а не гарантированное количество используемых потоков.

Что означает «достаточный объем данных», в первую очередь определяется двумя параметрами, которые задают минимальное количество строк (163 840 по умолчанию) и минимальное количество байтов (2 097 152 по умолчанию), которые должен обрабатывать каждый поток:

Для кластеров с раздельным хранилищем:

- [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
- [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

Для кластеров с общим хранилищем (например, ClickHouse Cloud):

- [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
- [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Кроме того, существует жесткий нижний предел размера задачи чтения, контролируемый следующими параметрами:

- [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)


:::warning Не изменяйте эти настройки
Мы не рекомендуем изменять эти настройки в production-среде. Они показаны здесь только для иллюстрации того, почему `max_threads` не всегда определяет фактический уровень параллелизма.
:::

В демонстрационных целях давайте изучим физический план с переопределёнными настройками, чтобы принудительно задать максимальный уровень параллелизма:

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

Теперь ClickHouse использует 59 одновременных потоков для сканирования данных, полностью соблюдая настроенное значение `max_threads`.

Это показывает, что для запросов к небольшим наборам данных ClickHouse намеренно ограничивает степень параллелизма. Используйте переопределения настроек только для тестирования — не в продакшене — поскольку они могут привести к неэффективному выполнению или конфликтам при использовании ресурсов.


## Ключевые выводы {#key-takeaways}

- ClickHouse распараллеливает запросы, используя потоки обработки, количество которых определяется параметром `max_threads`.
- Фактическое количество потоков зависит от объёма данных, выбранных для обработки.
- Для анализа использования потоков применяйте `EXPLAIN PIPELINE` и журналы трассировки.


## Где найти дополнительную информацию {#where-to-find-more-information}

Если вы хотите глубже разобраться в том, как ClickHouse выполняет запросы параллельно и как достигается высокая производительность при масштабировании, изучите следующие ресурсы:

- [Query Processing Layer – VLDB 2024 Paper (Web Edition)](/academic_overview#4-query-processing-layer) - Подробное описание внутренней модели выполнения запросов ClickHouse, включая планирование, конвейеризацию и проектирование операторов.

- [Partial aggregation states explained](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - Техническое погружение в механизм работы частичных состояний агрегации, обеспечивающих эффективное параллельное выполнение по потокам обработки.

- Видеоурок с подробным разбором всех этапов обработки запросов в ClickHouse:
  <iframe
    width='1024'
    height='576'
    src='https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe'
    title='YouTube video player'
    frameborder='0'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    referrerpolicy='strict-origin-when-cross-origin'
    allowfullscreen
  ></iframe>
