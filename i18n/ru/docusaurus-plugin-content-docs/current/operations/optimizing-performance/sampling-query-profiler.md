---
slug: '/operations/optimizing-performance/sampling-query-profiler'
sidebar_label: 'Профайлинг запросов'
sidebar_position: 54
description: 'Документация для инструмента профайлера запросов выборки в ClickHouse'
title: 'Профайлер запросов с выборкой'
doc_type: reference
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Профайлер выборки запросов

ClickHouse запускает профайлер выборки, который позволяет анализировать выполнение запросов. С помощью профайлера вы можете найти рутинные функции исходного кода, которые использовались наиболее часто во время выполнения запроса. Вы можете отслеживать затраченные времена CPU и время реального замера, включая время простоя.

Профайлер запросов автоматически включен в ClickHouse Cloud, и вы можете запустить выборочный запрос следующим образом:

:::note Если вы запускаете следующий запрос в ClickHouse Cloud, убедитесь, что изменили `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбрать все узлы кластера.
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

В самоуправляемых установках, чтобы использовать профайлер запросов:

- Настройте раздел [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) конфигурации сервера.

    Этот раздел настраивает системную таблицу [trace_log](/operations/system-tables/trace_log), содержащую результаты работы профайлера. Она настроена по умолчанию. Помните, что данные в этой таблице действительны только для запущенного сервера. После перезапуска сервера ClickHouse не очищает таблицу, и все сохранённые адреса виртуальной памяти могут стать недействительными.

- Настройте параметры [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра могут использоваться одновременно.

    Эти настройки позволяют вам конфигурировать таймеры профайлера. Поскольку это настройки сессии, вы можете получать разную частоту выборки для всего сервера, отдельных пользователей или профилей пользователей, для вашей интерактивной сессии и для каждого отдельного запроса.

Частота выборки по умолчанию составляет один образец в секунду, и таймеры CPU и реального времени включены. Эта частота позволяет собирать достаточно информации о кластере ClickHouse. В то же время, работа на этой частоте не влияет на производительность сервера ClickHouse. Если вам нужно профилировать каждый отдельный запрос, попробуйте использовать более высокую частоту выборки.

Чтобы проанализировать системную таблицу `trace_log`:

- Установите пакет `clickhouse-common-static-dbg`. См. [Установка из DEB-пакетов](../../getting-started/install/install.mdx).

- Разрешите функции интроспекции с помощью настройки [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions).

    По соображениям безопасности функции интроспекции отключены по умолчанию.

- Используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle` для получения имен функций и их позиций в коде ClickHouse. Чтобы получить профиль для некоторого запроса, вам нужно агрегировать данные из таблицы `trace_log`. Вы можете агрегировать данные по отдельным функциям или по целым стек-трейсам.

Если вам нужно визуализировать информацию из `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).

## Пример {#example}

В этом примере мы:

- Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.

- Агрегируем по стек-трейсу.

- Используя функции интроспекции, мы получим отчет о:

  - Именах символов и соответствующих функциях исходного кода.
  - Местоположениях этих функций в исходном коде. 

<!-- -->

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