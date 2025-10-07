---
'slug': '/use-cases/observability/clickstack/ttl'
'title': 'Управление TTL'
'sidebar_label': 'Управление TTL'
'pagination_prev': null
'pagination_next': null
'description': 'Управление TTL с ClickStack'
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## TTL в ClickStack {#ttl-clickstack}

Время жизни (TTL) является ключевой функцией в ClickStack для эффективного хранения и управления данными, особенно учитывая, что巨大的 объемы данных постоянно генерируются. TTL позволяет автоматически истекать и удалять устаревшие данные, обеспечивая оптимальное использование хранилища и поддержание производительности без вмешательства человека. Эта возможность является важной для поддержания базы данных в «пухлом» состоянии, сокращения затрат на хранение и обеспечения того, чтобы запросы оставались быстрыми и эффективными, сосредоточиваясь на наиболее актуальных и последних данных. Более того, это помогает соблюдать политики хранения данных, систематически управляя жизненным циклом данных, тем самым улучшая общую устойчивость и масштабируемость решения для мониторинга.

**По умолчанию ClickStack сохраняет данные в течение 3 дней. Чтобы изменить это, смотрите ["Изменение TTL"](#modifying-ttl).**

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

Партиционирование в ClickHouse позволяет логически разделить данные на диске в соответствии с колонкой или SQL-выражением. Логически разделяя данные, каждая партиция может обрабатываться независимо, например, удаляться по истечении срока в соответствии с политикой TTL.

Как показано в приведенном выше примере, партиционирование задается в таблице при ее первоначальном определении с помощью оператора `PARTITION BY`. Этот оператор может содержать SQL-выражение по любой колонке, результаты которого будут определять, в какую партицию будет отправлена строка. Это приводит к логической ассоциации данных (через общий префикс имени папки) с каждой партицией на диске, которые затем можно запрашивать в отдельности. В приведенном выше примере по умолчанию схема `otel_logs` партиционируется по дням, используя выражение `toDate(Timestamp).` По мере вставки строк в ClickHouse это выражение будет оцениваться для каждой строки и направляться в соответствующую партицию, если она существует (если строка является первой для дня, партиция будет создана). Для получения дополнительной информации о партиционировании и его других применениях смотрите ["Партиции таблиц"](/partitions).

<Image img={observability_14} alt="Partitions" size="lg"/>

Схема таблицы также включает `TTL TimestampTime + toIntervalDay(3)` и установку `ttl_only_drop_parts = 1`. Первый оператор обеспечивает удаление данных, как только они старше 3 дней. Установка `ttl_only_drop_parts = 1` заставляет удаляться только истекшие части данных, где все данные истекли (в отличие от попыток частично удалить строки). Благодаря партиционированию, обеспечивающему, что данные из разных дней никогда не «сливаются», данные могут быть эффективно удалены.

:::important `ttl_only_drop_parts`
Рекомендуем всегда использовать установку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). Когда эта настройка включена, ClickHouse удаляет целую часть, когда все строки в ней истекли. Удаление целых частей вместо частичного удаления истекших строк (достигаемого через ресурсоемкие мутации, когда `ttl_only_drop_parts=0`) позволяет сократить время `merge_with_ttl_timeout` и уменьшить влияние на производительность системы. Если данные партиционированы по тому же критерию, по которому вы выполняете истечение TTL, например, по дням, части будут естественным образом содержать только данные из заданного интервала. Это обеспечит возможность эффективного применения `ttl_only_drop_parts=1`.
:::

По умолчанию данные с истекшим TTL удаляются, когда ClickHouse [сливает части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что данные истекли, он выполняет внеплановое слияние.

:::note Расписание TTL
TTL не применяются немедленно, а выполняются по расписанию, как упоминалось выше. Настройка MergeTree `merge_with_ttl_timeout` задает минимальную задержку в секундах перед повторным слиянием с удалением TTL. Значение по умолчанию – 14400 секунд (4 часа). Но это всего лишь минимальная задержка; может пройти больше времени, прежде чем будет запущено слияние TTL. Если значение слишком малое, будет выполнено много внеплановых слияний, которые могут потреблять много ресурсов. Принудительное истечение TTL можно выполнить с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

## Изменение TTL {#modifying-ttl}

Чтобы изменить TTL, пользователи могут:

1. **Изменить схемы таблиц (рекомендуется)**. Для этого требуется подключиться к экземпляру ClickHouse, например, используя [clickhouse-client](/interfaces/cli) или [Cloud SQL Console](/cloud/get-started/sql-console). Например, мы можем изменить TTL для таблицы `otel_logs` с помощью следующего DDL:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **Изменить OTel коллектор**. Коллектор OpenTelemetry ClickStack создает таблицы в ClickHouse, если они не существуют. Это достигается через экспортёр ClickHouse, который сам предоставляет параметр `ttl`, используемый для управления выражением по умолчанию TTL, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### TTL на уровне колонок {#column-level-ttl}

Приведенные выше примеры истекают данные на уровне таблицы. Пользователи также могут истекать данные на уровне колонок. С течением времени это можно использовать для удаления колонок, чьи значения в расследованиях не оправдывают их ресурсные затраты на хранение. Например, мы рекомендуем сохранять колонку `Body` на случай, если будут добавлены новые динамические метаданные, которые не были извлечены во время вставки, например, новая метка Kubernetes. После определенного периода, например, 1 месяц, может стать очевидным, что эти дополнительные метаданные не полезны, тем самым ограничивая ценность хранения колонки `Body`.

Ниже мы показываем, как колонка `Body` может быть удалена после 30 дней.

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
Указание TTL на уровне колонок требует от пользователей указания собственной схемы. Это нельзя указать в OTel коллекторе.
:::
