---
description: 'Страница, посвящённая профилированию выделения памяти в ClickHouse'
sidebar_label: 'Профилирование выделения памяти'
slug: /operations/allocation-profiling
title: 'Профилирование выделения памяти'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделения памяти

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве глобального аллокатора. Jemalloc предоставляет ряд инструментов для семплирования и профилирования выделений памяти.  
Для удобства профилирования выделения памяти ClickHouse и Keeper позволяют управлять семплированием с помощью конфигураций, настроек запросов, команд `SYSTEM`, а также команд four letter word (4LW) в Keeper.   
Кроме того, семплы могут собираться в таблицу `system.trace_log` с типом `JemallocSample`.

:::note

Это руководство применимо к версиям 25.9+.
Для более старых версий см. раздел [профилирование выделения памяти для версий до 25.9](/operations/allocation-profiling-old.md).

:::



## Выборочное профилирование выделений памяти {#sampling-allocations}

Если вы хотите выполнять выборочное профилирование выделений памяти в `jemalloc`, необходимо запустить ClickHouse/Keeper с включённым параметром конфигурации `jemalloc_enable_global_profiler`.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` будет выполнять выборку выделений памяти и сохранять информацию во внутренних структурах.

Вы также можете включить профилирование выделений памяти для отдельных запросов с помощью настройки `jemalloc_enable_profiler`.

:::warning Предупреждение
Поскольку ClickHouse является приложением с интенсивным выделением памяти, выборочное профилирование jemalloc может привести к снижению производительности.
:::


## Сохранение сэмплов jemalloc в `system.trace_log` {#storing-jemalloc-samples-in-system-trace-log}

Все сэмплы jemalloc можно сохранять в `system.trace_log` с типом `JemallocSample`.
Для глобального включения используйте параметр конфигурации `jemalloc_collect_global_profile_samples_in_trace_log`.

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning Предупреждение
Поскольку ClickHouse является приложением с интенсивным выделением памяти, сбор всех сэмплов в system.trace_log может создать высокую нагрузку.
:::

Также можно включить сбор для отдельного запроса, используя настройку `jemalloc_collect_profile_samples_in_trace_log`.

### Пример анализа использования памяти запроса с помощью `system.trace_log` {#example-analyzing-memory-usage-trace-log}

Сначала необходимо выполнить запрос с включенным профилировщиком jemalloc и собрать сэмплы в `system.trace_log`:

```sql
SELECT *
FROM numbers(1000000)
ORDER BY number DESC
SETTINGS max_bytes_ratio_before_external_sort = 0
FORMAT `Null`
SETTINGS jemalloc_enable_profiler = 1, jemalloc_collect_profile_samples_in_trace_log = 1

Query id: 8678d8fe-62c5-48b8-b0cd-26851c62dd75

Ok.

0 rows in set. Elapsed: 0.009 sec. Processed 1.00 million rows, 8.00 MB (108.58 million rows/s., 868.61 MB/s.)
Peak memory usage: 12.65 MiB.
```

:::note
Если ClickHouse был запущен с параметром `jemalloc_enable_global_profiler`, включать `jemalloc_enable_profiler` не требуется.  
То же самое справедливо для `jemalloc_collect_global_profile_samples_in_trace_log` и `jemalloc_collect_profile_samples_in_trace_log`.
:::

Выполним сброс `system.trace_log`:

```sql
SYSTEM FLUSH LOGS trace_log
```

и запросим его, чтобы получить использование памяти выполненного запроса для каждого момента времени:

```sql
WITH per_bucket AS
(
    SELECT
        event_time_microseconds AS bucket_time,
        sum(size) AS bucket_sum
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
    GROUP BY bucket_time
)
SELECT
    bucket_time,
    sum(bucket_sum) OVER (
        ORDER BY bucket_time ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_size,
    formatReadableSize(cumulative_size) AS cumulative_size_readable
FROM per_bucket
ORDER BY bucket_time
```

Также можно найти момент времени, когда использование памяти было максимальным:

```sql
SELECT
    argMax(bucket_time, cumulative_size),
    max(cumulative_size)
FROM
(
    WITH per_bucket AS
    (
        SELECT
            event_time_microseconds AS bucket_time,
            sum(size) AS bucket_sum
        FROM system.trace_log
        WHERE trace_type = 'JemallocSample'
          AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
        GROUP BY bucket_time
    )
    SELECT
        bucket_time,
        sum(bucket_sum) OVER (
            ORDER BY bucket_time ASC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_size,
        formatReadableSize(cumulative_size) AS cumulative_size_readable
    FROM per_bucket
    ORDER BY bucket_time
)
```

Этот результат можно использовать, чтобы определить, откуда происходили наиболее активные выделения памяти в этот момент времени:


```sql
SELECT
    concat(
        '\n',
        arrayStringConcat(
            arrayMap(
                (x, y) -> concat(x, ': ', y),
                arrayMap(x -> addressToLine(x), allocation_trace),
                arrayMap(x -> demangle(addressToSymbol(x)), allocation_trace)
            ),
            '\n'
        )
    ) AS symbolized_trace,
    sum(s) AS per_trace_sum
FROM
(
    SELECT
        ptr,
        sum(size) AS s,
        argMax(trace, event_time_microseconds) AS allocation_trace
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
      AND event_time_microseconds <= '2025-09-04 11:56:21.737139'
    GROUP BY ptr
    HAVING s > 0
)
GROUP BY ALL
ORDER BY per_trace_sum ASC
```


## Сброс профилей кучи {#flushing-heap-profiles}

По умолчанию файл профиля кучи создаётся в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID процесса ClickHouse, а `_seqnum_` — глобальный порядковый номер текущего профиля кучи.  
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap`, применяются те же правила.

Чтобы указать `jemalloc` сбросить текущий профиль, выполните:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

Команда вернёт путь к сброшенному профилю.

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

Другое расположение можно задать, добавив опцию `prof_prefix` к переменной окружения `MALLOC_CONF`.  
Например, если требуется создавать профили в папке `/data` с префиксом имени файла `my_current_profile`, запустите ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

К имени созданного файла будут добавлены префикс, PID и порядковый номер.


## Анализ профилей кучи {#analyzing-heap-profiles}

После создания профилей кучи их необходимо проанализировать.  
Для этого можно использовать инструмент `jemalloc` под названием [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). Его можно установить несколькими способами:

- С помощью системного менеджера пакетов
- Клонировав [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустив `autogen.sh` из корневой директории. Скрипт `jeprof` будет находиться в директории `bin`

:::note
`jeprof` использует `addr2line` для генерации трассировок стека, что может работать очень медленно.  
В таком случае рекомендуется установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

Также хорошо работает `llvm-addr2line`.

:::

С помощью `jeprof` можно создавать профили кучи в различных форматах.
Рекомендуется выполнить `jeprof --help` для получения информации об использовании и доступных опциях инструмента.

В общем случае команда `jeprof` используется следующим образом:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если необходимо сравнить выделения памяти между двумя профилями, можно указать аргумент `base`:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### Примеры {#examples}

- Для создания текстового файла с каждой процедурой на отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- Для создания PDF-файла с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Создание flame graph {#generating-flame-graph}

`jeprof` позволяет генерировать свёрнутые стеки для построения flame graph.

Необходимо использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого можно использовать различные инструменты для визуализации свёрнутых стеков.

Наиболее популярным является [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Другим полезным инструментом является [speedscope](https://www.speedscope.app/), который позволяет анализировать собранные стеки в интерактивном режиме.


## Дополнительные параметры профилировщика {#additional-options-for-profiler}

`jemalloc` предоставляет множество различных параметров, связанных с профилировщиком. Управлять ими можно через переменную окружения `MALLOC_CONF`.
Например, интервал между выборками выделения памяти можно задать с помощью параметра `lg_prof_sample`.  
Если требуется выгружать профиль кучи каждые N байт, это можно включить с помощью параметра `lg_prof_interval`.

Полный список параметров приведен на [справочной странице](https://jemalloc.net/jemalloc.3.html) `jemalloc`.


## Другие ресурсы {#other-resources}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, множеством различных способов.

:::warning Предупреждение
Важно учитывать, что эти метрики не синхронизированы между собой, и их значения могут расходиться.
:::

### Системная таблица `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[Справочная информация](/operations/system-tables/asynchronous_metrics)

### Системная таблица `jemalloc_bins` {#system-table-jemalloc_bins}

Содержит информацию о выделениях памяти, выполненных через аллокатор jemalloc в различных классах размеров (bins), агрегированную из всех арен.

[Справочная информация](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics` также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Справочная информация](/operations/server-configuration-parameters/settings#prometheus)

### Команда 4LW `jmst` в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду 4LW `jmst`, которая возвращает [базовую статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```
