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

Мы видим, что

* ① ClickHouse нужно прочитать 3 609 гранул (обозначенных как «marks» в журналах трассировки) в пределах 3 диапазонов данных.
* ② Имея 59 ядер CPU, он распределяет эту работу между 59 параллельными потоками обработки — по одному на каждую линию.

В качестве альтернативы мы можем использовать оператор [EXPLAIN](/sql-reference/statements/explain#explain-pipeline), чтобы изучить [план физических операторов](/academic_overview#4-2-multi-core-parallelization) — также известный как «конвейер запроса» — для агрегирующего запроса:

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

Примечание: читайте план операторов выше снизу вверх. Каждая строка представляет собой стадию физического плана выполнения, начиная с чтения данных из хранилища внизу и заканчивая финальными этапами обработки вверху. Операторы, помеченные `× 59`, выполняются параллельно на непересекающихся диапазонах данных в 59 параллельных конвейерах обработки. Это отражает значение `max_threads` и показывает, как каждая стадия запроса распараллеливается по ядрам CPU.

[Встроенный веб-интерфейс](/interfaces/http) ClickHouse (доступен по эндпоинту `/play`) может отобразить приведённый выше физический план в виде графической визуализации. В этом примере мы установили `max_threads` равным `4`, чтобы сделать визуализацию компактной, показывая только 4 параллельных конвейера обработки:

<Image img={visual05} alt="Query pipeline" />

Примечание: читайте визуализацию слева направо. Каждая строка представляет параллельный конвейер обработки, который передаёт данные блок за блоком, применяя преобразования, такие как фильтрация, агрегация и финальные стадии обработки. В этом примере вы видите четыре параллельных конвейера, соответствующих настройке `max_threads = 4`.

### Балансировка нагрузки между конвейерами обработки {#load-balancing-across-processing-lanes}

Обратите внимание, что операторы `Resize` в физическом плане выше [переразбивают на части и перераспределяют](/academic_overview#4-2-multi-core-parallelization) потоки блоков данных между конвейерами обработки, чтобы поддерживать их равномерную загрузку. Такое перебалансирование особенно важно, когда диапазоны данных различаются по количеству строк, удовлетворяющих предикатам запроса, иначе некоторые конвейеры могут быть перегружены, в то время как другие простаивают. Перераспределяя работу, более быстрые конвейеры фактически помогают более медленным, оптимизируя общее время выполнения запроса.

## Почему max&#95;threads не всегда соблюдается {#why-max-threads-isnt-always-respected}

Как отмечалось выше, количество параллельных потоков обработки `n` контролируется параметром `max_threads`, который по умолчанию равен числу ядер CPU, доступных ClickHouse на сервере:

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

Однако значение `max_threads` может игнорироваться в зависимости от объёма выбранных для обработки данных:

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

Как видно из приведённого выше фрагмента плана операторов, хотя значение `max_threads` установлено в `59`, ClickHouse использует только **30** параллельных потоков для сканирования данных.

Теперь запустим запрос:

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

Как видно из вывода выше, запрос обработал 2,31 миллиона строк и прочитал 13,66 МБ данных. Это связано с тем, что на этапе анализа индекса ClickHouse выбрал для обработки **282 гранулы**, каждая из которых содержит 8 192 строки, что в сумме дает приблизительно 2,31 миллиона строк:

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

Независимо от заданного значения `max_threads`, ClickHouse выделяет дополнительные параллельные конвейеры обработки только тогда, когда данных достаточно, чтобы это было оправдано. «Max» в `max_threads` означает верхний предел, а не гарантированное количество используемых потоков.

То, что считается «достаточным количеством данных», в первую очередь определяется двумя настройками, которые задают минимальное количество строк (163 840 по умолчанию) и минимальное количество байт (2 097 152 по умолчанию), обрабатываемых каждым конвейером:

Для кластеров с архитектурой shared-nothing:

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

Для кластеров с общей подсистемой хранения (shared storage), например ClickHouse Cloud:

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Кроме того, существует жёсткий нижний предел размера задачи чтения, который контролируется настройками:

* [Merge&#95;tree&#95;min&#95;read&#95;task&#95;size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge&#95;tree&#95;min&#95;bytes&#95;per&#95;task&#95;for&#95;remote&#95;reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Не изменяйте эти настройки
Мы не рекомендуем изменять эти настройки в продакшене. Они приведены здесь только для того, чтобы показать, почему `max_threads` не всегда определяет фактический уровень параллелизма.
:::

В демонстрационных целях давайте рассмотрим физический план с переопределёнными настройками, чтобы принудительно задать максимальный уровень параллелизма:

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
