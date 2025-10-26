---
'description': 'Страница, содержащая информацию о профилировании выделения в ClickHouse'
'sidebar_label': 'Профилирование выделения для версий до 25.9'
'slug': '/operations/allocation-profiling-old'
'title': 'Профилирование выделения для версий до 25.9'
'doc_type': 'reference'
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Профилирование выделения памяти для версий до 25.9

ClickHouse использует [jemalloc](https://github.com/jemalloc/jemalloc) в качестве глобального драйвера памяти. Jemalloc предоставляет инструменты для выборки и профилирования выделения памяти.  
Чтобы сделать профилирование выделения памяти более удобным, предоставляются команды `SYSTEM`, а также команды четырехбуквенных слов (4LW) в Keeper.

## Выборка выделений и сброс профилей кучи {#sampling-allocations-and-flushing-heap-profiles}

Если вы хотите осуществить выборку и профилирование выделений в `jemalloc`, вам нужно запустить ClickHouse/Keeper с включенным профилированием, используя переменную окружения `MALLOC_CONF`:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` будет выборочно фиксировать выделения и хранить информацию внутри себя.

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

По умолчанию файл профиля кучи будет сгенерирован в `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`, где `_pid_` — это PID ClickHouse, а `_seqnum_` — глобальный номер последовательности для текущего профиля кучи.  
Для Keeper файл по умолчанию — `/tmp/jemalloc_keeper._pid_._seqnum_.heap` и следует тем же правилам.

Можно определить другое местоположение, добавив к переменной окружения `MALLOC_CONF` опцию `prof_prefix`.  
Например, если вы хотите генерировать профили в папке `/data`, где префикс имени файла будет `my_current_profile`, вы можете запустить ClickHouse/Keeper с следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

Сгенерированный файл будет дополнен префиксом PID и номером последовательности.

## Анализ профилей кучи {#analyzing-heap-profiles}

После того как профили кучи были сгенерированы, их нужно проанализировать.  
Для этого можно использовать инструмент `jemalloc`, называемый [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). Его можно установить несколькими способами:
- Используя менеджер пакетов вашей системы
- Клонируя [репозиторий jemalloc](https://github.com/jemalloc/jemalloc) и запустив `autogen.sh` из корневой папки. Это предоставит вам скрипт `jeprof` в папке `bin`

:::note
`jeprof` использует `addr2line` для генерации стек-трассировок, что может быть довольно медленно.  
В таком случае рекомендуется установить [альтернативную реализацию](https://github.com/gimli-rs/addr2line) инструмента.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

Существует множество различных форматов, которые можно сгенерировать из профиля кучи с помощью `jeprof`.
Рекомендуется запустить `jeprof --help` для получения информации об использовании и различных опциях, предоставляемых инструментом.

В общем, команда `jeprof` используется следующим образом:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

Если вы хотите сравнить, какие выделения произошли между двумя профилями, вы можете установить аргумент `base`:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### Примеры {#examples}

- если вы хотите сгенерировать текстовый файл с каждой процедурой, записанной на отдельной строке:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- если вы хотите сгенерировать PDF файл с графом вызовов:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### Генерация графика пламен {#generating-flame-graph}

`jeprof` позволяет вам генерировать сжатые стеки для построения графиков пламен.

Вам нужно использовать аргумент `--collapsed`:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

После этого вы можете использовать множество различных инструментов для визуализации сжатых стеков.

Самым популярным является [FlameGraph](https://github.com/brendangregg/FlameGraph), который содержит скрипт под названием `flamegraph.pl`:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

Другим интересным инструментом является [speedscope](https://www.speedscope.app/), который позволяет вам более интерактивно анализировать собранные стеки.

## Управление профилировщиком выделения во время выполнения {#controlling-allocation-profiler-during-runtime}

Если ClickHouse/Keeper запущен с включенным профилировщиком, поддерживаются дополнительные команды для отключения/включения профилирования выделения во время выполнения.
Используя эти команды, легче профилировать только определенные интервалы.

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

Также возможно контролировать начальное состояние профилировщика, установив опцию `prof_active`, которая включена по умолчанию.  
Например, если вы не хотите осуществлять выборку выделений во время старта, а только после, вы можете включить профилировщик. Вы можете запустить ClickHouse/Keeper с следующей переменной окружения:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

Профилировщик можно включить позже.

## Дополнительные опции для профилировщика {#additional-options-for-profiler}

`jemalloc` имеет множество различных опций, связанных с профилировщиком. Они могут контролироваться путем изменения переменной окружения `MALLOC_CONF`.
Например, интервал между выборками выделений можно контролировать с помощью `lg_prof_sample`.  
Если вы хотите сбросить профиль кучи каждые N байт, вы можете включить это, используя `lg_prof_interval`.

Рекомендуется ознакомиться с [страницей ссылок](https://jemalloc.net/jemalloc.3.html) `jemalloc` для полного списка опций.

## Другие ресурсы {#other-resources}

ClickHouse/Keeper представляют метрики, связанные с `jemalloc`, различными способами.

:::warning Warning
Важно помнить, что ни одна из этих метрик не синхронизирована между собой, и значения могут колебаться.
:::

### Системная таблица `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[Ссылка](/operations/system-tables/asynchronous_metrics)

### Системная таблица `jemalloc_bins` {#system-table-jemalloc_bins}

Содержит информацию о выделении памяти, выполненном через аллокатор jemalloc в различных классах размеров (bins), агрегированных из всех арен.

[Ссылка](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

Все метрики, связанные с `jemalloc`, из `asynchronous_metrics` также доступны через конечную точку Prometheus как в ClickHouse, так и в Keeper.

[Ссылка](/operations/server-configuration-parameters/settings#prometheus)

### Команда `jmst` 4LW в Keeper {#jmst-4lw-command-in-keeper}

Keeper поддерживает команду `jmst` 4LW, которая возвращает [основные статистические данные аллокатора](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```