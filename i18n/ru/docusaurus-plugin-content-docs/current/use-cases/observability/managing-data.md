---
title: Управление Данными
description: Управление Данными для Наблюдаемости
slug: /observability/managing-data
keywords: [наблюдаемость, логи, трассировки, метрики, OpenTelemetry, Grafana, OTel]
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';


# Управление Данными

Развертывания ClickHouse для наблюдаемости неизменно вовлекают большие объемы данных, которые необходимо управлять. ClickHouse предлагает ряд функций для помощи с управлением данными.

## Партиции {#partitions}

Партиционирование в ClickHouse позволяет логически разделять данные на диске в зависимости от колонки или SQL-выражения. Разделяя данные логически, каждая партиция может быть обработана независимо, например, удалена. Это позволяет пользователям перемещать партиции, а следовательно, подмножества, между уровнями хранения эффективно и время от времени [истекать данные/эффективно удалять из кластера](/sql-reference/statements/alter/partition).

Партиционирование задается в таблице при ее первоначальном определении с помощью ключевого слова `PARTITION BY`. Этот ключ может содержать SQL-выражение на любой колонке/колонках, результаты которого определят, в какую партицию будет отправлена строка.

<img src={observability_14}
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

Части данных логически связаны (через общее имя папки-префикса) с каждой партицией на диске и могут быть запрашиваемы в изоляции. Для примера ниже, схема `otel_logs` по умолчанию партиционируется по дням с использованием выражения `toDate(Timestamp)`. Когда строки вставляются в ClickHouse, это выражение будет оцениваться для каждой строки и направляться в результирующую партицию, если она существует (если строка является первой для дня, партиция будет создана).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

На партициях можно выполнить [ряд операций](/sql-reference/statements/alter/partition), включая [резервное копирование](/sql-reference/statements/alter/partition#freeze-partition), [манипуляции с колонками](/sql-reference/statements/alter/partition#clear-column-in-partition), мутации [изменяющие](/sql-reference/statements/alter/partition#update-in-partition)/[удаляющие](/sql-reference/statements/alter/partition#delete-in-partition) данные по строкам и [очистку индексов (например, вторичных индексов)](/sql-reference/statements/alter/partition#clear-index-in-partition).

В качестве примера предположим, что наша таблица `otel_logs` партиционирована по дням. Если она заполняется структурированным набором логов, она будет содержать несколько дней данных:

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

Текущие партиции можно найти, используя простой запрос к системной таблице:

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

У нас может быть другая таблица, `otel_logs_archive`, которую мы используем для хранения более старых данных. Данные могут быть перемещены в эту таблицу эффективно по партиции (это всего лишь изменение метаданных).

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--переместить данные в архивную таблицу
ALTER TABLE otel_logs
	(MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--подтвердить, что данные были перемещены
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

Это в отличие от других методов, которые потребовали бы использование `INSERT INTO SELECT` и переписывания данных в новую целевую таблицу.

:::note Перемещение партиций
[Перемещение партиций между таблицами](/sql-reference/statements/alter/partition#move-partition-to-table) требует выполнения нескольких условий; не в последнюю очередь таблицы должны иметь одинаковую структуру, ключ партиции, первичный ключ и индексы/проекции. Подробные примечания о том, как задать партиции в DDL `ALTER`, можно найти [здесь](/sql-reference/statements/alter/partition#how-to-set-partition-expression).
:::

Кроме того, данные можно эффективно удалять по партициям. Это гораздо более ресурсосберегающий метод, чем альтернативные техники (мутации или легкие удаления) и должен использоваться в первую очередь.

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
Эта функция используется TTL, когда установка [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) включена. См. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live) для получения дополнительной информации.
:::


### Применения {#applications}

Выше показано, как данные могут быть эффективно перемещены и манипулированы по партициям. На практике пользователи, вероятно, чаще всего будут использовать операции с партициями в сценариях наблюдаемости для следующих двух случаев:

- **Многоуровневые архитектуры** - Перемещение данных между уровнями хранения (см. [Уровни хранения](#storage-tiers)), что позволяет строить горячие-холодные архитектуры.
- **Эффективное удаление** - когда данные достигли указанного TTL (см. [Управление данными с помощью TTL](#data-management-with-ttl-time-to-live))

Мы подробно исследуем оба этих случая ниже.

### Производительность запросов {#query-performance}

Хотя партиции могут помочь с производительностью запросов, это сильно зависит от схем доступа. Если запросы направлены только на несколько партиций (желательно одну), производительность может улучшиться. Это обычно полезно только в том случае, если ключ партиционирования не входит в первичный ключ и вы фильтруете по нему. Однако запросы, которым необходимо охватить множество партиций, могут работать хуже, чем если бы партиционирование не использовалось (поскольку может быть больше частей). Преимущество нацеливания на одну партицию будет еще менее выраженным или вовсе отсутствующим, если ключ партиционирования уже является ранним элементом в первичном ключе. Партиционирование также может быть использовано для [оптимизации запросов GROUP BY](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key), если значения в каждой партиции уникальны. Однако, в общем, пользователи должны убедиться, что первичный ключ оптимизирован, и рассматривать партиционирование как технику оптимизации запросов в исключительных случаях, когда схемы доступа охватывают конкретное предсказуемое подмножество данных, например, партиционирование по дням, с большинством запросов за последний день. См. [здесь](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4) для примера этого поведения.

## Управление данными с помощью TTL (время жизни) {#data-management-with-ttl-time-to-live}

Время жизни (TTL) - это ключевая функция в решениях по наблюдаемости на базе ClickHouse для эффективного хранения и управления данными, особенно учитывая, что огромные объемы данных продолжают генерироваться. Реализация TTL в ClickHouse позволяет автоматическую экспирацию и удаление устаревших данных, гарантируя, что хранилище будет оптимально использоваться и производительность сохраняется без ручного вмешательства. Эта возможность необходима для поддержания базы данных в оптимальном состоянии, снижения затрат на хранение и обеспечения того, чтобы запросы оставались быстрыми и эффективными, сосредотачиваясь на наиболее актуальных и недавних данных. Более того, это помогает в соблюдении политики хранения данных, систематически управляя жизненными циклами данных, тем самым повышая общую устойчивость и масштабируемость решения для наблюдаемости.

TTL можно задать как на уровне таблицы, так и на уровне колонки в ClickHouse.

### Уровень таблицы TTL {#table-level-ttl}

Схема по умолчанию как для логов, так и для трассировок включает TTL, чтобы истекать данные по истечению определенного времени. Это указывается в экспортере ClickHouse под ключом `ttl`, например:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

Этот синтаксис в настоящее время поддерживает [синтаксис длительности Golang](https://pkg.go.dev/time#ParseDuration). **Мы рекомендуем пользователям использовать `h` и убедиться, что это совпадает с периодом партиционирования. Например, если вы партиционируете по дням, убедитесь, что это кратно дням, т.е. 24h, 48h, 72h.** Это автоматически обеспечит добавление условия TTL к таблице, например, если `ttl: 96h`.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

По умолчанию данные с истекшим TTL удаляются, когда ClickHouse [объединяет части данных](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage). Когда ClickHouse обнаруживает, что данные истекли, он выполняет внеплановое объединение.

:::note Запланированные TTL
TTL не применяются сразу, а скорее по расписанию, как указано выше. Параметр таблицы MergeTree `merge_with_ttl_timeout` задает минимальную задержку в секундах перед повторным объединением с удалением TTL. Значение по умолчанию - 14400 секунд (4 часа). Но это лишь минимальная задержка, может потребоваться больше времени, чтобы инициировать объединение TTL. Если значение слишком низкое, будет выполнено много внеплановых объединений, которые могут потреблять много ресурсов. Истечение TTL может быть принудительно вызвано с помощью команды `ALTER TABLE my_table MATERIALIZE TTL`.
:::

**Важно:** Мы рекомендуем использовать настройку [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) ** (применяется по умолчанию). Когда эта настройка включена, ClickHouse удаляет целую часть, когда все строки в ней истекают. Удаление целых частей вместо частичной очистки строк с истекшим TTL (что достигается через ресурсоемкие мутации при `ttl_only_drop_parts=0`) позволяет иметь более короткие времена `merge_with_ttl_timeout` и меньший влияние на производительность системы. Если данные партиционированы по тому же единице, на которой вы выполняете истечение TTL, например, по дням, части будут естественным образом содержать только данные из определенного интервала. Это гарантирует, что `ttl_only_drop_parts=1` может быть эффективно применен.

### Уровень колонки TTL {#column-level-ttl}

Вышеупомянутый пример истекает данные на уровне таблицы. Пользователи также могут истекать данные на уровне колонки. По мере старения данных это может использоваться для удаления колонок, значимость которых в расследованиях не оправдывает их дополнительные расходы на хранение. Например, мы рекомендуем сохранить колонку `Body` на случай, если новая динамическая метаинформация будет добавлена, которая не была извлечена во время вставки, например, новая метка Kubernetes. После периода, например, 1 месяц, может стать очевидно, что эта дополнительная метаинформация не является полезной - таким образом, уменьшая необходимость в сохранении колонки `Body`.

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
Указание TTL на уровне колонки требует от пользователей задания своей схемы. Это не может быть задано в OTel collector.
:::

## Рекомпрессия данных {#recompressing-data}

Хотя мы обычно рекомендуем `ZSTD(1)` для наборов данных наблюдаемости, пользователи могут экспериментировать с различными алгоритмами сжатия или более высокими уровнями сжатия, например, с `ZSTD(3)`. Кроме того, возможность указать это при создании схемы, сжатие может быть настроено для изменения после установленного периода. Это может быть уместно, если кодек или алгоритм сжатия улучшает сжатие, но ухудшает производительность запросов. Этот компромисс может быть приемлем для старых данных, которые запрашиваются реже, но не для недавних данных, которые подвержены более частому использованию в расследованиях.

Пример этого показан ниже, когда мы сжимаем данные с помощью `ZSTD(3)` после 4 дней вместо удаления их.

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
Мы рекомендуем пользователям всегда оценивать как вставку, так и влияние производительности запросов различных уровней и алгоритмов сжатия. Например, дельта-кодеки могут быть полезными в сжатии временных меток. Однако, если они являются частью первичного ключа, то производительность фильтрации может пострадать.
:::

Дополнительные сведения и примеры настройки TTL можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes). Примеры того, как TTL могут быть добавлены и изменены для таблиц и колонок, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl). Информацию о том, как TTL позволяют создавать иерархии хранения, такие как горячие-теплые архитектуры, смотрите [Уровни хранения](#storage-tiers).

## Уровни хранения {#storage-tiers}

В ClickHouse пользователи могут создавать уровни хранения на разных дисках, например, горячие/недавние данные на SSD и более старые данные, поддерживаемые S3. Эта архитектура позволяет использовать менее дорогое хранилище для более старых данных, у которых более высокие требования к SLA запросов из-за их редкого использования в расследованиях.

:::note Не применимо к ClickHouse Cloud
ClickHouse Cloud использует единую копию данных, которая поддерживается на S3, с кэшами узлов, поддерживаемыми SSD. Уровни хранения в ClickHouse Cloud, таким образом, не требуются.
:::

Создание уровней хранения требует от пользователей создания дисков, которые затем используются для формулирования политики хранения, с объемами, которые могут быть указаны во время создания таблицы. Данные могут автоматически перемещаться между дисками на основе уровня заполнения, размеров частей и приоритетов объемов. Дополнительные сведения можно найти [здесь](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes).

Хотя данные могут быть вручную перемещены между дисками с помощью команды `ALTER TABLE MOVE PARTITION`, движение данных между объемами также может контролироваться с помощью TTL. Полный пример можно найти [здесь](/guides/developer/ttl#implementing-a-hotwarmcold-architecture).

## Управление изменениями схемы {#managing-schema-changes}

Схемы логов и трассировок неизменно будут изменяться на протяжении жизни системы, например, когда пользователи мониторят новые системы, имеющие различную метаинформацию или метки пода. Создавая данные с использованием схемы OTel и захватывая оригинальные данные событий в структурированном формате, схемы ClickHouse будут устойчивы к этим изменениям. Однако, когда новая метаинформация становится доступной, и схемы доступа к запросам меняются, пользователи захотят обновить схемы в соответствии с этими изменениями.

Чтобы избежать простоя во время изменений схемы, у пользователей есть несколько вариантов, которые мы представляем ниже.

### Использование значений по умолчанию {#use-default-values}

Колонки могут быть добавлены в схему с использованием [`DEFAULT` значений](/sql-reference/statements/create/table#default). Указанное значение по умолчанию будет использоваться, если оно не указано во время вставки.

Изменения схемы могут быть внесены до изменения любой логики трансформации представления или конфигурации OTel collector, что приводит к тому, что эти новые колонки будут отправлены.

После изменения схемы пользователи могут перенастроить OTel collectors. Предполагая, что пользователи используют рекомендованный процесс, изложенный в ["Извлечение структуры с помощью SQL"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql), где OTel collectors отправляют свои данные в Null таблицу с представлением, ответственным за извлечение целевой схемы и отправку результатов в целевую таблицу для хранения, представление может быть изменено с помощью синтаксиса [`ALTER TABLE ... MODIFY QUERY`](/sql-reference/statements/alter/view). Предположим, у нас есть целевая таблица ниже с соответствующим материализованным представлением (аналогичным тому, что использовалось в "Извлечение структуры с помощью SQL") для извлечения целевой схемы из структурированных логов OTel:

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

Предположим, мы желаем извлечь новую колонку `Size` из `LogAttributes`. Мы можем добавить это в нашу схему с помощью `ALTER TABLE`, указав значение по умолчанию:

```sql
ALTER TABLE otel_logs_v2
	(ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

В приведенном выше примере мы указываем значение по умолчанию как ключ `size` в `LogAttributes` (это будет 0, если он не существует). Это означает, что запросы, которые обращаются к этой колонке для строк, не имеющих вставленного значения, должны обращаться к Map и, следовательно, будут медленнее. Мы также можем легко указать это как константу, например, 0, что уменьшит стоимость последующих запросов к строкам, у которых нет значения. Запрос к этой таблице показывает, что значение заполняется, как и ожидалось, из Map:

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

Чтобы гарантировать, что это значение будет вставлено для всех будущих данных, мы можем изменить наше материализованное представление с помощью синтаксиса `ALTER TABLE`, как показано ниже:

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

Последующие строки будут иметь колонку `Size`, заполненную во время вставки.

### Создание новых таблиц {#create-new-tables}

В качестве альтернативы вышеописанному процессу пользователи могут просто создать новую целевую таблицу с новой схемой. Все материализованные представления могут быть изменены, чтобы использовать новую таблицу с помощью `ALTER TABLE MODIFY QUERY.` С этим подходом пользователи могут версионировать свои таблицы, например, `otel_logs_v3`.

Этот подход оставляет пользователям несколько таблиц для запроса. Чтобы выполнять запросы по этим таблицам, пользователи могут использовать функцию [`merge`](/sql-reference/table-functions/merge), которая принимает шаблоны подстановки для имени таблицы. Мы демонстрируем это ниже, запрашивая v2 и v3 таблицы `otel_logs`:

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

Если пользователи хотят избежать использования функции `merge` и предоставить таблицу конечным пользователям, которая объединяет несколько таблиц, можно использовать [табличный движок Merge](/engines/table-engines/special/merge). Мы демонстрируем это ниже:

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

Это можно обновить всякий раз, когда новая таблица добавляется с помощью синтаксиса таблицы `EXCHANGE`. Например, чтобы добавить таблицу v4, мы можем создать новую таблицу и атомарно обменять ее с предыдущей версией.

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
│	200  │ 39259996 │
│	304  │  1378564 │
│	302  │   820118 │
│	404  │   429220 │
│	301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
