---
title: 'Управление данными'
description: 'Управление данными для задач наблюдаемости'
slug: /observability/managing-data
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

# Управление данными {#managing-data}

Развертывания ClickHouse для задач наблюдаемости неизбежно связаны с большими объемами данных, которыми необходимо управлять. ClickHouse предлагает ряд возможностей для управления такими данными.

## Разделы {#partitions}

Разбиение на разделы (partitioning) в ClickHouse позволяет логически разделять данные на диске в соответствии со столбцом или SQL-выражением. При таком логическом разделении данные каждого раздела могут обрабатываться независимо, например, удаляться. Это позволяет пользователям перемещать разделы, а значит, и подмножества данных, между уровнями хранилища по времени, а также [удалять устаревшие данные/эффективно удалять данные из кластера](/sql-reference/statements/alter/partition).

Разбиение на разделы задаётся для таблицы при её первичном определении с помощью предложения `PARTITION BY`. В этом предложении может содержаться SQL-выражение по любым столбцам, результат которого определяет, в какой раздел будет отправлена строка.

<Image img={observability_14} alt="Разделы" size="md" />

Части данных (data parts) логически связаны (через общий префикс имени каталога) с каждым разделом на диске и могут запрашиваться по отдельности. В примере ниже схема `otel_logs` по умолчанию делит данные на разделы по дням, используя выражение `toDate(Timestamp)`. По мере вставки строк в ClickHouse это выражение вычисляется для каждой строки, и она направляется в соответствующий раздел, если он уже существует (если строка — первая для дня, соответствующий раздел будет создан).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

Над разделами можно выполнять [ряд операций](/sql-reference/statements/alter/partition), включая [резервное копирование](/sql-reference/statements/alter/partition#freeze-partition), [манипуляции со столбцами](/sql-reference/statements/alter/partition#clear-column-in-partition), мутации, [изменяющие](/sql-reference/statements/alter/partition#update-in-partition)/[удаляющие](/sql-reference/statements/alter/partition#delete-in-partition) данные на уровне строк, а также [очистку индексов (например, вторичных индексов)](/sql-reference/statements/alter/partition#clear-index-in-partition).

В качестве примера предположим, что наша таблица `otel_logs` разбита на разделы по дням. Если заполнить её набором данных со структурированными логами, в ней будет содержаться несколько дней данных:

```sql
SELECT Timestamp::Date AS day,
         count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-26 │ 1986456 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

5 rows in set. Elapsed: 0.058 sec. Processed 10.37 million rows, 82.92 MB (177.96 million rows/s., 1.42 GB/s.)
Peak memory usage: 4.41 MiB.
```

Список текущих партиций можно получить с помощью простого запроса к системной таблице:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'otel_logs'

┌─partition──┐
│ 2019-01-22 │
│ 2019-01-23 │
│ 2019-01-24 │
│ 2019-01-25 │
│ 2019-01-26 │
└────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

У нас может быть дополнительная таблица `otel_logs_archive`, которую мы используем для хранения более старых данных. Данные могут быть эффективно перемещены в эту таблицу по разделам (это всего лишь изменение метаданных).

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--move data to archive table
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--confirm data has been moved
SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

4 rows in set. Elapsed: 0.051 sec. Processed 8.38 million rows, 67.03 MB (163.52 million rows/s., 1.31 GB/s.)
Peak memory usage: 4.40 MiB.

SELECT Timestamp::Date AS day,
        count() AS c
FROM otel_logs_archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 row in set. Elapsed: 0.024 sec. Processed 1.99 million rows, 15.89 MB (83.86 million rows/s., 670.87 MB/s.)
Peak memory usage: 4.99 MiB.
```

В отличие от других методов, при которых пришлось бы использовать `INSERT INTO SELECT` и переписывать данные в новую целевую таблицу.

:::note Перемещение партиций
[Перемещение партиций между таблицами](/sql-reference/statements/alter/partition#move-partition-to-table) требует выполнения нескольких условий; в частности, таблицы должны иметь одинаковую структуру, ключ партиционирования, первичный ключ и индексы/проекции. Подробные сведения о том, как указывать партиции в `ALTER` DDL, можно найти [здесь](/sql-reference/statements/alter/partition#how-to-set-partition-expression).
:::

Кроме того, данные можно эффективно удалять по партициям. Это значительно менее ресурсоёмко, чем альтернативные методы (мутации или облегчённые удаления) и должно рассматриваться как предпочтительный вариант.

```sql
ALTER TABLE otel_logs
        (DROP PARTITION tuple('2019-01-25'))

SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC
┌────────day─┬───────c─┐
│ 2019-01-22 │ 4667954 │
│ 2019-01-23 │ 4653388 │
│ 2019-01-24 │ 3792510 │
└────────────┴─────────┘
```

:::note
Эта возможность используется механизмом TTL при включении настройки [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Дополнительную информацию см. в разделе [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live).
:::

### Применения {#applications}

Выше показано, как данные могут эффективно перемещаться и обрабатываться на уровне партиций. На практике пользователи чаще всего будут использовать операции с партициями в сценариях наблюдаемости в двух случаях:

- **Многоуровневые архитектуры** — перемещение данных между уровнями хранилища (см. [Уровни хранилища](#storage-tiers)), что позволяет строить архитектуры с горячим и холодным хранилищем.
- **Эффективное удаление** — когда данные достигают заданного TTL (см. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live))

Оба этих сценария мы подробно рассматриваем ниже.

### Производительность запросов {#query-performance}

Хотя разбиение на партиции может помочь с производительностью запросов, это в значительной степени зависит от характера доступа к данным. Если запросы обращаются только к нескольким партициям (в идеале — к одной), производительность потенциально может улучшиться. Это, как правило, полезно только в том случае, если ключ партиционирования не входит в первичный ключ и по нему выполняется фильтрация. Однако запросы, которым необходимо охватить множество партиций, могут работать хуже, чем без разбиения на партиции (так как потенциально может быть больше частей — parts). Преимущество обращения к одной партиции будет слабо выражено или вовсе отсутствовать, если ключ партиционирования уже является одним из первых столбцов в первичном ключе. Разбиение на партиции также может использоваться для [оптимизации запросов GROUP BY](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в общем случае пользователям следует в первую очередь оптимизировать первичный ключ и рассматривать партиционирование как технику оптимизации запросов только в исключительных ситуациях, когда характер запросов предполагает доступ к конкретному предсказуемому подмножеству данных, например, при партиционировании по дням, когда большинство запросов приходится на последний день. Пример такого поведения приведён [здесь](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4).

## Управление данными с помощью TTL (Time-to-live) {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) — это ключевая функция в решениях для наблюдаемости на базе ClickHouse, обеспечивающая эффективное хранение и управление данными, особенно в условиях постоянной генерации огромных объёмов данных. Реализация TTL в ClickHouse обеспечивает автоматическое истечение срока действия и удаление устаревших данных, гарантируя оптимальное использование хранилища и поддержание производительности без ручного вмешательства. Эта возможность имеет ключевое значение для того, чтобы база данных оставалась компактной, снижались затраты на хранение и запросы оставались быстрыми и эффективными за счёт работы преимущественно с наиболее актуальными и свежими данными. Кроме того, TTL помогает соблюдать политики хранения данных путём систематического управления жизненным циклом данных, что в целом повышает устойчивость и масштабируемость решения для наблюдаемости.

TTL в ClickHouse может задаваться как на уровне таблицы, так и на уровне столбца.

### TTL на уровне таблицы {#table-level-ttl}

Схема по умолчанию как для логов, так и для трейсов включает TTL для удаления данных по истечении заданного периода. Он задаётся в экспортёре ClickHouse в ключе `ttl`, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

Этот синтаксис в настоящее время поддерживает [синтаксис длительностей Golang](https://pkg.go.dev/time#ParseDuration). **Мы рекомендуем использовать суффикс `h` и убедиться, что это соответствует периоду партиционирования. Например, если вы партиционируете по дням, убедитесь, что значение кратно суткам, например 24h, 48h, 72h.** Это автоматически гарантирует, что к таблице будет добавлено предложение TTL, например при `ttl: 96h`.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

По умолчанию данные с истёкшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что срок действия данных истёк, он выполняет внеплановое слияние.

:::note Плановые TTL
TTLs применяются не сразу, а по расписанию, как отмечено выше. Настройка таблицы MergeTree `merge_with_ttl_timeout` задаёт минимальную задержку в секундах перед повторным выполнением слияния с TTL на удаление. Значение по умолчанию — 14400 секунд (4 часа). Но это только минимальная задержка, может пройти больше времени, прежде чем будет инициировано слияние по TTL. Если значение слишком низкое, будет выполняться множество внеплановых слияний, которые могут потреблять много ресурсов. Принудительно применить TTL можно с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

**Важно: мы рекомендуем использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) ** (применяется в схеме по умолчанию). Когда эта настройка включена, ClickHouse удаляет целую часть, если все строки в ней имеют истёкший TTL. Удаление целых частей вместо частичной очистки строк с истёкшим TTL (достигаемой с помощью ресурсоёмких мутаций при `ttl_only_drop_parts=0`) позволяет использовать меньшие значения `merge_with_ttl_timeout` и снижать влияние на производительность системы. Если данные разбиваются на партиции по той же единице, по которой у вас настроено истечение TTL, например по дням, части естественным образом будут содержать данные только из заданного интервала. Это гарантирует, что `ttl_only_drop_parts=1` может эффективно применяться.

### TTL на уровне столбца {#column-level-ttl}

В приведённом выше примере срок жизни задаётся на уровне таблицы. Пользователи также могут задавать срок жизни данных на уровне столбца. По мере устаревания данных это можно использовать для удаления столбцов, ценность которых для расследований не оправдывает ресурсных затрат на их хранение. Например, мы рекомендуем сохранять столбец `Body` на случай, если будут добавлены новые динамические метаданные, которые не были извлечены во время вставки, например новая метка Kubernetes. После некоторого периода, например одного месяца, может стать очевидно, что эти дополнительные метаданные не полезны — и, следовательно, нет смысла продолжать хранить столбец `Body`.

Ниже показано, как можно удалить столбец `Body` через 30 дней.

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String TTL Timestamp + INTERVAL 30 DAY,
        `Timestamp` DateTime,
        ...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note
Указание TTL на уровне столбца требует от пользователей самостоятельного определения собственной схемы. Это нельзя настроить в OTel collector.
:::

## Повторное сжатие данных {#recompressing-data}

Хотя для наборов данных наблюдаемости мы обычно рекомендуем `ZSTD(1)`, пользователи могут экспериментировать с другими алгоритмами сжатия или более высокими уровнями сжатия, например `ZSTD(3)`. Помимо возможности указать это при создании схемы, сжатие можно настроить так, чтобы оно изменялось по истечении заданного периода времени. Это может быть целесообразно, если кодек или алгоритм сжатия обеспечивает более высокую степень сжатия, но ухудшает производительность запросов. Такой компромисс может быть приемлем для более старых данных, к которым обращаются реже, но не для свежих данных, которые используются чаще, в том числе при расследованиях инцидентов.

Пример этого показан ниже: вместо удаления данных мы сжимаем их с помощью `ZSTD(3)` по прошествии 4 дней.

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
TTL Timestamp + INTERVAL 4 DAY RECOMPRESS CODEC(ZSTD(3))
```

:::note Оцените производительность
Мы рекомендуем всегда оценивать влияние различных уровней и алгоритмов сжатия как на производительность вставки, так и на производительность выполнения запросов. Например, дельта‑кодеки могут быть полезны для сжатия временных меток. Однако если они являются частью первичного ключа, производительность фильтрации может снизиться.
:::

Дополнительные сведения и примеры по настройке TTL см. [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes). Примеры добавления и изменения TTL для таблиц и столбцов приведены [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl). О том, как TTL позволяет реализовывать иерархии хранилища, такие как архитектуры hot‑warm, см. раздел [Уровни хранилища](#storage-tiers).

## Уровни хранения {#storage-tiers}

В ClickHouse пользователи могут создавать уровни хранения на разных дисках, например «горячие»/недавние данные на SSD и более старые данные в S3. Такая архитектура позволяет использовать более дешевое хранилище для старых данных, для которых допустимы более высокие SLA по запросам из‑за их редкого использования при расследованиях.

:::note Не относится к ClickHouse Cloud
ClickHouse Cloud использует единственную копию данных, хранящуюся в S3, с кешами узлов на SSD. Таким образом, уровни хранения в ClickHouse Cloud не требуются.
:::

Создание уровней хранения требует от пользователей сначала создать диски, которые затем используются для формирования политик хранения с томами, указываемыми при создании таблиц. Данные могут автоматически переноситься между дисками на основе степени заполнения, размеров частей и приоритетов томов. Дополнительную информацию можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes).

Хотя данные можно вручную перемещать между дисками с помощью команды `ALTER TABLE MOVE PARTITION`, перемещение данных между томами также может управляться с использованием TTL. Полный пример можно найти [здесь](/guides/developer/ttl#implementing-a-hotwarmcold-architecture).

## Управление изменениями схемы {#managing-schema-changes}

Схемы логов и трейсов неизбежно будут меняться на протяжении жизненного цикла системы, например по мере того, как пользователи начинают мониторить новые системы с другими метаданными или метками подов. Благодаря генерации данных по схеме OTel и сохранению исходных данных событий в структурированном формате схемы ClickHouse будут устойчивы к этим изменениям. Однако по мере появления новых метаданных и изменения шаблонов выполнения запросов пользователи будут стремиться обновлять схемы, чтобы отражать эти изменения.

Чтобы избежать простоя во время изменений схемы, у пользователей есть несколько вариантов, которые мы рассмотрим ниже.

### Использование значений по умолчанию {#use-default-values}

Столбцы можно добавлять в схему, используя [значения `DEFAULT`](/sql-reference/statements/create/table#default). Указанное значение по умолчанию будет использоваться, если оно не задано при выполнении INSERT.

Изменения схемы можно внести до изменения любой логики трансформации материализованного представления или конфигурации OTel collector, которые приводят к отправке данных в эти новые столбцы.

После изменения схемы пользователи могут перенастроить экземпляры OTel collector. Предполагая, что пользователи используют рекомендуемый процесс, описанный в разделе [«Извлечение структуры с помощью SQL»](/docs/use-cases/observability/schema-design#extracting-structure-with-sql), когда OTel collectors отправляют данные в табличный движок Null, а материализованное представление отвечает за извлечение целевой схемы и отправку результатов в целевую таблицу для хранения, представление можно изменить, используя [синтаксис `ALTER TABLE ... MODIFY QUERY`](/sql-reference/statements/alter/view). Предположим, у нас есть целевая таблица ниже с соответствующим материализованным представлением (аналогичным используемому в разделе «Извлечение структуры с помощью SQL»), которое извлекает целевую схему из структурированных логов OTel:

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)

CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

Предположим, мы хотим извлечь новый столбец `Size` из `LogAttributes`. Мы можем добавить его в схему таблицы с помощью оператора `ALTER TABLE`, указав значение по умолчанию:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

В приведённом выше примере мы задаём значение по умолчанию через ключ `size` в `LogAttributes` (это будет 0, если этого ключа не существует). Это означает, что запросы, обращающиеся к этому столбцу для строк, в которых значение не было записано, должны будут обращаться к Map и, соответственно, выполняться медленнее. Мы также могли бы просто указать это как константу, например 0, уменьшая стоимость последующих запросов к строкам, где значение отсутствует. Запрос к этой таблице показывает, что значение заполняется, как и ожидается, из Map:

```sql
SELECT Size
FROM otel_logs_v2
LIMIT 5
┌──Size─┐
│ 30577 │
│  5667 │
│  5379 │
│  1696 │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.012 sec.
```

Чтобы обеспечить запись этого значения для всех будущих данных, мы можем изменить наше материализованное представление с помощью синтаксиса `ALTER TABLE`, как показано ниже:

```sql
ALTER TABLE otel_logs_mv
        MODIFY QUERY
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300,                 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

Для последующих строк значение в столбце `Size` будет заполняться в момент вставки.

### Создание новых таблиц {#create-new-tables}

В качестве альтернативы описанному выше процессу пользователи могут просто создать новую целевую таблицу с новой схемой. Любые материализованные представления затем можно изменить так, чтобы они использовали эту новую таблицу, с помощью вышеупомянутой команды `ALTER TABLE MODIFY QUERY`. При таком подходе пользователи могут версионировать свои таблицы, например `otel_logs_v3`.

Этот подход оставляет пользователям несколько таблиц, по которым нужно выполнять запросы. Чтобы выполнять запросы по нескольким таблицам, пользователи могут использовать функцию [`merge`](/sql-reference/table-functions/merge), которая принимает шаблоны с подстановочными символами для имени таблицы. Ниже мы демонстрируем это, выполняя запрос к версиям v2 и v3 таблицы `otel_logs`:

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

Если пользователи хотят избежать использования функции `merge` и предоставить конечным пользователям таблицу, объединяющую несколько таблиц, можно использовать [движок таблиц Merge](/engines/table-engines/special/merge). Ниже показан пример:

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

Это можно обновлять при добавлении новой таблицы с использованием синтаксиса `EXCHANGE` для таблиц. Например, чтобы добавить таблицу версии v4, можно создать новую таблицу и атомарно подменить ею предыдущую версию.

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
