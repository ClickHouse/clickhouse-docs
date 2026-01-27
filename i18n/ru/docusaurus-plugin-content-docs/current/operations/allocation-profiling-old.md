---
description: 'Страница о профилировании выделения памяти в ClickHouse'
sidebar_label: 'Профилирование выделения памяти для версий до 25.9'
slug: /operations/allocation-profiling-old
title: 'Профилирование выделения памяти для версий до 25.9'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Профилирование выделения памяти для версий до 25.9 \{#allocation-profiling-for-versions-before-259\}

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве глобального аллокатора. Jemalloc предоставляет инструменты для выборочного отслеживания и профилирования выделения памяти.  
Для удобства профилирования выделения памяти предусмотрены команды `SYSTEM`, а также четырёхбуквенные (4LW) команды в Keeper.

## Сэмплирование выделений памяти и сброс профилей кучи \{#sampling-allocations-and-flushing-heap-profiles\}

Если вы хотите выполнять сэмплирование и профилирование выделений памяти в `jemalloc`, необходимо запустить ClickHouse/Keeper с включённым профилированием, задав переменную окружения `MALLOC_CONF`:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выборочно отслеживать выделения памяти и сохранять информацию во внутренних структурах.

Вы можете принудительно сбросить текущий профиль `jemalloc`, выполнив:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

По умолчанию файл профиля кучи будет создан в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — глобальный порядковый номер текущего профиля кучи.\
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap` и подчиняется тем же правилам.

Другое место хранения может быть задано путём добавления к переменной окружения `MALLOC_CONF` опции `prof_prefix`.\
Например, если вы хотите генерировать профили в каталоге `/data`, при этом префиксом имени файла будет `my_current_profile`, вы можете запускать ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

К имени сгенерированного файла будет добавлен префикс PID и порядковый номер.

## Анализ профилей кучи \{#analyzing-heap-profiles\}

После генерации профилей кучи их необходимо проанализировать.\
Для этого можно использовать инструмент `jemalloc` под названием [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). Его можно установить несколькими способами:

* С помощью пакетного менеджера операционной системы
* Клонировав [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и выполнив `autogen.sh` в корневом каталоге. В результате в каталоге `bin` появится скрипт `jeprof`

:::note
`jeprof` использует `addr2line` для генерации стек-трейсов, что может быть очень медленным.\
В таком случае рекомендуется установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) этого инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

:::

Существует множество форматов вывода, которые можно получить из профиля кучи с помощью `jeprof`.
Рекомендуется запустить `jeprof --help`, чтобы получить информацию об использовании и различных опциях, которые предоставляет этот инструмент.

В общем случае команда `jeprof` используется следующим образом:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если вы хотите сравнить, какие выделения памяти произошли между двумя профилями, задайте аргумент `base`:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### Примеры \{#examples\}

* если вы хотите создать текстовый файл, в котором каждая процедура записана в отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

* если вы хотите создать PDF-файл с графом вызовов:

```sh
jeprof путь/к/исполняемому/файлу путь/к/профилю/heap --pdf > result.pdf
```

### Генерация flame-графа \{#generating-flame-graph\}

`jeprof` позволяет создавать свернутые стеки для построения flame-графов.

Необходимо использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

Затем вы можете использовать множество инструментов для визуализации свернутых стеков.

Самый популярный — [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Еще один полезный инструмент — [speedscope](https://www.speedscope.app/), который позволяет анализировать собранные стеки в более интерактивном режиме.

## Управление профилировщиком выделений во время работы \{#controlling-allocation-profiler-during-runtime\}

Если ClickHouse/Keeper запущен с включённым профилировщиком, становятся доступны дополнительные команды для отключения и включения профилирования выделений во время работы.
С их помощью проще профилировать только отдельные интервалы.

Чтобы отключить профилировщик:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC DISABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmdp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

Чтобы включить профилировщик:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC ENABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmep | nc localhost 9181
    ```
  </TabItem>
</Tabs>

Также можно управлять начальным состоянием профилировщика, установив опцию `prof_active`, которая по умолчанию включена.\
Например, если вы не хотите сэмплировать выделения памяти во время запуска, а только после, вы можете включить профилировщик позже. Для этого запустите ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

Профилировщик можно будет включить позже.

## Дополнительные параметры профилировщика \{#additional-options-for-profiler\}

В `jemalloc` доступно множество различных параметров, связанных с профилировщиком. Ими можно управлять через переменную окружения `MALLOC_CONF`.
Например, интервал между выборками выделений памяти можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбрасывать профиль кучи каждые N байт, вы можете включить это с помощью `lg_prof_interval`.  

Для получения полного списка параметров рекомендуется ознакомиться со [справочной страницей](https://jemalloc.net/jemalloc.3.html) `jemalloc`.

## Другие ресурсы \{#other-resources\}

ClickHouse/Keeper предоставляют метрики, связанные с `jemalloc`, множеством разных способов.

:::warning Предупреждение
Важно понимать, что ни одна из этих метрик не синхронизирована с другими, и значения могут расходиться.
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

Содержит информацию о выделении памяти с помощью аллокатора `jemalloc` по различным классам размеров (bins), агрегированную по всем аренам.

[Справочник](/operations/system-tables/jemalloc_bins)

### Prometheus \{#prometheus\}

Все метрики, связанные с `jemalloc` и доступные в `asynchronous_metrics`, также публикуются через endpoint Prometheus как в ClickHouse, так и в Keeper.

[Справочник](/operations/server-configuration-parameters/settings#prometheus)

### 4LW-команда `jmst` в Keeper \{#jmst-4lw-command-in-keeper\}

Keeper поддерживает 4LW-команду `jmst`, которая возвращает [базовую статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```
