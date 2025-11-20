---
title: 'Управление данными'
description: 'Управление данными для обзервабилити'
slug: /observability/managing-data
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# Управление данными

Развертывания ClickHouse для задач Observability неизбежно связаны с большими наборами данных, которыми необходимо управлять. ClickHouse предлагает ряд возможностей, помогающих в этом.



## Партиции {#partitions}

Партиционирование в ClickHouse позволяет логически разделять данные на диске в соответствии со столбцом или SQL-выражением. Благодаря логическому разделению данных с каждой партицией можно работать независимо, например удалять её. Это позволяет пользователям эффективно перемещать партиции и, следовательно, подмножества данных между уровнями хранения по времени или [удалять устаревшие данные/эффективно удалять данные из кластера](/sql-reference/statements/alter/partition).

Партиционирование задаётся для таблицы при её создании с помощью секции `PARTITION BY`. Эта секция может содержать SQL-выражение для любого столбца или столбцов, результат которого определит, в какую партицию будет направлена строка.

<Image img={observability_14} alt='Партиции' size='md' />

Куски данных логически связаны (через общий префикс имени папки) с каждой партицией на диске и могут запрашиваться изолированно. В приведённом ниже примере схема `otel_logs` по умолчанию разбивается на партиции по дням с использованием выражения `toDate(Timestamp)`. При вставке строк в ClickHouse это выражение вычисляется для каждой строки и направляет её в соответствующую партицию, если она существует (если строка первая за день, партиция будет создана).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

С партициями можно выполнять [ряд операций](/sql-reference/statements/alter/partition), включая [резервное копирование](/sql-reference/statements/alter/partition#freeze-partition), [манипуляции со столбцами](/sql-reference/statements/alter/partition#clear-column-in-partition), мутации ([изменение](/sql-reference/statements/alter/partition#update-in-partition)/[удаление](/sql-reference/statements/alter/partition#delete-in-partition) данных по строкам) и [очистку индексов (например, вторичных индексов)](/sql-reference/statements/alter/partition#clear-index-in-partition).

В качестве примера предположим, что наша таблица `otel_logs` разбита на партиции по дням. При заполнении структурированным набором данных логов она будет содержать данные за несколько дней:

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

Текущие партиции можно найти с помощью простого запроса к системной таблице:

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

У нас может быть другая таблица `otel_logs_archive`, которую мы используем для хранения более старых данных. Данные можно эффективно переместить в эту таблицу по партициям (это всего лишь изменение метаданных).

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--перемещаем данные в архивную таблицу
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--подтверждаем, что данные перемещены
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

```


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

````

Это отличается от других методов, которые требуют использования `INSERT INTO SELECT` и перезаписи данных в новую целевую таблицу.

:::note Перемещение партиций
[Перемещение партиций между таблицами](/sql-reference/statements/alter/partition#move-partition-to-table) требует выполнения нескольких условий, в частности таблицы должны иметь одинаковую структуру, ключ партиционирования, первичный ключ и индексы/проекции. Подробные примечания о том, как указывать партиции в DDL-командах `ALTER`, можно найти [здесь](/sql-reference/statements/alter/partition#how-to-set-partition-expression).
:::

Кроме того, данные можно эффективно удалять по партициям. Это гораздо более ресурсоэффективно, чем альтернативные методы (мутации или легковесные удаления), и является предпочтительным вариантом.

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
````

:::note
Эта возможность используется TTL при установке параметра [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Дополнительные сведения см. в разделе [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live).
:::

### Применение {#applications}

Приведенные выше примеры показывают, как данные можно эффективно перемещать и обрабатывать по партициям. На практике пользователи чаще всего будут использовать операции с партициями в сценариях наблюдаемости для двух случаев:

- **Многоуровневые архитектуры** — перемещение данных между уровнями хранения (см. [Уровни хранения](#storage-tiers)), что позволяет создавать горячие и холодные архитектуры.
- **Эффективное удаление** — когда данные достигли указанного TTL (см. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live))

Оба этих случая подробно рассмотрены ниже.

### Производительность запросов {#query-performance}

Хотя партиции могут помочь с производительностью запросов, это сильно зависит от паттернов доступа. Если запросы обращаются только к нескольким партициям (в идеале к одной), производительность может потенциально улучшиться. Это обычно полезно только в том случае, если ключ партиционирования не входит в первичный ключ и вы фильтруете по нему. Однако запросы, которым необходимо охватить множество партиций, могут работать хуже, чем при отсутствии партиционирования (поскольку может быть больше кусков данных). Преимущество обращения к одной партиции будет еще менее выраженным или отсутствовать, если ключ партиционирования уже является ранним элементом первичного ключа. Партиционирование также можно использовать для [оптимизации запросов GROUP BY](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в целом пользователям следует убедиться, что первичный ключ оптимизирован, и рассматривать партиционирование как метод оптимизации запросов только в исключительных случаях, когда паттерны доступа обращаются к определенному предсказуемому подмножеству данных, например, партиционирование по дням, когда большинство запросов относятся к последнему дню. См. [здесь](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4) пример такого поведения.


## Управление данными с помощью TTL (Time-to-live) {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) — это критически важная функция в решениях для наблюдаемости на базе ClickHouse, обеспечивающая эффективное хранение и управление данными, особенно учитывая непрерывную генерацию огромных объёмов данных. Реализация TTL в ClickHouse позволяет автоматически удалять устаревшие данные по истечении срока их хранения, обеспечивая оптимальное использование хранилища и поддержание производительности без ручного вмешательства. Эта возможность необходима для поддержания базы данных в компактном состоянии, снижения затрат на хранение и обеспечения быстрого и эффективного выполнения запросов за счёт фокусировки на наиболее актуальных и свежих данных. Кроме того, она помогает соблюдать политики хранения данных путём систематического управления жизненными циклами данных, тем самым повышая общую устойчивость и масштабируемость решения для наблюдаемости.

TTL может быть указан как на уровне таблицы, так и на уровне столбца в ClickHouse.

### TTL на уровне таблицы {#table-level-ttl}

Схема по умолчанию как для логов, так и для трассировок включает TTL для удаления данных по истечении указанного периода. Это задаётся в экспортере ClickHouse под ключом `ttl`, например:

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

Этот синтаксис в настоящее время поддерживает [синтаксис Golang Duration](https://pkg.go.dev/time#ParseDuration). **Мы рекомендуем использовать `h` и убедиться, что это соответствует периоду партиционирования. Например, если вы партиционируете по дням, убедитесь, что значение кратно дням, например, 24h, 48h, 72h.** Это автоматически обеспечит добавление условия TTL к таблице, например, если `ttl: 96h`.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

По умолчанию данные с истёкшим TTL удаляются, когда ClickHouse [объединяет куски данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что данные истекли, он выполняет внеплановое слияние.

:::note Запланированные TTL
TTL применяются не немедленно, а по расписанию, как отмечено выше. Настройка таблицы MergeTree `merge_with_ttl_timeout` устанавливает минимальную задержку в секундах перед повторным слиянием с удалением по TTL. Значение по умолчанию — 14400 секунд (4 часа). Но это только минимальная задержка, может потребоваться больше времени до запуска слияния по TTL. Если значение слишком мало, будет выполняться много внеплановых слияний, которые могут потреблять много ресурсов. Истечение TTL можно принудительно выполнить с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

**Важно: Мы рекомендуем использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)** (применяется схемой по умолчанию). Когда эта настройка включена, ClickHouse удаляет целый кусок, когда все строки в нём истекли. Удаление целых кусков вместо частичной очистки строк с истёкшим TTL (достигаемой через ресурсоёмкие мутации при `ttl_only_drop_parts=0`) позволяет иметь более короткие значения `merge_with_ttl_timeout` и меньшее влияние на производительность системы. Если данные партиционированы по той же единице, по которой выполняется истечение TTL, например, по дням, куски естественным образом будут содержать только данные из определённого интервала. Это обеспечит эффективное применение `ttl_only_drop_parts=1`.

### TTL на уровне столбца {#column-level-ttl}

Приведённый выше пример удаляет данные на уровне таблицы. Пользователи также могут удалять данные на уровне столбца. По мере старения данных это можно использовать для удаления столбцов, ценность которых в исследованиях не оправдывает затраты ресурсов на их хранение. Например, мы рекомендуем сохранять столбец `Body` на случай добавления новых динамических метаданных, которые не были извлечены во время вставки, например, новой метки Kubernetes. По прошествии периода, например, 1 месяца, может стать очевидным, что эти дополнительные метаданные не полезны — таким образом ограничивая ценность сохранения столбца `Body`.

Ниже мы показываем, как столбец `Body` может быть удалён через 30 дней.

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
Указание TTL на уровне столбца требует от пользователей определения собственной схемы. Это не может быть указано в коллекторе OTel.
:::


## Повторное сжатие данных {#recompressing-data}

Хотя для наборов данных наблюдаемости мы обычно рекомендуем `ZSTD(1)`, пользователи могут экспериментировать с различными алгоритмами сжатия или более высокими уровнями сжатия, например `ZSTD(3)`. Помимо возможности указать это при создании схемы, сжатие можно настроить так, чтобы оно изменялось по истечении заданного периода. Это может быть целесообразно, если кодек или алгоритм сжатия улучшает степень сжатия, но снижает производительность запросов. Такой компромисс может быть приемлем для старых данных, к которым обращаются реже, но не для свежих данных, которые чаще используются при анализе.

Пример этого показан ниже: мы сжимаем данные с использованием `ZSTD(3)` через 4 дня вместо их удаления.

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

:::note Оценка производительности
Мы рекомендуем всегда оценивать влияние различных уровней сжатия и алгоритмов как на производительность вставки, так и на производительность запросов. Например, дельта-кодеки могут быть полезны при сжатии временных меток. Однако если они являются частью первичного ключа, производительность фильтрации может снизиться.
:::

Дополнительные сведения и примеры настройки TTL можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes). Примеры добавления и изменения TTL для таблиц и столбцов можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl). О том, как TTL обеспечивают иерархии хранения, такие как горячие-теплые архитектуры, см. раздел [Уровни хранения](#storage-tiers).


## Уровни хранения {#storage-tiers}

В ClickHouse пользователи могут создавать уровни хранения на различных дисках, например, горячие/свежие данные на SSD и старые данные на базе S3. Такая архитектура позволяет использовать более дешёвое хранилище для старых данных, к которым предъявляются менее строгие требования по производительности запросов из-за их редкого использования в аналитических задачах.

:::note Не относится к ClickHouse Cloud
ClickHouse Cloud использует единственную копию данных, размещённую на S3, с кешами узлов на базе SSD. Поэтому уровни хранения в ClickHouse Cloud не требуются.
:::

Создание уровней хранения требует от пользователей создания дисков, которые затем используются для формирования политик хранения с томами, указываемыми при создании таблицы. Данные могут автоматически перемещаться между дисками на основе степени заполнения, размеров кусков и приоритетов томов. Подробности можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes).

Хотя данные можно вручную перемещать между дисками с помощью команды `ALTER TABLE MOVE PARTITION`, перемещением данных между томами также можно управлять с помощью TTL. Полный пример можно найти [здесь](/guides/developer/ttl#implementing-a-hotwarmcold-architecture).


## Управление изменениями схемы {#managing-schema-changes}

Схемы логов и трассировок неизбежно меняются в течение жизненного цикла системы, например, когда пользователи начинают мониторить новые системы с другими метаданными или метками подов. Благодаря формированию данных по схеме OTel и сохранению исходных данных событий в структурированном формате схемы ClickHouse будут устойчивы к таким изменениям. Однако по мере появления новых метаданных и изменения паттернов доступа к данным пользователи захотят обновлять схемы, чтобы отразить эти изменения.

Чтобы избежать простоя при изменении схемы, у пользователей есть несколько вариантов, которые мы рассмотрим ниже.

### Использование значений по умолчанию {#use-default-values}

Столбцы можно добавлять в схему с использованием значений [`DEFAULT`](/sql-reference/statements/create/table#default). Указанное значение по умолчанию будет использоваться, если оно не задано при выполнении INSERT.

Изменения схемы можно выполнить до изменения логики преобразования материализованных представлений или конфигурации коллектора OTel, которые приводят к отправке этих новых столбцов.

После изменения схемы пользователи могут перенастроить коллекторы OTel. Предполагая, что пользователи используют рекомендуемый процесс, описанный в разделе ["Извлечение структуры с помощью SQL"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql), где коллекторы OTel отправляют данные в таблицу с движком Null, а материализованное представление отвечает за извлечение целевой схемы и отправку результатов в целевую таблицу для хранения, представление можно изменить с помощью синтаксиса [`ALTER TABLE ... MODIFY QUERY`](/sql-reference/statements/alter/view). Предположим, у нас есть целевая таблица, приведенная ниже, с соответствующим материализованным представлением (аналогичным тому, которое используется в разделе "Извлечение структуры с помощью SQL") для извлечения целевой схемы из структурированных логов OTel:

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

Предположим, мы хотим извлечь новый столбец `Size` из `LogAttributes`. Мы можем добавить его в схему с помощью `ALTER TABLE`, указав значение по умолчанию:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

В приведенном выше примере мы указываем в качестве значения по умолчанию ключ `size` из `LogAttributes` (это будет 0, если ключ не существует). Это означает, что запросы, обращающиеся к этому столбцу для строк, в которых значение не было вставлено, должны обращаться к Map и, следовательно, будут выполняться медленнее. Мы также можем легко указать константу, например 0, что снизит стоимость последующих запросов к строкам без этого значения. Запрос к этой таблице показывает, что значение заполняется из Map, как и ожидалось:

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


Чтобы обеспечить вставку этого значения для всех будущих данных, можно изменить материализованное представление с помощью синтаксиса `ALTER TABLE`, как показано ниже:

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

В последующих строках столбец `Size` будет заполняться при вставке.

### Создание новых таблиц {#create-new-tables}

В качестве альтернативы описанному выше процессу можно просто создать новую целевую таблицу с новой схемой. Затем любые материализованные представления можно изменить для использования новой таблицы с помощью указанной выше команды `ALTER TABLE MODIFY QUERY`. При таком подходе можно версионировать таблицы, например `otel_logs_v3`.

При таком подходе остаётся несколько таблиц для запросов. Для выполнения запросов к нескольким таблицам можно использовать [табличную функцию `merge`](/sql-reference/table-functions/merge), которая принимает шаблоны с подстановочными символами для имени таблицы. Ниже показан пример запроса к версиям v2 и v3 таблицы `otel_logs`:

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

5 строк в наборе. Затрачено: 0,137 сек. Обработано 41,46 млн строк, 82,92 МБ (302,43 млн строк/сек., 604,85 МБ/сек.)
```

Если требуется избежать использования функции `merge` и предоставить конечным пользователям таблицу, объединяющую несколько таблиц, можно использовать [движок таблиц Merge](/engines/table-engines/special/merge). Ниже показан пример:

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

5 строк в наборе. Затрачено: 0,073 сек. Обработано 41,46 млн строк, 82,92 МБ (565,43 млн строк/сек., 1,13 ГБ/сек.)
```

Это можно обновлять при добавлении новой таблицы с помощью синтаксиса `EXCHANGE TABLE`. Например, чтобы добавить таблицу v4, можно создать новую таблицу и атомарно обменять её с предыдущей версией.

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

```


┌─Status─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 строк в наборе. Прошло: 0.068 сек. Обработано 42.46 млн строк, 84.92 МБ (620.45 млн строк/с, 1.24 ГБ/с.)

```
```
