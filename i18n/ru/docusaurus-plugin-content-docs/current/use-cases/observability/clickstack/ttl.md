---
slug: /use-cases/observability/clickstack/ttl
title: 'Управление TTL'
sidebar_label: 'Управление TTL'
pagination_prev: null
pagination_next: null
description: 'Управление TTL в ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'срок хранения данных', 'жизненный цикл', 'управление хранилищем']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


## TTL в ClickStack

Time-to-Live (TTL) — это ключевая функция в ClickStack для эффективного хранения и управления данными, особенно с учётом того, что постоянно генерируются огромные объёмы данных. TTL обеспечивает автоматическое истечение срока жизни и удаление более старых данных, что позволяет оптимально использовать хранилище и поддерживать производительность без ручного вмешательства. Эта возможность критически важна для того, чтобы база данных оставалась компактной, снижались затраты на хранение и чтобы запросы оставались быстрыми и эффективными за счёт работы преимущественно с наиболее релевантными и свежими данными. Кроме того, она помогает соблюдать политики хранения данных путём систематического управления жизненным циклом данных, повышая общую устойчивость и масштабируемость решения в области наблюдаемости.

**По умолчанию ClickStack хранит данные в течение 3 дней. Чтобы изменить это, см. раздел [&quot;Modifying TTL&quot;](#modifying-ttl).**

TTL задаётся на уровне таблицы в ClickHouse. Например, ниже показана схема для логов:

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

Разбиение на партиции в ClickHouse позволяет логически разделять данные на диске по столбцу или SQL-выражению. Благодаря логическому разделению данных каждая партиция может обрабатываться независимо, например быть удалена по истечении срока действия в соответствии с политикой TTL.

Как показано в приведённом выше примере, разбиение на партиции задаётся для таблицы при её первоначальном определении с помощью конструкции `PARTITION BY`. Она может содержать SQL-выражение по любым столбцам, результаты которого определяют, в какую партицию будет направлена строка. В результате данные логически связываются (через общий префикс имени каталога) с каждой партицией на диске, которая затем может запрашиваться отдельно. В приведённом выше примере схема `otel_logs` по умолчанию выполняет разбиение по дням, используя выражение `toDate(Timestamp)`. При вставке строк в ClickHouse это выражение будет вычисляться для каждой строки и направлять её в соответствующую партицию, если она уже существует (если строка является первой для данного дня, партиция будет создана). Для получения дополнительной информации о разбиении на партиции и других вариантах его использования см. раздел [&quot;Table Partitions&quot;](/partitions).

<Image img={observability_14} alt="Partitions" size="lg" />


Схема таблицы также включает выражение `TTL TimestampTime + toIntervalDay(3)` и параметр `ttl_only_drop_parts = 1`. Первое выражение гарантирует, что данные будут удалены, как только их возраст превысит 3 дня. Параметр `ttl_only_drop_parts = 1` заставляет истекать только те части данных, в которых все данные уже просрочены (в отличие от попыток частично удалять строки). Поскольку при секционировании гарантируется, что данные за разные дни никогда не «сливаются», данные можно эффективно удалять. 

:::important `ttl_only_drop_parts`
Мы рекомендуем всегда использовать параметр [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Когда этот параметр включён, ClickHouse удаляет целую часть, если все строки в ней имеют истекший TTL. Удаление целых частей вместо частичной очистки строк с истекшим TTL (достигаемой с помощью ресурсоёмких мутаций при `ttl_only_drop_parts=0`) позволяет задавать меньшие значения `merge_with_ttl_timeout` и снижать влияние на производительность системы. Если данные секционируются по той же единице, по которой вы выполняете истечение TTL, например по дню, части естественным образом будут содержать данные только из заданного интервала. Это обеспечит эффективное применение `ttl_only_drop_parts=1`.
:::

По умолчанию данные с истекшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что срок действия данных истёк, он выполняет внеплановое объединение.

:::note TTL schedule
TTL применяется не сразу, а по расписанию, как отмечено выше. Настройка таблицы MergeTree `merge_with_ttl_timeout` задаёт минимальную задержку в секундах перед повторным объединением с удалением по TTL. Значение по умолчанию — 14400 секунд (4 часа). Однако это лишь минимальная задержка; может пройти больше времени, прежде чем будет запущено объединение по TTL. Если значение слишком низкое, будет выполняться много внеплановых объединений, которые могут потреблять значительные ресурсы. Принудительно запустить истечение TTL можно с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::



## Изменение TTL

Чтобы изменить TTL, пользователи могут:

1. **Изменить схемы таблиц (рекомендуется)**. Для этого необходимо подключиться к экземпляру ClickHouse, например с помощью [clickhouse-client](/interfaces/cli) или [Cloud SQL Console](/cloud/get-started/sql-console). Например, мы можем изменить TTL для таблицы `otel_logs`, используя следующий DDL:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **Измените OTel collector**. ClickStack OpenTelemetry collector создаёт таблицы в ClickHouse, если они ещё не созданы. Это достигается с помощью экспортера ClickHouse (ClickHouse exporter), который, в свою очередь, предоставляет параметр `ttl`, используемый для управления выражением TTL по умолчанию, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### TTL на уровне столбца

Приведённые выше примеры задают срок жизни данных на уровне таблицы. Пользователи также могут задавать срок жизни на уровне столбца. По мере устаревания данных это можно использовать для удаления столбцов, чья ценность для расследований не оправдывает затраты ресурсов на их хранение. Например, мы рекомендуем сохранять столбец `Body` на случай, если будут добавлены новые динамические метаданные, которые не были извлечены во время вставки, например новая метка Kubernetes. По прошествии, например, одного месяца может стать очевидно, что эти дополнительные метаданные не полезны — а значит, ценность сохранения столбца `Body` ограничена.

Ниже показано, как столбец `Body` может быть удалён через 30 дней.

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
Указание TTL на уровне столбца требует, чтобы пользователи задали собственную схему. Это невозможно настроить в OTel collector.
:::
