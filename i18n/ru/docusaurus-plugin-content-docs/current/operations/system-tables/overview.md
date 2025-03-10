---
description: 'Обзор системных таблиц и их полезности.'
slug: /operations/system-tables/overview
sidebar_position: 52
sidebar_label: Обзор
title: 'Обзор системных таблиц'
keywords: ['системные таблицы', 'обзор']
---

## Введение {#system-tables-introduction}

Системные таблицы предоставляют информацию о:

- Состоянии сервера, процессах и окружении.
- Внутренних процессах сервера.
- Опциях, используемых при сборке бинарного файла ClickHouse.

Системные таблицы:

- Находятся в базе данных `system`.
- Доступны только для чтения данных.
- Не могут быть удалены или изменены, но могут быть отсоединены.

Большинство системных таблиц хранят свои данные в ОЗУ. Сервер ClickHouse создает такие системные таблицы при старте.

В отличие от других системных таблиц, системные журналы [metric_log](../../operations/system-tables/metric_log.md), [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [trace_log](../../operations/system-tables/trace_log.md), [part_log](../../operations/system-tables/part_log.md), [crash_log](../../operations/system-tables/crash-log.md), [text_log](../../operations/system-tables/text_log.md) и [backup_log](../../operations/system-tables/backup_log.md) обслуживаются движком таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) и по умолчанию хранят свои данные в файловой системе. Если вы удаляете таблицу из файловой системы, сервер ClickHouse снова создает пустую при следующей записи данных. Если схема системной таблицы изменилась в новом релизе, ClickHouse переименовывает текущую таблицу и создает новую.

Системные журналы можно настроить, создав файл конфигурации с таким же именем, как и таблица, в `/etc/clickhouse-server/config.d/`, или установив соответствующие элементы в `/etc/clickhouse-server/config.xml`. Настраиваемые элементы:

- `database`: база данных, к которой принадлежит системная таблица журнала. Эта опция устарела. Все системные таблицы журнала находятся под базой данных `system`.
- `table`: таблица для вставки данных.
- `partition_by`: укажите выражение [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).
- `ttl`: укажите выражение [TTL](../../sql-reference/statements/alter/ttl.md) таблицы.
- `flush_interval_milliseconds`: интервал сброса данных на диск.
- `engine`: укажите полное выражение движка (начиная с `ENGINE =`) с параметрами. Эта опция конфликтует с `partition_by` и `ttl`. Если заданы вместе, сервер вызовет исключение и завершится.

Пример:

```xml
<clickhouse>
    <query_log>
        <database>system</database>
        <table>query_log</table>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <ttl>event_date + INTERVAL 30 DAY DELETE</ttl>
        <!--
        <engine>ENGINE = MergeTree PARTITION BY toYYYYMM(event_date) ORDER BY (event_date, event_time) SETTINGS index_granularity = 1024</engine>
        -->
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_log>
</clickhouse>
```

По умолчанию рост таблицы не ограничен. Для контроля размера таблицы можно использовать настройки [TTL](/sql-reference/statements/alter/ttl) для удаления устаревших записей журнала. Также можно использовать функцию партиционирования таблиц с движком `MergeTree`.

## Источники системных метрик {#system-tables-sources-of-system-metrics}

Для сбора системных метрик сервер ClickHouse использует:

- Возможность `CAP_NET_ADMIN`.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (только в Linux).

**procfs**

Если сервер ClickHouse не имеет возможности `CAP_NET_ADMIN`, он пытается перейти на `ProcfsMetricsProvider`. `ProcfsMetricsProvider` позволяет собирать системные метрики по запросам (для CPU и I/O).

Если procfs поддерживается и включен в системе, сервер ClickHouse собирает следующие метрики:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` отключен по умолчанию в ядрах Linux начиная с 5.14.x.
Вы можете включить его, используя `sudo sysctl kernel.task_delayacct=1` или создав файл `.conf` в `/etc/sysctl.d/` с `kernel.task_delayacct = 1`.
:::

## Системные таблицы в ClickHouse Cloud {#system-tables-in-clickhouse-cloud}

В ClickHouse Cloud системные таблицы предоставляют критически важные данные о состоянии и производительности сервиса, так же как и в управляемых развертываниях. Некоторые системные таблицы работают на уровне всего кластера, особенно те, которые получают свои данные от узлов Keeper, которые управляют распределенными метаданными. Эти таблицы отражают коллективное состояние кластера и должны быть согласованными при запросах на отдельных узлах. Например, [`parts`](/operations/system-tables/parts) должны быть согласованными независимо от узла, с которого они запрашиваются:

```sql
SELECT hostname(), count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-vccsrty-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.005 sec.

SELECT
 hostname(),
    count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-w59bfco-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.004 sec.
```

С другой стороны, некоторые системные таблицы являются узко специфичными, например, таблицы, хранящие данные в памяти или используя движок MergeTree. Это типично для таких данных, как логи и метрики. Эта устойчивость обеспечивает доступность исторических данных для анализа. Однако эти узкоспециализированные таблицы по своей сути уникальны для каждого узла.

Чтобы всесторонне просмотреть весь кластер, пользователи могут воспользоваться функцией [`clusterAllReplicas`](/sql-reference/table-functions/cluster). Эта функция позволяет запрашивать системные таблицы по всем репликам внутри "дефолтного" кластера, объединяя данные, специфичные для узла, в единый результат. Этот подход особенно полезен для мониторинга и отладки операций на уровне всего кластера, обеспечивая пользователей возможностью эффективно анализировать состояние и производительность развертывания ClickHouse Cloud.

:::note
ClickHouse Cloud предоставляет кластеры из нескольких реплик для избыточности и отказоустойчивости. Это позволяет использовать его функции, такие как динамическое автошкалирование и безотказные обновления. В определенный момент времени новые узлы могут добавляться в кластер или удаляться из кластера. Чтобы пропустить эти узлы, добавьте `SETTINGS skip_unavailable_shards = 1` к запросам, использующим `clusterAllReplicas`, как показано ниже.
:::

Например, рассмотрим разницу при запросе таблицы `query_log` - это часто важно для анализа.

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 154.63 thousand rows, 618.55 KB (16.12 million rows/s., 64.49 MB/s.)


SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
│ c-ecru-oc-31-server-myt0lr4-0 │   81473 │
│ c-ecru-oc-31-server-5mp9vn3-0 │   84292 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.309 sec. Processed 686.09 thousand rows, 2.74 MB (2.22 million rows/s., 8.88 MB/s.)
Peak memory usage: 6.07 MiB.
```

В общем, следующие правила могут быть применены для определения, является ли системная таблица узкоспециализированной:

- Системные таблицы с суффиксом `_log`.
- Системные таблицы, которые показывают метрики, например, `metrics`, `asynchronous_metrics`, `events`.
- Системные таблицы, которые показывают текущие процессы, например, `processes`, `merges`.

## Связанный контент {#related-content}

- Блог: [Системные таблицы и окно в внутреннее устройство ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- Блог: [Основные запросы мониторинга - часть 1 - запросы INSERT](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- Блог: [Основные запросы мониторинга - часть 2 - запросы SELECT](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
