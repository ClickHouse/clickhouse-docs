---
slug: /operations/optimizing-performance/sampling-query-profiler
sidebar_position: 54
sidebar_label: Профилирование Запросов
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Профилирование Запросов с Использованием Выборки

ClickHouse запускает профайлер выборки, который позволяет анализировать выполнение запросов. С помощью профайлера вы можете найти рутинные функции исходного кода, которые использовались наиболее часто во время выполнения запросов. Вы можете отслеживать время процессора и реальное время, затраченное на выполнение, включая время простоя.

Профайлер запросов автоматически включен в ClickHouse Cloud, и вы можете выполнить выборочный запрос следующим образом:

:::note Если вы выполняете следующий запрос в ClickHouse Cloud, убедитесь, что изменили `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбрать данные со всех узлов кластера.
:::

``` sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

В развертываниях с управлением собственными силами, для использования профайлера запросов:

- Настройте секцию [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) в конфигурации сервера.

    Эта секция настраивает системную таблицу [trace_log](/operations/system-tables/trace_log), содержащую результаты работы профайлера. Она настроена по умолчанию. Имейте в виду, что данные в этой таблице действительны только для работающего сервера. После перезапуска сервера ClickHouse не очищает таблицу, и все сохраненные адреса виртуальной памяти могут стать недействительными.

- Настройте параметры [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра могут использоваться одновременно.

    Эти параметры позволяют настраивать таймеры профайлера. Поскольку это параметры сессии, вы можете получить разную частоту выборки для всего сервера, отдельных пользователей или профилей пользователей, для вашей интерактивной сессии и для каждого отдельного запроса.

Стандартная частота выборки составляет один образец в секунду, и оба таймера CPU и реального времени включены. Эта частота позволяет собирать достаточно информации о кластере ClickHouse. В то же время, работая с этой частотой, профайлер не влияет на производительность сервера ClickHouse. Если вам необходимо профилировать каждый отдельный запрос, попробуйте использовать более высокую частоту выборки.

Для анализа системной таблицы `trace_log`:

- Установите пакет `clickhouse-common-static-dbg`. См. [Установка из DEB пакетов](../../getting-started/install.md#install-from-deb-packages).

- Разрешите функции интроспекции с помощью параметра [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions).

    По соображениям безопасности функции интроспекции отключены по умолчанию.

- Используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle` [функции интроспекции](../../sql-reference/functions/introspection.md) для получения имен функций и их позиций в коде ClickHouse. Чтобы получить отчет для какого-либо запроса, вам необходимо агрегировать данные из таблицы `trace_log`. Вы можете агрегировать данные по отдельным функциям или по целым стек-трейсам.

Если вам нужно визуализировать информацию из `trace_log`, попробуйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).

## Пример {#example}

В этом примере мы:

- Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.

- Агрегируем по стек-трейсу.

- Используя функции интроспекции, мы получим отчет о:

    - Названиях символов и соответствующих им функциях исходного кода.
    - Местоположениях функций в исходном коде.

<!-- -->

``` sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
