---
description: 'Страница, посвящённая профилированию выделения памяти в ClickHouse'
sidebar_label: 'Профилирование выделения памяти в версиях до 25.9'
slug: /operations/allocation-profiling-old
title: 'Профилирование выделения памяти в версиях до 25.9'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделения памяти для версий до 25.9

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве глобального аллокатора памяти. Jemalloc предоставляет инструменты для семплирования и профилирования выделений памяти.  
Для упрощения профилирования выделения памяти предусмотрены команды `SYSTEM`, а также четырёхбуквенные команды (4LW) в Keeper.



## Выборка выделений памяти и сброс профилей кучи {#sampling-allocations-and-flushing-heap-profiles}

Если вы хотите выполнить выборку и профилирование выделений памяти в `jemalloc`, необходимо запустить ClickHouse/Keeper с включенным профилированием, используя переменную окружения `MALLOC_CONF`:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выполнять выборку выделений памяти и сохранять информацию внутренне.

Вы можете указать `jemalloc` сбросить текущий профиль, выполнив:

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

По умолчанию файл профиля кучи будет создан в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID процесса ClickHouse, а `_seqnum_` — глобальный порядковый номер текущего профиля кучи.  
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap`, и применяются те же правила.

Другое расположение можно задать, добавив к переменной окружения `MALLOC_CONF` параметр `prof_prefix`.  
Например, если вы хотите создавать профили в папке `/data` с префиксом имени файла `my_current_profile`, можно запустить ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

К созданному файлу будут добавлены префикс, PID и порядковый номер.


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

- для создания текстового файла с каждой процедурой на отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- для создания PDF-файла с графом вызовов:

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


## Управление профилировщиком выделения памяти во время работы {#controlling-allocation-profiler-during-runtime}

Если ClickHouse/Keeper запущен с включенным профилировщиком, поддерживаются дополнительные команды для отключения/включения профилирования выделения памяти во время работы.
Использование этих команд позволяет профилировать только определенные интервалы времени.

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

Также можно управлять начальным состоянием профилировщика, установив параметр `prof_active`, который по умолчанию включен.  
Например, если вы не хотите отслеживать выделения памяти во время запуска, а только после него, можно включить профилировщик позже. Для этого запустите ClickHouse/Keeper со следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

Профилировщик можно будет включить позже.


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

[Справочник](/operations/system-tables/asynchronous_metrics)

### Системная таблица `jemalloc_bins` {#system-table-jemalloc_bins}

Содержит информацию о выделениях памяти, выполненных через аллокатор jemalloc в различных классах размеров (bins), агрегированную из всех арен.

[Справочник](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics` также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Справочник](/operations/server-configuration-parameters/settings#prometheus)

### Команда 4LW `jmst` в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду 4LW `jmst`, которая возвращает [базовую статистику аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```
