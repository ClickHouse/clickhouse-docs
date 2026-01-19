---
description: 'Документация по инструменту выборочного профилирования запросов в ClickHouse'
sidebar_label: 'Профилирование запросов'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'Профилировщик запросов с семплированием'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Профилировщик запросов с выборочным сбором данных \{#sampling-query-profiler\}

ClickHouse запускает профилировщик с выборочным сбором данных, который позволяет анализировать выполнение запросов. С помощью профилировщика вы можете найти участки исходного кода, которые использовались чаще всего во время выполнения запроса. Вы можете отслеживать затраченное процессорное время (CPU time) и реальное время (wall-clock time), включая периоды простоя.

Профилировщик запросов автоматически включен в ClickHouse Cloud, и вы можете выполнить пример запроса следующим образом:

:::note Если вы выполняете следующий запрос в ClickHouse Cloud, обязательно измените `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбирать данные со всех узлов кластера
:::

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c' AND trace_type = 'CPU' AND event_date = today()
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

В самостоятельных (self-managed) развертываниях, чтобы использовать профилировщик запросов:

* Настройте раздел [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) конфигурации сервера.

  Этот раздел настраивает системную таблицу [trace&#95;log](/operations/system-tables/trace_log), в которой содержатся результаты работы профилировщика. Она настроена по умолчанию. Помните, что данные в этой таблице корректны только для работающего сервера. После перезапуска сервера ClickHouse не очищает таблицу, и все сохранённые виртуальные адреса памяти могут стать недействительными.

* Настройте параметры [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра можно использовать одновременно.

  Эти параметры позволяют настроить таймеры профилировщика. Поскольку это сессионные настройки, вы можете задать разную частоту семплирования для всего сервера, отдельных пользователей или профилей пользователей, для вашей интерактивной сессии и для каждого отдельного запроса.

Частота семплирования по умолчанию — один сэмпл в секунду, при этом включены оба таймера — CPU и реального времени. Эта частота позволяет собрать достаточно информации о кластере ClickHouse. Одновременно при такой частоте работы профилировщик не влияет на производительность сервера ClickHouse. Если вам нужно профилировать каждый отдельный запрос, попробуйте использовать более высокую частоту семплирования.

Чтобы проанализировать системную таблицу `trace_log`:

* Установите пакет `clickhouse-common-static-dbg`. См. раздел [Install from DEB Packages](../../getting-started/install/install.mdx).

* Разрешите функции интроспекции с помощью настройки [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions).

  В целях безопасности функции интроспекции по умолчанию отключены.

* Используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle` ([introspection functions](../../sql-reference/functions/introspection.md)), чтобы получить имена функций и их позиции в коде ClickHouse. Чтобы получить профиль для какого-либо запроса, вам нужно агрегировать данные из таблицы `trace_log`. Вы можете агрегировать данные по отдельным функциям или по целым стекам трассировки.

Если вам нужно визуализировать информацию из `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).

## Пример \{#example\}

В этом примере мы:

* Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.
* Агрегируем по стек-трейсу.
* Используя функции интроспекции, получим отчет о следующем:

  * Именах символов и соответствующих им функциях исходного кода.
  * Местоположениях этих функций в исходном коде.

{/* */ }

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
