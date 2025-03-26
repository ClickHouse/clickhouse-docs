---
description: 'Страница, посвященная профилированию аллокаций в ClickHouse'
sidebar_label: 'Профилирование аллокаций'
slug: /operations/allocation-profiling
title: 'Профилирование аллокаций'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование аллокаций

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве своего глобального аллокатора, который поставляется с некоторыми инструментами для выборки и профилирования аллокаций.  
Чтобы сделать профилирование аллокаций более удобным, предоставляются команды `SYSTEM` вместе с командами 4LW в Keeper.

## Выборка аллокаций и сброс профилей кучи {#sampling-allocations-and-flushing-heap-profiles}

Если мы хотим выбрать и профилировать аллокации в `jemalloc`, нам нужно запустить ClickHouse/Keeper с включенным профилированием, используя переменную окружения `MALLOC_CONF`.

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выбирать аллокации и хранить информацию внутренне.

Мы можем заставить `jemalloc` сбросить текущий профиль, выполнив:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

По умолчанию файл профиля кучи будет сгенерирован в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` - это PID ClickHouse, а `_seqnum_` - это глобальный последовательный номер для текущего профиля кучи.  
Для Keeper файл по умолчанию - `/tmp/jemalloc_keeper._pid_._seqnum_.heap`, следуя тем же правилам.

Другую локацию можно определить, добавив к переменной окружения `MALLOC_CONF` опцию `prof_prefix`.  
Например, если мы хотим генерировать профили в папке `/data`, где префиксом для имени файла будет `my_current_profile`, мы можем запустить ClickHouse/Keeper с следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
Сгенерированный файл будет дополняться префиксом PID и номером последовательности.

## Анализ профилей кучи {#analyzing-heap-profiles}

После того как мы сгенерировали профили кучи, нам нужно их проанализировать.  
Для этого нам нужно использовать инструмент `jemalloc`, называемый [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in), который можно установить несколькими способами:
- установив `jemalloc` с помощью менеджера пакетов системы
- clone [jemalloc repo](https://github.com/jemalloc/jemalloc) и запустив autogen.sh из корневой папки, что обеспечит вас скриптом `jeprof` внутри папки `bin`

:::note
`jeprof` использует `addr2line` для генерации трассировок стека, что может быть действительно медленным.  
Если это так, мы рекомендуем установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

Существует много различных форматов, которые можно сгенерировать из профиля кучи с помощью `jeprof`.
Мы рекомендуем запустить `jeprof --help`, чтобы проверить использование и множество различных опций, которые предоставляет инструмент.

В общем, команда `jeprof` будет выглядеть так:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если мы хотим сравнить, какие аллокации произошли между 2 профилями, мы можем установить базовый аргумент:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

Например:

- если мы хотим сгенерировать текстовый файл с каждой процедурой, записанной по строкам:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- если мы хотим сгенерировать PDF файл с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Генерация огненной графики {#generating-flame-graph}

`jeprof` позволяет нам генерировать сжатые стеки для построения огненных графиков.

Нам нужно использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого мы можем использовать множество различных инструментов для визуализации сжатых стеков.

Наиболее популярным является [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Еще одним интересным инструментом является [speedscope](https://www.speedscope.app/), который позволяет вам более интерактивно анализировать собранные стеки.

## Управление профайлером аллокаций во время выполнения {#controlling-allocation-profiler-during-runtime}

Если ClickHouse/Keeper были запущены с включенным профайлером, они поддерживают дополнительные команды для отключения / включения профилирования аллокаций во время выполнения.
С помощью этих команд легче профилировать только определенные интервалы.

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

Также возможно управлять начальным состоянием профайлера, устанавливая опцию `prof_active`, которая по умолчанию включена.  
Например, если мы не хотим выбирать аллокации во время запуска, а только после того, как мы активируем профайлер, мы можем запустить ClickHouse/Keeper с следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

и включить профайлер позже.

## Дополнительные параметры для профайлера {#additional-options-for-profiler}

`jemalloc` имеет много различных опций, доступных, связанных с профилером, которые можно контролировать, изменяя переменную окружения `MALLOC_CONF`.
Например, интервал между выборками аллокаций можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбрасывать профиль кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.  

Мы рекомендуем проверить [справочную страницу](https://jemalloc.net/jemalloc.3.html) `jemalloc` для таких опций.

## Другие ресурсы {#other-resources}

ClickHouse/Keeper отображают метрики, связанные с `jemalloc`, во многих разных форматах.

:::warning Warning
Важно понимать, что ни одна из этих метрик не синхронизирована друг с другом, и значения могут колебаться.
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

Содержит информацию о аллокациях памяти, выполненных через аллокатор jemalloc в разных классах размеров (бин, bins), агрегированных из всех арен.

[Ссылка](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics` также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Ссылка](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [основную статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics).

Пример:
```sh
echo jmst | nc localhost 9181
```
