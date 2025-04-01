---
description: 'Обзор того, что такое системные таблицы и почему они полезны.'
keywords: ['системные таблицы', 'обзор']
sidebar_label: 'Обзор'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'Обзор системных таблиц'
---

## Обзор системных таблиц {#system-tables-introduction}

Системные таблицы предоставляют информацию о:

- состояниях серверов, процессах и среде.
- внутренних процессах сервера.
- параметрах, использованных при сборке бинарного файла ClickHouse.

Системные таблицы:

- расположены в базе данных `system`.
- доступны только для чтения данных.
- не могут быть удалены или изменены, но могут быть отсоединены.

Большинство системных таблиц хранит свои данные в оперативной памяти. Сервер ClickHouse создает такие системные таблицы при запуске.

В отличие от других системных таблиц, системные журнальные таблицы [metric_log](../../operations/system-tables/metric_log.md), [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [trace_log](../../operations/system-tables/trace_log.md), [part_log](../../operations/system-tables/part_log.md), [crash_log](../../operations/system-tables/crash-log.md), [text_log](../../operations/system-tables/text_log.md) и [backup_log](../../operations/system-tables/backup_log.md) обслуживаются движком таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) и по умолчанию хранят свои данные в файловой системе. Если вы удалите таблицу из файловой системы, сервер ClickHouse снова создаст ее пустую при следующей записи данных. Если схема системной таблицы изменилась в новой версии, ClickHouse переименует текущую таблицу и создаст новую.

Системные журнальные таблицы можно настраивать, создав файл конфигурации с таким же именем, как таблица, в `/etc/clickhouse-server/config.d/`, или установив соответствующие элементы в `/etc/clickhouse-server/config.xml`. Элементы, которые можно настраивать:

- `database`: база данных, к которой принадлежит системная журнальная таблица. Этот параметр устарел. Все системные журнальные таблицы находятся в базе данных `system`.
- `table`: таблица для вставки данных.
- `partition_by`: укажите выражение [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).
- `ttl`: укажите выражение [TTL](../../sql-reference/statements/alter/ttl.md) для таблицы.
- `flush_interval_milliseconds`: интервал сброса данных на диск.
- `engine`: укажите полное выражение для движка (начиная с `ENGINE =`) с параметрами. Этот параметр конфликтует с `partition_by` и `ttl`. Если установить их вместе, сервер вызовет исключение и завершится.

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

По умолчанию рост таблицы неограничен. Для контроля размера таблицы вы можете использовать настройки [TTL](/sql-reference/statements/alter/ttl) для удаления устаревших записей журнала. Также вы можете использовать функцию партиционирования таблиц движка `MergeTree`.

## Источники системных метрик {#system-tables-sources-of-system-metrics}

Для сбора системных метрик сервер ClickHouse использует:

- возможность `CAP_NET_ADMIN`.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (только в Linux).

**procfs**

Если сервер ClickHouse не имеет возможности `CAP_NET_ADMIN`, он пытается переключиться на `ProcfsMetricsProvider`. `ProcfsMetricsProvider` позволяет собирать системные метрики по запросам (для CPU и I/O).

Если procfs поддерживается и включен на системе, сервер ClickHouse собирает эти метрики:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` по умолчанию отключен в ядрах Linux, начиная с 5.14.x.
Вы можете включить его с помощью `sudo sysctl kernel.task_delayacct=1` или создав файл `.conf` в `/etc/sysctl.d/` с содержимым `kernel.task_delayacct = 1`
:::

## Системные таблицы в ClickHouse Cloud {#system-tables-in-clickhouse-cloud}

В ClickHouse Cloud системные таблицы предоставляют критически важную информацию о состоянии и производительности услуги, так же как и в самоуправляемых развертываниях. Некоторые системные таблицы работают на уровне всего кластера, особенно те, которые получают свои данные из узлов Keeper, которые управляют распределенными метаданными. Эти таблицы отражают общее состояние кластера и должны быть последовательны при запросе на отдельных узлах. Например, [`parts`](/operations/system-tables/parts) должны быть последовательными независимо от узла, с которого выполняется запрос:

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

С другой стороны, другие системные таблицы специфичны для узла, например, в оперативной памяти или сохраняющие свои данные с использованием движка таблиц MergeTree. Этоtypical для таких данных, как журналы и метрики. Эта устойчивость гарантирует, что исторические данные остаются доступными для анализа. Однако эти специфические для узла таблицы по своей природе уникальны для каждого узла.

Чтобы всесторонне просмотреть весь кластер, пользователи могут использовать функцию [`clusterAllReplicas`](/sql-reference/table-functions/cluster). Эта функция позволяет выполнять запросы к системным таблицам на всех репликах в кластере "default", консолидируя специфические для узла данные в единый результат. Этот подход особенно ценен для мониторинга и отладки операций на уровне кластера, обеспечивая пользователям возможность эффективно анализировать состояние и производительность своего развертывания ClickHouse Cloud.

:::note
ClickHouse Cloud обеспечивает кластеры с несколькими репликами для избыточности и аварийного восстановления. Это позволяет использовать такие функции, как динамическое автомасштабирование и обновления без простоя. В определенный момент времени новые узлы могут добавляться в кластер или удаляться из него. Чтобы пропустить эти узлы, добавьте `SETTINGS skip_unavailable_shards = 1` к запросам с использованием `clusterAllReplicas`, как показано ниже.
:::

Например, рассмотрите разницу при запросе таблицы `query_log` - часто необходимой для анализа.

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

В общем, следующие правила могут быть применены при определении, является ли системная таблица специфичной для узла:

- Системные таблицы с суффиксом `_log`.
- Системные таблицы, которые отображают метрики, например, `metrics`, `asynchronous_metrics`, `events`.
- Системные таблицы, которые отображают текущие процессы, например, `processes`, `merges`.

## Связанный контент {#related-content}

- Блог: [Системные таблицы и окно в внутренности ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- Блог: [Основные запросы мониторинга - часть 1 - запросы INSERT](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- Блог: [Основные запросы мониторинга - часть 2 - запросы SELECT](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
