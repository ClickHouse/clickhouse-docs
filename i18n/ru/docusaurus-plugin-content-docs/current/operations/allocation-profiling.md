---
description: 'Страница, посвященная профилированию выделения в ClickHouse'
sidebar_label: 'Профилирование выделения'
slug: /operations/allocation-profiling
title: 'Профилирование выделения'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделения

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве своего глобального диспетчера памяти, который включает инструменты для выборки и профилирования выделений.  
Чтобы сделать профилирование выделения более удобным, в ClickHouse/Keeper доступны команды `SYSTEM` наряду с командами 4LW.

## Выборка выделений и сброс профилей кучи {#sampling-allocations-and-flushing-heap-profiles}

Если мы хотим выбрать и профилировать выделения в `jemalloc`, нам нужно запустить ClickHouse/Keeper с включенным профилированием, используя переменную окружения `MALLOC_CONF`.

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выборочно выполнять выделения и хранить информацию внутри.

Мы можем сказать `jemalloc`, чтобы он сбросил текущий профиль, выполнив:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

По умолчанию файл профиля кучи будет создан в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — это глобальный порядковый номер для текущего профиля кучи.  
Для Keeper по умолчанию файл будет `/tmp/jemalloc_keeper._pid_._seqnum_.heap`, следуя тем же правилам.

Можно определить другое местоположение, добавив к переменной окружения `MALLOC_CONF` опцию `prof_prefix`.  
Например, если мы хотим создать профили в папке `/data`, где префикс для имени файла будет `my_current_profile`, мы можем запустить ClickHouse/Keeper со следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
Сгенерированный файл будет дополнен PID и номером последовательности.

## Анализ профилей кучи {#analyzing-heap-profiles}

После того как мы создали профили кучи, нам нужно их проанализировать.  
Для этого необходимо использовать инструмент `jemalloc`, называемый [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in), который можно установить несколькими способами:
- установив `jemalloc` с помощью менеджера пакетов системы
- клонируя [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустив autogen.sh из корневой папки, что обеспечит вам скрипт `jeprof` в папке `bin`

:::note
`jeprof` использует `addr2line` для генерации стек-трейсов, что может быть довольно медленным.  
Если это так, мы рекомендуем установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

Существует множество различных форматов для генерации из профиля кучи с использованием `jeprof`.  
Рекомендуем запустить `jeprof --help`, чтобы проверить использование и множество различных опций, которые предоставляет этот инструмент.

В целом, команда `jeprof` будет выглядеть так:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если мы хотим сравнить, какие выделения произошли между 2 профилями, мы можем установить базовый аргумент:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

Например:

- если мы хотим создать текстовый файл, где каждая процедура будет написана на отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- если мы хотим создать PDF-файл с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Генерация графика пламени {#generating-flame-graph}

`jeprof` позволяет нам генерировать сжатые стеки для создания графиков пламени.

Нам нужно использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого можно использовать множество различных инструментов для визуализации сжатых стеков.

Наиболее популярным будет [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Еще одним интересным инструментом является [speedscope](https://www.speedscope.app/), который позволяет вам анализировать собранные стеки более интерактивно.

## Управление профилировщиком выделений во время выполнения {#controlling-allocation-profiler-during-runtime}

Если ClickHouse/Keeper были запущены с включенным профилировщиком, они поддерживают дополнительные команды для отключения/включения профилирования выделений во время выполнения.  
С помощью этих команд проще профилировать только определенные интервалы.

Отключить профилировщик:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

Включить профилировщик:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

Также возможно контролировать начальное состояние профилировщика, установив опцию `prof_active`, которая включена по умолчанию.  
Например, если мы не хотим выборочно выполнять выделения во время запуска, а только после включения профилировщика, мы можем запустить ClickHouse/Keeper со следующей переменной окружения:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

и включить профилировщик позже.

## Дополнительные опции для профилировщика {#additional-options-for-profiler}

`jemalloc` имеет множество различных опций, связанных с профилировщиком, которые можно контролировать, изменяя переменную окружения `MALLOC_CONF`.  
Например, интервал между выборками выделений можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбрасывать профиль кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.

Рекомендуем проверить [справочную страницу](https://jemalloc.net/jemalloc.3.html) `jemalloc` для таких опций.

## Другие ресурсы {#other-resources}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, множеством различных способов.

:::warning Warning
Важно быть в курсе того, что ни одна из этих метрик не синхронизирована между собой и значения могут изменяться.
:::

### Системная таблица `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical
```

[Справка](/operations/system-tables/asynchronous_metrics)

### Системная таблица `jemalloc_bins` {#system-table-jemalloc_bins}

Содержит информацию о выделениях памяти, выполненных через диспетчер памяти jemalloc в различных классах размеров (bins), агрегированную со всех арен.

[Справка](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics`, также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Справка](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [базовые статистические данные по выделителю](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics).

Пример:
```sh
echo jmst | nc localhost 9181
```
