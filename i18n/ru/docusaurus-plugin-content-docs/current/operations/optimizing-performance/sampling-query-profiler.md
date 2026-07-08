---
description: 'Документация по инструменту выборочного профилирования запросов в ClickHouse'
sidebar_label: 'Профилирование запросов'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'Выборочный профилировщик запросов'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Выборочный профилировщик запросов \{#sampling-query-profiler\}

В ClickHouse работает выборочный профилировщик, который позволяет анализировать выполнение запросов.
С помощью профилировщика можно определить процедуры исходного кода, которые чаще всего используются при выполнении запроса.
Можно отслеживать затраты процессорного и реального времени, включая время бездействия.

Профилировщик запросов автоматически включен в ClickHouse Cloud.
Следующий пример запроса находит наиболее частые стеки вызовов для профилируемого запроса с расшифрованными именами функций и расположением в исходном коде:

:::tip
Замените значение `query_id` на идентификатор запроса, который нужно профилировать.
:::

<Tabs groupId="deployment">
  <TabItem value="cloud" label="ClickHouse Cloud">
    В ClickHouse Cloud идентификатор запроса можно получить, нажав **&quot;...&quot;** в крайней правой части панели над таблицей результатов запроса (рядом с переключателем таблица/чарт). Откроется контекстное меню, в котором можно нажать **&quot;Copy query ID&quot;**.

    Используйте `clusterAllReplicas(default, system.trace_log)`, чтобы выполнить выборку со всех узлов кластера:

    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM clusterAllReplicas(default, system.trace_log)
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>

  <TabItem value="self-managed" label="Самоуправляемое">
    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>
</Tabs>

## Использование профилировщика запросов в самоуправляемых развертываниях \{#self-managed-query-profiler\}

Чтобы использовать профилировщик запросов в самоуправляемых развертываниях, выполните следующие шаги:

<VerticalStepper headerLevel="h3">
  ### Установите ClickHouse с отладочной информацией \{#debug-info\}

  Установите пакет `clickhouse-common-static-dbg`:

  1. Следуйте инструкциям из шага [&quot;Настройте Debian-репозиторий&quot;](/install/debian_ubuntu#setup-the-debian-repository)
  2. Выполните `sudo apt-get install clickhouse-server clickhouse-client clickhouse-common-static-dbg`, чтобы установить бинарные файлы ClickHouse, скомпилированные с отладочной информацией
  3. Выполните `sudo service clickhouse-server start`, чтобы запустить сервер
  4. Выполните `clickhouse-client`. Отладочные символы из пакета `clickhouse-common-static-dbg` будут автоматически подхвачены сервером — ничего дополнительно включать не нужно

  ### Проверьте конфигурацию сервера \{#server-config\}

  Убедитесь, что раздел [`trace_log`](../../operations/server-configuration-parameters/settings.md#trace_log) в вашем [файле конфигурации сервера](/operations/configuration-files) настроен. По умолчанию он включен:

  ```xml
  <!-- Журнал трассировки. Хранит трассировки стека, собранные профилировщиками запросов.
       См. настройки query_profiler_real_time_period_ns и query_profiler_cpu_time_period_ns. -->
  <trace_log>
      <database>system</database>
      <table>trace_log</table>

      <partition_by>toYYYYMM(event_date)</partition_by>
      <flush_interval_milliseconds>7500</flush_interval_milliseconds>
      <max_size_rows>1048576</max_size_rows>
      <reserved_size_rows>8192</reserved_size_rows>
      <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
      <!-- Указывает, следует ли сбрасывать журналы на диск в случае сбоя -->
      <flush_on_crash>false</flush_on_crash>
      <symbolize>true</symbolize>
  </trace_log>
  ```

  Этот раздел настраивает системную таблицу [trace&#95;log](/operations/system-tables/trace_log), содержащую результаты работы профилировщика.
  Помните, что данные в этой таблице корректны только для работающего сервера.
  После перезапуска сервера ClickHouse не очищает таблицу, и все сохраненные адреса виртуальной памяти могут стать недействительными.

  ### Настройте таймеры профилирования \{#configure-profile-timers\}

  Настройте параметры [`query_profiler_cpu_time_period_ns`](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [`query_profiler_real_time_period_ns`](../../operations/settings/settings.md#query_profiler_real_time_period_ns).
  Оба параметра можно использовать одновременно.

  Эти параметры позволяют настроить таймеры профилировщика.
  Поскольку это параметры сеанса, можно задать разную частоту выборки для всего сервера, отдельных пользователей или профилей пользователей, для интерактивного сеанса и для каждого отдельного запроса.

  Частота выборки по умолчанию — один сэмпл в секунду, при этом включены таймеры CPU и реального времени.
  Такая частота позволяет собирать достаточно информации о вашем кластере ClickHouse, не влияя на производительность сервера.
  Если нужно профилировать каждый отдельный запрос, используйте более высокую частоту выборки.

  ### Проанализируйте системную таблицу `trace_log` \{#analyze-trace-log-system-table\}

  Чтобы анализировать системную таблицу `trace_log`, разрешите функции интроспекции с помощью настройки [`allow_introspection_functions`](../../operations/settings/settings.md#allow_introspection_functions):

  ```sql
  SET allow_introspection_functions=1
  ```

  :::note
  Из соображений безопасности функции интроспекции по умолчанию отключены
  :::

  Используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle` из [функций интроспекции](../../sql-reference/functions/introspection.md), чтобы получить имена функций и их позиции в коде ClickHouse.
  Чтобы получить профиль для некоторого запроса, нужно агрегировать данные из таблицы `trace_log`.
  Можно агрегировать данные по отдельным функциям или по полным трассировкам стека.

  :::tip
  Если вам нужно визуализировать информацию из `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://www.speedscope.app).
  :::
</VerticalStepper>

## Построение флеймграф с помощью функции `flameGraph` \{#flamegraph\}

ClickHouse предоставляет [`flameGraph`](/sql-reference/aggregate-functions/reference/flame_graph) — агрегатную функцию, которая строит флеймграф непосредственно по стекам вызовов, хранящимся в `trace_log`.
Результат представляет собой массив строк в формате, совместимом с [flamegraph.pl](https://github.com/brendangregg/FlameGraph).

**Синтаксис:**

```sql
flameGraph(traces, [size = 1], [ptr = 0])
```

**Аргументы:**

* `traces` — стек вызовов. [`Array(UInt64)`](/sql-reference/data-types/array).
* `size` — размер выделения памяти при профилировании памяти. [`Int64`](/sql-reference/data-types/int-uint).
* `ptr` — адрес выделенной памяти. [`UInt64`](/sql-reference/data-types/int-uint).

Если `ptr` не равен нулю, `flameGraph` сопоставляет выделения (`size > 0`) и освобождения (`size < 0`) с одинаковыми размером и адресом.
Показываются только те выделения, которые не были освобождены.
Освобождения, для которых не найдено соответствия, игнорируются.

### Флеймграф CPU \{#cpu-flame-graph\}

:::note
Для выполнения приведённых ниже запросов необходимо, чтобы у вас был установлен [flamegraph.pl](https://github.com/brendangregg/FlameGraph).

Для этого выполните:

```bash
git clone https://github.com/brendangregg/FlameGraph
# Then use it as:
# ~/FlameGraph/flamegraph.pl
```

Замените `flamegraph.pl` в следующих запросах на путь к `flamegraph.pl` на вашей машине
:::

```sql
SET query_profiler_cpu_time_period_ns = 10000000;
```

Выполните запрос, затем постройте флеймграф:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(arrayReverse(trace)))
        FROM system.trace_log
        WHERE trace_type = 'CPU' AND query_id = '<query_id>'" \
    | flamegraph.pl > flame_cpu.svg
```

### Флеймграф памяти — все выделения \{#memory-flame-graph-all\}

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

Выполните запрос, затем постройте флейм-граф:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### Флейм-граф памяти — неосвобождённые выделения \{#memory-flame-graph-unfreed\}

В этом варианте выделения памяти сопоставляются с освобождениями по указателю, и отображается только память, которая не была освобождена во время выполнения запроса.

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1,
    use_uncompressed_cache = 1,
    merge_tree_max_rows_to_use_cache = 100000000000,
    merge_tree_max_bytes_to_use_cache = 1000000000000;
```

Выполните следующий запрос, чтобы построить флейм-граф:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_unfreed.svg
```

### Флеймграф памяти — активные выделения в определённый момент времени \{#memory-flame-graph-time-point\}

Этот подход позволяет определить пиковое потребление памяти и визуализировать, что именно было выделено в этот момент.

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

#### Проследите использование памяти во времени \{#find-memory-usage-over-time\}

```sql
SELECT
    event_time,
    formatReadableSize(max(s)) AS m
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
)
GROUP BY event_time
ORDER BY event_time;
```

#### Найдите момент с максимальным использованием памяти \{#find-time-point-maximum-memory-usage\}

```sql
SELECT
    argMax(event_time, s),
    max(s)
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
);
```

#### Постройте флеймграф активных аллокаций для этого момента времени \{#build-flame-graph\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time <= '<time_point>'
            ORDER BY event_time
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

#### Постройте флеймграф освобождений памяти после этого момента (чтобы понять, что было освобождено позже) \{#build-flame-graph-deallocations\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, -size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time > '<time_point>'
            ORDER BY event_time DESC
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```

## Пример \{#example\}

Приведенный ниже фрагмент кода:

* Фильтрует данные `trace_log` по идентификатору запроса и текущей дате.
* Агрегирует по стек-трейсу.
* Использует функции интроспекции, чтобы получить отчет о следующем:
  * Именах символов и соответствующих им функциях исходного кода.
  * Местоположениях этих функций в исходном коде.

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = '<query_id>') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
