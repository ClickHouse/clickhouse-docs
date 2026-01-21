---
description: 'Обзор того, что такое системные таблицы и зачем они нужны.'
keywords: ['system tables', 'overview']
sidebar_label: 'Обзор'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'Обзор системных таблиц'
doc_type: 'reference'
---

## Обзор системных таблиц \{#system-tables-introduction\}

Системные таблицы предоставляют информацию о:

* Состоянии сервера, процессах и окружении.
* Внутренних процессах сервера.
* Опциях, использованных при сборке бинарного файла ClickHouse.

Системные таблицы:

* Находятся в базе данных `system`.
* Доступны только для чтения данных.
* Не могут быть удалены или изменены, но могут быть отсоединены.

Большинство системных таблиц хранят свои данные в оперативной памяти. Сервер ClickHouse создает такие системные таблицы при запуске.

В отличие от других системных таблиц, системные журнальные таблицы [metric&#95;log](../../operations/system-tables/metric_log.md), [query&#95;log](../../operations/system-tables/query_log.md), [query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md), [trace&#95;log](../../operations/system-tables/trace_log.md), [part&#95;log](../../operations/system-tables/part_log.md), [crash&#95;log](../../operations/system-tables/crash_log.md), [text&#95;log](../../operations/system-tables/text_log.md) и [backup&#95;log](../../operations/system-tables/backup_log.md) обслуживаются движком таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) и по умолчанию хранят свои данные в файловой системе. Если вы удалите таблицу из файловой системы, сервер ClickHouse создаст пустую таблицу заново при следующей записи данных. Если схема системной таблицы изменилась в новом релизе, ClickHouse переименовывает текущую таблицу и создает новую.

Таблицы системных журналов можно настраивать, создавая конфигурационный файл с тем же именем, что и таблица, в каталоге `/etc/clickhouse-server/config.d/`, или задавая соответствующие элементы в `/etc/clickhouse-server/config.xml`. Настраиваемые элементы:

* `database`: база данных, к которой относится системная журнальная таблица. Этот параметр сейчас устарел. Все системные журнальные таблицы находятся в базе данных `system`.
* `table`: таблица для записи данных.
* `partition_by`: выражение [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).
* `ttl`: выражение [TTL](../../sql-reference/statements/alter/ttl.md) таблицы.
* `flush_interval_milliseconds`: интервал сброса данных на диск.
* `engine`: полное выражение движка (начиная с `ENGINE =` ) с параметрами. Этот параметр конфликтует с `partition_by` и `ttl`. При одновременной установке сервер сгенерирует исключение и завершит работу.

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

По умолчанию рост таблицы не ограничен. Чтобы контролировать размер таблицы, вы можете использовать настройки [TTL](/sql-reference/statements/alter/ttl) для удаления устаревших записей логов. Также вы можете использовать механизм партиционирования таблиц движка `MergeTree`.

## Источники системных метрик \{#system-tables-sources-of-system-metrics\}

Для сбора системных метрик сервер ClickHouse использует:

- привилегию `CAP_NET_ADMIN`.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (только в Linux).

**procfs**

Если сервер ClickHouse не имеет привилегии `CAP_NET_ADMIN`, он пытается использовать `ProcfsMetricsProvider`. `ProcfsMetricsProvider` позволяет собирать системные метрики на уровне отдельных запросов (по CPU и I/O).

Если procfs поддерживается и включён в системе, сервер ClickHouse собирает следующие метрики:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` по умолчанию отключена в ядрах Linux, начиная с версии 5.14.x.
Вы можете включить её с помощью `sudo sysctl kernel.task_delayacct=1` или создав файл `.conf` в `/etc/sysctl.d/` с содержимым `kernel.task_delayacct = 1`
:::

## Системные таблицы в ClickHouse Cloud \{#system-tables-in-clickhouse-cloud\}

В ClickHouse Cloud системные таблицы предоставляют критически важную информацию о состоянии и производительности сервиса, так же, как и в развертываниях с самостоятельным управлением. Некоторые системные таблицы работают на уровне всего кластера, особенно те, которые получают данные с узлов Keeper, управляющих распределёнными метаданными. Эти таблицы отражают совокупное состояние кластера и должны возвращать согласованные данные при выполнении запросов с отдельных узлов. Например, таблица [`parts`](/operations/system-tables/parts) должна возвращать согласованные данные независимо от узла, с которого выполняется запрос:

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

Напротив, другие системные таблицы являются специфичными для узла, например, хранятся в памяти или сохраняют свои данные с использованием движка таблиц MergeTree. Это характерно для данных, таких как журналы (логи) и метрики. Такое постоянное хранение обеспечивает доступность исторических данных для анализа. Однако эти специфичные для узла таблицы по своей сути уникальны для каждого отдельного узла.

В общем случае при определении того, является ли системная таблица специфичной для узла, можно руководствоваться следующими правилами:

* Системные таблицы с суффиксом `_log`.
* Системные таблицы, предоставляющие метрики, например `metrics`, `asynchronous_metrics`, `events`.
* Системные таблицы, отражающие выполняющиеся процессы, например `processes`, `merges`.

Кроме того, новые версии системных таблиц могут создаваться в результате обновлений или изменений их схемы. Эти версии именуются с использованием числового суффикса.

Например, рассмотрим таблицы `system.query_log`, которые содержат строку для каждого запроса, выполненного на узле:

```sql
SHOW TABLES FROM system LIKE 'query_log%'

┌─name─────────┐
│ query_log    │
│ query_log_1  │
│ query_log_10 │
│ query_log_2  │
│ query_log_3  │
│ query_log_4  │
│ query_log_5  │
│ query_log_6  │
│ query_log_7  │
│ query_log_8  │
│ query_log_9  │
└──────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### Выполнение запросов к нескольким версиям \{#querying-multiple-versions\}

Мы можем выполнять запросы к этим таблицам, используя функцию [`merge`](/sql-reference/table-functions/merge). Например, запрос ниже определяет последний запрос, отправленный на целевой узел, в каждой таблице `query_log`:

```sql
SELECT
    _table,
    max(event_time) AS most_recent
FROM merge('system', '^query_log')
GROUP BY _table
ORDER BY most_recent DESC

┌─_table───────┬─────────most_recent─┐
│ query_log    │ 2025-04-13 10:59:29 │
│ query_log_1  │ 2025-04-09 12:34:46 │
│ query_log_2  │ 2025-04-09 12:33:45 │
│ query_log_3  │ 2025-04-07 17:10:34 │
│ query_log_5  │ 2025-03-24 09:39:39 │
│ query_log_4  │ 2025-03-24 09:38:58 │
│ query_log_6  │ 2025-03-19 16:07:41 │
│ query_log_7  │ 2025-03-18 17:01:07 │
│ query_log_8  │ 2025-03-18 14:36:07 │
│ query_log_10 │ 2025-03-18 14:01:33 │
│ query_log_9  │ 2025-03-18 14:01:32 │
└──────────────┴─────────────────────┘

11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
Peak memory usage: 28.45 MiB.
```

11 строк в наборе. Прошло: 0.373 сек. Обработано 6.44 миллиона строк, 25.77 МБ (17.29 миллиона строк/с, 69.17 МБ/с).
Пиковое потребление памяти: 28.45 МиБ.

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 17.87 thousand rows, 71.51 KB (1.75 million rows/s., 7.01 MB/s.)

SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
│ c-ecru-qn-34-server-6em4y4t-0 │  656029 │
│ c-ecru-qn-34-server-iejrkg0-0 │  641155 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.026 sec. Processed 1.97 million rows, 7.88 MB (75.51 million rows/s., 302.05 MB/s.)
```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 17.87 thousand rows, 71.51 KB (1.75 million rows/s., 7.01 MB/s.)

SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
│ c-ecru-qn-34-server-6em4y4t-0 │  656029 │
│ c-ecru-qn-34-server-iejrkg0-0 │  641155 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.026 sec. Processed 1.97 million rows, 7.88 MB (75.51 million rows/s., 302.05 MB/s.)
```sql
SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', merge('system', '^query_log'))
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │ 3008000 │
│ c-ecru-qn-34-server-6em4y4t-0 │ 3659443 │
│ c-ecru-qn-34-server-iejrkg0-0 │ 1078287 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.462 sec. Processed 7.94 million rows, 31.75 MB (17.17 million rows/s., 68.67 MB/s.)
```sql
SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', merge('system', '^query_log'))
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │ 3008000 │
│ c-ecru-qn-34-server-6em4y4t-0 │ 3659443 │
│ c-ecru-qn-34-server-iejrkg0-0 │ 1078287 │
└───────────────────────────────┴─────────┘
```

3 строки в наборе. Прошло: 0.462 сек. Обработано 7.94 млн строк, 31.75 MB (17.17 млн строк/с, 68.67 MB/s.)

```
```

## Связанные материалы {#related-content}

- Блог: [Системные таблицы и окно во внутреннюю работу ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- Блог: [Основные запросы для мониторинга — часть 1 — запросы INSERT](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- Блог: [Основные запросы для мониторинга — часть 2 — запросы SELECT](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
