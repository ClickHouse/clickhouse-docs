---
slug: /operations/allocation-profiling
sidebar_label: 'Профилирование аллокации'
title: 'Профилирование аллокации'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование аллокации

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве своего глобального аллокатора, который предоставляет некоторые инструменты для выборки и профилирования аллокации.  
Для удобства профилирования аллокации предоставляются команды `SYSTEM` наряду с командами 4LW в Keeper.

## Выборка аллокаций и сброс профилей кучи {#sampling-allocations-and-flushing-heap-profiles}

Если мы хотим выбрать и профилировать аллокации в `jemalloc`, нам нужно запустить ClickHouse/Keeper с включенным профилированием, используя переменную окружения `MALLOC_CONF`.

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выборочно фиксировать аллокации и хранить информацию внутри.

Мы можем сказать `jemalloc` сбросить текущий профиль, выполнив:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

По умолчанию файл профиля кучи будет сгенерирован в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — это глобальный последовательный номер для текущего профиля кучи.  
Для Keeper файл по умолчанию — это `/tmp/jemalloc_keeper._pid_._seqnum_.heap`, с соблюдением тех же правил.

Можно определить другое местоположение, добавив переменную окружения `MALLOC_CONF` с опцией `prof_prefix`.  
Например, если мы хотим генерировать профили в папке `/data`, где префиксом для имени файла будет `my_current_profile`, мы можем запустить ClickHouse/Keeper с следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
Сгенерированный файл будет дополнен идентификатором процесса и номером последовательности.

## Анализ профилей кучи {#analyzing-heap-profiles}

После того, как мы сгенерировали профили кучи, нам нужно их проанализировать.  
Для этого мы должны использовать инструмент `jemalloc`, называемый [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in), который можно установить несколькими способами:
- установив `jemalloc` с помощью пакетного менеджера системы
- клонируя [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустив autogen.sh из корневой папки, который предоставит вам скрипт `jeprof` внутри папки `bin`

:::note
`jeprof` использует `addr2line` для генерации стек-трейсов, что может быть очень медленно.  
Если это так, мы рекомендуем установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

Существует множество различных форматов, которые можно сгенерировать из профиля кучи с использованием `jeprof`.
Рекомендуем запустить `jeprof --help`, чтобы проверить использование и множество различных параметров, которые предоставляет инструмент.

В общем, команда `jeprof` будет выглядеть так:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если мы хотим сравнить, какие аллокации произошли между 2 профилями, мы можем установить базовый аргумент:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

Например:

- если мы хотим сгенерировать текстовый файл, в котором каждая процедура записана на отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- если мы хотим сгенерировать PDF файл с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Генерация графика горения {#generating-flame-graph}

`jeprof` позволяет нам генерировать сведенные стеки для построения графиков горения.

Мы должны использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого мы можем использовать множество разных инструментов для визуализации сведенных стеков.

Наиболее популярным является [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="График аллокации" --width 2400 > result.svg
```

Еще один интересный инструмент — [speedscope](https://www.speedscope.app/), который позволяет вам анализировать собранные стеки более интерактивным способом.

## Управление профайлером аллокации во время выполнения {#controlling-allocation-profiler-during-runtime}

Если ClickHouse/Keeper были запущены с включенным профайлером, они поддерживают дополнительные команды для отключения/включения профилирования аллокации во время выполнения.  
Используя эти команды, проще профилировать только конкретные интервалы.

Отключить профайлер:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

Включить профайлер:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

Также возможно контролировать начальное состояние профайлера, установив опцию `prof_active`, которая по умолчанию включена.  
Например, если мы не хотим выбирать аллокации во время запуска, а только после того, как включим профайлер, мы можем запустить ClickHouse/Keeper с следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

и включить профайлер позже.

## Дополнительные параметры для профайлера {#additional-options-for-profiler}

`jemalloc` имеет множество различных доступных опций, связанных с профайлером, которые можно контролировать, изменяя переменную окружения `MALLOC_CONF`.  
Например, интервал между выборками аллокаций можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбрасывать профиль кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.

Рекомендуем проверить [страницу справки](https://jemalloc.net/jemalloc.3.html) `jemalloc` для таких опций.

## Другие ресурсы {#other-resources}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, различными способами.

:::warning Warning
Важно понимать, что ни одна из этих метрик не синхронизирована между собой, и значения могут изменяться.
:::

### Системная таблица `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical
```

[Ссылка](/operations/system-tables/asynchronous_metrics)

### Системная таблица `jemalloc_bins` {#system-table-jemalloc_bins}

Содержит информацию о аллокациях памяти, выполненных через аллокатор jemalloc в различных классах размеров (bins), агрегированных из всех арен.

[Ссылка](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc` из `asynchronous_metrics`, также доступны через Prometheus endpoint как в ClickHouse, так и в Keeper.

[Ссылка](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [основную статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics).

Пример:
```sh
echo jmst | nc localhost 9181
```
