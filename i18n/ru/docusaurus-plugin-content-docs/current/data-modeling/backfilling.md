---
'slug': '/data-modeling/backfilling'
'title': 'Заполнение данных'
'description': 'Как использовать backfill для больших наборов данных в ClickHouse'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
'doc_type': 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# Заполнение данных

Независимо от того, новичок ли вы в ClickHouse или отвечаете за существующее развертывание, пользователям неизбежно потребуется заполнить таблицы историческими данными. В некоторых случаях это достаточно просто, но может стать более сложным, когда нужно заполнять материализованные представления. Этот гид описывает некоторые процессы для этой задачи, которые пользователи могут применить к своему случаю.

:::note
В этом руководстве предполагается, что пользователи уже знакомы с концепцией [Инкрементных материализованных представлений](/materialized-view/incremental-materialized-view) и [загрузкой данных с использованием табличных функций, таких как s3 и gcs](/integrations/s3). Мы также рекомендуем пользователям прочитать наше руководство по [оптимизации производительности вставок из объектного хранилища](/integrations/s3/performance), советы из которого могут быть применены к вставкам на протяжении всего этого руководства.
:::

## Пример набора данных {#example-dataset}

На протяжении этого руководства мы используем набор данных PyPI. Каждая строка в этом наборе данных представляет собой загрузку пакета Python с использованием инструмента, такого как `pip`.

Например, этот поднабор охватывает один день - `2024-12-17` и доступен публично по адресу `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`. Пользователи могут выполнять запросы с помощью:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

Полный набор данных для этой корзины содержит более 320 ГБ файлов parquet. В приведенных ниже примерах мы намеренно нацеливаемся на поднаборы, используя шаблоны glob.

Мы предполагаем, что пользователь получает поток этих данных, например, из Kafka или объектного хранилища, для данных после этой даты. Схема для этих данных показана ниже:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')
FORMAT PrettyCompactNoEscapesMonoBlock
SETTINGS describe_compact_output = 1

┌─name───────────────┬─type────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ timestamp │ Nullable(DateTime64(6))                                                                                                                 │
│ country_code       │ Nullable(String)                                                                                                                        │
│ url │ Nullable(String)                                                                                                                        │
│ project            │ Nullable(String)                                                                                                                        │
│ file │ Tuple(filename Nullable(String), project Nullable(String), version Nullable(String), type Nullable(String))                             │
│ installer          │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ python             │ Nullable(String)                                                                                                                        │
│ implementation     │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ distro             │ Tuple(name Nullable(String), version Nullable(String), id Nullable(String), libc Tuple(lib Nullable(String), version Nullable(String))) │
│ system │ Tuple(name Nullable(String), release Nullable(String))                                                                                  │
│ cpu                │ Nullable(String)                                                                                                                        │
│ openssl_version    │ Nullable(String)                                                                                                                        │
│ setuptools_version │ Nullable(String)                                                                                                                        │
│ rustc_version      │ Nullable(String)                                                                                                                        │
│ tls_protocol       │ Nullable(String)                                                                                                                        │
│ tls_cipher         │ Nullable(String)                                                                                                                        │
└────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
Полный набор данных PyPI, состоящий из более чем 1 триллиона строк, доступен в нашей публичной демонстрационной среде [clickpy.clickhouse.com](https://clickpy.clickhouse.com). Для получения дополнительных сведений об этом наборе данных, включая то, как демонстрация использует материализованные представления для повышения производительности и как данные пополняются ежедневно, смотрите [здесь](https://github.com/ClickHouse/clickpy).
:::

## Сценарии заполнения данных {#backfilling-scenarios}

Заполнение данных обычно требуется, когда поток данных потребляется с определенного момента времени. Эти данные вставляются в таблицы ClickHouse с [инкрементными материализованными представлениями](/materialized-view/incremental-materialized-view), которые срабатывают при вставке блоков. Эти представления могут трансформировать данные перед вставкой или вычислять агрегаты и отправлять результаты в целевые таблицы для дальнейшего использования в приложениях.

Мы постараемся охватить следующие сценарии:

1. **Заполнение данных с существующим приемом данных** - Загружаются новые данные, и необходимо заполнить исторические данные. Эти исторические данные уже идентифицированы.
2. **Добавление материализованных представлений к существующим таблицам** - Необходимо добавить новые материализованные представления к установке, для которой были заполнены исторические данные, и данные уже потоковые.

Мы предполагаем, что данные будут заполняться из объектного хранилища. В любом случае мы стремимся избежать пауз в вставке данных.

Рекомендуем заполнять исторические данные из объектного хранилища. Данные должны экспортироваться в Parquet, где это возможно, для оптимальной производительности чтения и сжатия (снижения сетевой передачи). Обычно предпочтителен размер файла около 150 МБ, но ClickHouse поддерживает более [70 форматов файлов](/interfaces/formats) и способен обрабатывать файлы любого размера.

## Использование дублирующих таблиц и представлений {#using-duplicate-tables-and-views}

Для всех сценариев мы опираемся на концепцию "дублирующих таблиц и представлений". Эти таблицы и представления представляют собой копии тех, которые используются для потоковых данных, и позволяют выполнять заполнение в изоляции с простым способом восстановления в случае сбоя. Например, у нас есть основная таблица `pypi` и соответствующее материализованное представление, которое вычисляет количество загрузок на проект Python:

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `on` String
)
ENGINE = MergeTree
ORDER BY (project, timestamp)

CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
AS SELECT
 project,
    count() AS count
FROM pypi
GROUP BY project
```

Мы заполняем основную таблицу и связанное представление поднабором данных:

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15 thousand rows, 769.23 KB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

Предположим, что мы хотим загрузить еще один поднабор `{101..200}`. Хотя мы могли бы вставить данные непосредственно в `pypi`, мы можем сделать это заполнение в изоляции, создав дублирующие таблицы.

Если задание по заполнению не удалось, мы не повлияли на наши основные таблицы и можем просто [обрезать](/managing-data/truncate) наши дублирующие таблицы и повторить процесс.

Чтобы создать новые копии этих представлений, мы можем использовать оператор `CREATE TABLE AS` с суффиксом `_v2`:

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT
 project,
    count() AS count
FROM pypi_v2
GROUP BY project
```

Мы заполняем это нашим 2-м поднабором примерно того же размера и подтверждаем успешную загрузку.

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49 thousand rows, 763.90 KB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```

Если в любой момент во время этой второй загрузки произошел сбой, мы просто [обрезаем](/managing-data/truncate) наши `pypi_v2` и `pypi_downloads_v2` и повторяем загрузку данных.

После завершения загрузки мы можем переместить данные из наших дублирующих таблиц в основные таблицы, используя оператор [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table).

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note Имена партиций
В приведенном выше вызове `MOVE PARTITION` используется имя партиции `()`. Это представляет собой единственную партицию для этой таблицы (которая не является партиционированной). Для таблиц, которые являются партиционированными, пользователям необходимо будет вызвать несколько вызовов `MOVE PARTITION` - по одному для каждой партиции. Название текущих партиций можно установить из таблицы [`system.parts`](/operations/system-tables/parts), например, `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

Теперь мы можем подтвердить, что `pypi` и `pypi_downloads` содержат полные данные. `pypi_downloads_v2` и `pypi_v2` могут быть безопасно удалены.

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01 million
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01 million
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

Важно, что операция `MOVE PARTITION` является легковесной (использует жесткие ссылки) и атомарной, т.е. она либо завершится неудачно, либо успешно без промежуточного состояния.

Мы активно используем этот процесс в наших сценариях заполнения данных ниже.

Обратите внимание, что этот процесс требует от пользователей выбирать размер каждой операции вставки.

Более крупные вставки, т.е. больше строк, означают, что потребуется меньше операций `MOVE PARTITION`. Однако это необходимо сбалансировать с затратами в случае сбоя вставки, например, из-за сбоя сети, для восстановления. Пользователи могут дополнить этот процесс объединением файлов для снижения риска. Это можно выполнить с помощью запроса диапазона, например, `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`, или с помощью шаблонов glob. Например,

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--continued to all files loaded OR MOVE PARTITION call is performed
```

:::note
ClickPipes использует этот подход при загрузке данных из объектного хранилища, автоматически создавая дубликаты целевой таблицы и ее материализованных представлений, избегая необходимости пользователю выполнять вышеуказанные шаги. Также, используя несколько потоков рабочих сотрудников, каждый из которых обрабатывает разные поднаборы (через шаблоны glob) и имеет свои собственные дублирующие таблицы, данные могут быстро загружаться с семантикой exactly-once. Для тех, кто заинтересован, дополнительную информацию можно найти [в этом блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).
:::

## Сценарий 1: Заполнение данных с существующим приемом данных {#scenario-1-backfilling-data-with-existing-data-ingestion}

В этом сценарии мы предполагаем, что данные для заполнения не находятся в изолированной корзине, и поэтому требуется фильтрация. Данные уже вставляются, и можно идентифицировать временную метку или монотонную увеличивающуюся колонку, с которой необходимо заполнить исторические данные.

Этот процесс включает следующие шаги:

1. Определите контрольную точку - либо временную метку, либо значение колонки, с которой необходимо восстановить исторические данные.
2. Создайте дубликаты основной таблицы и целевых таблиц для материализованных представлений.
3. Создайте копии любых материализованных представлений, указывающих на целевые таблицы, созданные на шаге (2).
4. Вставьте данные в нашу дублирующую основную таблицу, созданную на шаге (2).
5. Переместите все партиции из дублирующих таблиц в их оригинальные версии. Удалите дублирующие таблицы.

Например, в наших данных PyPI предположим, что у нас есть загруженные данные. Мы можем определить минимальную временную метку и, таким образом, нашу "контрольную точку".

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

Из вышеизложенного мы понимаем, что нам нужно загрузить данные до `2024-12-17 09:00:00`. Используя наш предыдущий процесс, мы создаем дублирующие таблицы и представления и загружаем поднабор, применяя фильтр на временную метку.

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT project, count() AS count
FROM pypi_v2
GROUP BY project

INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-*.parquet')
WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 500.152 sec. Processed 2.74 billion rows, 364.40 GB (5.47 million rows/s., 728.59 MB/s.)
```
:::note
Фильтрация по временным меткам в Parquet может быть очень эффективной. ClickHouse будет читать только колонку временной метки, чтобы определить все диапазоны данных для загрузки, минимизируя сетевой трафик. Индексы Parquet, такие как min-max, также могут быть использованы движком запросов ClickHouse.
:::

Как только эта вставка завершена, мы можем переместить связанные партиции.

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

Если исторические данные находятся в изолированной корзине, фильтр по времени не требуется. Если временная или монотонная колонка недоступна, выделите ваши исторические данные.

:::note Просто используйте ClickPipes в ClickHouse Cloud
Пользователи ClickHouse Cloud должны использовать ClickPipes для восстановления исторических резервных копий, если данные могут быть изолированы в своей собственной корзине (и фильтр не требуется). Кроме того, параллелизуя загрузку с несколькими рабочими потоками, тем самым уменьшая время загрузки, ClickPipes автоматизирует вышеуказанный процесс - создавая дублирующие таблицы как для основной таблицы, так и для материализованных представлений.
:::

## Сценарий 2: Добавление материализованных представлений к существующим таблицам {#scenario-2-adding-materialized-views-to-existing-tables}

Не редкость, что новые материализованные представления необходимо добавлять к установке, для которой было заполнено значительное количество данных, и данные продолжают вставляться. Временная метка или монотонная увеличивающаяся колонка, которая может быть использована для идентификации точки в потоке, полезна здесь и позволяет избежать пауз в загрузке данных. В приведенных ниже примерах мы предполагаем оба случая, предпочитая подходы, которые избегают пауз в загрузке.

:::note Избегайте POPULATE
Мы не рекомендуем использовать команду [`POPULATE`](/sql-reference/statements/create/view#materialized-view) для заполнения материализованных представлений для чего-либо, кроме небольших наборов данных, когда загрузка приостановлена. Этот оператор может пропустить строки, вставленные в его исходную таблицу, и материализованное представление будет создано после завершения хеширования заполнения. Более того, это заполнение выполняется для всех данных и подвержено прерываниям или ограничениям по памяти при больших наборах данных.
:::

### Доступна временная метка или монотонная увеличивающаяся колонка {#timestamp-or-monotonically-increasing-column-available}

В этом случае мы рекомендуем, чтобы новое материализованное представление включало фильтр, ограничивающий строки теми, которые больше произвольных данных в будущем. Затем материализованное представление может быть заполнено с этой даты, используя исторические данные из основной таблицы. Подход к заполнению зависит от размера данных и сложности связанного запроса.

Наш самый простой подход включает следующие шаги:

1. Создайте наше материализованное представление с фильтром, который учитывает только строки, превышающие произвольное время в ближайшем будущем.
2. Выполните запрос `INSERT INTO SELECT`, который вставляет данные в целевую таблицу нашего материализованного представления, считывая из исходной таблицы с использованием запроса агрегации представления.

Это можно дополнительно улучшить, нацеливаясь на поднаборы данных на шаге (2) и/или используя дублирующую целевую таблицу для материализованного представления (присоединение партиций к оригиналу после завершения вставки) для облегчения восстановления после сбоя.

Рассмотрим следующее материализованное представление, которое вычисляет самые популярные проекты по часу.

```sql
CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project
```

Хотя мы можем добавить целевую таблицу, прежде чем добавлять материализованное представление, мы модифицируем его оператор `SELECT`, чтобы включить фильтр, который учитывает только строки более поздних значений чем произвольное время в ближайшем будущем - в данном случае мы предполагаем, что `2024-12-17 09:00:00` - это несколько минут в будущем.

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

После добавления этого представления мы можем заполнить все данные для материализованного представления до этой даты.

Самый простой способ сделать это - просто выполнить запрос из материализованного представления по основной таблице с фильтром, который игнорирует недавно добавленные данные, вставляя результаты в целевую таблицу нашего представления с помощью `INSERT INTO SELECT`. Например, для приведенного выше представления:

```sql
INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) AS hour,
 project,
    count() AS count
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
GROUP BY
    hour,
 project

Ok.

0 rows in set. Elapsed: 2.830 sec. Processed 798.89 million rows, 17.40 GB (282.28 million rows/s., 6.15 GB/s.)
Peak memory usage: 543.71 MiB.
```

:::note
В приведенном выше примере нашей целевой таблицей является [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). В этом случае мы можем просто использовать наш оригинальный запрос агрегации. Для более сложных случаев, которые используют [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), пользователи будут использовать функции `-State` для агрегатов. Пример этого можно найти [здесь](/integrations/s3/performance#be-aware-of-merges).
:::

В нашем случае это относительно легкая агрегация, которая завершается менее чем за 3 секунды и использует менее 600MiB памяти. Для более сложных или длительных агрегаций пользователи могут сделать этот процесс более устойчивым, используя ранее упомянутый подход с дублирующей таблицей, т.е. создайте теневую целевую таблицу, например, `pypi_downloads_per_day_v2`, вставьте данные в нее и присоедините полученные партиции к `pypi_downloads_per_day`.

Часто запрос материализованного представления может быть более сложным (это не редкость, иначе пользователи не использовали бы представление!) и потреблять ресурсы. В редких случаях ресурсы для выполнения запроса могут превышать возможности сервера. Это подчеркивает одно из преимуществ материализованных представлений ClickHouse - они инкрементные и не обрабатывают весь набор данных сразу!

В этом случае у пользователей есть несколько вариантов:

1. Измените ваш запрос для заполнения диапазонов, например, `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`, `WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` и т.д.
2. Используйте [Null движок таблицы](/engines/table-engines/special/null) для заполнения материализованного представления. Это имитирует типичное инкрементное заполнение материализованного представления, выполняя его запрос над блоками данных (настраиваемого размера).

(1) представляет собой самый простой подход, который часто является достаточным. Мы не приводим примеры для краткости.

Мы более подробно рассмотрим (2) ниже.

#### Использование Null движка таблицы для заполнения материализованных представлений {#using-a-null-table-engine-for-filling-materialized-views}

[Null движок таблицы](/engines/table-engines/special/null) обеспечивает движок хранения, который не сохраняет данные (рассматривайте его как `/dev/null` в мире движков таблиц). Хотя это кажется противоречивым, материализованные представления все равно будут выполняться на данных, вставленных в этот движок таблицы. Это позволяет строить материализованные представления без сохранения оригинальных данных - избегая ввода-вывода и связанных с ним затрат на хранение.

Важно, чтобы любые материализованные представления, присоединенные к движку таблицы, все равно выполнялись по блокам данных по мере их вставки - отправляя свои результаты в целевую таблицу. Эти блоки имеют настраиваемый размер. Хотя более крупные блоки могут быть потенциально более эффективными (и быстрее обрабатываемыми), они потребляют больше ресурсов (в первую очередь памяти). Использование этого движка таблицы означает, что мы можем поэтапно строить наше материализованное представление, т.е. по одному блоку за раз, избегая необходимости удерживать всю агрегацию в памяти.

<Image img={nullTableMV} size="md" alt="Денормализация в ClickHouse"/>

<br />

Рассмотрим следующий пример:

```sql
CREATE TABLE pypi_v2
(
    `timestamp` DateTime,
    `project` String
)
ENGINE = Null

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv_v2 TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project
```

Здесь мы создаем Null таблицу `pypi_v2`, чтобы получать строки, которые будут использованы для построения нашего материализованного представления. Обратите внимание, как мы ограничиваем схему только необходимыми колонками. Наше материализованное представление выполняет агрегацию над строками, вставленными в эту таблицу (по одному блоку за раз), отправляя результаты в нашу целевую таблицу `pypi_downloads_per_day`.

:::note
Мы использовали `pypi_downloads_per_day` как нашу целевую таблицу здесь. Для дополнительной устойчивости пользователи могут создать дублирующую таблицу `pypi_downloads_per_day_v2` и использовать это как целевую таблицу представления, как показано в предыдущих примерах. После завершения вставки партиции в `pypi_downloads_per_day_v2` могут, в свою очередь, быть перемещены в `pypi_downloads_per_day`. Это позволило бы восстановиться в случае сбоя вставки из-за ограничений по памяти или перебоев в работе сервера, т.е. мы просто обрезаем `pypi_downloads_per_day_v2`, настраиваем параметры и пробуем снова.
:::

Чтобы заполнить это материализованное представление, мы просто вставляем соответствующие данные для заполнения в `pypi_v2` из `pypi.`

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

Обратите внимание, что использование памяти здесь составляет `639.47 MiB`.

##### Настройка производительности и ресурсов {#tuning-performance--resources}

Несколько факторов определяют производительность и ресурсы, используемые в вышеописанном сценарии. Прежде чем пытаться настраивать, мы рекомендуем читателям понять механику вставки, подробно описанную в разделе [Использование потоков для чтения](/integrations/s3/performance#using-threads-for-reads) руководства по [Оптимизации производительности вставок и чтения для S3](/integrations/s3/performance). Вкратце:

- **Чтение в параллельном режиме** - Количество потоков, используемых для чтения. Контролируется через [`max_threads`](/operations/settings/settings#max_threads). В ClickHouse Cloud это определяется размером экземпляра по умолчанию, равным количеству vCPU. Увеличение этого значения может улучшить производительность чтения за счет увеличения использования памяти.
- **Параллелизм вставок** - Количество потоков вставки, используемых для вставки. Контролируется через [`max_insert_threads`](/operations/settings/settings#max_insert_threads). В ClickHouse Cloud это определяется размером экземпляра (от 2 до 4) и установлено на 1 в OSS. Увеличение этого значения может улучшить производительность за счет увеличения использования памяти.
- **Размер блока вставки** - Данные обрабатываются в цикле, где они извлекаются, анализируются и формируются в блоки вставки в памяти на основе [ключа партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key). Эти блоки сортируются, оптимизируются, сжимаются и записываются в хранилище в виде новых [частей данных](/parts). Размер блока вставки, контролируемый настройками [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) и [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (несжатый), влияет на использование памяти и ввод-вывод диска. Более крупные блоки используют больше памяти, но создают меньше частей, снижая ввод-вывод и фоновое слияние. Эти настройки представляют собой минимальные пороги (какое из них достигнуто первым, вызывает сброс).
- **Размер блока для материализованных представлений** - Кроме вышеописанных механизмов для основной вставки, перед вставкой в материализованные представления блоки также сжимаются для более эффективной обработки. Размер этих блоков определяется настройками [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) и [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views). Более крупные блоки позволяют более эффективно обрабатывать, но требуют большего использования памяти. По умолчанию эти настройки возвращаются к значениям настроек исходной таблицы [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) и [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes).

Чтобы улучшить производительность, пользователи могут следовать рекомендациям, изложенным в разделе [Настройка потоков и размера блоков для вставок](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) в [руководстве по оптимизации производительности вставок и чтения для S3](/integrations/s3/performance). Обычно нет необходимости дополнительно изменять `min_insert_block_size_bytes_for_materialized_views` и `min_insert_block_size_rows_for_materialized_views`, чтобы увеличить производительность. Если они изменены, используйте те же лучшие практики, как и для `min_insert_block_size_rows` и `min_insert_block_size_bytes`.

Чтобы минимизировать использование памяти, пользователи могут поэкспериментировать с этими настройками. Это, безусловно, снизит производительность. На основе предыдущего запроса мы показываем примеры ниже.

Снижение `max_insert_threads` до 1 уменьшает нашу нагрузку на память.

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0 rows in set. Elapsed: 27.752 sec. Processed 1.50 billion rows, 33.48 GB (53.89 million rows/s., 1.21 GB/s.)
Peak memory usage: 506.78 MiB.
```

Мы можем еще больше снизить память, уменьшив настройку `max_threads` до 1.

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0 rows in set. Elapsed: 43.907 sec. Processed 1.50 billion rows, 33.48 GB (34.06 million rows/s., 762.54 MB/s.)
Peak memory usage: 272.53 MiB.
```

Наконец, мы можем еще больше снизить память, установив `min_insert_block_size_rows` в 0 (это отключает его как решающий фактор для размера блока) и `min_insert_block_size_bytes` в 10485760 (10 MiB).

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 1.50 billion rows, 33.48 GB (34.54 million rows/s., 773.36 MB/s.)
Peak memory usage: 218.64 MiB.
```

Наконец, имейте в виду, что уменьшение размеров блоков приводит к созданию большего количества частей и вызывает большее давление на слияние. Как обсуждалось [здесь](/integrations/s3/performance#be-aware-of-merges), эти настройки следует изменять осторожно.

### Нет временной метки или монотонной увеличивающейся колонки {#no-timestamp-or-monotonically-increasing-column}

Вышеописанные процессы зависят от наличия у пользователя временной метки или монотонной увеличивающейся колонки. В некоторых случаях это просто недоступно. В этом случае мы рекомендуем следующий процесс, который использует многие из вышеописанных шагов, но требует от пользователей приостановить вставку.

1. Приостановите вставки в вашей основной таблице.
2. Создайте дубликат вашей основной целевой таблицы, используя синтаксис `CREATE AS`.
3. Присоедините партиции из оригинальной целевой таблицы к дублирующей с помощью [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart). **Примечание:** Эта операция присоединения отличается от ранее использованной перемещения. Хотя она также использует жесткие ссылки, данные в оригинальной таблице сохраняются.
4. Создайте новые материализованные представления.
5. Перезапустите вставки. **Примечание:** Вставки будут обновлять только целевую таблицу, а не дублирующую, которая будет ссылаться только на оригинальные данные.
6. Заполните материализованное представление, применив тот же процесс, что использовался выше для данных с временными метками, используя дублирующую таблицу в качестве источника.

Рассмотрим следующий пример, используя PyPI и наше предыдущее новое материализованное представление `pypi_downloads_per_day` (предположим, что мы не можем использовать временную метку):

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) Pause inserts
-- (2) Create a duplicate of our target table

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) Attach partitions from the original target table to the duplicate.

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) Create our new materialized views

CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project

-- (4) Restart inserts. We replicate here by inserting a single row.

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- notice how pypi_v2 contains same number of rows as before

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

-- (5) Backfill the view using the backup pypi_v2

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)

DROP TABLE pypi_v2;
```

На предпоследнем шаге мы заполняем `pypi_downloads_per_day` с помощью нашего простого подхода `INSERT INTO SELECT`, описанного [ранее](#timestamp-or-monotonically-increasing-column-available). Это также можно улучшить, используя подход с Null таблицей, описанный [выше](#using-a-null-table-engine-for-filling-materialized-views), с необязательным использованием дублирующей таблицы для большей устойчивости.

Хотя эта операция действительно требует приостановки вставок, промежуточные операции обычно могут быть выполнены быстро - минимизируя любые перебои в данных.
