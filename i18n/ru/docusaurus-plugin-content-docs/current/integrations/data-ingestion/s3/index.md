---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'Интеграция S3 с ClickHouse'
title: 'Интеграция S3 с ClickHouse'
description: 'Страница, описывающая, как интегрировать S3 с ClickHouse'
---

import BucketDetails from '@site/i18n/ru/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';

# Интеграция S3 с ClickHouse

Вы можете вставлять данные из S3 в ClickHouse, а также использовать S3 в качестве места экспорта, таким образом позволяя взаимодействовать с архитектурами "ДатаЛэйк". Более того, S3 может предоставить уровни "холодного" хранения и помочь в разделении хранения и вычислений. В разделах ниже мы используем набор данных такси Нью-Йорка, чтобы продемонстрировать процесс перемещения данных между S3 и ClickHouse, а также определить ключевые параметры конфигурации и дать советы по оптимизации производительности.
## Функции таблиц S3 {#s3-table-functions}

Функция таблицы `s3` позволяет вам читать и записывать файлы из и в хранилище, совместимое с S3. Основная форма синтаксиса выглядит так:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

где:

* path — URL корзины с путём к файлу. Поддерживаются следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}` где `N`, `M` — это числа, `'abc'`, `'def'` — это строки. Для получения дополнительной информации смотрите документацию по [использованию подстановочных знаков в пути](/engines/table-engines/integrations/s3/#wildcards-in-path).
* format — [формат](/interfaces/formats#formats-overview) файла.
* structure — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
* compression — Параметр является опциональным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет автоматически определено сжатие по расширению файла.

Использование подстановочных знаков в выражении пути позволяет ссылаться на несколько файлов и открывает возможность параллелизма.
### Подготовка {#preparation}

Перед созданием таблицы в ClickHouse вы можете сначала внимательно рассмотреть данные в корзине S3. Вы можете сделать это прямо из ClickHouse, используя оператор `DESCRIBE`:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Результат оператора `DESCRIBE TABLE` должен показать вам, как ClickHouse автоматически выведет эти данные, как это видно в корзине S3. Обратите внимание, что он также автоматически распознаёт и разжимает формат сжатия gzip:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

┌─name──────────────────┬─type───────────────┐
│ trip_id               │ Nullable(Int64)    │
│ vendor_id             │ Nullable(Int64)    │
│ pickup_date           │ Nullable(Date)     │
│ pickup_datetime       │ Nullable(DateTime) │
│ dropoff_date          │ Nullable(Date)     │
│ dropoff_datetime      │ Nullable(DateTime) │
│ store_and_fwd_flag    │ Nullable(Int64)    │
│ rate_code_id          │ Nullable(Int64)    │
│ pickup_longitude      │ Nullable(Float64)  │
│ pickup_latitude       │ Nullable(Float64)  │
│ dropoff_longitude     │ Nullable(Float64)  │
│ dropoff_latitude      │ Nullable(Float64)  │
│ passenger_count       │ Nullable(Int64)    │
│ trip_distance         │ Nullable(String)   │
│ fare_amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta_tax               │ Nullable(String)   │
│ tip_amount            │ Nullable(String)   │
│ tolls_amount          │ Nullable(Float64)  │
│ ehail_fee             │ Nullable(Int64)    │
│ improvement_surcharge │ Nullable(String)   │
│ total_amount          │ Nullable(String)   │
│ payment_type          │ Nullable(String)   │
│ trip_type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab_type              │ Nullable(String)   │
│ pickup_nyct2010_gid   │ Nullable(Int64)    │
│ pickup_ctlabel        │ Nullable(Float64)  │
│ pickup_borocode       │ Nullable(Int64)    │
│ pickup_ct2010         │ Nullable(String)   │
│ pickup_boroct2010     │ Nullable(String)   │
│ pickup_cdeligibil     │ Nullable(String)   │
│ pickup_ntacode        │ Nullable(String)   │
│ pickup_ntaname        │ Nullable(String)   │
│ pickup_puma           │ Nullable(Int64)    │
│ dropoff_nyct2010_gid  │ Nullable(Int64)    │
│ dropoff_ctlabel       │ Nullable(Float64)  │
│ dropoff_borocode      │ Nullable(Int64)    │
│ dropoff_ct2010        │ Nullable(String)   │
│ dropoff_boroct2010    │ Nullable(String)   │
│ dropoff_cdeligibil    │ Nullable(String)   │
│ dropoff_ntacode       │ Nullable(String)   │
│ dropoff_ntaname       │ Nullable(String)   │
│ dropoff_puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘
```

Чтобы взаимодействовать с нашими данными на основе S3, мы подготавливаем стандартную таблицу `MergeTree` в качестве нашего назначения. Оператор ниже создает таблицу с именем `trips` в базе данных по умолчанию. Обратите внимание, что мы решили изменить некоторые из типов данных, как было выведено выше, особенно чтобы не использовать модификатор типа данных [`Nullable()`](/sql-reference/data-types/nullable), который может вызвать ненужные дополнительные хранимые данные и дополнительные накладные расходы по производительности:

```sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
```

Обратите внимание на использование [партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) по полю `pickup_date`. Обычно ключ партиционирования предназначен для управления данными, но позже мы будем использовать этот ключ для параллелизации записей в S3.

Каждая запись в нашем наборе данных такси содержит поездку на такси. Эти анонимизированные данные состоят из 20 млн записей, сжатых в корзине S3 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ под папкой **nyc-taxi**. Данные находятся в формате TSV с примерно 1 млн строк на файл.
### Чтение данных из S3 {#reading-data-from-s3}

Мы можем запрашивать данные S3 в качестве источника без необходимости сохранять их в ClickHouse. В следующем запросе мы выбираем 10 строк. Обратите внимание на отсутствие учетных данных, так как корзина является общедоступной:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

Обратите внимание, что нам не нужно перечислять столбцы, поскольку формат `TabSeparatedWithNames` кодирует названия столбцов в первой строке. Другие форматы, такие как `CSV` или `TSV`, вернут автоматически сгенерированные столбцы для этого запроса, например, `c1`, `c2`, `c3` и т.д.

Запросы дополнительно поддерживают [виртуальные столбцы](../sql-reference/table-functions/s3#virtual-columns), такие как `_path` и `_file`, которые предоставляют информацию о пути к корзине и имени файла соответственно. Например:

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

Подтвердите количество строк в этом выборочном наборе данных. Обратите внимание на использование подстановочных знаков для расширения файлов, чтобы мы могли учитывать все двадцать файлов. Этот запрос займет около 10 секунд, в зависимости от количества ядер на экземпляре ClickHouse:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

Хотя это полезно для выборки данных и выполнения запросов, не рекомендуется регулярно читать данные непосредственно из S3. Когда пришло время заняться серьезными делами, импортируйте данные в таблицу `MergeTree` в ClickHouse.
### Использование clickhouse-local {#using-clickhouse-local}

Программа `clickhouse-local` позволяет вам выполнять быструю обработку локальных файлов без развертывания и настройки сервера ClickHouse. Все запросы, использующие функцию таблицы `s3`, можно выполнять с помощью этого инструмента. Например:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### Вставка данных из S3 {#inserting-data-from-s3}

Чтобы использовать все возможности ClickHouse, мы далее читаем и вставляем данные в наш экземпляр. Мы комбинируем нашу функцию `s3` с простым оператором `INSERT`, чтобы достичь этого. Обратите внимание, что нам не нужно перечислять наши столбцы, так как целевая таблица предоставляет необходимую структуру. Это требует, чтобы столбцы появлялись в порядке, указанном в операторе DDL таблицы: столбцы сопоставляются в соответствии с их позицией в клаузе `SELECT`. Вставка всех 10 млн строк может занять несколько минут в зависимости от экземпляра ClickHouse. Ниже мы вставляем 1 млн строк, чтобы обеспечить быструю реакцию. Настройте клаузу `LIMIT` или выбор столбцов, чтобы импортировать подмножества по мере необходимости:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### Удаленная вставка с использованием ClickHouse Local {#remote-insert-using-clickhouse-local}

Если политики безопасности сети препятствуют вашему кластеру ClickHouse осуществлять исходящие соединения, вы можете потенциально вставить данные из S3, используя `clickhouse-local`. В следующем примере мы читаем из корзины S3 и вставляем в ClickHouse с использованием функции `remote`:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
Для выполнения этого через безопасное SSL соединение используйте функцию `remoteSecure`.
:::
### Экспорт данных {#exporting-data}

Вы можете записывать файлы в S3, используя функцию таблицы `s3`. Это потребует соответствующих разрешений. Мы передаём необходимые учетные данные в запросе, но смотрите страницу [Управление учетными данными](#managing-credentials) для получения дополнительных опций.

В простом примере ниже мы используем функцию таблицы в качестве назначения вместо источника. Здесь мы потоково передаем 10 000 строк из таблицы `trips` в корзину, указывая сжатие `lz4` и тип вывода `CSV`:

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
SELECT *
FROM trips
LIMIT 10000;
```

Обратите внимание, как формат файла определяется по расширению. Нам также не нужно указывать столбцы в функции `s3` — это можно определить из `SELECT`.
### Разделение больших файлов {#splitting-large-files}

Вряд ли вы захотите экспортировать ваши данные в виде одного файла. Большинство инструментов, включая ClickHouse, добиваются более высокой производительности при чтении и записи в несколько файлов благодаря возможности параллелизма. Мы могли бы выполнять нашу команду `INSERT` несколько раз, нацеливаясь на подмножество данных. ClickHouse предлагает способ автоматического разделения файлов с использованием ключа `PARTITION`.

В следующем примере мы создаем десять файлов, используя модуль функции `rand()`. Обратите внимание, как результирующий идентификатор партиции ссылается на имя файла. Это приводит к созданию десяти файлов с числовым окончанием, например, `trips_0.csv.lz4`, `trips_1.csv.lz4` и т.д.:

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY rand() % 10
SELECT *
FROM trips
LIMIT 100000;
```

В качестве альтернативы мы можем сослаться на поле в данных. Для этого набора данных `payment_type` предоставляет естественный ключ партиционирования с кардинальностью 5.

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY payment_type
SELECT *
FROM trips
LIMIT 100000;
```
### Использование кластеров {#utilizing-clusters}

Вышеуказанные функции ограничены выполнением на одном узле. Скорость чтения будет масштабироваться линейно с ядрами CPU до тех пор, пока не будет ограничен другие ресурсы (обычно сеть), позволяя пользователям вертикально масштабироваться. Однако этот подход имеет свои ограничения. Хотя пользователи могут облегчить часть давления на ресурсы, вставляя в распределённую таблицу при выполнении запроса `INSERT INTO SELECT`, это всё равно оставляет один узел для чтения, разбора и обработки данных. Для решения этой проблемы и обеспечения масштабирования чтений по горизонтали у нас есть функция [s3Cluster](/sql-reference/table-functions/s3Cluster.md).

Узел, принимающий запрос, известный как инициатор, создает соединение с каждым узлом в кластере. Шаблон glob, определяющий, какие файлы нужно читать, разрешается в набор файлов. Инициатор распределяет файлы по узлам в кластере, которые выступают в роли рабочих. Эти рабочие, в свою очередь, запрашивают файлы для обработки по мере завершения чтения. Этот процесс обеспечивает возможность горизонтального масштабирования чтений.

Функция `s3Cluster` принимает тот же формат, что и варианты с одним узлом, за исключением того, что требуется целевой кластер для обозначения рабочих узлов:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — имя кластера, который используется для построения набора адресов и параметров соединения для удалённых и локальных серверов.
* `source` — URL к файлу или множеству файлов. Поддерживаются следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{'abc','def'}` и `{N..M}` где N, M — числа, abc, def — строки. Для получения дополнительной информации смотрите [Подстановочные знаки в пути](/engines/table-engines/integrations/s3.md/#wildcards-in-path).
* `access_key_id` и `secret_access_key` — ключи, которые указывают учетные данные для использования с указанным конечным пунктом. Опционально.
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `structure` — структура таблицы. Формат 'column1_name column1_type, column2_name column2_type, ...'.

Как и в любом `s3`, учетные данные являются опциональными, если корзина небезопасна или вы определяете безопасность через окружение, например, IAM роли. В отличие от функции s3, однако, структура должна быть указана в запросе, начиная с версии 22.3.1, то есть схема не считается автоматически.

Эта функция будет использоваться в большинстве случаев как часть `INSERT INTO SELECT`. В этом случае вы часто будете вставлять в распределённую таблицу. Мы иллюстрируем простой пример ниже, где trips_all является распределённой таблицей. Хотя эта таблица использует кластер событий, согласованность узлов, используемых для чтения и записи, не является обязательной:

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

Вставки будут происходить против узла инициатора. Это означает, что в то время как чтения будут происходить на каждом узле, результирующие строки будут направляться к инициатору для распределения. В сценариях с высокой пропускной способностью это может стать узким местом. Для решения этой проблемы установите параметр [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select) для функции `s3cluster`.
## Движки таблиц S3 {#s3-table-engines}

Хотя функции `s3` позволяют выполнять ad-hoc запросы к данным, хранящимся в S3, они синтаксически громоздки. Движок таблиц `S3` позволяет вам не указывать URL корзины и учетные данные снова и снова. Для этого ClickHouse предоставляет движок таблиц S3.

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — URL корзины с путём к файлу. Поддерживаются следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}` где N, M — числа, 'abc', 'def' — строки. Для получения дополнительной информации смотрите [здесь](/engines/table-engines/integrations/s3#wildcards-in-path).
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя AWS. Вы можете использовать их для аутентификации ваших запросов. Параметр является опциональным. Если учетные данные не указаны, используются значения из файла конфигурации. Для получения дополнительной информации смотрите [Управление учетными данными](#managing-credentials).
* `compression` — Тип сжатия. Поддерживаемые значения: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. Параметр является опциональным. По умолчанию будет автоматически определено сжатие по расширению файла.
### Чтение данных {#reading-data}

В следующем примере мы создаем таблицу с именем `trips_raw`, используя первые десять файлов TSV, расположенных в корзине `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`. Каждый из этих файлов содержит по 1 млн строк:


```sql
CREATE TABLE trips_raw
(
   `trip_id`               UInt32,
   `vendor_id`             Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_date`          Date,
   `dropoff_datetime`      DateTime,
   `store_and_fwd_flag`    UInt8,
   `rate_code_id`          UInt8,
   `pickup_longitude`      Float64,
   `pickup_latitude`       Float64,
   `dropoff_longitude`     Float64,
   `dropoff_latitude`      Float64,
   `passenger_count`       UInt8,
   `trip_distance`         Float64,
   `fare_amount`           Float32,
   `extra`                 Float32,
   `mta_tax`               Float32,
   `tip_amount`            Float32,
   `tolls_amount`          Float32,
   `ehail_fee`             Float32,
   `improvement_surcharge` Float32,
   `total_amount`          Float32,
   `payment_type_`         Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
   `trip_type`             UInt8,
   `pickup`                FixedString(25),
   `dropoff`               FixedString(25),
   `cab_type`              Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
   `pickup_nyct2010_gid`   Int8,
   `pickup_ctlabel`        Float32,
   `pickup_borocode`       Int8,
   `pickup_ct2010`         String,
   `pickup_boroct2010`     FixedString(7),
   `pickup_cdeligibil`     String,
   `pickup_ntacode`        FixedString(4),
   `pickup_ntaname`        String,
   `pickup_puma`           UInt16,
   `dropoff_nyct2010_gid`  UInt8,
   `dropoff_ctlabel`       Float32,
   `dropoff_borocode`      UInt8,
   `dropoff_ct2010`        String,
   `dropoff_boroct2010`    FixedString(7),
   `dropoff_cdeligibil`    String,
   `dropoff_ntacode`       FixedString(4),
   `dropoff_ntaname`       String,
   `dropoff_puma`          UInt16
) ENGINE = S3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..9}.gz', 'TabSeparatedWithNames', 'gzip');
```

Обратите внимание на использование шаблона `{0..9}`, чтобы ограничить только первыми десятью файлами. После создания мы можем запрашивать эту таблицу так же, как и любую другую таблицу:

```sql
SELECT DISTINCT(pickup_ntaname)
FROM trips_raw
LIMIT 10;

┌─pickup_ntaname───────────────────────────────────┐
│ Lenox Hill-Roosevelt Island                      │
│ Airport                                          │
│ SoHo-TriBeCa-Civic Center-Little Italy           │
│ West Village                                     │
│ Chinatown                                        │
│ Hudson Yards-Chelsea-Flatiron-Union Square       │
│ Turtle Bay-East Midtown                          │
│ Upper West Side                                  │
│ Murray Hill-Kips Bay                             │
│ DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill │
└──────────────────────────────────────────────────┘
```
### Вставка данных {#inserting-data}

Движок таблиц `S3` поддерживает параллельное чтение. Записи поддерживаются только в том случае, если определение таблицы не содержит шаблонов glob. Таким образом, вышеуказанная таблица блокировала бы записи.

Чтобы продемонстрировать записи, создайте таблицу, указывающую на запись в S3:

```sql
CREATE TABLE trips_dest
(
   `trip_id`               UInt32,
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_datetime`      DateTime,
   `tip_amount`            Float32,
   `total_amount`          Float32
) ENGINE = S3('<bucket path>/trips.bin', 'Native');
```

```sql
INSERT INTO trips_dest
   SELECT
      trip_id,
      pickup_date,
      pickup_datetime,
      dropoff_datetime,
      tip_amount,
      total_amount
   FROM trips
   LIMIT 10;
```

```sql
SELECT * FROM trips_dest LIMIT 5;
```

```response
┌────trip_id─┬─pickup_date─┬─────pickup_datetime─┬────dropoff_datetime─┬─tip_amount─┬─total_amount─┐
│ 1200018648 │  2015-07-01 │ 2015-07-01 00:00:16 │ 2015-07-01 00:02:57 │          0 │          7.3 │
│ 1201452450 │  2015-07-01 │ 2015-07-01 00:00:20 │ 2015-07-01 00:11:07 │       1.96 │        11.76 │
│ 1202368372 │  2015-07-01 │ 2015-07-01 00:00:40 │ 2015-07-01 00:05:46 │          0 │          7.3 │
│ 1200831168 │  2015-07-01 │ 2015-07-01 00:01:06 │ 2015-07-01 00:09:23 │          2 │         12.3 │
│ 1201362116 │  2015-07-01 │ 2015-07-01 00:01:07 │ 2015-07-01 00:03:31 │          0 │          5.3 │
└────────────┴─────────────┴─────────────────────┴─────────────────────┴────────────┴──────────────┘
```

Обратите внимание, что строки можно вставлять только в новые файлы. Не существует линейных циклов слияния или операций разделения файлов. Как только файл записывается, последующие вставки завершатся неудачей. У пользователей есть два варианта:

* Установить параметр `s3_create_new_file_on_insert=1`. Это приведет к созданию новых файлов при каждой вставке. Числовое окончание будет добавлено в конец каждого файла, что будет монотонно увеличиваться для каждой операции вставки. Для вышеуказанного примера последующая вставка приведёт к созданию `trips_1.bin`.
* Установить параметр `s3_truncate_on_insert=1`. Это приведет к усечению файла, т.е. он будет содержать только вновь вставленные строки после завершения.

Оба этих параметра по умолчанию установлены в 0 — таким образом, пользователю необходимо установить один из них. Если оба установлены, `s3_truncate_on_insert` будет иметь приоритет.

Некоторые примечания об движке таблиц `S3`:

- В отличие от традиционной таблицы из семьи `MergeTree`, удаление таблицы `S3` не приведет к удалению подлежащих данным.
- Полные настройки для этого типа таблиц можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).
- Будьте внимательны к следующим ограничениям при использовании этого движка:
    * Запросы ALTER не поддерживаются
    * Операции SAMPLE не поддерживаются
    * Нет понятия индексов, т.е. первичных или разреженных.
## Управление учетными данными {#managing-credentials}

В предыдущих примерах мы передавали учетные данные в функции `s3` или определении таблицы `S3`. Хотя это может быть приемлемо для время от времени, пользователи требуют менее явных механизмов аутентификации в производственной среде. Для решения этой проблемы ClickHouse предлагает несколько вариантов:

* Укажите детали соединения в **config.xml** или аналогичном файле конфигурации в **conf.d**. Содержимое примера файла показано ниже, предполагая установку с использованием Debian-пакета.

    ```xml
    ubuntu@single-node-clickhouse:/etc/clickhouse-server/config.d$ cat s3.xml
    <clickhouse>
        <s3>
            <endpoint-name>
                <endpoint>https://dalem-files.s3.amazonaws.com/test/</endpoint>
                <access_key_id>key</access_key_id>
                <secret_access_key>secret</secret_access_key>
                <!-- <use_environment_credentials>false</use_environment_credentials> -->
                <!-- <header>Authorization: Bearer SOME-TOKEN</header> -->
            </endpoint-name>
        </s3>
    </clickhouse>
    ```

    Эти учетные данные будут использоваться для любых запросов, где указанный выше конечный пункт является точным префиксным соответствием для запрашиваемого URL. Также обратите внимание на возможность в этом примере объявить заголовок авторизации как альтернативу для ключей доступа и секретов. Полный список поддерживаемых настроек можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).

* Пример выше подчеркивает наличие параметра конфигурации `use_environment_credentials`. Этот параметр конфигурации также можно установить глобально на уровне `s3`:

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    Эта настройка включает попытку получить учетные данные S3 из окружения, что позволяет получать доступ через IAM-ролей. В частности, выполняется следующий порядок извлечения:

   * Поиск переменных окружения `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`
   * Проверка выполняется в **$HOME/.aws**
   * Временные учетные данные, полученные через службу безопасности AWS Token — т.е. через API [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
   * Проверки учетных данных в переменных окружения ECS `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` или `AWS_CONTAINER_CREDENTIALS_FULL_URI` и `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
   * Получение учетных данных через [метаданные экземпляра Amazon EC2](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html), при этом имеется в виду, что [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) не установлен в true.
   * Эти же настройки также могут быть установлены для конкретного конечного пункта с использованием того же правила сопоставления префиксов.
## Оптимизация производительности {#s3-optimizing-performance}

Для оптимизации чтения и вставки с использованием функции S3 смотрите [посвященное руководство по производительности](./performance.md).
### Настройка хранения S3 {#s3-storage-tuning}

Внутренне дерево слияния ClickHouse использует два основных формата хранения: [`Wide` и `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). Хотя текущее выполнение использует поведение по умолчанию ClickHouse (управляемое через настройки `min_bytes_for_wide_part` и `min_rows_for_wide_part`), мы ожидаем, что поведение S3 будет отличаться в будущих релизах, например, большее значение по умолчанию `min_bytes_for_wide_part`, поощряющее более `Compact` формат и, следовательно, меньшее количество файлов. Пользователи могут теперь захотеть настроить эти настройки при использовании исключительно хранилища S3.
## MergeTree на основе S3 {#s3-backed-mergetree}

Функции `s3` и связанный движок таблиц позволяют нам запрашивать данные в S3, используя привычный синтаксис ClickHouse. Однако, касаясь функций управления данными и производительности, они ограничены. Нет поддержки первичных индексов, поддержки no-cache, и операции вставки файлов необходимо управлять пользователем.

ClickHouse признает, что S3 представляет собой привлекательное решение для хранения, особенно когда производительность запросов на "более холодные" данные менее критична, и пользователи стремятся разделить хранение и вычисления. Чтобы помочь в этом, предусмотрена поддержка использования S3 в качестве хранилища для движка MergeTree. Это позволит пользователям использовать преимущества масштабируемости и экономии затрат S3, а также производительности вставки и запросов движка MergeTree.
### Уровни хранения {#storage-tiers}

Носители хранимых данных ClickHouse позволяют абстрагироваться от физических дисков в движке таблиц MergeTree. Любой отдельный носитель может состоять из упорядоченного набора дисков. Хотя в основном это позволяет использовать несколько блоковых устройств для хранения данных, такая абстракция также позволяет использовать другие типы хранения, включая S3. Части данных ClickHouse могут перемещаться между носителями и заполняемостью в соответствии с политиками хранения, тем самым создавая концепцию уровней хранения.

Уровни хранения разблокируют архитектуры горячего и холодного хранения, где самые свежие данные, которые обычно также запрашиваются чаще всего, требуют лишь небольшого объема на высокопроизводительных носителях, например, NVMe SSD. По мере старения данных, обязательства по времени выполнения запросов увеличиваются, как и частота запросов. Этот "толстый" хвост данных может храниться на более медленных, менее производительных носителях, таких как HDD или объектное хранилище, такое как S3.

### Создание диска {#creating-a-disk}

Чтобы использовать S3 корзину в качестве диска, мы должны сначала объявить ее в файле конфигурации ClickHouse. Либо расширить config.xml, либо предпочтительно предоставить новый файл в директории conf.d. Пример объявления диска S3 показан ниже:

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://sample-bucket.s3.us-east-2.amazonaws.com/tables/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>
```

Полный список настроек, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Обратите внимание, что учетные данные можно управлять здесь, используя те же подходы, описанные в [Управлении учетными данными](#managing-credentials), т.е. `use_environment_credentials` может быть установлен в true в приведенном выше блоке настроек, чтобы использовать роли IAM.

### Создание политики хранения {#creating-a-storage-policy}

После настройки этот "диск" может быть использован носителем, объявленным в политике. В приведенном ниже примере мы предполагаем, что s3 является нашим единственным хранилищем. Это игнорирует более сложные архитектуры горячего и холодного хранения, где данные могут перемещаться на основе TTL и заполняемости.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
            ...
            </s3>
            <s3_cache>
            ...
            </s3_cache>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### Создание таблицы {#creating-a-table}

Предполагая, что вы настроили ваш диск для использования корзины с правами на запись, вы должны иметь возможность создать таблицу, как в приведенном ниже примере. Для краткости мы используем подмножество колонок такси NYC и передаем данные непосредственно в таблицу, поддерживаемую S3:

```sql
CREATE TABLE trips_s3
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

В зависимости от аппаратного обеспечения, эта последняя вставка 1 миллиона строк может занять несколько минут для выполнения. Вы можете подтвердить прогресс через таблицу system.processes. Не стесняйтесь увеличивать количество строк до лимита в 10 миллионов и исследовать некоторые тестовые запросы.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Модификация таблицы {#modifying-a-table}

Иногда пользователям может потребоваться модифицировать политику хранения конкретной таблицы. Хотя это возможно, это имеет ограничения. Новая целевая политика должна содержать все диски и носители предыдущей политики, т.е. данные не будут мигрированы, чтобы удовлетворить изменения в политике. При проверке этих ограничений носители и диски будут определяться по их имени, и попытки нарушения приведут к ошибке. Однако, если вы используете предыдущие примеры, следующие изменения допустимы.

```xml
<policies>
   <s3_main>
       <volumes>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
   </s3_main>
   <s3_tiered>
       <volumes>
           <hot>
               <disk>default</disk>
           </hot>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
       <move_factor>0.2</move_factor>
   </s3_tiered>
</policies>
```

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

Здесь мы повторно используем основной носитель в нашей новой политике s3_tiered и вводим новый горячий носитель. Это использует диск по умолчанию, который состоит только из одного диска, настроенного через параметр `<path>`. Обратите внимание, что наши имена носителей и дисков не меняются. Новые вставки в таблицу будут находиться на диске по умолчанию, пока это не достигнет `move_factor * disk_size` - после чего данные будут перемещены в S3.

### Обработка репликации {#handling-replication}

Репликация с S3 дисками может быть выполнена с использованием движка таблиц `ReplicatedMergeTree`. См. руководство по [репликации одного шардирования через два региона AWS с использованием объектного хранилища S3](#s3-multi-region) для подробностей.

### Чтения и записи {#read--writes}

Ниже приведены заметки, касающиеся реализации взаимодействия S3 с ClickHouse. Хотя они в основном информативны, они могут помочь читателям при [Оптимизации производительности](#s3-optimizing-performance):

* По умолчанию максимальное количество потоков обработки запросов, используемых на любом этапе конвейера обработки запросов, равно количеству ядер. Некоторые этапы более параллелизируемы, чем другие, поэтому это значение дает верхний предел. Несколько этапов запроса могут выполняться одновременно, так как данные передаются с диска. Таким образом, точное количество потоков, используемых для запроса, может превышать это значение. Измените через настройку [max_threads](/operations/settings/settings#max_threads).
* Чтения в S3 асинхронные по умолчанию. Это поведение определяется настройкой `remote_filesystem_read_method`, установленной в значение `threadpool` по умолчанию. При обслуживании запроса ClickHouse читает гранулы в полосах. Каждая из этих полос потенциально содержит множество колонок. Поток будет читать столбцы для своих гранул по одному. Вместо того, чтобы делать это синхронно, происходит предварительная выборка всех колонок перед ожиданием данных. Это предлагает значительные улучшения в производительности по сравнению с синхронным ожиданием на каждом столбце. Пользователям обычно не нужно изменять эту настройку - см. [Оптимизацию производительности](#s3-optimizing-performance).
* Записи выполняются параллельно, с максимум 100 одновременными потоками записи файлов. `max_insert_delayed_streams_for_parallel_write`, который имеет значение по умолчанию 1000, контролирует количество S3 блобов, записываемых параллельно. Поскольку для каждого записываемого файла требуется буфер (~1 МБ), это эффективно ограничивает потребление памяти при вставке. В низких сценариях памяти сервера может быть целесообразно снизить это значение.

## Использование S3 объектного хранилища в качестве диска ClickHouse {#configuring-s3-for-clickhouse-use}

Если вам нужны пошаговые инструкции по созданию корзин и роли IAM, то разверните **Создание корзин S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

### Настройка ClickHouse для использования корзины S3 в качестве диска {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

Следующий пример основан на установленном пакете Deb Linux как службы с каталогами ClickHouse по умолчанию.

1. Создайте новый файл в директории `config.d` ClickHouse для хранения конфигурации хранения.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. Добавьте следующее для конфигурации хранения; подставляя путь к корзине, ключ доступа и секретные ключи из предыдущих шагов.
```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
        <access_key_id>ABC123</access_key_id>
        <secret_access_key>Abc+123</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

:::note
Теги `s3_disk` и `s3_cache` внутри тега `<disks>` являются произвольными метками. Их можно установить на что-то другое, но та же метка должна быть использована в теге `<disk>` под тегом `<policies>`, чтобы ссылаться на диск. Тег `<S3_main>` также произвольный и являет собой имя политики, которое будет использоваться в качестве идентификатора для хранения при создании ресурсов в ClickHouse.

Представленная выше конфигурация предназначена для ClickHouse версии 22.8 и выше, если вы используете более старую версию, пожалуйста, смотрите [хранение данных](/operations/storing-data.md/#using-local-cache).

Для получения дополнительной информации о использовании S3:
Руководство по интеграциям: [MergeTree с поддержкой S3](#s3-backed-mergetree)
:::

3. Обновите владельца файла на пользователя и группу `clickhouse`.
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. Перезапустите экземпляр ClickHouse, чтобы изменения вступили в силу.
```bash
service clickhouse-server restart
```

### Тестирование {#testing}

1. Войдите через клиент ClickHouse, что-то вроде следующего.
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. Создайте таблицу, указав новую политику хранения S3.
```sql
CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';
```

3. Покажите, что таблица была создана с правильной политикой.
```sql
SHOW CREATE TABLE s3_table1;
```
```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

4. Вставьте тестовые строки в таблицу.
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```

5. Просмотрите строки.
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

6. В консоли AWS перейдите к корзинам и выберите новую, а также папку.
Вы должны увидеть что-то похожее на следующее:

<Image img={S3J} size="lg" border alt="Просмотр корзины S3 в консоли AWS с показанными файлами данных ClickHouse, хранящимися в S3" />

## Репликация одного шардирования через два региона AWS с использованием объектного хранилища S3 {#s3-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Этот учебник основан на развертывании двух узлов сервера ClickHouse и трех узлов ClickHouse Keeper в AWS EC2. Хранилище данных для серверов ClickHouse - это S3. Используются два региона AWS, каждый из которых имеет сервер ClickHouse и корзину S3, чтобы поддерживать восстановление после сбоя.

Таблицы ClickHouse реплицируются между двумя серверами, а следовательно, и между двумя регионами.

### Установка программного обеспечения {#install-software}

#### Узлы сервера ClickHouse {#clickhouse-server-nodes}

Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах сервера ClickHouse.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в образцах конфигураций они называются `chnode1`, `chnode2`.

Поместите `chnode1` в один регион AWS, а `chnode2` - во второй.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в образцах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, а `keepernode3` в любом регионе, но в другой доступной зоне по сравнению с узлом ClickHouse в этом регионе.

Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах ClickHouse Keeper.

### Создание корзин S3 {#create-s3-buckets}

Создайте две корзины S3, одну в каждом из регионов, где вы разместили `chnode1` и `chnode2`.

Если вам нужны пошаговые инструкции по созданию корзин и роли IAM, то разверните **Создание корзин S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

Файлы конфигурации затем будут помещены в `/etc/clickhouse-server/config.d/`. Вот пример файла конфигурации для одной корзины, другая аналогична с тремя отличиями, отмеченными:

```xml title="/etc/clickhouse-server/config.d/storage_config.xml"
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
        <!--highlight-start-->
           <endpoint>https://docs-clickhouse-s3.s3.us-east-2.amazonaws.com/clickhouses3/</endpoint>
           <access_key_id>ABCDEFGHIJKLMNOPQRST</access_key_id>
           <secret_access_key>Tjdm4kf5snfkj303nfljnev79wkjn2l3knr81007</secret_access_key>
        <!--highlight-end-->
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
        </s3_disk>

        <s3_cache>
           <type>cache</type>
           <disk>s3_disk</disk>
           <path>/var/lib/clickhouse/disks/s3_cache/</path>
           <max_size>10Gi</max_size>
        </s3_cache>
     </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```

:::note
Многие шаги в этом руководстве попросят вас разместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это место по умолчанию для файлов переопределения конфигурации на системах Linux. Когда вы помещаете эти файлы в этот каталог, ClickHouse использует их содержимое для переопределения конфигурации по умолчанию. Помещая эти файлы в каталог переопределения, вы избегаете потери конфигурации при обновлении.
:::

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

При запуске ClickHouse Keeper в автономном режиме (отдельно от сервера ClickHouse) конфигурация представляет собой один XML файл. В этом учебном материале файл - `/etc/clickhouse-keeper/keeper_config.xml`. Все три сервера Keeper используют одну и ту же конфигурацию, но с одной отличающейся настройкой; `<server_id>`.

`server_id` указывает ID, который будет назначен хосту, на котором используется файл конфигурации. В приведенном ниже примере `server_id` равен `3`, и если вы еще раз взглянете на файл секции `<raft_configuration>`, вы увидите, что сервер 3 имеет имя хоста `keepernode3`. Таким образом, процесс ClickHouse Keeper знает, к каким другим серверам подключаться, выбирая лидера и выполняя все другие действия.

```xml title="/etc/clickhouse-keeper/keeper_config.xml"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

Скопируйте файл конфигурации для ClickHouse Keeper на место (не забывая установить `<server_id>`):
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### Настройка сервера ClickHouse {#configure-clickhouse-server}

#### Определение кластера {#define-a-cluster}

Кластеры ClickHouse определяются в разделе `<remote_servers>` конфигурации. В этом примере определен один кластер, `cluster_1S_2R`, который состоит из одного шарда с двумя репликами. Реплики находятся на хостах `chnode1` и `chnode2`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

При работе с кластерами полезно определить макросы, которые заполняют DDL-запросы данными о кластере, шарде и реплике. Этот образец позволяет вам указывать использование реплицированного движка таблицы без предоставления деталей о `shard` и `replica`. При создании таблицы вы можете увидеть, как макросы `shard` и `replica` используются, запрашивая `system.tables`.

```xml title="/etc/clickhouse-server/config.d/macros.xml"
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```
:::note
Вышеприведенные макросы предназначены для `chnode1`, на `chnode2` установите `replica` на `replica_2`.
:::

#### Отключение репликации без копирования {#disable-zero-copy-replication}

В версиях ClickHouse 22.7 и ниже настройка `allow_remote_fs_zero_copy_replication` по умолчанию установлена в `true` для дисков S3 и HDFS. Эта настройка должна быть установлена в `false` для этого сценария восстановления после сбоя, а в версии 22.8 и выше она по умолчанию установлена в `false`.

Эта настройка должна быть ложной по двум причинам: 1) эта функция не готова к производству; 2) в случае восстановления после сбоя как данные, так и метаданные должны храниться в нескольких регионах. Установите `allow_remote_fs_zero_copy_replication` в `false`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper отвечает за координацию репликации данных между узлами ClickHouse. Чтобы сообщить ClickHouse об узлах ClickHouse Keeper, добавьте файл конфигурации на каждом из узлов ClickHouse.

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

### Настройка сети {#configure-networking}

Смотрите список [сетевых портов](../../../guides/sre/network-ports.md), когда вы настраиваете параметры безопасности в AWS, чтобы ваши серверы могли общаться друг с другом, и вы могли с ними общаться.

Все три сервера должны слушать сетевые подключения, чтобы они могли взаимодействовать между собой и с S3. По умолчанию ClickHouse слушает только на адресе обратной связи, поэтому это необходимо изменить. Это настраивается в `/etc/clickhouse-server/config.d/`. Вот пример, который настраивает ClickHouse и ClickHouse Keeper для прослушивания всех интерфейсов IP v4. см. документацию или файл конфигурации по умолчанию `/etc/clickhouse/config.xml` для получения дополнительной информации.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### Запуск серверов {#start-the-servers}

#### Запуск ClickHouse Keeper {#run-clickhouse-keeper}

На каждом сервере Keeper выполните команды для вашей операционной системы, например:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Проверка статуса ClickHouse Keeper {#check-clickhouse-keeper-status}

Отправьте команды ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните команду на каждом из узлов Keeper, вы увидите, что один является лидером, а другие два - последователями:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```

#### Запуск сервера ClickHouse {#run-clickhouse-server}

На каждом сервере ClickHouse выполните

```bash
sudo service clickhouse-server start
```

#### Проверка сервера ClickHouse {#verify-clickhouse-server}

Когда вы добавили [конфигурацию кластера](#define-a-cluster), был определен один шард, реплицированный между двумя узлами ClickHouse. На этом этапе проверки вы будете проверять, был ли кластер построен при запуске ClickHouse и создадите реплицированную таблицу, использующую этот кластер.
- Убедитесь, что кластер существует:
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec.
  ```

- Создайте таблицу в кластере с использованием движка таблицы `ReplicatedMergeTree`:
  ```sql
  create table trips on cluster 'cluster_1S_2R' (
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  ENGINE = ReplicatedMergeTree
  PARTITION BY toYYYYMM(pickup_date)
  ORDER BY pickup_datetime
  SETTINGS storage_policy='s3_main'
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```

- Понимание использования ранее определенных макросов

  Макросы `shard` и `replica` были [определены ранее](#define-a-cluster), и на выделенной строчке ниже вы можете увидеть, где значения подставляются на каждом узле ClickHouse. Кроме того, используется значение `uuid`; `uuid` не определен в макросах, поскольку он генерируется системой.
  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0

  Row 1:
  ──────
  create_table_query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  # highlight-next-line
  ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
  PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS storage_policy = 's3_main'

  1 row in set. Elapsed: 0.012 sec.
  ```

  :::note
  Вы можете настроить путь к зоопарку `'clickhouse/tables/{uuid}/{shard}` показанный выше, установив `default_replica_path` и `default_replica_name`. Документация доступна [здесь](/operations/server-configuration-parameters/settings.md/#default_replica_path).
  :::

### Тестирование {#testing-1}

Эти тесты подтвердят, что данные реплицируются между двумя серверами и хранятся в корзинах S3, а не на локальном диске.

- Добавьте данные из набора данных такси Нью-Йорка:
  ```sql
  INSERT INTO trips
  SELECT trip_id,
         pickup_date,
         pickup_datetime,
         dropoff_datetime,
         pickup_longitude,
         pickup_latitude,
         dropoff_longitude,
         dropoff_latitude,
         passenger_count,
         trip_distance,
         tip_amount,
         total_amount,
         payment_type
     FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
  ```
- Убедитесь, что данные хранятся в S3.

  Этот запрос показывает размер данных на диске и политику, используемую для определения, какой диск используется.
  ```sql
  SELECT
      engine,
      data_paths,
      metadata_path,
      storage_policy,
      formatReadableSize(total_bytes)
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: af7a3d1b-7730-49e0-9314-cc51c4cf053c

  Row 1:
  ──────
  engine:                          ReplicatedMergeTree
  data_paths:                      ['/var/lib/clickhouse/disks/s3_disk/store/551/551a859d-ec2d-4512-9554-3a4e60782853/']
  metadata_path:                   /var/lib/clickhouse/store/e18/e18d3538-4c43-43d9-b083-4d8e0f390cf7/trips.sql
  storage_policy:                  s3_main
  formatReadableSize(total_bytes): 36.42 MiB

  1 row in set. Elapsed: 0.009 sec.
  ```

  Проверьте размер данных на локальном диске. Из вышесказанного, размер на диске для миллионов строк составляет 36.42 MiB. Это должно быть на S3, а не на локальном диске. Вышеуказанный запрос также показывает, где на локальном диске хранятся данные и метаданные. Проверьте локальные данные:
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  Проверьте данные S3 в каждой корзине S3 (общие размеры не показаны, но в обеих корзинах после вставок хранится приблизительно 36 MiB):

<Image img={Bucket1} size="lg" border alt="Размер данных в первой корзине S3, показывающий метрики использования хранилища" />

<Image img={Bucket2} size="lg" border alt="Размер данных во второй корзине S3, показывающий метрики использования хранилища" />

## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) - это новый класс хранения с высокой производительностью в одной зоне доступности в Amazon S3.

Вы можете ознакомиться с [этим блогом](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) чтобы узнать о нашем опыте тестирования S3Express с ClickHouse.

:::note
  S3Express хранит данные в пределах одной зоны доступности. Это означает, что данные будут недоступны в случае сбоя зоны доступности.
:::
### S3 диск {#s3-disk}

Создание таблицы с хранилищем на основе S3Express корзины включает в себя следующие шаги:

1. Создайте корзину типа `Directory`
2. Установите соответствующую политику корзины, чтобы предоставить все необходимые права вашему пользователю S3 (например, `"Action": "s3express:*"` для простого разрешения неограниченного доступа)
3. При настройке политики хранения, пожалуйста, укажите параметр `region`

Конфигурация хранения такая же, как для обычного S3 и может выглядеть следующим образом:

``` sql
<storage_configuration>
    <disks>
        <s3_express>
            <type>s3</type>
            <endpoint>https://my-test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/store/</endpoint>
            <region>eu-north-1</region>
            <access_key_id>...</access_key_id>
            <secret_access_key>...</secret_access_key>
        </s3_express>
    </disks>
    <policies>
        <s3_express>
            <volumes>
                <main>
                    <disk>s3_express</disk>
                </main>
            </volumes>
        </s3_express>
    </policies>
</storage_configuration>
```

Затем создайте таблицу в новом хранилище:

``` sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3 хранилище {#s3-storage}

S3 хранилище также поддерживается, но только для путей `Object URL`. Например:

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

это также требует указания региона корзины в конфигурации:

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### Резервные копии {#backups}

Возможно сохранить резервную копию на диске, который мы создали выше:

``` sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

``` sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
