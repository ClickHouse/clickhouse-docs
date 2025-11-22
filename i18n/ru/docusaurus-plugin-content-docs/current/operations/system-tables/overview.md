---
description: 'Обзор того, что такое системные таблицы и для чего они нужны.'
keywords: ['системные таблицы', 'обзор']
sidebar_label: 'Обзор'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'Обзор системных таблиц'
doc_type: 'reference'
---



## Обзор системных таблиц {#system-tables-introduction}

Системные таблицы предоставляют информацию о:

- Состоянии сервера, процессах и окружении.
- Внутренних процессах сервера.
- Параметрах, использованных при сборке бинарного файла ClickHouse.

Системные таблицы:

- Расположены в базе данных `system`.
- Доступны только для чтения.
- Не могут быть удалены или изменены, но могут быть отсоединены.

Большинство системных таблиц хранят данные в оперативной памяти. Сервер ClickHouse создаёт такие системные таблицы при запуске.

В отличие от других системных таблиц, таблицы системных логов [metric_log](../../operations/system-tables/metric_log.md), [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [trace_log](../../operations/system-tables/trace_log.md), [part_log](../../operations/system-tables/part_log.md), [crash_log](../../operations/system-tables/crash_log.md), [text_log](../../operations/system-tables/text_log.md) и [backup_log](../../operations/system-tables/backup_log.md) используют движок таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) и по умолчанию хранят данные в файловой системе. Если удалить таблицу из файловой системы, сервер ClickHouse создаст пустую таблицу заново при следующей записи данных. Если схема системной таблицы изменилась в новом релизе, ClickHouse переименовывает текущую таблицу и создаёт новую.

Таблицы системных логов можно настроить, создав конфигурационный файл с тем же именем, что и таблица, в каталоге `/etc/clickhouse-server/config.d/`, или задав соответствующие элементы в `/etc/clickhouse-server/config.xml`. Настраиваемые элементы:

- `database`: база данных, к которой принадлежит таблица системных логов. Эта опция устарела. Все таблицы системных логов находятся в базе данных `system`.
- `table`: таблица для вставки данных.
- `partition_by`: задание выражения [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).
- `ttl`: задание выражения [TTL](../../sql-reference/statements/alter/ttl.md) таблицы.
- `flush_interval_milliseconds`: интервал сброса данных на диск.
- `engine`: полное выражение движка (начинающееся с `ENGINE =`) с параметрами. Эта опция конфликтует с `partition_by` и `ttl`. Если они заданы одновременно, сервер выдаст исключение и завершит работу.

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

По умолчанию рост таблицы не ограничен. Для контроля размера таблицы можно использовать настройки [TTL](/sql-reference/statements/alter/ttl) для удаления устаревших записей логов. Также можно использовать функцию партиционирования таблиц с движком `MergeTree`.


## Источники системных метрик {#system-tables-sources-of-system-metrics}

Для сбора системных метрик сервер ClickHouse использует:

- Capability `CAP_NET_ADMIN`.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (только в Linux).

**procfs**

Если сервер ClickHouse не имеет capability `CAP_NET_ADMIN`, он пытается использовать резервный вариант `ProcfsMetricsProvider`. `ProcfsMetricsProvider` позволяет собирать системные метрики для каждого запроса (для CPU и I/O).

Если procfs поддерживается и включена в системе, сервер ClickHouse собирает следующие метрики:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` отключена по умолчанию в ядрах Linux начиная с версии 5.14.x.
Вы можете включить её с помощью команды `sudo sysctl kernel.task_delayacct=1` или создав файл `.conf` в `/etc/sysctl.d/` с содержимым `kernel.task_delayacct = 1`
:::


## Системные таблицы в ClickHouse Cloud {#system-tables-in-clickhouse-cloud}

В ClickHouse Cloud системные таблицы предоставляют важную информацию о состоянии и производительности сервиса, так же как и в самостоятельно управляемых развертываниях. Некоторые системные таблицы работают на уровне всего кластера, особенно те, которые получают данные от узлов Keeper, управляющих распределенными метаданными. Эти таблицы отражают общее состояние кластера и должны быть согласованными при запросе с отдельных узлов. Например, таблица [`parts`](/operations/system-tables/parts) должна быть согласованной независимо от того, с какого узла выполняется запрос:

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

Напротив, другие системные таблицы являются специфичными для узла, например, хранящиеся в памяти или сохраняющие свои данные с использованием движка таблиц MergeTree. Это характерно для таких данных, как журналы и метрики. Такое сохранение гарантирует, что исторические данные остаются доступными для анализа. Однако эти специфичные для узла таблицы по своей природе уникальны для каждого узла.

В общем случае при определении того, является ли системная таблица специфичной для узла, можно применить следующие правила:

- Системные таблицы с суффиксом `_log`.
- Системные таблицы, предоставляющие метрики, например `metrics`, `asynchronous_metrics`, `events`.
- Системные таблицы, предоставляющие информацию о текущих процессах, например `processes`, `merges`.

Кроме того, новые версии системных таблиц могут создаваться в результате обновлений или изменений их схемы. Эти версии именуются с использованием числового суффикса.

Например, рассмотрим таблицы `system.query_log`, которые содержат строку для каждого запроса, выполненного узлом:

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

### Запрос нескольких версий {#querying-multiple-versions}

Мы можем выполнять запросы к этим таблицам с использованием функции [`merge`](/sql-reference/table-functions/merge). Например, приведенный ниже запрос определяет последний запрос, отправленный на целевой узел в каждой таблице `query_log`:

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

```


11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
Peak memory usage: 28.45 MiB.

````

:::note Не полагайтесь на числовой суффикс для упорядочивания
Хотя числовой суффикс в названиях таблиц может указывать на порядок данных, полагаться на него не следует. По этой причине всегда используйте табличную функцию merge в сочетании с фильтром по дате при работе с конкретными диапазонами дат.
:::

Важно отметить, что эти таблицы по-прежнему являются **локальными для каждого узла**.

### Запросы к нескольким узлам {#querying-across-nodes}

Для получения полного представления о всём кластере пользователи могут использовать функцию [`clusterAllReplicas`](/sql-reference/table-functions/cluster) в сочетании с функцией `merge`. Функция `clusterAllReplicas` позволяет выполнять запросы к системным таблицам на всех репликах в кластере "default", объединяя данные отдельных узлов в единый результат. В сочетании с функцией `merge` это можно использовать для получения всех системных данных конкретной таблицы в кластере.

Этот подход особенно ценен для мониторинга и отладки операций на уровне кластера, позволяя пользователям эффективно анализировать работоспособность и производительность своего развёртывания ClickHouse Cloud.

:::note
ClickHouse Cloud предоставляет кластеры с несколькими репликами для обеспечения избыточности и отказоустойчивости. Это обеспечивает такие возможности, как динамическое автомасштабирование и обновления без простоя. В определённый момент времени новые узлы могут находиться в процессе добавления в кластер или удаления из кластера. Чтобы пропустить эти узлы, добавьте `SETTINGS skip_unavailable_shards = 1` к запросам, использующим `clusterAllReplicas`, как показано ниже.
:::

Например, рассмотрим разницу при запросе к таблице `query_log` — часто необходимой для анализа.

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
````

### Запросы к нескольким узлам и версиям {#querying-across-nodes-and-versions}

Из-за версионирования системных таблиц это всё ещё не представляет полные данные в кластере. При объединении вышеуказанного с функцией `merge` мы получаем точный результат для нашего диапазона дат:

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


3 строки в наборе. Прошло 0.462 сек. Обработано 7.94 млн строк, 31.75 МБ (17.17 млн строк/с, 68.67 МБ/с)

```
```


## Связанный контент {#related-content}

- Блог: [Системные таблицы и окно во внутреннее устройство ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- Блог: [Основные запросы мониторинга — часть 1 — запросы INSERT](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- Блог: [Основные запросы мониторинга — часть 2 — запросы SELECT](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
