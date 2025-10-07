---
'title': 'Управление данными'
'description': 'Управление данными для мониторинга'
'slug': '/observability/managing-data'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
---
import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# Управление данными

Развертывания ClickHouse для мониторинга неизбежно связаны с большими наборами данных, которые необходимо управлять. ClickHouse предлагает ряд функций для помощи в управлении данными.

## Партиции {#partitions}

Партиционирование в ClickHouse позволяет логически разделить данные на диске в соответствии с колонкой или SQL-выражением. Логически разделяя данные, каждая партиция может обрабатываться независимо, например, удаляться. Это позволяет пользователям перемещать партиции, а значит и подсеты, между уровнями хранения эффективно в соответствии со временем или [истеканию данных/эффективному удалению из кластера](/sql-reference/statements/alter/partition).

Партиционирование указывается в таблице при ее первоначальном определении через оператор `PARTITION BY`. Этот оператор может содержать SQL-выражение для любой колонки, результаты которого определяют, в какую партицию будет отправлена строка.

<Image img={observability_14} alt="Партиции" size="md"/>

Части данных логически связаны (через общий префикс имени папки) с каждой партицией на диске и могут запрашиваться изолированно. Для приведенного ниже примера стандартная схема `otel_logs` партиционируется по дням, используя выражение `toDate(Timestamp)`. По мере вставки строк в ClickHouse это выражение будет вычисляться для каждой строки и направляться в результирующую партицию, если она существует (если строка первая за день, партиция будет создана).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

Существует [ряд операций](/sql-reference/statements/alter/partition), которые можно выполнять с партициями, включая [резервное копирование](/sql-reference/statements/alter/partition#freeze-partition), [манипуляции с колонками](/sql-reference/statements/alter/partition#clear-column-in-partition), мутации [изменения](/sql-reference/statements/alter/partition#update-in-partition)/[удаления](/sql-reference/statements/alter/partition#delete-in-partition) данных по строкам и [очистки индексов (например, вторичных индексов)](/sql-reference/statements/alter/partition#clear-index-in-partition).

Например, предположим, что наша таблица `otel_logs` партиционирована по дням. Если она заполнена структурированным набором данных логов, это будет содержать несколько дней данных:

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

Мы можем иметь другую таблицу, `otel_logs_archive`, которую мы используем для хранения старых данных. Данные можно эффективно перемещать в эту таблицу по партициям (это всего лишь изменение метаданных).

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

Это контрастирует с другими техниками, которые требуют использования `INSERT INTO SELECT` и переписывания данных в новую целевую таблицу.

:::note Перемещение партиций
[Перемещение партиций между таблицами](/sql-reference/statements/alter/partition#move-partition-to-table) требует выполнения нескольких условий, в частности, таблицы должны иметь одинаковую структуру, ключ партиционирования, первичный ключ и индексы/проекции. Подробные примечания о том, как указывать партиции в DDL `ALTER`, можно найти [здесь](/sql-reference/statements/alter/partition#how-to-set-partition-expression).
:::

Кроме того, данные можно эффективно удалять по партициям. Это значительно более эффективный способ использования ресурсов, чем альтернативные техники (мутации или легковесные удаления) и должен быть предпочтительным.

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
Эта функция используется TTL, когда устанавливается настройка [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts). См. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live) для получения дополнительных деталей.
:::

### Приложения {#applications}

Вышеописанное иллюстрирует, как данные могут эффективно перемещаться и манипулироваться по партициям. На практике пользователи вероятно чаще всего используют операции с партициями в сценариях мониторинга для двух ситуаций:

- **Уровневые архитектуры** - Перемещение данных между уровнями хранения (см. [Уровни хранения](#storage-tiers)), позволяя строить горячие-холодные архитектуры.
- **Эффективное удаление** - когда данные достигли заданного TTL (см. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live))

Мы подробнее рассмотрим оба этих сценария ниже.

### Производительность запросов {#query-performance}

Хотя партиции могут помочь с производительностью запросов, это во многом зависит от паттернов доступа. Если запросы нацелены только на несколько партиций (в идеале на одну), производительность может улучшиться. Это обычно полезно, если ключ партиционирования не входит в первичный ключ и вы фильтруете по нему. Однако запросы, которые покрывают многие партиции, могут работать хуже, чем если партиционирование не использовалось (так как может быть больше частей). Преимущество нацеливания на одну партицию будет еще менее выраженным в том случае, если ключ партиционирования уже является ранним элементом в первичном ключе. Партиционирование также можно использовать для [оптимизации запросов GROUP BY](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако в общем пользователи должны гарантировать, что первичный ключ оптимизирован, и рассматривать партиционирование как технику оптимизации запросов в исключительных случаях, когда паттерны доступа касаются конкретного предсказуемого подмножества данных, например, партиционирование по дням, когда большинство запросов касается последнего дня. См. [здесь](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4) для примера такого поведения.

## Управление данными с TTL (Time-to-live) {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) является ключевой функцией в решениях мониторинга на базе ClickHouse для эффективного хранения и управления данными, особенно учитывая, что огромные объемы данных постоянно генерируются. Реализация TTL в ClickHouse позволяет автоматически истекать и удалять старые данные, обеспечивая оптимальное использование хранения и поддержание производительности без ручного вмешательства. Эта возможность необходима для поддержания базы данных в компактном состоянии, снижения затрат на хранение и обеспечения быстрого и эффективного выполнения запросов, сосредотачиваясь на наиболее актуальных и свежих данных. Более того, это помогает соответствовать политикам хранения данных, систематически управляя жизненным циклом данных, тем самым повышая общую устойчивость и масштабируемость решения для мониторинга.

TTL может быть указан как на уровне таблицы, так и на уровне колонки в ClickHouse.

### Уровень таблицы TTL {#table-level-ttl}

Стандартная схема как для логов, так и для трассировок включает TTL для истечения данных через заданный период. Это указывается в экспортере ClickHouse под ключом `ttl`, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

Этот синтаксис в настоящее время поддерживает [синтаксис длительности Golang](https://pkg.go.dev/time#ParseDuration). **Рекомендуем пользователям использовать `h` и убедиться, что это соответствует периоду партиционирования. Например, если вы партиционируете по дням, убедитесь, что это кратно дням, например, 24ч, 48ч, 72ч.** Это автоматически обеспечит добавление условия TTL в таблицу, например, если `ttl: 96h`.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

По умолчанию данные с истекшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что данные истекли, он выполняет внеплановое объединение.

:::note Запланированные TTL
TTL не применяются немедленно, а скорее по расписанию, как было упомянуто выше. Параметр таблицы MergeTree `merge_with_ttl_timeout` устанавливает минимальную задержку в секундах перед повторным объединением с удалением TTL. Значение по умолчанию составляет 14400 секунд (4 часа). Но это только минимальная задержка, может потребоваться больше времени, прежде чем сработает объединение TTL. Если значение слишком низкое, это приведет к множеству внеплановых объединений, которые могут потреблять много ресурсов. Срочную истечение TTL можно принудительно вызвать с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

**Важно: Рекомендуем использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) (применяется по умолчанию схемы). Когда эта настройка включена, ClickHouse удаляет целую часть, когда все строки в ней истекли. Удаление целых частей вместо частичной очистки строк с TTL (что достигается через ресурсоемкие мутации, когда `ttl_only_drop_parts=0`) позволяет иметь более короткие промежутки времени `merge_with_ttl_timeout` и меньший влияние на производительность системы. Если данные партиционированы по тому же принципу, по которому вы выполняете истечение TTL, например, по дням, части будут естественным образом содержать только данные из определенного интервала. Это обеспечит эффективное применение `ttl_only_drop_parts=1`.

### Уровень колонки TTL {#column-level-ttl}

Вышеуказанный пример истекает данные на уровне таблицы. Пользователи также могут истекать данные на уровне колонки. По мере старения данных это может использоваться для удаления колонок, значение которых в исследованиях не оправдывает их ресурсоемкость для хранения. Например, мы рекомендуем сохранять колонку `Body`, на случай если добавятся новые динамические метаданные, которые не были извлечены во время вставки, например, новая метка Kubernetes. Через определенное время, например, через 1 месяц, может стать очевидным, что эти дополнительные метаданные не полезны - тем самым ограничивая ценность сохранения колонки `Body`.

Ниже мы показываем, как колонка `Body` может быть удалена через 30 дней.

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
Указание TTL на уровне колонки требует от пользователей указания своей схемы. Это не может быть указано в сборщике OTel.
:::

## Повторное сжатие данных {#recompressing-data}

Хотя мы обычно рекомендуем `ZSTD(1)` для наборов данных мониторинга, пользователи могут экспериментировать с различными алгоритмами сжатия или более высокими уровнями сжатия, например, `ZSTD(3)`. Кроме того, возможность указать это при создании схемы, сжатие может быть настроено на изменение по истечении установленного периода. Это может быть актуально, если кодек или алгоритм сжатия улучшает сжатие, но ухудшает производительность запросов. Эта компромисс может быть приемлем для старых данных, которые запрашиваются реже, но не для недавних данных, которые подвергаются более частому использованию в расследованиях.

Пример этого показан ниже, где мы сжимаем данные, используя `ZSTD(3)` после 4 дней вместо их удаления.

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
Рекомендуем пользователям всегда оценивать как влияние на производительность вставок, так и производительность запросов от разных уровней и алгоритмов сжатия. Например, дельта-кодеки могут быть полезны для сжатия временных меток. Однако, если они являются частью первичного ключа, то производительность фильтрации может пострадать.
:::

Дополнительные детали и примеры настройки TTL можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes). Примеры того, как TTL могут быть добавлены и изменены для таблиц и колонок, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl). Чтобы узнать, как TTL позволяют создавать иерархии хранения, такие как горячие-теплые архитектуры, см. [Уровни хранения](#storage-tiers).

## Уровни хранения {#storage-tiers}

В ClickHouse пользователи могут создавать уровни хранения на различных дисках, например, горячие/недавние данные на SSD и старые данные на S3. Эта архитектура позволяет использовать менее дорогие хранилища для стары данных, которые имеют более высокие требования к SLA запросов из-за реже использования в расследованиях.

:::note Не относится к ClickHouse Cloud
ClickHouse Cloud использует одну копию данных, которая хранится на S3, с кешами узлов, поддерживаемыми SSD. Следовательно, уровни хранения в ClickHouse Cloud не требуются.
:::

Создание уровней хранения требует от пользователей создания дисков, которые затем используются для формулирования политик хранения, с размерами объемов, которые могут быть указаны во время создания таблицы. Данные могут автоматически перемещаться между дисками на основе уровней заполнения, размеров частей и приоритетов объемов. Дополнительные детали можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes).

Хотя данные можно вручную перемещать между дисками с помощью команды `ALTER TABLE MOVE PARTITION`, движение данных между объемами также можно контролировать с помощью TTL. Полный пример можно найти [здесь](/guides/developer/ttl#implementing-a-hotwarmcold-architecture).

## Управление изменениями схемы {#managing-schema-changes}

Схемы логов и трассировок неизбежно будут изменяться в течение жизни системы, например, когда пользователи мониторят новые системы с разными метаданными или метками подов. Создавая данные с использованием схемы OTel и захватывая оригинальные данные событий в структурированном формате, схемы ClickHouse будут устойчивы к этим изменениям. Однако, с появлением новых метаданных и изменением паттернов доступа к запросам, пользователи захотят обновлять схемы, чтобы отразить эти изменения.

Чтобы избежать простоев во время изменений схемы, у пользователей есть несколько вариантов, которые мы представим ниже.

### Использование значений по умолчанию {#use-default-values}

Столбцы могут быть добавлены в схему с использованием [`DEFAULT` значений](/sql-reference/statements/create/table#default). Указанное значение по умолчанию будет использовано, если оно не указано во время INSERT.

Изменения схемы могут быть сделаны до изменения любой логики преобразования материализованного представления или конфигурации сборщика OTel, что приводит к отправке этих новых колонок.

После изменения схемы пользователи могут перенастроить сборщики OTel. Предполагая, что пользователи используют рекомендуемый процесс, изложенный в ["Извлечение структуры с помощью SQL"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql), где сборщики OTel отправляют свои данные в таблицу Null с материализованным представлением, ответственным за извлечение целевой схемы и отправку результатов в целевую таблицу для хранения, представление может быть изменено с использованием синтаксиса [`ALTER TABLE ... MODIFY QUERY`](/sql-reference/statements/alter/view). Предположим, у нас есть целевая таблица ниже с соответствующим материализованным представлением (аналогичным тому, что использовалось в "Извлечение структуры с помощью SQL") для извлечения целевой схемы из структурированных логов OTel:

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

Предположим, что мы хотим извлечь новый столбец `Size` из `LogAttributes`. Мы можем добавить это в нашу схему с помощью `ALTER TABLE`, указав значение по умолчанию:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

В приведенном выше примере мы указываем значение по умолчанию как ключ `size` в `LogAttributes` (это будет 0, если он не существует). Это означает, что запросы, которые обращаются к этому столбцу для строк, у которых значение не было вставлено, должны получить доступ к Map, и, следовательно, будут работать медленнее. Мы также можем легко указать это как константу, например, 0, что снижает стоимость последующих запросов к строкам, у которых нет этого значения. Запрос к этой таблице показывает, что значение заполняется, как и ожидалось, из Map:

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

Чтобы гарантировать, что это значение вставляется для всех будущих данных, мы можем изменить наше материализованное представление, используя синтаксис `ALTER TABLE`, как показано ниже:

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

Последующие строки будут иметь заполняемый столбец `Size` во время вставки.

### Создание новых таблиц {#create-new-tables}

В качестве альтернативы вышеописанному процессу пользователи могут просто создать новую целевую таблицу с новой схемой. Любые материализованные представления могут быть изменены для использования новой таблицы с помощью вышеприведенного синтаксиса `ALTER TABLE MODIFY QUERY`. С помощью этого подхода пользователи могут версионировать свои таблицы, например, `otel_logs_v3`.

Этот подход оставляет пользователям несколько таблиц для выполнения запросов. Для выполнения запросов по нескольким таблицам пользователи могут использовать [`merge` функцию](/sql-reference/table-functions/merge), которая принимает шаблоны с подстановочными знаками для имени таблицы. Мы демонстрируем это ниже, выполняя запросы к версии 2 и 3 таблицы `otel_logs`:

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

Если пользователи хотят избежать использования функции `merge` и предоставить пользователям интерфейса конечной таблицы, объединяющей несколько таблиц, можно использовать [движок таблиц Merge](/engines/table-engines/special/merge). Мы демонстрируем это ниже:

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

Это можно обновить в любое время, когда добавляется новая таблица, используя синтаксис таблицы `EXCHANGE`. Например, чтобы добавить таблицу версии 4, мы можем создать новую таблицу и атомарно обменяться ею с предыдущей версией.

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