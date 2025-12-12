---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 'Оптимизация производительности'
title: 'Оптимизация производительности операций вставки и чтения в S3'
description: 'Оптимизация производительности операций чтения и вставки в S3'
doc_type: 'guide'
keywords: ['s3', 'производительность', 'оптимизация', 'объектное хранилище', 'загрузка данных']
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

В этом разделе основное внимание уделяется оптимизации производительности при чтении и вставке данных из S3 с использованием [табличной функции s3](/sql-reference/table-functions/s3).

:::info
**Описанный в этом руководстве подход можно применить и к другим реализациям объектного хранилища с собственными табличными функциями, таким, как [GCS](/sql-reference/table-functions/gcs) и [Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage).**
:::

Прежде чем настраивать число потоков и размеры блоков для улучшения производительности вставки, мы рекомендуем сначала разобраться в механизме вставки данных в S3. Если вы уже знакомы с этим механизмом или хотите получить только краткие рекомендации, переходите сразу к нашему примеру [ниже](/integrations/s3/performance#example-dataset).

## Механизм вставки (одиночный узел) {#insert-mechanics-single-node}

На производительность и использование ресурсов механизма вставки данных ClickHouse (для одиночного узла), помимо конфигурации оборудования, влияют два основных фактора: **размер блока вставки** и **параллелизм вставки**.

### Размер блока вставки {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="Механизм формирования блоков вставки в ClickHouse" />

При выполнении `INSERT INTO SELECT` ClickHouse получает некоторый объём данных и ① формирует (как минимум) один блок вставки в памяти (для каждого [ключа партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key)) из полученных данных. Данные блока сортируются, и применяются оптимизации, специфичные для табличного движка. Затем данные сжимаются и ② записываются в хранилище базы данных в виде новой части данных.

Размер блока вставки влияет как на [использование дискового ввода-вывода](https://en.wikipedia.org/wiki/Category:Disk_file_systems), так и на использование памяти сервером ClickHouse. Более крупные блоки вставки используют больше памяти, но формируют более крупные и менее многочисленные исходные части. Чем меньше частей нужно создать ClickHouse при загрузке большого объёма данных, тем меньше требуется дискового ввода-вывода и автоматических [фоновых слияний](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges).

При использовании запроса `INSERT INTO SELECT` в сочетании с интеграционным табличным движком или табличной функцией данные забираются сервером ClickHouse:

<Image img={Pull} size="lg" border alt="Загрузка данных из внешних источников в ClickHouse" />

Пока данные не будут полностью загружены, сервер выполняет цикл:

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

В ① размер зависит от размера блока вставки, который можно контролировать двумя настройками:

* [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (по умолчанию: `1048545` миллионов строк)
* [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (по умолчанию: `256 MiB`)

Когда в блоке вставки накапливается либо указанное количество строк, либо достигается настроенный объём данных (в зависимости от того, что произойдёт раньше), это приводит к записи блока в новую часть. Цикл вставки продолжается с шага ①.

Обратите внимание, что значение `min_insert_block_size_bytes` обозначает несжатый размер блока в памяти (а не сжатый размер части на диске). Также обратите внимание, что созданные блоки и части редко в точности содержат настроенное количество строк или байт, поскольку ClickHouse стримит и [обрабатывает](https://clickhouse.com/company/events/query-performance-introspection) данные построчно-[блочно](/operations/settings/settings#max_block_size). Поэтому эти настройки задают минимальные пороговые значения.

#### Учитывайте слияния {#be-aware-of-merges}

Чем меньше настроенный размер блока вставки, тем больше исходных частей создаётся при большой загрузке данных и тем больше фоновых слияний частей выполняется параллельно с ингестией данных. Это может вызвать конкуренцию за ресурсы (CPU и память) и потребовать дополнительного времени (для достижения [здорового](/operations/settings/merge-tree-settings#parts_to_throw_insert) (3000) числа частей) после завершения ингестии.

:::important
Производительность запросов ClickHouse будет ухудшаться, если количество частей превысит [рекомендуемые пределы](/operations/settings/merge-tree-settings#parts_to_throw_insert).
:::

ClickHouse будет постоянно [сливать части](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) в более крупные части, пока они не [достигнут](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) сжатого размера около 150 GiB. Эта диаграмма показывает, как сервер ClickHouse выполняет слияния частей:

<Image img={Merges} size="lg" border alt="Фоновые слияния в ClickHouse" />

Один сервер ClickHouse использует несколько [фоновых потоков слияний](/operations/server-configuration-parameters/settings#background_pool_size) для выполнения параллельных [слияний частей](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes). Каждый поток выполняет цикл:

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

③ Запишите объединённый блок в новый part на диск.

Перейдите к шагу ①

````bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```bash
① Получить следующую порцию необработанных данных файла (размер порции определяется настроенным размером блока) и создать из неё блок данных в памяти.

② Записать блок в новый кусок на хранилище.

Перейти к ①. 
````sql
-- Top usernames
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- Load into posts table
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```sql
-- Топ имён пользователей
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

Получено 5 строк. Затрачено: 3.013 сек. Обработано 59.82 млн строк, 24.03 ГБ (19.86 млн строк/с., 7.98 ГБ/с.)
Пиковое использование памяти: 603.64 МиБ.

-- Загрузка в таблицу posts
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

Получено 0 строк. Затрачено: 191.692 сек. Обработано 59.82 млн строк, 24.03 ГБ (312.06 тыс. строк/с., 125.37 МБ/с.)
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

Получено 5 строк. Затрачено: 1.505 сек. Обработано 59.82 млн строк, 24.03 ГБ (39.76 млн строк/с., 15.97 ГБ/с.)
Пиковое использование памяти: 178.58 МиБ.

SETTINGS max_threads = 32

Получено 5 строк. Затрачено: 0.779 сек. Обработано 59.82 млн строк, 24.03 ГБ (76.81 млн строк/с., 30.86 ГБ/с.)
Пиковое использование памяти: 369.20 МиБ.

SETTINGS max_threads = 64

Получено 5 строк. Затрачено: 0.674 сек. Обработано 59.82 млн строк, 24.03 ГБ (88.81 млн строк/с., 35.68 ГБ/с.)
Пиковое использование памяти: 639.99 МиБ.
```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```bash
• max_insert_threads: выберите примерно половину доступных ядер процессора для потоков вставки (чтобы оставить достаточно выделенных ядер для фоновых слияний)

• peak_memory_usage_in_bytes: выберите планируемый пиковый объём используемой памяти; либо всю доступную оперативную память (если это изолированный приём данных), либо половину или меньше (чтобы оставить место для других параллельных задач)

Затем:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 строк в наборе. Затрачено: 128.566 сек. Обработано 59.82 млн строк, 24.03 ГБ (465.28 тыс. строк/с., 186.92 МБ/с.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

Выбрано 0 строк. Затрачено: 67.294 сек. Обработано 59.82 млн строк, 24.03 ГБ (888.93 тыс. строк/с., 357.12 МБ/с.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

Выбрано 5 строк. Затрачено: 0.421 сек. Обработано 59.82 млн строк, 24.03 ГБ (142.08 млн строк/с., 57.08 ГБ/с.)
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

Получено 5 строк. Время выполнения: 0.622 сек. Обработано 59.82 млн строк, 24.03 ГБ (96.13 млн строк/сек., 38.62 ГБ/сек.)
Пиковое потребление памяти: 176.74 МиБ.
```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 тыс. строк/с., 140.37 МБ/с.)
```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 строк в наборе. Прошло: 49.688 сек. Обработано 59.82 млн строк, 24.03 ГБ (1.20 млн строк/сек., 483.66 МБ/сек.)
```

## Прочие заметки {#misc-notes}

* При ограниченном объёме памяти рассмотрите возможность уменьшить значение `max_insert_delayed_streams_for_parallel_write` при вставке данных в S3.
