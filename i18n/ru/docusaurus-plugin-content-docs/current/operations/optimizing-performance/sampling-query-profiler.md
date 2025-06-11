---
description: 'Документация для инструмента профайлинга запросов с помощью выборки в ClickHouse'
sidebar_label: 'Профайлинг запросов'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'Профайлер запросов с выборкой'
---

import SelfManaged from '@site/i18n/ru/current/_snippets/_self_managed_only_no_roadmap.md';


# Профайлер запросов с выборкой

ClickHouse выполняет профайлер выборки, который позволяет анализировать выполнение запросов. С помощью профайлера вы можете найти рутинные функции исходного кода, которые использовались наиболее часто во время выполнения запроса. Вы можете отследить время процессора и реальное время, затраченное на выполнение, включая время простоя.

Профайлер запросов автоматически включен в ClickHouse Cloud, и вы можете выполнить пример запроса следующим образом:

:::note Если вы выполняете следующий запрос в ClickHouse Cloud, убедитесь, что вы изменили `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбрать из всех узлов кластера.
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

В самоуправляемых развертываниях для использования профайлера запросов:

- Настройте секцию [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) в конфигурации сервера.

    Эта секция настраивает системную таблицу [trace_log](/operations/system-tables/trace_log), содержащую результаты работы профайлера. Она настроена по умолчанию. Помните, что данные в этой таблице действительны только для работающего сервера. После перезапуска сервера ClickHouse не очищает таблицу, и все сохраненные виртуальные адреса памяти могут стать недействительными.

- Настройте параметры [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра могут использоваться одновременно.

    Эти параметры позволяют вам настраивать таймеры профайлера. Поскольку это параметры сессии, вы можете получить различную частоту выборки для всего сервера, отдельных пользователей или профилей пользователей, для вашей интерактивной сессии и для каждого отдельного запроса.

Частота выборки по умолчанию составляет один образец в секунду, и включены как таймеры CPU, так и реального времени. Эта частота позволяет собирать достаточно информации о кластере ClickHouse. В то же время, работая с этой частотой, профайлер не влияет на производительность сервера ClickHouse. Если вам нужно профилировать каждый отдельный запрос, постарайтесь использовать более высокую частоту выборки.

Чтобы проанализировать системную таблицу `trace_log`:

- Установите пакет `clickhouse-common-static-dbg`. См. [Установка из DEB пакетов](../../getting-started/install.md#install-from-deb-packages).

- Позвольте функции интроспекции с помощью параметра [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions).

    По соображениям безопасности функции интроспекции отключены по умолчанию.

- Используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle` [интроспективные функции](../../sql-reference/functions/introspection.md), чтобы получить имена функций и их позиции в коде ClickHouse. Чтобы получить профиль для какого-либо запроса, вам нужно агрегировать данные из таблицы `trace_log`. Вы можете агрегировать данные по отдельным функциям или по полным трассам стека.

Если вам необходимо визуализировать информацию `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).

## Пример {#example}

В этом примере мы:

- Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.

- Агрегируем по трассе стека.

- Используя функции интроспекции, мы получим отчет о:

    - Именах символов и соответствующих исходных функциях.
    - Местоположении исходного кода этих функций.

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
