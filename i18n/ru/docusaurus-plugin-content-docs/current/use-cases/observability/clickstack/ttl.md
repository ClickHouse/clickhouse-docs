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

Time-to-Live (TTL) — это важнейшая функция в ClickStack для эффективного хранения и управления данными, особенно учитывая непрерывную генерацию огромных объемов данных. TTL обеспечивает автоматическое истечение срока действия и удаление устаревших данных, гарантируя оптимальное использование хранилища и поддержание производительности без ручного вмешательства. Эта возможность необходима для поддержания компактности базы данных, снижения затрат на хранение и обеспечения быстрого и эффективного выполнения запросов за счет фокусировки на наиболее релевантных и актуальных данных. Кроме того, она помогает соблюдать политики хранения данных путем систематического управления жизненным циклом данных, тем самым повышая общую устойчивость и масштабируемость решения для наблюдаемости.

**По умолчанию ClickStack хранит данные в течение 3 дней. Чтобы изменить это значение, см. раздел [«Изменение TTL»](#modifying-ttl).**

TTL управляется на уровне таблицы в ClickHouse. Например, схема для логов показана ниже:

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

Партиционирование в ClickHouse позволяет логически разделять данные на диске в соответствии со столбцом или SQL-выражением. Благодаря логическому разделению данных с каждой партицией можно работать независимо, например удалять её при истечении срока действия согласно политике TTL.

Как показано в приведенном выше примере, партиционирование задается для таблицы при её первоначальном определении через конструкцию `PARTITION BY`. Эта конструкция может содержать SQL-выражение для любого столбца или столбцов, результат которого определит, в какую партицию будет отправлена строка. Это приводит к логической ассоциации данных (через общий префикс имени папки) с каждой партицией на диске, которую затем можно запрашивать изолированно. В приведенном выше примере схема по умолчанию `otel_logs` разбивает данные по дням с использованием выражения `toDate(Timestamp).` По мере вставки строк в ClickHouse это выражение вычисляется для каждой строки, и строка направляется в соответствующую партицию, если она существует (если строка является первой за день, партиция будет создана). Для получения дополнительной информации о партиционировании и его других применениях см. раздел [«Партиции таблиц»](/partitions).

<Image img={observability_14} alt='Partitions' size='lg' />


Схема таблицы также включает `TTL TimestampTime + toIntervalDay(3)` и установку `ttl_only_drop_parts = 1`. Первое выражение гарантирует, что данные будут удалены, как только им исполнится больше 3 дней. Настройка `ttl_only_drop_parts = 1` заставляет удалять только те части данных, в которых все данные уже истекли (в отличие от попыток частичного удаления строк). При разбиении на партиции, гарантирующем, что данные за разные дни никогда не будут «объединены», данные можно эффективно удалять. 

:::important `ttl_only_drop_parts`
Мы рекомендуем всегда использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Когда эта настройка включена, ClickHouse удаляет целую часть, когда все строки в ней истекли. Удаление целых частей вместо частичной очистки строк с истёкшим TTL (которая выполняется с помощью ресурсоёмких мутаций, когда `ttl_only_drop_parts=0`) позволяет использовать меньшие значения `merge_with_ttl_timeout` и снижать влияние на производительность системы. Если данные разбиваются на партиции по той же единице, по которой выполняется истечение TTL, например по дням, части будут естественным образом содержать только данные из заданного интервала. Это обеспечит эффективное применение `ttl_only_drop_parts=1`.
:::

По умолчанию данные с истёкшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что срок жизни данных истёк, он выполняет внеплановое объединение.

:::note TTL schedule
TTL не применяется немедленно, а срабатывает по расписанию, как отмечено выше. Настройка таблицы MergeTree `merge_with_ttl_timeout` задаёт минимальную задержку в секундах перед повторным объединением с удалением по TTL. Значение по умолчанию — 14400 секунд (4 часа). Но это только минимальная задержка; может пройти больше времени, прежде чем будет запущено объединение по TTL. Если значение слишком низкое, будет выполняться много внеплановых объединений, которые могут потреблять много ресурсов. Принудительно запустить истечение TTL можно командой `ALTER TABLE my_table MATERIALIZE TTL`.
:::



## Изменение TTL {#modifying-ttl}

Для изменения TTL пользователи могут:

1. **Изменить схему таблицы (рекомендуется)**. Для этого необходимо подключиться к экземпляру ClickHouse, например, с помощью [clickhouse-client](/interfaces/cli) или [Cloud SQL Console](/cloud/get-started/sql-console). Например, можно изменить TTL для таблицы `otel_logs` с помощью следующего DDL:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **Изменить OTel-коллектор**. ClickStack OpenTelemetry-коллектор создает таблицы в ClickHouse, если они не существуют. Это достигается через ClickHouse-экспортер, который предоставляет параметр `ttl` для управления выражением TTL по умолчанию, например:

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

### TTL на уровне столбца {#column-level-ttl}

Приведенные выше примеры удаляют данные на уровне таблицы. Пользователи также могут удалять данные на уровне столбца. По мере старения данных это можно использовать для удаления столбцов, ценность которых при анализе не оправдывает затраты ресурсов на их хранение. Например, мы рекомендуем сохранять столбец `Body` на случай добавления новых динамических метаданных, которые не были извлечены во время вставки, например новой метки Kubernetes. Через некоторое время, например через месяц, может стать очевидно, что эти дополнительные метаданные бесполезны — что снижает ценность сохранения столбца `Body`.

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
Указание TTL на уровне столбца требует от пользователей определения собственной схемы. Это невозможно указать в OTel-коллекторе.
:::
