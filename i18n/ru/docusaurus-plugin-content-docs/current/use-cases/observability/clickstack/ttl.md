---
slug: /use-cases/observability/clickstack/ttl
title: 'Управление TTL'
sidebar_label: 'Управление TTL'
pagination_prev: null
pagination_next: null
description: 'Управление TTL в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'data retention', 'lifecycle', 'storage management']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## TTL в ClickStack {#ttl-clickstack}

Time-to-Live (TTL) — это ключевая функция в ClickStack для эффективного управления хранением и жизненным циклом данных, особенно с учётом того, что постоянно генерируются огромные объёмы данных. TTL обеспечивает автоматическое истечение срока хранения и удаление более старых данных, гарантируя оптимальное использование хранилища и поддержание производительности без ручного вмешательства. Эта возможность критически важна для того, чтобы база данных оставалась компактной, снижала затраты на хранение и обеспечивала высокую скорость и эффективность запросов за счёт работы преимущественно с наиболее актуальными и свежими данными. Кроме того, она помогает соблюдать политики хранения данных за счёт систематического управления жизненным циклом данных, тем самым повышая общую устойчивость и масштабируемость решения для наблюдаемости.

**По умолчанию ClickStack хранит данные в течение 3 дней. Чтобы изменить это, см. раздел [«Modifying TTL»](#modifying-ttl).**

TTL управляется на уровне таблицы в ClickHouse. Например, ниже показана схема таблицы логов:

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TimestampTime` DateTime DEFAULT toDateTime(Timestamp),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt8,
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` UInt8,
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(TimestampTime)
PRIMARY KEY (ServiceName, TimestampTime)
ORDER BY (ServiceName, TimestampTime, Timestamp)
TTL TimestampTime + toIntervalDay(3)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

Разбиение на секции (partitioning) в ClickHouse позволяет логически разделять данные на диске в соответствии со столбцом или SQL-выражением. Благодаря логическому разделению данных каждая секция может обрабатываться независимо, например удаляться при истечении срока жизни согласно политике TTL.

Как показано в приведённом выше примере, разбиение задаётся для таблицы при её создании с помощью выражения `PARTITION BY`. В нём может использоваться любое SQL-выражение над одним или несколькими столбцами, результат которого определяет, в какую секцию будет помещена строка. В результате данные логически связываются (через общий префикс имени каталога) с каждой секцией на диске, после чего могут запрашиваться отдельно. В приведённом выше примере схема `otel_logs` по умолчанию разбивает данные по дням, используя выражение `toDate(Timestamp).` При вставке строк в ClickHouse это выражение вычисляется для каждой строки и направляет её в соответствующую секцию, если она уже существует (если строка первая за день, секция будет создана). Для получения дополнительных сведений о разбиении и других вариантах его применения см. [&quot;Части таблицы (Table Partitions)&quot;](/partitions).

<Image img={observability_14} alt="Секции (Partitions)" size="lg" />

Схема таблицы также включает `TTL TimestampTime + toIntervalDay(3)` и установку `ttl_only_drop_parts = 1`. Первое выражение гарантирует, что данные будут удалены, как только их возраст превысит 3 дня. Настройка `ttl_only_drop_parts = 1` обеспечивает удаление только тех частей данных, в которых все данные уже просрочены (в отличие от попытки частичного удаления строк). Поскольку секционирование гарантирует, что данные за разные дни никогда не «сливаются», данные можно эффективно удалять.

:::important `ttl_only_drop_parts`
Мы рекомендуем всегда использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Когда эта настройка включена, ClickHouse удаляет целую часть, когда все строки в ней просрочены. Удаление целых частей вместо частичной очистки строк с истекшим TTL (достигаемой через ресурсоёмкие мутации при `ttl_only_drop_parts=0`) позволяет использовать меньшее значение `merge_with_ttl_timeout` и снижает влияние на производительность системы. Если данные секционируются по той же единице, по которой вы выполняете истечение TTL, например по дню, то части естественным образом будут содержать данные только из заданного интервала. Это обеспечит эффективное применение `ttl_only_drop_parts=1`.
:::

По умолчанию данные с истекшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что данные просрочены, он выполняет внеплановое слияние.

:::note Расписание TTL
TTL не применяется немедленно, а выполняется по расписанию, как указано выше. Настройка таблицы MergeTree `merge_with_ttl_timeout` задаёт минимальную задержку в секундах перед повторным слиянием с удалением по TTL. Значение по умолчанию — 14400 секунд (4 часа). Но это лишь минимальная задержка; может пройти больше времени, прежде чем будет инициировано TTL-слияние. Если значение слишком мало, будет выполняться много внеплановых слияний, которые могут потреблять много ресурсов. Применение TTL можно принудительно запустить с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

## Изменение TTL {#modifying-ttl}

Чтобы изменить TTL, пользователи могут:

1. **Изменить схемы таблиц (рекомендуется)**. Для этого необходимо подключиться к экземпляру ClickHouse, например с помощью [clickhouse-client](/interfaces/cli) или [Cloud SQL Console](/cloud/get-started/sql-console). Например, мы можем изменить TTL для таблицы `otel_logs`, используя следующую DDL-команду:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **Измените OTel collector**. ClickStack OpenTelemetry collector создаёт таблицы в ClickHouse, если они ещё не существуют. Это реализовано через ClickHouse exporter, который, в свою очередь, предоставляет параметр `ttl`, используемый для задания выражения TTL по умолчанию, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### TTL на уровне столбца {#column-level-ttl}

Приведённые выше примеры истечения срока жизни данных относятся к уровню таблицы. Пользователи также могут задавать истечение срока жизни на уровне столбца. По мере устаревания данных это можно использовать для удаления столбцов, ценность которых при расследовании инцидентов не оправдывает затраты ресурсов на их хранение. Например, мы рекомендуем сохранять столбец `Body` на случай, если будут добавлены новые динамические метаданные, которые не были извлечены во время вставки, например новая метка Kubernetes. Спустя некоторое время, например 1 месяц, может стать очевидно, что эти дополнительные метаданные не полезны — и, следовательно, нет смысла продолжать хранить столбец `Body`.

Ниже показано, как можно удалить столбец `Body` по истечении 30 дней.

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
Задавать TTL на уровне столбца можно только при использовании собственной схемы. Это нельзя настроить в OTel collector.
:::
