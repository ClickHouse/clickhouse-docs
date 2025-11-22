---
description: 'Документация по инструменту выборочного профилирования запросов в ClickHouse'
sidebar_label: 'Профилирование запросов'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'Выборочный профилировщик запросов'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Семплирующий профилировщик запросов

ClickHouse запускает семплирующий профилировщик, который позволяет анализировать выполнение запросов. С его помощью вы можете найти участки исходного кода, которые чаще всего выполнялись во время выполнения запроса. Вы можете отслеживать затраченное процессорное время (CPU time) и реальное время (wall-clock time), включая время простоя.

Профилировщик запросов автоматически включён в ClickHouse Cloud, и вы можете выполнить пример запроса следующим образом.

:::note Если вы выполняете следующий запрос в ClickHouse Cloud, обязательно измените `FROM system.trace_log` на `FROM clusterAllReplicas(default, system.trace_log)`, чтобы выбрать данные со всех узлов кластера
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

В самостоятельных развертываниях, чтобы использовать профилировщик запросов:

* Настройте секцию [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) в конфигурации сервера.

  Эта секция настраивает системную таблицу [trace&#95;log](/operations/system-tables/trace_log), содержащую результаты работы профилировщика. По умолчанию она уже сконфигурирована. Помните, что данные в этой таблице валидны только для запущенного сервера. После перезапуска сервера ClickHouse не очищает эту таблицу, и все сохранённые виртуальные адреса памяти могут стать недействительными.

* Настройте параметры [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) или [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns). Оба параметра можно использовать одновременно.

  Эти параметры позволяют настроить таймеры профилировщика. Поскольку это сессионные настройки, вы можете задавать различную частоту сэмплирования для всего сервера, отдельных пользователей или профилей пользователей, для своей интерактивной сессии и для каждого отдельного запроса.

Частота сэмплирования по умолчанию — один сэмпл в секунду, при этом включены оба таймера — по CPU и по реальному времени. Эта частота позволяет собрать достаточно информации о кластере ClickHouse. В то же время при такой частоте работы профилировщик не влияет на производительность сервера ClickHouse. Если вам нужно профилировать каждый отдельный запрос, используйте более высокую частоту сэмплирования.

Для анализа системной таблицы `trace_log`:

* Установите пакет `clickhouse-common-static-dbg`. См. [Установка из DEB-пакетов](../../getting-started/install/install.mdx).

* Разрешите функции интроспекции с помощью настройки [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions).

  В целях безопасности функции интроспекции по умолчанию отключены.

* Используйте функции интроспекции [`addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`](../../sql-reference/functions/introspection.md), чтобы получить имена функций и их позиции в коде ClickHouse. Чтобы получить профиль для конкретного запроса, необходимо агрегировать данные из таблицы `trace_log`. Агрегацию можно выполнять по отдельным функциям или по целым стекам вызовов.

Если вам нужно визуализировать данные из `trace_log`, используйте [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) и [speedscope](https://github.com/laplab/clickhouse-speedscope).


## Пример {#example}

В этом примере мы:

- Фильтруем данные `trace_log` по идентификатору запроса и текущей дате.

- Агрегируем по трассировке стека.

- Используя функции интроспекции, получим отчёт о:
  - Именах символов и соответствующих функциях исходного кода.
  - Местоположении этих функций в исходном коде.

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
