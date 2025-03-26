---
description: 'Документация для инструмента профилирования выборки запросов в ClickHouse'
sidebar_label: 'Профилирование запросов'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'Профилирование выборки запросов'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Профилирование выборки запросов

ClickHouse выполняет профилирование выборки, которое позволяет анализировать выполнение запросов. С помощью профилировщика вы можете найти рутинные функции исходного кода, которые использовались чаще всего во время выполнения запроса. Вы можете отследить время CPU и время с учетом реальных часов, включая время простоя.

Профилировщик запросов автоматически включен в ClickHouse Cloud, и вы можете выполнить образец запроса следующим образом:

:::note Если вы выполняете следующий запрос в ClickHouse Cloud, не забудьте изменить `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбрать из всех узлов кластера
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

В самоуправляемых развертываниях, чтобы использовать профилировщик запросов:

- Настройте раздел [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) в конфигурации сервера.

    Этот раздел настраивает системную таблицу [trace_log](/operations/system-tables/trace_log), содержащую результаты работы профилировщика. Он настроен по умолчанию. Помните, что данные в этой таблице действительны только для работающего сервера. После перезапуска сервера ClickHouse не очищает таблицу, и все сохраненные адреса виртуальной памяти могут стать недействительными.

- Настройте параметры [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра могут использоваться одновременно.

    Эти параметры позволяют настраивать таймеры профилировщика. Поскольку это параметры сессии, вы можете получить разную частоту выборки для всего сервера, отдельных пользователей или профилей пользователей, для вашей интерактивной сессии и для каждого отдельного запроса.

Частота выборки по умолчанию составляет один образец в секунду, и оба таймера CPU и реального времени включены. Эта частота позволяет собирать достаточную информацию о кластере ClickHouse. В то же время, работая с этой частотой, профилировщик не влияет на производительность сервера ClickHouse. Если вам необходимо профилировать каждый отдельный запрос, постарайтесь использовать более высокую частоту выборки.

Чтобы анализировать системную таблицу `trace_log`:

- Установите пакет `clickhouse-common-static-dbg`. См. [Установка из DEB-пакетов](../../getting-started/install.md#install-from-deb-packages).

- Разрешите функции инспекции с помощью параметра [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions).

    По соображениям безопасности функции инспекции отключены по умолчанию.

- Используйте функции инспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`, чтобы получить имена функций и их позиции в коде ClickHouse. Чтобы получить профиль для какого-либо запроса, вам необходимо агрегировать данные из таблицы `trace_log`. Вы можете агрегировать данные по отдельным функциям или по полным стек-трейсам.

Если вам нужно визуализировать информацию из `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).

## Пример {#example}

В этом примере мы:

- Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.

- Агрегируем по стек-трейсу.

- Используя функции инспекции, получим отчет о:

    - Именах символов и соответствующих функциях исходного кода.
    - Местоположениях исходного кода этих функций.

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
