---
description: 'Страница, описывающая профилирование выделения памяти в ClickHouse'
sidebar_label: 'Профилирование выделения памяти'
slug: /operations/allocation-profiling
title: 'Профилирование выделения памяти'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделений памяти \{#allocation-profiling\}

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве глобального аллокатора. Jemalloc предоставляет инструменты для сэмплирования и профилирования выделений памяти.  
Чтобы сделать профилирование выделений более удобным, ClickHouse и Keeper позволяют управлять сэмплированием с помощью конфигурационных файлов, настроек запроса, команд `SYSTEM` и четырёхбуквенных (4LW) команд в Keeper.   
Кроме того, сэмплы могут записываться в таблицу `system.trace_log` с типом `JemallocSample`.

:::note

Это руководство применимо к версиям 25.9 и новее.
Для более старых версий см. раздел [профилирование выделений для версий до 25.9](/operations/allocation-profiling-old.md).

:::

## Сэмплирование выделений памяти \{#sampling-allocations\}

Если вы хотите выполнять сэмплирование и профилирование выделений памяти в `jemalloc`, необходимо запускать ClickHouse/Keeper с включённой настройкой конфигурации `jemalloc_enable_global_profiler`.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` будет выборочно отслеживать выделения памяти и сохранять эту информацию во внутренних структурах.

Вы также можете включить профилирование выделений памяти по каждому запросу с помощью настройки `jemalloc_enable_profiler`.

:::warning Предупреждение
Поскольку ClickHouse — приложение с интенсивным использованием выделения памяти, выборочное отслеживание jemalloc может привести к дополнительным накладным расходам и снижению производительности.
:::


## Хранение выборок jemalloc в `system.trace_log` \{#storing-jemalloc-samples-in-system-trace-log\}

Вы можете хранить все выборки jemalloc в `system.trace_log` с типом записи `JemallocSample`.
Чтобы включить это глобально, используйте параметр конфигурации `jemalloc_collect_global_profile_samples_in_trace_log`.

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning Предупреждение
Поскольку ClickHouse — приложение с большим количеством операций выделения памяти, сбор всех сэмплов в system.trace&#95;log может привести к значительной нагрузке.
:::

Вы также можете включить это для отдельного запроса, используя настройку `jemalloc_collect_profile_samples_in_trace_log`.


### Пример анализа использования памяти запросом с помощью `system.trace_log` \{#example-analyzing-memory-usage-trace-log\}

Сначала нам нужно выполнить запрос с включённым профилировщиком памяти jemalloc и собрать для него сэмплы в `system.trace_log`:

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
То же самое относится к `jemalloc_collect_global_profile_samples_in_trace_log` и `jemalloc_collect_profile_samples_in_trace_log`.
:::

Очистим `system.trace_log`:

```sql
SYSTEM FLUSH LOGS trace_log
```

и выполним к нему запрос, чтобы получить использование памяти нашим запросом в каждый момент времени:

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

Мы также можем найти момент времени, когда использование памяти было максимальным:

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

Мы можем использовать этот результат, чтобы увидеть, откуда происходило больше всего активных выделений памяти в тот момент времени:

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


## Сброс профилей кучи \{#flushing-heap-profiles\}

По умолчанию файл профиля кучи создаётся в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — глобальный порядковый номер для текущего профиля кучи.
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap` и подчиняется тем же правилам.

Вы можете попросить `jemalloc` сбросить текущий профиль, выполнив:

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

Другое местоположение можно задать, дополнив переменную окружения `MALLOC_CONF` опцией `prof_prefix`.
Например, если вы хотите генерировать профили в каталоге `/data`, где префиксом имени файла будет `my_current_profile`, вы можете запустить ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

К префиксу имени сгенерированного файла будут добавлены PID и порядковый номер.


## Анализ профилей кучи \{#analyzing-heap-profiles\}

После того как профили кучи были сгенерированы, их необходимо проанализировать.\
Для этого можно использовать инструмент `jemalloc` под названием [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). Его можно установить несколькими способами:

* С помощью системного менеджера пакетов
* Клонировать [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустить `autogen.sh` из корневого каталога. В результате в каталоге `bin` появится скрипт `jeprof`.

Существует множество различных форматов, которые можно получить из профиля кучи с помощью `jeprof`.
Вы можете запустить `jeprof --help`, чтобы получить информацию об использовании и о различных опциях, которые предоставляет этот инструмент.

### Символизированные профили кучи \{#symbolized-heap-profiles\}

Начиная с версии 26.1+ ClickHouse автоматически генерирует символизированные профили кучи при выполнении команды `SYSTEM JEMALLOC FLUSH PROFILE`.
Символизированный профиль (с расширением `.symbolized`) содержит встроенные символы функций и может анализироваться с помощью `jeprof` без необходимости в исполняемом файле ClickHouse.

Например, при выполнении:

```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

ClickHouse вернёт путь к символизированному профилю (например, `/tmp/jemalloc_clickhouse.12345.0.heap.symbolized`).

Затем вы можете напрямую проанализировать его с помощью `jeprof`:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --output_format [ > output_file]
```

:::note

**Бинарный файл не требуется**: При использовании символизированных профилей (файлы `.symbolized`) вам не нужно указывать путь к бинарнику ClickHouse для `jeprof`. Это значительно упрощает анализ профилей на разных машинах или после обновления бинарного файла.

:::

Если у вас есть старый несимволизированный профиль кучи и по-прежнему есть доступ к бинарному файлу ClickHouse, вы можете использовать традиционный подход:

```sh
jeprof path/to/clickhouse path/to/heap/profile --output_format [ > output_file]
```

:::note

Для несимволизированных профилей `jeprof` использует `addr2line` для генерации стек-трейсов, что может работать очень медленно.
В таком случае рекомендуется установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

В качестве альтернативы можно использовать `llvm-addr2line` — он работает не хуже (но обратите внимание, что `llvm-objdump` не совместим с `jeprof`).

После этого используйте его следующим образом: `jeprof --tools addr2line:/usr/bin/llvm-addr2line,nm:/usr/bin/llvm-nm,objdump:/usr/bin/objdump,c++filt:/usr/bin/llvm-cxxfilt`

:::

При сравнении двух профилей вы можете использовать аргумент `--base`:

```sh
jeprof --base /path/to/first.heap.symbolized /path/to/second.heap.symbolized --output_format [ > output_file]
```


### Примеры \{#examples\}

Использование символизированных профилей (рекомендуется):

* Создайте текстовый файл, в котором каждая процедура указана в отдельной строке:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --text > result.txt
```

* Сгенерируйте PDF-файл с графом вызовов:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --pdf > result.pdf
```

Использование несиволизированных профилей (требуется бинарник):

* Сгенерируйте текстовый файл, в котором каждая процедура указана в отдельной строке:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --text > result.txt
```

* Создайте PDF-файл с графом вызовов:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --pdf > result.pdf
```


### Построение flame-графа \{#generating-flame-graph\}

`jeprof` позволяет получать свернутые стеки вызовов для построения flame-графов.

Для этого следует использовать аргумент `--collapsed`:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --collapsed > result.collapsed
```

Или с профилем без символов:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --collapsed > result.collapsed
```

После этого вы можете использовать различные инструменты для визуализации свернутых стеков.

Самый популярный из них — [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Еще один полезный инструмент — [speedscope](https://www.speedscope.app/), который позволяет более интерактивно анализировать собранные стеки.


## Дополнительные параметры профилировщика \{#additional-options-for-profiler\}

У `jemalloc` есть множество параметров, относящихся к профилировщику. Ими можно управлять, изменяя переменную окружения `MALLOC_CONF`.
Например, интервал между выборками операций выделения памяти можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите создавать дамп профиля кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.  

Рекомендуется ознакомиться со [справочной страницей](https://jemalloc.net/jemalloc.3.html) `jemalloc` для получения полного перечня параметров.

## Другие ресурсы \{#other-resources\}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, множеством разных способов.

:::warning Warning
Важно понимать, что ни одна из этих метрик не синхронизирована с другими, и значения со временем могут расходиться.
:::

### Системная таблица `asynchronous_metrics` \{#system-table-asynchronous_metrics\}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[Справочник](/operations/system-tables/asynchronous_metrics)


### Системная таблица `jemalloc_bins` \{#system-table-jemalloc_bins\}

Содержит информацию о выделении памяти, выполненном через аллокатор jemalloc в разных классах размеров (bins), агрегированную по всем аренам.

[Справочник](/operations/system-tables/jemalloc_bins)

### Prometheus \{#prometheus\}

Все метрики, связанные с `jemalloc` из `asynchronous_metrics`, также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Справочник](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper \{#jmst-4lw-command-in-keeper\}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [базовую статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```
