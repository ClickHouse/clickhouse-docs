---
slug: /data-modeling/backfilling
title: 'Дозагрузка данных'
description: 'Как выполнять дозагрузку крупных наборов данных в ClickHouse'
keywords: ['материализованные представления', 'дозагрузка', 'вставка данных', 'устойчивая к сбоям загрузка данных']
doc_type: 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# Дозагрузка данных {#backfilling-data}

Независимо от того, являетесь ли вы новым пользователем ClickHouse или отвечаете за существующее развертывание, рано или поздно вам потребуется дозагрузить в таблицы исторические данные. В некоторых случаях это относительно просто, но может становиться сложнее, когда нужно заполнить материализованные представления. В этом руководстве описаны некоторые подходы к решению этой задачи, которые вы можете адаптировать под свои сценарии.

:::note
В этом руководстве предполагается, что пользователи уже знакомы с концепцией [инкрементных материализованных представлений](/materialized-view/incremental-materialized-view) и [загрузки данных с использованием табличных функций, таких как S3 и GCS](/integrations/s3). Мы также рекомендуем ознакомиться с нашим руководством по [оптимизации производительности вставки из объектного хранилища](/integrations/s3/performance), рекомендации из которого можно применять к операциям вставки во всех примерах этого руководства.
:::

## Пример набора данных {#example-dataset}

Во всём этом руководстве мы используем набор данных PyPI. Каждая строка в этом наборе данных представляет загрузку Python‑пакета с использованием такого инструмента, как `pip`.

Например, этот поднабор охватывает один день — `2024-12-17` — и доступен в открытом доступе по адресу `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`. Вы можете выполнять запросы с помощью:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

Полный набор данных для этого бакета содержит более 320 ГБ файлов Parquet. В примерах ниже мы намеренно выбираем подмножества с помощью glob-шаблонов.

Мы предполагаем, что пользователь получает поток этих данных, например из Kafka или объектного хранилища, начиная с этой даты. Схема этих данных показана ниже.

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
Полный набор данных PyPI, содержащий более чем 1 триллион строк, доступен в нашем публичном демонстрационном окружении [clickpy.clickhouse.com](https://clickpy.clickhouse.com). Дополнительные сведения об этом наборе данных, включая то, как демо использует материализованные представления для повышения производительности и как данные ежедневно пополняются, см. [здесь](https://github.com/ClickHouse/clickpy).
:::


## Сценарии дозаполнения данных задним числом {#backfilling-scenarios}

Дозаполнение исторических данных обычно требуется, когда потребление потока данных начинается с определённого момента времени. Эти данные вставляются в таблицы ClickHouse с помощью [инкрементальных материализованных представлений](/materialized-view/incremental-materialized-view), которые срабатывают на блоки данных по мере их вставки. Эти представления могут трансформировать данные перед вставкой или вычислять агрегаты и отправлять результаты в целевые таблицы для последующего использования в нижестоящих приложениях.

Мы рассмотрим следующие сценарии:

1. **Дозаполнение исторических данных при существующей ингестии данных** — загружаются новые данные, и необходимо дозаполнить исторические данные. Эти исторические данные уже определены.
2. **Добавление материализованных представлений к существующим таблицам** — необходимо добавить новые материализованные представления к конфигурации, для которой исторические данные уже загружены и поток данных уже идёт.

Мы предполагаем, что исторические данные будут дозаполняться из объектного хранилища. Во всех случаях мы стремимся избежать пауз во вставке данных.

Мы рекомендуем дозаполнять исторические данные из объектного хранилища. Данные по возможности следует экспортировать в формат Parquet для оптимальной производительности чтения и сжатия (уменьшения сетевого трафика). Размер файла порядка 150 МБ обычно является предпочтительным, однако ClickHouse поддерживает более [70 форматов файлов](/interfaces/formats) и может обрабатывать файлы любого размера.

## Использование дублирующих таблиц и представлений {#using-duplicate-tables-and-views}

Во всех сценариях мы опираемся на концепцию «дублирующих таблиц и представлений». Эти таблицы и представления являются копиями тех, что используются для потоковых данных в реальном времени, и позволяют выполнять backfill (дозагрузку данных задним числом) изолированно, с простым механизмом восстановления в случае сбоя. Например, у нас есть следующая основная таблица `pypi` и материализованное представление, которое вычисляет количество загрузок для каждого Python‑проекта:

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

Мы заполняем основную таблицу и соответствующее представление подмножеством данных:

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

Предположим, мы хотим загрузить другое подмножество `{101..200}`. Хотя мы могли бы вставлять данные напрямую в `pypi`, мы можем выполнить этот бэкфилл изолированно, создав дублирующие таблицы.

Если этот бэкфилл завершится неудачно, мы не затронем наши основные таблицы и сможем просто [очистить](/managing-data/truncate) дублирующие таблицы и повторить попытку.

Чтобы создать новые копии этих представлений, мы можем использовать конструкцию `CREATE TABLE AS` с суффиксом `_v2`:

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

Мы заполняем эту таблицу вторым подмножеством примерно того же размера и убеждаемся, что данные успешно загрузились.

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


Если бы мы столкнулись с ошибкой на любом этапе второй загрузки, мы могли бы просто [очистить](/managing-data/truncate) таблицы `pypi_v2` и `pypi_downloads_v2` и повторить загрузку данных.

После завершения загрузки данных мы можем переместить данные из дублирующих таблиц в основные таблицы с помощью оператора [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table).

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note Имена партиций
Приведённый выше вызов `MOVE PARTITION` использует имя партиции `()`. Оно соответствует единственной партиции для этой таблицы (которая не разбита на партиции). Для таблиц, которые разбиты на партиции, потребуется выполнить несколько вызовов `MOVE PARTITION` — по одному для каждой партиции. Имена текущих партиций можно получить из таблицы [`system.parts`](/operations/system-tables/parts), например: `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

Теперь мы можем убедиться, что `pypi` и `pypi_downloads` содержат все данные. Таблицы `pypi_downloads_v2` и `pypi_v2` можно безопасно удалить.

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

Важно, что операция `MOVE PARTITION` одновременно лёгковесна (использует жёсткие ссылки) и атомарна, т.е. либо завершается успешно, либо с ошибкой, без промежуточного состояния.

Мы активно используем этот подход в описанных ниже сценариях дозагрузки данных (backfilling).

Обратите внимание, что этот процесс требует от пользователей выбора размера каждой операции вставки.

Более крупные вставки, т.е. больше строк, означают, что потребуется меньше операций `MOVE PARTITION`. Однако это необходимо сбалансировать с затратами на восстановление в случае сбоя вставки, например из‑за обрыва сети. Вы можете дополнить этот процесс пакетной обработкой файлов для снижения риска. Это можно выполнять либо с помощью диапазонных запросов, например `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`, либо с помощью glob-шаблонов. Например,

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
ClickPipes использует этот подход при загрузке данных из объектного хранилища, автоматически создавая дубликаты целевой таблицы и её materialized view и избавляя пользователя от необходимости выполнять описанные выше шаги. Кроме того, за счёт использования нескольких рабочих потоков, каждый из которых обрабатывает свои подмножества данных (через glob-шаблоны) и использует собственные дубликаты таблиц, данные могут загружаться быстро с соблюдением семантики exactly-once. Заинтересованные читатели могут найти дополнительные подробности [в этой записи блога](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).
:::


## Сценарий 1: Дозагрузка данных при существующей ингестии данных {#scenario-1-backfilling-data-with-existing-data-ingestion}

В этом сценарии мы предполагаем, что данные для дозагрузки не находятся в отдельном бакете, поэтому требуется фильтрация. Данные уже вставляются, и можно определить метку времени или монотонно возрастающий столбец, начиная с которого необходимо выполнить дозагрузку исторических данных.

Этот процесс включает следующие шаги:

1. Определить контрольную точку — либо метку времени, либо значение столбца, начиная с которого необходимо восстановить исторические данные.
2. Создать дубликаты основной таблицы и целевых таблиц для материализованных представлений.
3. Создать копии всех материализованных представлений, которые ссылаются на целевые таблицы, созданные на шаге (2).
4. Вставить данные в дублирующую основную таблицу, созданную на шаге (2).
5. Переместить все партиции из дублирующих таблиц в их исходные таблицы. Удалить дублирующие таблицы.

Например, в наших данных PyPI предположим, что данные уже загружены. Мы можем определить минимальную метку времени и, таким образом, нашу «контрольную точку».

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

Из приведённого выше результата мы знаем, что нам нужно загрузить данные до `2024-12-17 09:00:00`. Используя описанный ранее процесс, мы создаём дубликаты таблиц и представлений и загружаем подмножество данных, отфильтровав его по временной метке.

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
Фильтрация по столбцам с временными метками в Parquet может быть очень эффективной. ClickHouse будет читать только столбец с временными метками, чтобы определить полные диапазоны данных для загрузки, минимизируя сетевой трафик. Индексы Parquet, такие как min-max, также могут использоваться движком выполнения запросов ClickHouse.
:::

После завершения операции вставки мы можем переместить соответствующие партиции.

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

Если исторические данные находятся в отдельном bucket-е, описанный выше фильтр по времени не требуется. Если временного или монотонного столбца нет, изолируйте исторические данные.

:::note Просто используйте ClickPipes в ClickHouse Cloud
Пользователям ClickHouse Cloud следует использовать ClickPipes для восстановления исторических резервных копий, если данные можно изолировать в отдельном bucket-е (и фильтр не требуется). Помимо сокращения времени загрузки за счёт параллельной загрузки несколькими воркерами, ClickPipes автоматизирует описанный выше процесс и создаёт дубликаты таблиц как для основной таблицы, так и для материализованных представлений.
:::


## Сценарий 2: Добавление материализованных представлений к существующим таблицам {#scenario-2-adding-materialized-views-to-existing-tables}

Нередко возникает необходимость добавить новые материализованные представления в конфигурацию, для которой уже накоплен значительный объём данных и продолжается вставка. В этом случае полезен столбец с меткой времени или монотонно возрастающим значением, который можно использовать для идентификации точки в потоке, что позволяет избежать пауз в ингестии данных. В примерах ниже мы рассматриваем оба случая, отдавая предпочтение подходам, которые позволяют избежать пауз в ингестии.

:::note Avoid POPULATE
Мы не рекомендуем использовать команду [`POPULATE`](/sql-reference/statements/create/view#materialized-view) для заполнения задним числом материализованных представлений, за исключением небольших наборов данных, для которых приём приостановлен. Этот оператор может пропускать строки, вставленные в исходную таблицу, если материализованное представление создаётся после завершения выполнения POPULATE. Кроме того, эта операция выполняется по всем данным и уязвима к прерываниям или ограничениям по памяти на больших наборах данных.
:::

### Наличие столбца с меткой времени или монотонно возрастающим значением {#timestamp-or-monotonically-increasing-column-available}

В этом случае мы рекомендуем включить в новое материализованное представление фильтр, который ограничивает строки теми, что больше некоторого произвольного значения в будущем. Затем материализованное представление можно заполнить задним числом, начиная с этой даты, используя исторические данные из основной таблицы. Подход к такому заполнению зависит от объёма данных и сложности соответствующего запроса.

Наш самый простой подход включает следующие шаги:

1. Создать материализованное представление с фильтром, который учитывает только строки, большие некоторого произвольного момента времени в ближайшем будущем.
2. Выполнить запрос `INSERT INTO SELECT`, который вставляет данные в целевую таблицу нашего материализованного представления, читая из исходной таблицы с использованием агрегирующего запроса представления.

Данный подход можно дополнительно улучшить, нацеливаясь на подмножества данных на шаге (2) и/или используя дубликат целевой таблицы для материализованного представления (прикрепляя партиции к исходной после завершения вставки) для упрощения восстановления после сбоев.

Рассмотрим следующее материализованное представление, которое рассчитывает самые популярные проекты за каждый час.

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

Хотя мы уже можем добавить целевую таблицу, перед добавлением материализованного представления мы изменяем выражение `SELECT`, чтобы включить фильтр, учитывающий только строки с меткой времени позже некоторого произвольного момента в ближайшем будущем — в данном случае считаем, что `2024-12-17 09:00:00` наступит через несколько минут.

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

После добавления этого представления мы можем задним числом дозагрузить все данные для материализованного представления до этого момента.

Самый простой способ сделать это — выполнить запрос материализованного представления по основной таблице с фильтром, который игнорирует недавно добавленные данные, вставив результаты в целевую таблицу нашего представления с помощью `INSERT INTO SELECT`. Например, для приведённого выше представления:

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
В приведённом выше примере целевой таблицей служит [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree). В этом случае мы можем просто использовать исходный запрос агрегации. Для более сложных сценариев, в которых используется [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree), вы будете применять функции `-State` для агрегирования. Пример такого подхода можно найти в этом [руководстве по интеграции](/integrations/s3/performance#be-aware-of-merges).
:::

В нашем случае это относительно лёгкая агрегация, которая завершается менее чем за 3 секунды и использует менее 600 MiB памяти. Для более сложных или долгих агрегаций вы можете сделать этот процесс более устойчивым, используя описанный выше подход с дублирующей таблицей, то есть создать теневую целевую таблицу, например `pypi_downloads_per_day_v2`, выполнять вставку в неё, а затем прикрепить получившиеся партиции к `pypi_downloads_per_day`.

Часто запрос материализованного представления бывает более сложным (что неудивительно, иначе пользователи не стали бы использовать представление!) и потребляет ресурсы. В более редких случаях ресурсы, требуемые для запроса, превышают возможности сервера. Это подчёркивает одно из преимуществ материализованных представлений ClickHouse — они работают инкрементально и не обрабатывают весь набор данных за один проход!

В этом случае у пользователей есть несколько вариантов:


1. Модифицировать запрос для дозаполнения по диапазонам, например `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`, `WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` и т. д.
2. Использовать [движок таблиц Null](/engines/table-engines/special/null) для заполнения материализованного представления. Это имитирует типичное инкрементальное наполнение материализованного представления, выполняя его запрос над блоками данных (настраиваемого размера).

Вариант (1) является самым простым подходом и часто достаточен. Мы не приводим примеры ради краткости.

Вариант (2) рассматривается подробнее ниже.

#### Использование движка таблиц Null для заполнения материализованных представлений {#using-a-null-table-engine-for-filling-materialized-views}

[Движок таблиц Null](/engines/table-engines/special/null) предоставляет движок хранения, который не сохраняет данные (думайте о нём как о `/dev/null` в мире движков таблиц). Хотя это может казаться противоречивым, материализованные представления всё равно будут выполняться над данными, вставляемыми в этот движок таблиц. Это позволяет создавать материализованные представления без сохранения исходных данных — избегая I/O и связанного с этим хранения.

Важно, что любые материализованные представления, прикреплённые к этому движку таблиц, продолжают выполняться над блоками данных по мере их вставки, отправляя результаты в целевую таблицу. Размер этих блоков настраивается. Более крупные блоки потенциально могут быть более эффективными (и быстрее обрабатываться), но они потребляют больше ресурсов (в первую очередь памяти). Использование этого движка таблиц означает, что мы можем строить наше материализованное представление инкрементально, то есть по одному блоку за раз, избегая необходимости удерживать всю агрегацию в памяти.

<Image img={nullTableMV} size="md" alt="Денормализация в ClickHouse" />

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

Здесь мы создаем таблицу с движком Null `pypi_v2`, чтобы принимать строки, которые будут использованы для построения нашего материализованного представления. Обратите внимание, что мы ограничиваем схему только теми столбцами, которые нам нужны. Наше материализованное представление выполняет агрегацию по строкам, вставленным в эту таблицу (по одному блоку за раз), отправляя результаты в нашу целевую таблицу `pypi_downloads_per_day`.

:::note
В качестве целевой таблицы мы используем здесь `pypi_downloads_per_day`. Для повышения отказоустойчивости пользователи могут создать дубликат таблицы `pypi_downloads_per_day_v2` и использовать ее в качестве целевой таблицы представления, как показано в предыдущих примерах. По завершении вставки партиции в `pypi_downloads_per_day_v2` могут, в свою очередь, быть перенесены в `pypi_downloads_per_day`. Это позволит выполнить восстановление в случае, если вставка завершится сбоем из‑за проблем с памятью или прерывания работы сервера, т.е. мы просто очищаем `pypi_downloads_per_day_v2`, настраиваем параметры и повторяем попытку.
:::

Чтобы заполнить это материализованное представление, мы просто вставляем соответствующие данные для догрузки (backfill) в `pypi_v2` из `pypi`.

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

Обратите внимание: здесь пиковое потребление памяти — `639.47 MiB`.


##### Настройка производительности и ресурсов {#tuning-performance--resources}

На производительность и потребление ресурсов в описанном выше сценарии влияет несколько факторов. Перед тем как приступать к настройке, мы рекомендуем ознакомиться с механикой вставки, подробно описанной в разделе [Using Threads for Reads](/integrations/s3/performance#using-threads-for-reads) руководства [Optimizing for S3 Insert and Read Performance](/integrations/s3/performance). Вкратце:

* **Параллелизм чтения (Read Parallelism)** — количество потоков, используемых для чтения. Управляется через [`max_threads`](/operations/settings/settings#max_threads). В ClickHouse Cloud определяется размером экземпляра, по умолчанию равным количеству vCPU. Увеличение этого значения может улучшить производительность чтения за счет большего потребления памяти.
* **Параллелизм вставки (Insert Parallelism)** — количество потоков, используемых для вставки данных. Управляется через [`max_insert_threads`](/operations/settings/settings#max_insert_threads). В ClickHouse Cloud определяется размером экземпляра (между 2 и 4), а в OSS по умолчанию равно 1. Увеличение этого значения может улучшить производительность за счет большего потребления памяти.
* **Размер блока вставки (Insert Block Size)** — данные обрабатываются в цикле: они извлекаются, парсятся и формируются в блоки вставки в памяти на основе [ключа партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key). Эти блоки сортируются, оптимизируются, сжимаются и записываются в хранилище как новые [части данных](/parts). Размер блока вставки, управляемый настройками [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) и [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (в несжатом виде), влияет на использование памяти и дисковый ввод-вывод. Более крупные блоки потребляют больше памяти, но создают меньше частей, снижая I/O и объем фоновых слияний. Эти настройки задают минимальные пороговые значения (как только достигается любое из них, инициируется сброс).
* **Размер блока для материализованного представления (Materialized view block size)** — помимо описанной выше механики основной вставки, перед вставкой в материализованные представления блоки также укрупняются для более эффективной обработки. Размер этих блоков определяется настройками [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) и [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views). Более крупные блоки позволяют более эффективно обрабатывать данные за счет большего потребления памяти. По умолчанию эти настройки наследуют значения настроек исходной таблицы [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) и [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) соответственно.

Для улучшения производительности пользователи могут следовать рекомендациям, изложенным в разделе [Tuning Threads and Block Size for Inserts](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) руководства [Optimizing for S3 Insert and Read Performance](/integrations/s3/performance). В большинстве случаев нет необходимости дополнительно изменять `min_insert_block_size_bytes_for_materialized_views` и `min_insert_block_size_rows_for_materialized_views` для повышения производительности. Если вы все же изменяете эти параметры, применяйте те же рекомендуемые практики, которые описаны для `min_insert_block_size_rows` и `min_insert_block_size_bytes`.

Чтобы минимизировать потребление памяти, пользователи могут поэкспериментировать с этими настройками. Это неизбежно снизит производительность. Используя предыдущий запрос, ниже мы приводим примеры.

Уменьшение значения `max_insert_threads` до 1 снижает накладные расходы по памяти.

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

Мы можем еще больше снизить использование памяти, уменьшив значение параметра `max_threads` до 1.

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

Наконец, мы можем еще больше снизить потребление памяти, установив параметр `min_insert_block_size_rows` в 0 (отключает его как определяющий фактор при выборе размера блока) и `min_insert_block_size_bytes` в 10485760 (10 МиБ).


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

Наконец, имейте в виду, что уменьшение размеров блоков приводит к большему числу частей и вызывает более сильную нагрузку на процесс слияний. Как обсуждается [здесь](/integrations/s3/performance#be-aware-of-merges), эти настройки следует изменять с осторожностью.


### Отсутствует столбец с меткой времени или монотонно возрастающий столбец {#no-timestamp-or-monotonically-increasing-column}

Описанные выше процессы предполагают, что в таблице есть столбец с меткой времени или монотонно возрастающий столбец. В некоторых случаях он просто отсутствует. В этом случае мы рекомендуем следующий процесс, который использует многие из шагов, описанных ранее, но требует от пользователей приостановить приём данных.

1. Приостановите вставки в основную таблицу.
2. Создайте дубликат основной целевой таблицы, используя синтаксис `CREATE AS`.
3. Присоедините партиции из исходной целевой таблицы к дубликату, используя [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart). **Примечание:** Эта операция присоединения отличается от ранее использованной операции перемещения. Хотя она и использует жёсткие ссылки, данные в исходной таблице сохраняются.
4. Создайте новые материализованные представления.
5. Возобновите вставки. **Примечание:** Вставки будут обновлять только целевую таблицу, а не дубликат, который будет ссылаться только на исходные данные.
6. Выполните дозагрузку данных в материализованное представление, применив тот же процесс, что и выше для данных с метками времени, используя дубликат таблицы в качестве источника.

Рассмотрим следующий пример с использованием PyPI и нашего ранее созданного нового материализованного представления `pypi_downloads_per_day` (будем считать, что мы не можем использовать метку времени):

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

На предпоследнем шаге мы выполняем дозагрузку данных в `pypi_downloads_per_day`, используя наш простой подход `INSERT INTO SELECT`, описанный [ранее](#timestamp-or-monotonically-increasing-column-available). Этот процесс также можно усовершенствовать, применив подход с таблицей с движком Null, описанный [выше](#using-a-null-table-engine-for-filling-materialized-views), с дополнительным использованием дубликата таблицы для повышения устойчивости.

Хотя для этой операции требуется приостановить вставки, промежуточные операции, как правило, выполняются быстро, что минимизирует перерывы в поступлении данных.
