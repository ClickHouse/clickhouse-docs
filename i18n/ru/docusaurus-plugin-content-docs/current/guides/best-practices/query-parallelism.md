---
slug: /optimize/query-parallelism
sidebar_label: 'Параллелизм запросов'
sidebar_position: 20
description: 'ClickHouse параллелизует выполнение запросов с использованием обработчиков и настройки max_threads.'
title: 'Как ClickHouse выполняет запрос в параллельном режиме'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';


# Как ClickHouse выполняет запрос в параллельном режиме

ClickHouse [разработан для скорости](/concepts/why-clickhouse-is-so-fast). Он выполняет запросы в высоко параллельном режиме, используя все доступные ядра CPU, распределяя данные по обработчикам и часто подводя оборудование к его предельным возможностям.

Этот гид объясняет, как работает параллелизм запросов в ClickHouse и как вы можете настроить или мониторить его для улучшения производительности при больших нагрузках.

Мы используем запрос агрегации к набору данных [uk_price_paid_simple](/parts), чтобы проиллюстрировать ключевые концепции.


## По шагам: Как ClickHouse параллелизует запрос агрегации {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

Когда ClickHouse ① выполняет запрос агрегации с фильтром на первичном ключе таблицы, он ② загружает первичный индекс в память, чтобы ③ определить, какие гранулы необходимо обработать, а какие можно безопасно пропустить:

<Image img={visual01} size="md" alt="Анализ индекса"/>

### Распределение работы по обработчикам {#distributing-work-across-processing-lanes}

Выбранные данные затем [динамически](#load-balancing-across-processing-lanes) распределяются по `n` параллельным [обработчикам](/academic_overview#4-2-multi-core-parallelization), которые обрабатывают данные [блок](/development/architecture#block) за блоком в конечный результат:

<Image img={visual02} size="md" alt="4 параллельных обработчика"/>

<br/><br/>
Количество `n` параллельных обработчиков контролируется настройкой [max_threads](/operations/settings/settings#max_threads), которая по умолчанию соответствует количеству доступных ядер CPU на сервере. В приведенном выше примере предполагается, что имеется `4` ядра.

На машине с `8` ядрами производительность обработки запросов примерно удвоится (но использование памяти также увеличится соответственно), так как больше обработчиков обрабатывают данные параллельно:

<Image img={visual03} size="md" alt="8 параллельных обработчиков"/>

<br/><br/>
Эффективное распределение обработчиков является ключом к максимальному использованию CPU и снижению общего времени выполнения запроса.

### Обработка запросов к шардированным таблицам {#processing-queries-on-sharded-tables}

Когда данные таблицы распределены по нескольким серверам как [шарды](/shards), каждый сервер обрабатывает свой шард параллельно. Внутри каждого сервера локальные данные обрабатываются с использованием параллельных обработчиков, как описано выше:

<Image img={visual04} size="md" alt="Распределенные обработчики"/>

<br/><br/>
Сервер, который изначально получает запрос, собирает все субрезультаты из шардов и комбинирует их в итоговый глобальный результат.

Распределение нагрузки запросов по шартам позволяет горизонтально масштабировать параллелизм, особенно в средах с высоким трафиком.

:::note ClickHouse Cloud использует параллельные реплики вместо шардов
В ClickHouse Cloud тот же самый параллелизм достигается через [параллельные реплики](https://clickhouse.com/docs/deployment-guides/parallel-replicas), которые функционируют аналогично шартам в кластерах с отсутствующими общими ресурсами. Каждая реплика ClickHouse Cloud — это безд状態вый вычислительный узел — обрабатывает часть данных параллельно и вносит вклад в итоговый результат, как и независимый шард.
:::

## Мониторинг параллелизма запросов {#monitoring-query-parallelism}

Используйте эти инструменты, чтобы проверить, что ваш запрос полностью использует доступные ресурсы CPU и чтобы диагностировать, когда это не так.

Мы запускаем это на тестовом сервере с 59 ядрами CPU, что позволяет ClickHouse полностью продемонстрировать свой параллелизм запросов.

Чтобы наблюдать, как выполняется пример запроса, мы можем дать команду серверу ClickHouse вернуть все записи журнала уровня трассировки во время запроса агрегации. Для этой демонстрации мы убрали предикат запроса — в противном случае было бы обработано только 3 гранулы, чего недостаточно, чтобы ClickHouse мог использовать более чем несколько параллельных обработчиков:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 меток для чтения из 3 диапазонов
② <Trace> ...: Распределение диапазонов меток среди потоков
② <Debug> ...: Чтение примерно 29564928 строк с 59 потоками
```

Мы можем видеть, что

* ① ClickHouse нужно прочитать 3,609 гранул (указанных как метки в журналах трассировки) из 3 диапазонов данных.
* ② С 59 ядрами CPU он распределяет эту работу по 59 параллельным потокам обработки — по одному на каждый обработчик.

В качестве альтернативы, мы можем использовать [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) для проверки [физического плана оператора](/academic_overview#4-2-multi-core-parallelization) — также известного как "конвейер запросов" — для запроса агрегации:
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

Примечание: Читайте операторный план выше снизу вверх. Каждая строка представляет собой этап в физическом плане выполнения, начиная с чтения данных из хранилища внизу и заканчивая итоговыми шагами обработки вверху. Операторы, помеченные `× 59`, выполняются одновременно на не накладывающихся регионах данных через 59 параллельных обработчиков. Это отражает значение `max_threads` и иллюстрирует, как каждый этап запроса параллелизуется по ядрам CPU.

Веб-интерфейс [встроенного UI ClickHouse](/interfaces/http) (доступный по конечной точке `/play`) может отобразить физический план выше в виде графической визуализации. В этом примере мы установили `max_threads` равным `4`, чтобы сохранить визуализацию компактной, показывая всего 4 параллельных обработчика:

<Image img={visual05} alt="Конвейер запроса"/>

Примечание: Читайте визуализацию слева направо. Каждая строка представляет собой параллельный обработчик, который передает данные блоками, применяя такие преобразования, как фильтрация, агрегация и завершение обработки. В этом примере вы можете увидеть четыре параллельных потока, соответствующих настройке `max_threads = 4`.


### Балансировка нагрузки по обработчикам {#load-balancing-across-processing-lanes}

Обратите внимание, что операторы `Resize` в физическом плане выше [перераспределяют и перераспределяют](/academic_overview#4-2-multi-core-parallelization) потоки данных блоков по обработчикам, чтобы поддерживать их равномерное использование. Это перераспределение особенно важно, когда диапазоны данных различаются по количеству строк, соответствующих предикатам запроса, в противном случае некоторые обработчики могут перегружаться, в то время как другие остаются без дела. Перераспределяя работу, более быстрые обработчики эффективно помогают медленным, оптимизируя общее время выполнения запроса.


## Почему max_threads не всегда соблюдается {#why-max-threads-isnt-always-respected}

Как упоминалось выше, количество `n` параллельных обработчиков контролируется настройкой `max_threads`, которая по умолчанию равняется количеству доступных ядер CPU в ClickHouse на сервере:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

Однако значение `max_threads` может быть проигнорировано в зависимости от объема данных, выбранного для обработки:
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

Как показано в извлечении из операционного плана выше, хотя `max_threads` установлено на `59`, ClickHouse использует только **30** параллельных потоков для сканирования данных.

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
1. │  594300000 │ -- 594.30 миллионов
   └────────────┘
   
1 строка в наборе. Время: 0.013 сек. Обработано 2.31 миллиона строк, 13.66 МБ (173.12 миллиона строк/сек., 1.02 Гб/сек.)
Максимальное использование памяти: 27.24 МБ.   
```

Как показано в выводе выше, запрос обработал 2.31 миллиона строк и прочитал 13.66 МБ данных. Это произошло потому, что на этапе анализа индекса ClickHouse выбрал **282 гранулы** для обработки, каждая из которых содержит 8192 строки, в сумме примерно 2.31 миллиона строк:

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
 6. │         Индексы:                                      │
 7. │           PrimaryKey                                  │
 8. │             Ключи:                                    │
 9. │               town                                    │
10. │             Условие: (town in ['LONDON', 'LONDON']) │
11. │             Части: 3/3                                │
12. │             Гранулы: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

Независимо от настроенного значения `max_threads`, ClickHouse выделяет дополнительные параллельные обработчики только тогда, когда существует достаточно данных, чтобы это оправдать. "max" в `max_threads` относится к верхнему пределу, а не к гарантированному количеству используемых потоков.

Что "достаточно данных" подразумевает, определяется в первую очередь двумя настройками, которые определяют минимальное количество строк (по умолчанию 163840) и минимальное количество байт (по умолчанию 2097152), которые каждый обработчик должен обрабатывать:

Для кластеров без общих ресурсов:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

Для кластеров с общим хранилищем (например, ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Кроме того, существует жесткий нижний предел для размера задач чтения, контролируемый:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Не изменяйте эти настройки
Мы не рекомендуем изменять эти настройки в производственной среде. Они показываются здесь исключительно для иллюстрации того, почему `max_threads` не всегда определяет фактический уровень параллелизма.
:::


В демонстрационных целях давайте исследуем физический план, переопределив эти настройки, чтобы принудительно максимизировать степень параллелизма:
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

Теперь ClickHouse использует 59 параллельных потоков для сканирования данных, полностью соблюдая настроенное значение `max_threads`.

Это демонстрирует, что для запросов по небольшим наборам данных ClickHouse намеренно ограничивает параллелизм. Используйте переопределения настроек только для тестирования — не в производственной среде — так как они могут привести к неэффективному выполнению или конфликту ресурсов.

## Ключевые выводы {#key-takeaways}

* ClickHouse параллелизует запросы, используя обработчики, связанные с `max_threads`.
* Фактическое количество обработчиков зависит от объема данных, выбранного для обработки.
* Используйте `EXPLAIN PIPELINE` и журналы трассировки для анализа использования обработчиков.


## Где найти дополнительную информацию  {#where-to-find-more-information}

Если вы хотите углубиться в то, как ClickHouse выполняет запросы в параллельном режиме и как он достигает высокой производительности в больших масштабах, изучите следующие ресурсы: 

* [Слой обработки запросов – статья VLDB 2024 (веб-редакция)](/academic_overview#4-query-processing-layer) - Подробный анализ внутренней модели выполнения ClickHouse, включая планирование, конвейеризацию и проектирование операторов.

* [Объяснение частичных состояний агрегации](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - Техническое глубокое погружение в то, как частичные состояния агрегации позволяют эффективное параллельное выполнение запросов через обработчики.

* Видеоурок, подробно объясняющий все этапы обработки запросов ClickHouse:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
