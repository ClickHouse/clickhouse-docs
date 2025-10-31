---
slug: '/operations/system-tables/overview'
sidebar_label: Обзор
sidebar_position: 52
description: 'Обзор того, что такие системные таблицы и почему они полезны.'
title: 'Обзор системных таблиц'
keywords: ['системные таблицы', 'обзор']
doc_type: reference
---
## Обзор системных таблиц {#system-tables-introduction}

Системные таблицы предоставляют информацию о:

- Состояниях сервера, процессах и окружении.
- Внутренних процессах сервера.
- Опциях, используемых при сборке бинарного файла ClickHouse.

Системные таблицы:

- Находятся в базе данных `system`.
- Доступны только для чтения данных.
- Не могут быть удалены или изменены, но могут быть отсоединены.

Большинство системных таблиц хранят свои данные в оперативной памяти. Сервер ClickHouse создает такие системные таблицы при запуске.

В отличие от других системных таблиц, системные таблицы журнала [metric_log](../../operations/system-tables/metric_log.md), [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [trace_log](../../operations/system-tables/trace_log.md), [part_log](../../operations/system-tables/part_log.md), [crash_log](../../operations/system-tables/crash_log.md), [text_log](../../operations/system-tables/text_log.md) и [backup_log](../../operations/system-tables/backup_log.md) обслуживаются движком таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) и по умолчанию хранят свои данные в файловой системе. Если вы удалите таблицу из файловой системы, сервер ClickHouse снова создаст пустую таблицу при следующей записи данных. Если схема системной таблицы изменилась в новой версии, то ClickHouse переименовывает текущую таблицу и создает новую.

Таблицы журнала могут быть настроены путем создания конфигурационного файла с тем же именем, что и таблица, в `/etc/clickhouse-server/config.d/`, или установив соответствующие элементы в `/etc/clickhouse-server/config.xml`. Элементы, которые можно настроить:

- `database`: база данных, к которой принадлежит таблица журнала. Эта опция устарела. Все таблицы журнала находятся в базе данных `system`.
- `table`: таблица для вставки данных.
- `partition_by`: укажите выражение [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).
- `ttl`: укажите выражение [TTL](../../sql-reference/statements/alter/ttl.md) таблицы.
- `flush_interval_milliseconds`: интервал сброса данных на диск.
- `engine`: укажите полное выражение движка (начиная с `ENGINE =`) с параметрами. Эта опция конфликтует с `partition_by` и `ttl`. Если они установлены вместе, сервер выдаст исключение и завершится.

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

- Способность `CAP_NET_ADMIN`.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (только в Linux).

**procfs**

Если у сервера ClickHouse нет способности `CAP_NET_ADMIN`, он пытается использовать `ProcfsMetricsProvider`. `ProcfsMetricsProvider` позволяет собирать системные метрики по запросам (для CPU и I/O).

Если поддерживается и включен procfs на системе, сервер ClickHouse собирает эти метрики:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` по умолчанию отключен в ядрах Linux, начиная с версии 5.14.x.
Вы можете включить его, используя `sudo sysctl kernel.task_delayacct=1` или создав файл `.conf` в `/etc/sysctl.d/` с `kernel.task_delayacct = 1`
:::

## Системные таблицы в ClickHouse Cloud {#system-tables-in-clickhouse-cloud}

В ClickHouse Cloud системные таблицы предоставляют критически важные сведения о состоянии и производительности сервиса, точно так же, как и в самоуправляемых развертываниях. Некоторые системные таблицы работают на уровне всего кластера, особенно те, которые извлекают свои данные из узлов Keeper, управляющих распределенными метаданными. Эти таблицы отражают коллективное состояние кластера и должны быть последовательными при запросе на отдельных узлах. Например, таблицы [`parts`](/operations/system-tables/parts) должны быть последовательными независимо от узла, с которого они запрашиваются:

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

Напротив, другие системные таблицы являются конкретными для узла, например, хранят свои данные в оперативной памяти или сохраняя их с использованием движка таблицы MergeTree. Это типично для данных, таких как журналы и метрики. Эта устойчивость обеспечивает доступность исторических данных для анализа. Однако эти таблицы, специфичные для узла, по своей природе уникальны для каждого узла.

В общем, следующие правила могут быть применены для определения, является ли системная таблица специфичной для узла:

- Системные таблицы с суффиксом `_log`.
- Системные таблицы, которые представляют метрики, например, `metrics`, `asynchronous_metrics`, `events`.
- Системные таблицы, которые представляют текущие процессы, например, `processes`, `merges`.

Кроме того, новые версии системных таблиц могут быть созданы в результате обновлений или изменений в их схеме. Эти версии называются с использованием числового суффикса.

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

Мы можем выполнять запросы к этим таблицам, используя функцию [`merge`](/sql-reference/table-functions/merge). Например, следующий запрос определяет последний запрос, выданный целевому узлу в каждой таблице `query_log`:

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

:::note Не полагайтесь на числовой суффикс для упорядочивания
Хотя числовой суффикс на таблицах может предлагать порядок данных, на него никогда нельзя полагаться. По этой причине всегда используйте функцию таблицы merge в сочетании с фильтром даты, когда нацелены на определенные диапазоны дат.
:::

Важно отметить, что эти таблицы все еще **локальны для каждого узла**.

### Запрос между узлами {#querying-across-nodes}

Чтобы получить полный обзор всего кластера, пользователи могут использовать функцию [`clusterAllReplicas`](/sql-reference/table-functions/cluster) в сочетании с функцией `merge`. Функция `clusterAllReplicas` позволяет выполнять запросы к системным таблицам на всех репликах в кластере "default", объединяя данные, специфичные для узла, в единственный результат. В сочетании с функцией `merge` это может использоваться для нацеливания на все системные данные для определенной таблицы в кластере. 

Этот подход особенно ценен для мониторинга и отладки операций на уровне кластера, обеспечивая пользователям возможность эффективно анализировать состояние и производительность их развертывания ClickHouse Cloud.

:::note
ClickHouse Cloud предоставляет кластеры с несколькими репликами для резервирования и автоматического переключения. Это позволяет его функциям, таким как динамическое автоматическое масштабирование и обновления без простоя. В определенный момент времени новые узлы могут быть добавлены или удалены из кластера. Чтобы пропустить эти узлы, добавьте `SETTINGS skip_unavailable_shards = 1` к запросам с использованием `clusterAllReplicas`, как показано ниже.
:::

Например, рассмотрим разницу при запросе таблицы `query_log` - часто важной для анализа.

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
```

### Запрос между узлами и версиями {#querying-across-nodes-and-versions}

Из-за версионирования системных таблиц это все еще не отражает полные данные в кластере. Объединив вышеуказанное с функцией `merge`, мы получаем точный результат для нашего диапазона дат:

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
```

## Связанный контент {#related-content}

- Блог: [Системные таблицы и окно в внутренности ClickHouse](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- Блог: [Основные запросы мониторинга - часть 1 - запрашивающие запросы](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- Блог: [Основные запросы мониторинга - часть 2 - SELECT запросы](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)