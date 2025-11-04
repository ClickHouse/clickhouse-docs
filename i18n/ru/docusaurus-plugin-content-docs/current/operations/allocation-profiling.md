---
slug: '/operations/allocation-profiling'
sidebar_label: 'Профилирование выделения'
description: 'Страница с описанием профилирования распределения в ClickHouse'
title: 'Профилирование выделения'
doc_type: guide
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделения памяти

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве своего глобального аллокатора. Jemalloc предоставляет некоторые инструменты для выборки и профилирования выделений памяти.  
Для упрощения профилирования выделения памяти, ClickHouse и Keeper позволяют вам управлять выборкой с использованием конфигураций, настроек запросов, команд `SYSTEM` и команд из четырех букв (4LW) в Keeper.   
Кроме того, выборки могут быть собраны в таблицу `system.trace_log` под типом `JemallocSample`.

:::note

Этот справочник применим для версий 25.9 и выше.  
Для более ранних версий смотрите [профилирование выделения для версий до 25.9](/operations/allocation-profiling-old.md).

:::

## Выборка выделений {#sampling-allocations}

Если вы хотите выполнять выборку и профилирование выделений в `jemalloc`, вам необходимо запустить ClickHouse/Keeper с включенной конфигурацией `jemalloc_enable_global_profiler`.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` будет выполнять выборку выделений и сохранять информацию внутри.

Вы также можете включить выделения для запроса, используя настройку `jemalloc_enable_profiler`.

:::warning Warning
Поскольку ClickHouse является приложением с интенсивным выделением памяти, выборка jemalloc может привести к дополнительной нагрузке на производительность.
:::

## Хранение выборок jemalloc в `system.trace_log` {#storing-jemalloc-samples-in-system-trace-log}

Вы можете хранить все выборки jemalloc в `system.trace_log` под типом `JemallocSample`.  
Чтобы включить это глобально, вы можете использовать конфигурацию `jemalloc_collect_global_profile_samples_in_trace_log`.

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning Warning
Поскольку ClickHouse является приложением с интенсивным выделением памяти, сбор всех выборок в system.trace_log может привести к высокой нагрузке.
:::

Вы также можете включить это для запроса, используя настройку `jemalloc_collect_profile_samples_in_trace_log`.

### Пример анализа использования памяти запроса с использованием `system.trace_log` {#example-analyzing-memory-usage-trace-log}

Сначала мы должны выполнить запрос с включенным профайлером jemalloc и собрать выборки для него в `system.trace_log`:

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
Если ClickHouse был запущен с `jemalloc_enable_global_profiler`, вам не нужно включать `jemalloc_enable_profiler`.   
То же самое касается `jemalloc_collect_global_profile_samples_in_trace_log` и `jemalloc_collect_profile_samples_in_trace_log`.
:::

Мы сбросим `system.trace_log`:

```sql
SYSTEM FLUSH LOGS trace_log
```
и выполним запрос, чтобы получить использование памяти запроса в каждой точке времени:
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

Мы также можем найти момент, когда использование памяти было максимальным:

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

Мы можем использовать этот результат, чтобы увидеть, откуда произошло наибольшее количество активных выделений в этот момент времени:

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

По умолчанию файл профиля кучи будет генерироваться в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — глобальный номер последовательности для текущего профиля кучи.  
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap` и следует тем же правилам.

Вы можете указать `jemalloc`, чтобы сбросить текущий профиль, выполнив:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

Он вернет расположение сброшенного профиля.

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

Другое местоположение можно определить, добавив переменную среды `MALLOC_CONF` с опцией `prof_prefix`.  
Например, если вы хотите генерировать профили в папке `/data`, где префикс имени файла будет `my_current_profile`, вы можете запустить ClickHouse/Keeper с следующей переменной среды:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

Сгенерированный файл будет добавлен к префиксу PID и номеру последовательности.

## Анализ профилей кучи {#analyzing-heap-profiles}

После генерации профилей кучи их необходимо проанализировать.  
Для этого можно использовать инструмент `jemalloc`, называемый [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). Установить его можно несколькими способами:
- С использованием пакетного менеджера системы
- Клонировав [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустив `autogen.sh` из корневой папки. Это обеспечит вас скриптом `jeprof` внутри папки `bin`

:::note
`jeprof` использует `addr2line` для генерации стековых трассировок, что может быть довольно медленно.  
Если это так, рекомендуется установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.   

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

Кроме того, `llvm-addr2line` работает не хуже.

:::

Существует много разных форматов, которые можно сгенерировать из профиля кучи с помощью `jeprof`.  
Рекомендуется запустить `jeprof --help` для получения информации о том, как использовать инструмент и о различных доступных параметрах.

В общем, команда `jeprof` используется следующим образом:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если вы хотите сравнить, какие выделения произошли между двумя профилями, вы можете установить аргумент `base`:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### Примеры {#examples}

- если вы хотите сгенерировать текстовый файл с каждой процедурой, записанной в строку:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- если вы хотите сгенерировать PDF файл с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Генерация графика пламени {#generating-flame-graph}

`jeprof` позволяет вам генерировать сжатые стеки для построения графиков пламени.

Для этого вам необходимо использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого вы можете использовать множество различных инструментов для визуализации сжатых стеков.

Самый популярный — [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Другой интересный инструмент — [speedscope](https://www.speedscope.app/), который позволяет вам анализировать собранные стеки более интерактивным способом.

## Дополнительные параметры для профайлера {#additional-options-for-profiler}

`jemalloc` имеет много различных параметров, связанных с профайлером. Они могут быть настроены через изменение переменной среды `MALLOC_CONF`.  
Например, интервал между выборками выделений можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбрасывать профиль кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.  

Рекомендуется проверить [референсную страницу](https://jemalloc.net/jemalloc.3.html) jemalloc для получения полного списка параметров.

## Другие ресурсы {#other-resources}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, различными способами.

:::warning Warning
Важно помнить, что ни одна из этих метрик не синхронизирована друг с другом, и значения могут приводить к расхождениям.
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

Содержит информацию о выделениях памяти, выполненных с помощью аллокатора jemalloc в разных размерах классов (бинов), агрегированных из всех арен.

[Справочная информация](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics` также доступны через эндпоинт Prometheus как в ClickHouse, так и в Keeper.

[Справочная информация](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [основные статистические данные аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```