---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'Интеграция S3 с ClickHouse'
title: 'Интеграция S3 с ClickHouse'
description: 'Страница, описывающая, как интегрировать S3 с ClickHouse'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';

# Интеграция S3 с ClickHouse

Вы можете вставлять данные из S3 в ClickHouse, а также использовать S3 в качестве места экспорта, что позволяет взаимодействовать с архитектурами "Озера данных". Более того, S3 может предоставлять уровни "холодного" хранения и помогать разделять хранение и вычисления. В разделах ниже мы используем набор данных о такси в Нью-Йорке, чтобы продемонстрировать процесс перемещения данных между S3 и ClickHouse, а также определить ключевые параметры конфигурации и дать подсказки по оптимизации производительности.
## Функции таблицы S3 {#s3-table-functions}

Функция таблицы `s3` позволяет вам читать и записывать файлы из и в хранилище, совместимое с S3. Основной синтаксис выглядит следующим образом:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

где:

* path — URL корзины с путем к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки. Для получения дополнительной информации смотрите документацию о [использовании подстановочных знаков в пути](/engines/table-engines/integrations/s3/#wildcards-in-path).
* format — [формат](/interfaces/formats#formats-overview) файла.
* structure — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
* compression — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет выполнено автоматическое определение сжатия по расширению файла.

Использование подстановочных знаков в выражении пути позволяет ссылаться на несколько файлов и открывает возможности для параллелизма.
### Подготовка {#preparation}

Перед созданием таблицы в ClickHouse вам может потребоваться сначала внимательно посмотреть на данные в корзине S3. Вы можете сделать это напрямую из ClickHouse, используя оператор `DESCRIBE`:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Результат выполнения оператора `DESCRIBE TABLE` должен показать, как ClickHouse автоматически интерпретирует эти данные, как это видно в корзине S3. Обратите внимание, что он также автоматически распознает и декомпрессирует формат gzip:

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

Чтобы взаимодействовать с нашими данными на основе S3, мы подготавливаем стандартную таблицу `MergeTree` в качестве нашего пункта назначения. В следующем операторе создается таблица с именем `trips` в базе данных по умолчанию. Обратите внимание, что мы решили изменить некоторые из этих типов данных, как это было интерпретировано выше, особенно чтобы не использовать модификатор типа данных [`Nullable()`](/sql-reference/data-types/nullable), что может привести к излишнему хранению и дополнительным накладным расходам на производительность:

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

Обратите внимание на использование [партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) по полю `pickup_date`. Обычно ключ партиционирования предназначен для управления данными, но позже мы будем использовать этот ключ, чтобы параллелизовать записи в S3.

Каждая запись в нашем наборе данных о такси содержит поездку на такси. Эти анонимизированные данные состоят из 20 миллионов записей, сжатых в корзине S3 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ под папкой **nyc-taxi**. Данные находятся в формате TSV с примерно 1 миллионом строк в файле.
### Чтение данных из S3 {#reading-data-from-s3}

Мы можем запрашивать данные S3 как источник, не требуя их постоянства в ClickHouse. В следующем запросе мы выбираем 10 строк. Обратите внимание на отсутствие учетных данных, так как корзина доступна для общего доступа:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

Обратите внимание, что нам не нужно перечислять столбцы, так как формат `TabSeparatedWithNames` кодирует имена столбцов в первой строке. Другие форматы, такие как `CSV` или `TSV`, будут возвращать автоматически сгенерированные столбцы для этого запроса, например, `c1`, `c2`, `c3` и так далее.

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

Подтвердите количество строк в этом выборочном наборе данных. Обратите внимание на использование подстановочных знаков для расширения файлов, поэтому мы учитываем все двадцать файлов. Этот запрос займет около 10 секунд, в зависимости от количества ядер на экземпляре ClickHouse:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

Хотя это полезно для выборки данных и выполнения исследовательских запросов, чтение данных непосредственно из S3 не то, что вы хотите делать регулярно. Когда придет время действовать серьезно, импортируйте данные в таблицу `MergeTree` в ClickHouse.
### Использование clickhouse-local {#using-clickhouse-local}

Программа `clickhouse-local` позволяет вам выполнять быструю обработку на локальных файлах без развертывания и настройки сервера ClickHouse. Любые запросы с использованием функции таблицы `s3` могут быть выполнены с помощью этого инструмента. Например:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### Вставка данных из S3 {#inserting-data-from-s3}

Чтобы использовать все возможности ClickHouse, мы читаем и вставляем данные в наш экземпляр. Мы объединяем нашу функцию `s3` с простым оператором `INSERT`, чтобы достичь этого. Обратите внимание, что нам не нужно перечислять столбцы, поскольку наша целевая таблица предоставляет требуемую структуру. Это требует, чтобы столбцы появлялись в указанном порядке в заявлении DDL таблицы: столбцы сопоставляются в соответствии с их позицией в разделе `SELECT`. Вставка всех 10 миллионов строк может занять несколько минут в зависимости от экземпляра ClickHouse. Ниже мы вставляем 1 миллион строк, чтобы обеспечить быструю реакцию. Отрегулируйте условие `LIMIT` или выбор столбцов для импорта подмножеств по мере необходимости:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### Удаленная вставка с использованием ClickHouse Local {#remote-insert-using-clickhouse-local}

Если политики сетевой безопасности запрещают вашему кластеру ClickHouse устанавливать исходящие подключение, вы можете потенциально вставить данные S3, используя `clickhouse-local`. В следующем примере мы читаем из корзины S3 и вставляем в ClickHouse, используя функцию `remote`:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
Для выполнения этого запроса через безопасное SSL-соединение используйте функцию `remoteSecure`.
:::
### Экспорт данных {#exporting-data}

Вы можете записывать файлы в S3, используя функцию таблицы `s3`. Это потребует соответствующих разрешений. Мы передаем учетные данные, необходимые в запросе, но смотрите страницу [Управление учетными данными](#managing-credentials) для получения дополнительных вариантов.

В простом примере ниже мы используем функцию таблицы в качестве пункта назначения вместо источника. Здесь мы передаем 10,000 строк из таблицы `trips` в корзину, указывая сжатие `lz4` и тип вывода `CSV`:

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

Обратите внимание, как формат файла определяется по расширению. Нам также не нужно указывать столбцы в функции `s3` - это можно вывести из `SELECT`.
### Деление больших файлов {#splitting-large-files}

Маловероятно, что вы захотите экспортировать ваши данные в виде одного файла. Большинство инструментов, включая ClickHouse, будут достигать более высокой производительности при чтении и записи в несколько файлов благодаря возможности параллелизма. Мы могли бы выполнять нашу команду `INSERT` несколько раз, нацеливаясь на подмножество данных. ClickHouse предлагает способ автоматического деления файлов, используя ключ `PARTITION`.

В следующем примере мы создаем десять файлов, используя модуль функции `rand()`. Обратите внимание, как идентификатор результирующей партиции ссылается на имя файла. В результате мы получаем десять файлов с числовым суффиксом, например `trips_0.csv.lz4`, `trips_1.csv.lz4` и т.д.:

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

В качестве альтернативы мы можем ссылаться на поле в данных. Для этого набора данных `payment_type` предоставляет естественный ключ партиционирования с кардинальностью 5.

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

Вышеупомянутые функции ограничены выполнением на одном узле. Скорости чтения будут масштабироваться линейно с ядрами CPU до тех пор, пока другие ресурсы (обычно сеть) не окажутся насыщенными, позволяя пользователям вертикально масштабироваться. Тем не менее, у этого подхода есть свои ограничения. Хотя пользователи могут облегчить некоторую нагрузку на ресурсы, вставляя записи в распределенную таблицу, выполняя запрос `INSERT INTO SELECT`, тем не менее, это оставляет один узел для чтения, анализа и обработки данных. Для решения этой задачи и обеспечения горизонтального масштабирования чтений существует функция [s3Cluster](/sql-reference/table-functions/s3Cluster.md).

Узел, который получает запрос, известен как инициатор, создает соединение с каждым узлом в кластере. Шаблон глобального поиска, определяющий, какие файлы необходимо читать, разрешается в набор файлов. Инициатор распределяет файлы между узлами в кластере, которые действуют как рабочие. Эти рабочие, в свою очередь, запрашивают файлы для обработки по мере завершения чтения. Этот процесс обеспечивает горизонтальное масштабирование чтений.

Функция `s3Cluster` принимает тот же формат, что и варианты для одного узла, за исключением того, что требуется указать целевой кластер для обозначения рабочих узлов:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — Имя кластера, которое используется для создания набора адресов и параметров соединений с удаленными и локальными серверами.
* `source` — URL к файлу или группе файлов. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{'abc','def'}` и `{N..M}`, где N, M — числа, abc, def — строки. Для получения дополнительной информации смотрите [Подстановочные знаки в пути](/engines/table-engines/integrations/s3.md/#wildcards-in-path).
* `access_key_id` и `secret_access_key` — Ключи, которые указывают на учетные данные, которые следует использовать с данной конечной точкой. Опционально.
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `structure` — Структура таблицы. Формат 'column1_name column1_type, column2_name column2_type, ...'.

Как и любые функции `s3`, учетные данные являются необязательными, если корзина небезопасна или вы определяете безопасность через среду, например, IAM роли. В отличие от функции s3, однако, структура должна быть указана в запросе с версии 22.3.1, т.е. схема не выводится.

Эта функция будет использоваться как часть `INSERT INTO SELECT` в большинстве случаев. В этом случае вы часто будете вставлять в распределенную таблицу. Мы иллюстрируем простой пример ниже, где trips_all — это распределенная таблица. В то время как эта таблица использует кластер событий, согласованность узлов, используемых для чтения и записи, не является обязательным условием:

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

Вставки будут происходить против инициирующего узла. Это означает, что хотя чтения будут происходить на каждом узле, результирующие строки будут переданы инициатору для распределения. В сценариях с высокой пропускной способностью это может стать узким местом. Для решения этой проблемы установите параметр [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select) для функции `s3cluster`.
## Движки таблиц S3 {#s3-table-engines}

В то время как функции `s3` позволяют выполнять выборки ad-hoc на данных, хранящихся в S3, они являются синтаксически многословными. Движок таблицы `S3` позволяет вам не указывать URL корзины и учетные данные снова и снова. Для решения этой задачи ClickHouse предоставляет движок таблицы S3.

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — URL корзины с путем к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где N, M — числа, 'abc', 'def' — строки. Для получения дополнительной информации смотрите [здесь](/engines/table-engines/integrations/s3#wildcards-in-path).
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные пользователя AWS. Вы можете использовать их для аутентификации ваших запросов. Параметр является необязательным. Если учетные данные не указаны, используются значения из файла конфигурации. Для получения дополнительной информации смотрите [Управление учетными данными](#managing-credentials).
* `compression` — Тип сжатия. Поддерживаемые значения: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. Параметр является необязательным. По умолчанию будет выполнено автоматическое определение сжатия по расширению файла.
### Чтение данных {#reading-data}

В следующем примере мы создаем таблицу с именем `trips_raw`, используя первые десять файлов TSV, расположенных в корзине `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`. Каждый из этих файлов содержит по 1 миллиону строк:

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
   `payment_type`          Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
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

Обратите внимание на использование шаблона `{0..9}` для ограничения только первыми десятью файлами. После создания мы можем запрашивать эту таблицу, как любую другую:

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

Движок таблицы `S3` поддерживает параллельные чтения. Записи поддерживаются только в том случае, если определение таблицы не содержит шаблонов глобального поиска. Таким образом, вышеупомянутая таблица заблокирует записи.

Чтобы продемонстрировать записи, создайте таблицу, которая указывает на записываемую корзину S3:

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

Обратите внимание, что строки могут вставляться только в новые файлы. Нет операций слияния или деления файлов. После записи файлов последующие вставки будут неудачными. У пользователей есть два варианта:

* Установить параметр `s3_create_new_file_on_insert=1`. Это приведет к созданию новых файлов при каждой вставке. Численный суффикс будет добавляться в конец каждого файла, который будет неуклонно увеличиваться для каждой операции вставки. Для приведенного выше примера последующая вставка вызовет создание файла trips_1.bin.
* Установить параметр `s3_truncate_on_insert=1`. Это приведет к обрезке файла, т.е. он будет содержать только вновь вставленные строки после завершения.

Оба этих параметра по умолчанию равны 0 - это вынуждает пользователя установить один из них. Параметр `s3_truncate_on_insert` будет иметь приоритет, если оба установлены.

Некоторые замечания по движку таблицы `S3`:

- В отличие от традиционной таблицы семейства `MergeTree`, удаление таблицы `S3` не приведет к удалению базовых данных.
- Полные настройки для этого типа таблиц можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).
- Обратите внимание на следующие ограничения при использовании этого движка:
    * Запросы ALTER не поддерживаются
    * Операции SAMPLE не поддерживаются
    * Нет понятия индексов, т.е. первичных или разреженных.
## Управление учетными данными {#managing-credentials}

В предыдущих примерах мы передавали учетные данные в функции `s3` или определении таблицы `S3`. Хотя это может быть приемлемо для случайного использования, пользователям требуется менее явный механизм аутентификации в производственной среде. Для этого ClickHouse имеет несколько опций:

* Укажите параметры соединения в **config.xml** или эквивалентном файле конфигурации в **conf.d**. Содержимое примерного файла показано ниже, исходя из установки с использованием пакета debian.

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

    Эти учетные данные будут использоваться для любых запросов, где указанная конечная точка точно совпадает с запрашиваемым URL. Также обратите внимание на возможность в этом примере указать заголовок авторизации в качестве альтернативы ключам доступа и секрета. Полный список поддерживаемых настроек можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).

* Пример выше подчеркивает доступность параметра конфигурации `use_environment_credentials`. Этот параметр конфигурации также может быть установлен глобально на уровне `s3`:

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    Эта настройка включает попытку извлечения учетных данных S3 из среды, что позволяет доступ через IAM роли. В частности, выполняется следующий порядок извлечения:

   * Поиск переменных окружения `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`
   * Проверка в **$HOME/.aws**
   * Временные учетные данные, полученные через службу временных токенов безопасности AWS - т.е. через [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API
   * Проверки учетных данных в переменных среды ECS `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` или `AWS_CONTAINER_CREDENTIALS_FULL_URI` и `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
   * Получение учетных данных через [метаданные экземпляра Amazon EC2](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html), при этом следует учитывать, что [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) не должно быть установлено в true.
   * Эти же параметры могут быть установлены для конкретной конечной точки, используя то же правило сопоставления префиксов.
## Оптимизация производительности {#s3-optimizing-performance}

Для оптимизации чтения и вставки с использованием функции S3 смотрите [посвященное руководство по производительности](./performance.md).
### Настройка хранения S3 {#s3-storage-tuning}

Внутри clickhouse merge tree использует два основных формата хранения: [`Широкий` и `Компактный`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). Хотя текущее выполнение использует поведение по умолчанию ClickHouse (контролируемое через параметры `min_bytes_for_wide_part` и `min_rows_for_wide_part`), мы ожидаем, что поведение для S3 будет различаться в будущих релизах, например, более крупное значение по умолчанию для `min_bytes_for_wide_part` будет поощрять более `Компактный` формат и, таким образом, меньшее количество файлов. Пользователи могут настраивать эти параметры при использовании исключительно хранилища S3.
## MergeTree на основе S3 {#s3-backed-mergetree}

Функции `s3` и связанный с ними движок таблицы позволяют запрашивать данные в S3, используя знакомый синтаксис ClickHouse. Однако в отношении функций управления данными и производительности они ограничены. Нет поддержки первичных индексов, поддержки кэша, и операции вставки файлов необходимо управлять пользователем.

ClickHouse признает, что S3 представляет собой привлекательное решение для хранения, особенно когда производительность запросов на "более холодных" данных менее критична, и пользователи стремятся разделить хранение и вычисления. Чтобы помочь в этом, предоставляется поддержка использования S3 в качестве хранилища для движка MergeTree. Это позволит пользователям использовать преимущества масштабируемости и экономии затрат S3 и производительности вставки и запроса движка MergeTree.
### Уровни хранения {#storage-tiers}

Объёмы хранения ClickHouse позволяют абстрагировать физические диски от движка таблиц MergeTree. Каждый отдельный объём может состоять из упорядоченного набора дисков. Хотя в основном это позволяет использовать несколько блочных устройств для хранения данных, такая абстракция также позволяет использовать другие типы хранилищ, включая S3. Части данных ClickHouse могут перемещаться между объёмами и заполняемостью в соответствии с политиками хранения, создавая таким образом концепцию уровней хранения.

Уровни хранения открывают архитектуры горячего и холодного хранения, где самые свежие данные, которые обычно также чаще всего запрашиваются, требуют лишь небольшого объёма на высокопроизводительном хранилище, например, на NVMe SSD. С течением времени, когда данные стареют, SLA по времени выполнения запросов увеличивается, как и частота запросов. Этот «толстый» хвост данных может храниться на более медленных, менее производительных хранилищах, таких как HDD или объектное хранилище, такое как S3.

### Создание диска {#creating-a-disk}

Чтобы использовать S3 корзину в качестве диска, нужно сначала объявить её в файле конфигурации ClickHouse. Либо дополните config.xml, либо желательно предоставьте новый файл в conf.d. Пример объявления S3 диска показан ниже:

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

Полный список настроек, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Обратите внимание, что учетные данные можно управлять здесь с использованием тех же методов, описанных в [Управление учетными данными](#managing-credentials), т.е. параметр use_environment_credentials можно установить в true в указанном выше блоке настроек для использования ролей IAM.

### Создание политики хранения {#creating-a-storage-policy}

После настройки этот «диск» может быть использован объёмом хранения, объявленным в политике. Для приведенного ниже примера мы предполагаем, что s3 - это наше единственное хранение. Это не учитывает более сложные архитектуры горячего и холодного хранилища, где данные могут быть перемещены на основе TTL и заполняемости.

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

Предполагая, что вы настроили ваш диск для использования корзины с правами на запись, вы сможете создать таблицу, как в следующем примере. В целях краткости мы используем подмножество столбцов такси NYC и передаем данные напрямую в таблицу на S3:

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

В зависимости от оборудования, последняя вставка 1м строк может занять несколько минут для выполнения. Вы можете подтвердить прогресс через таблицу system.processes. Не стесняйтесь увеличивать количество строк до максимума в 10м и исследовать несколько примерных запросов.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Изменение таблицы {#modifying-a-table}

Иногда пользователям может понадобиться изменить политику хранения конкретной таблицы. Хотя это возможно, это связано с ограничениями. Новая целевая политика должна содержать все диски и объёмы предыдущей политики, т.е. данные не будут перемещены для удовлетворения изменения политики. При проверке этих ограничений, объёмы и диски будут идентифицированы по их именам, а попытки нарушить это приведут к ошибке. Тем не менее, предполагая, что вы используете предыдущие примеры, следующие изменения действительны.

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

Здесь мы повторно используем основной объём в нашей новой политике s3_tiered и вводим новый горячий объём. Это использует диск по умолчанию, который состоит только из одного диска, настроенного через параметр `<path>`. Обратите внимание, что наши имена объёмов и дисков не меняются. Новые вставки в нашу таблицу будут находиться на диске по умолчанию, пока это не достигнет move_factor * disk_size - после чего данные будут перемещены в S3.

### Обработка репликации {#handling-replication}

Репликация с дисками S3 может быть осуществлена с помощью движка таблиц `ReplicatedMergeTree`. Подробности см. в руководстве [репликации единого шарда по двум регионам AWS с использованием объектного хранилища S3](#s3-multi-region).

### Чтения и записи {#read--writes}

Следующие примечания охватывают реализацию взаимодействия S3 с ClickHouse. Хотя они в основном информативны, они могут помочь читателям при [Оптимизации производительности](#s3-optimizing-performance):

* По умолчанию максимальное количество потоков обработки запросов, используемых на любом этапе конвейера обработки запросов, равно количеству ядер. Некоторые этапы более параллелизуемы, чем другие, поэтому это значение предоставляет верхний предел. Несколько этапов запроса могут выполняться одновременно, поскольку данные считываются с диска. Таким образом, точное количество потоков, использованных для выполнения запроса, может превышать это. Модифицируйте через настройку [max_threads](/operations/settings/settings#max_threads).
* Чтения из S3 по умолчанию являются асинхронными. Это поведение определено установкой `remote_filesystem_read_method`, которая по умолчанию устанавливается в значение `threadpool`. При обслуживании запроса ClickHouse считывает гранулы по полосам. Каждая из этих полос потенциально содержит много столбцов. Поток будет считывать столбцы для своих гранул один за другим. Вместо того чтобы делать это синхронно, выполняется предвыборка для всех столбцов перед ожиданием данных. Это дает значительные улучшения производительности по сравнению с синхронными ожиданиями для каждого столбца. Пользователям не нужно изменять эту настройку в большинстве случаев - см. [Оптимизация производительности](#s3-optimizing-performance).
* Записи выполняются параллельно, с максимум 100 параллельными потоками записи файлов. `max_insert_delayed_streams_for_parallel_write`, который имеет значение по умолчанию 1000, контролирует количество S3 объектов, записываемых параллельно. Поскольку для каждого файла, который записывается, требуется буфер (~1MB), это эффективно ограничивает потребление памяти при выполнении INSERT. Может быть целесообразно снизить это значение в сценариях с низкой памятью сервера.

## Использование объектного хранилища S3 как диска ClickHouse {#configuring-s3-for-clickhouse-use}

Если вам нужны пошаговые инструкции для создания корзин и роли IAM, то разверните раздел **Создание корзин S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

### Настройка ClickHouse для использования корзины S3 в качестве диска {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
Следующий пример основан на пакете Deb для Linux, установленном как служба с папками ClickHouse по умолчанию.

1. Создайте новый файл в директории ClickHouse `config.d` для хранения конфигурации хранения.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. Добавьте следующее для конфигурации хранилища, заменяя путь к корзине, ключи доступа и секретные ключи из предыдущих шагов
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
Теги `s3_disk` и `s3_cache` внутри тега `<disks>` являются произвольными метками. Их можно изменить на что-то другое, но одна и та же метка должна использоваться в теге `<disk>` под тегом `<policies>` для ссылки на диск. Тег `<S3_main>` также произвольный и является названием политики, которая будет использоваться в качестве идентификатора хранилища при создании ресурсов в ClickHouse.

Конфигурация, представленная выше, предназначена для версии ClickHouse 22.8 или выше, если вы используете более старую версию, пожалуйста, ознакомьтесь с документацией по [хранению данных](/operations/storing-data.md/#using-local-cache).

Для получения дополнительной информации об использовании S3:
Руководство по интеграции: [S3 Backed MergeTree](#s3-backed-mergetree)
:::

3. Обновите владельца файла на пользователя и группу `clickhouse`
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. Перезапустите экземпляр ClickHouse, чтобы изменения вступили в силу.
```bash
service clickhouse-server restart
```
### Тестирование {#testing}
1. Войдите с помощью клиента ClickHouse, что-то вроде следующего
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. Создайте таблицу, указав новую политику хранения S3
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

3. Убедитесь, что таблица была создана с правильной политикой
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

4. Вставьте тестовые строки в таблицу
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
5. Просмотрите строки
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
6. В консоли AWS перейдите к корзинам и выберите новую и папку.
Вам нужно увидеть что-то вроде следующего:

<Image img={S3J} size="lg" border alt="Представление S3 корзины в консоли AWS с отображением хранившихся файлов данных ClickHouse в S3" />
## Репликация единого шарда по двум регионам AWS с использованием объектного хранилища S3 {#s3-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::
### Планирование развертывания {#plan-the-deployment}
Этот учебник основан на развертывании двух узлов сервера ClickHouse и трёх узлов Keeper ClickHouse в AWS EC2. Хранилище данных для серверов ClickHouse - это S3. Используются два региона AWS, с сервером ClickHouse и корзиной S3 в каждом регионе, чтобы поддерживать восстановление после сбоя.

Таблицы ClickHouse реплицируются между двумя серверами, а следовательно, и в двух регионах.

### Установка программного обеспечения {#install-software}
#### Узлы сервера ClickHouse {#clickhouse-server-nodes}
Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах сервера ClickHouse.
#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в примерах конфигураций они называются `chnode1`, `chnode2`.

Поместите `chnode1` в один регион AWS, а `chnode2` - во второй.

#### Развертывание Keeper ClickHouse {#deploy-clickhouse-keeper}

Разверните Keeper ClickHouse на трёх хостах, в примерах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`.  `keepernode1` может быть развернут в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, а `keepernode3` в любом регионе, но в другой зоне доступности от узла ClickHouse в этом регионе.

Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах Keeper ClickHouse.

### Создание корзин S3 {#create-s3-buckets}

Создайте две корзины S3, по одной в каждом из регионов, куда вы поместили `chnode1` и `chnode2`.

Если вам нужны пошаговые инструкции для создания корзин и роли IAM, то разверните раздел **Создание корзин S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

Файлы конфигурации затем будут помещены в `/etc/clickhouse-server/config.d/`. Вот пример конфигурационного файла для одной корзины, другой будет подобным, с тремя отличающимися выделенными строками:

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
           <disk>s3</disk>
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
Многие шаги в этом руководстве будут просить вас разместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это местоположение по умолчанию для файлов переписывания конфигурации в системах Linux. Когда вы помещаете эти файлы в этот каталог, ClickHouse использует содержимое для переписывания конфигурации по умолчанию. Помещая эти файлы в каталог переопределения, вы избежите потери вашей конфигурации во время обновления.
:::
### Настройка Keeper ClickHouse {#configure-clickhouse-keeper}

При работе с Keeper ClickHouse в автономном режиме (отдельно от сервера ClickHouse) конфигурация представляет собой один файл XML. В этом учебнике файл - `/etc/clickhouse-keeper/keeper_config.xml`. Все три сервера Keeper используют одну и ту же конфигурацию с одним отличающимся параметром; `<server_id>`.

`server_id` указывает ID, который будет присвоен хосту, на котором используется файл конфигурации. В примере ниже `server_id` равен `3`, и если вы посмотрите дальше в файле в разделе `<raft_configuration>`, вы увидите, что сервер 3 имеет имя хоста `keepernode3`. Это позволяет процессу Keeper ClickHouse знать, к каким другим серверам подключаться при выборе лидера и всех других действиях.

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

Скопируйте файл конфигурации для Keeper ClickHouse на место (не забудьте установить `<server_id>`):
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### Настройка сервера ClickHouse {#configure-clickhouse-server}
#### Определение кластера {#define-a-cluster}

Кластеры ClickHouse (кластер) определяются в разделе `<remote_servers>` конфигурации. В этом примере определяется один кластер `cluster_1S_2R`, который состоит из единого шарда с двумя репликами. Реплики находятся на хостах `chnode1` и `chnode2`.

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

При работе с кластерами удобно определять макросы, которые заполняют запросы DDL настройками кластера, шарда и реплики. Этот пример позволяет вам указать использование реплицированного движка таблиц, не предоставляя деталей `shard` и `replica`. Когда вы создаете таблицу, вы можете увидеть, как макросы `shard` и `replica` используются, запрашивая `system.tables`.

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
Вышеуказанные макросы предназначены для `chnode1`, на `chnode2` установите `replica` на `replica_2`.
:::
#### Отключение репликации без копирования {#disable-zero-copy-replication}

В версиях ClickHouse 22.7 и ниже установка `allow_remote_fs_zero_copy_replication` по умолчанию установлена в `true` для дисков S3 и HDFS. Из-за этого параметра в сценарии восстановления после сбоя он должен быть установлен в `false`, а в версиях 22.8 и выше он по умолчанию установлен в `false`.

Эта установка должна быть выставлена в false по двум причинам: 1) эта функция еще не готова к производству; 2) в сценарии восстановления после сбоя оба данных и метаданные должны храниться в нескольких регионах. Установите `allow_remote_fs_zero_copy_replication` в `false`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```


ClickHouse Keeper отвечает за координацию репликации данных между узлами ClickHouse. Чтобы проинформировать ClickHouse о узлах ClickHouse Keeper, добавьте конфигурационный файл на каждый из узлов ClickHouse.

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

Смотрите [список сетевых портов](../../../guides/sre/network-ports.md), когда вы настраиваете параметры безопасности в AWS, чтобы ваши серверы могли общаться друг с другом, и вы могли общаться с ними.

Все три сервера должны слушать сетевые подключения, чтобы они могли общаться между серверами и с S3. По умолчанию ClickHouse прослушивает только по адресу обратной связи, поэтому это нужно изменить. Это настраивается в `/etc/clickhouse-server/config.d/`. Вот пример, который настраивает ClickHouse и Keeper ClickHouse на прослушивание всех интерфейсов IP версии 4. Смотрите документацию или файл конфигурации по умолчанию `/etc/clickhouse/config.xml` для получения дополнительной информации.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### Запуск серверов {#start-the-servers}
#### Запуск Keeper ClickHouse {#run-clickhouse-keeper}

На каждом сервере Keeper выполните команды для вашей операционной системы, например:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### Проверка статуса Keeper ClickHouse {#check-clickhouse-keeper-status}

Отправьте команды в ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы запустите команду на каждом из узлов Keeper, вы увидите, что один из них является лидером, а другие два - последователями:

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

Когда вы добавили [конфигурацию кластера](#define-a-cluster), был определён единственный шард, реплицированный между двумя узлами ClickHouse. На этом этапе вы проверите, что кластер был создан при запуске ClickHouse, и создадите реплицированную таблицу, используя этот кластер.
- Проверьте, что кластер существует:
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- Создайте таблицу в кластере с использованием движка таблиц `ReplicatedMergeTree`:
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
- Понимать использование ранее определённых макросов

  Макросы `shard` и `replica` были [определены ранее](#define-a-cluster), а в выделенной строке ниже вы можете увидеть, где значения подставлены на каждом узле ClickHouse. Кроме того, значение `uuid` используется; `uuid` не определяется в макросах, так как оно генерируется системой.
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
  Вы можете настроить путь к зукиперу `'clickhouse/tables/{uuid}/{shard}` показанном выше, установив `default_replica_path` и `default_replica_name`. Документация [здесь](/operations/server-configuration-parameters/settings.md/#default_replica_path).
  :::

### Тестирование {#testing-1}

Эти тесты будут проверять, что данные реплицируются между двумя серверами и что они хранятся в корзинах S3, а не на локальном диске.

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

  Этот запрос показывает размер данных на диске и политику, используемую для определения того, какой диск используется.
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

  Проверьте размер данных на локальном диске. Из вышеизложенного размер для миллиона строк, хранящихся на диске, составляет 36.42 MiB. Это должно быть на S3, а не на локальном диске. Этот запрос также сообщает нам, где на локальном диске хранятся данные и метаданные. Проверьте локальные данные:
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  Проверьте данные S3 в каждой корзине S3 (общие размеры не показаны, но в обеих корзинах после вставок хранится примерно 36 MiB):

<Image img={Bucket1} size="lg" border alt="Размер данных в первой корзине S3 с показателями использования хранилища" />

<Image img={Bucket2} size="lg" border alt="Размер данных во второй корзине S3 с показателями использования хранилища" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) - это новый высокопроизводительный класс хранения с одним зоной доступности в Amazon S3.

Вы можете обратиться к этому [блогу](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) чтобы прочитать о нашем опыте тестирования S3Express с ClickHouse.

:::note
  S3Express хранит данные в одной зоне доступности. Это означает, что данные будут недоступны в случае сбоя зоны доступности.
:::
### S3 диск {#s3-disk}

Создание таблицы с хранилищем, основанным на S3Express корзине, включает следующие шаги:

1. Создать корзину типа `Directory`
2. Установить подходящую политику корзины, чтобы предоставить все необходимые разрешения вашему S3 пользователю (например, `"Action": "s3express:*"` для простого разрешения неограниченного доступа)
3. При настройке политики хранения укажите параметр `region`

Конфигурация хранения такая же, как для обычного S3, и, например, может выглядеть следующим образом:

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

А затем создайте таблицу в новом хранилище:

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

S3 хранилище также поддерживается, но только для путей `Object URL`. Пример:

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

Это также требует указания региона корзины в конфигурации:

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### Резервные копии {#backups}

Можно сохранить резервную копию на диске, который мы создали выше:

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
