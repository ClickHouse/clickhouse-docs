---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'Интеграция S3 с ClickHouse'
title: 'Интеграция S3 с ClickHouse'
description: 'Страница, описывающая интеграцию S3 с ClickHouse'
keywords: ['Amazon S3', 'объектное хранилище', 'облачное хранилище', 'озеро данных', 'интеграция с S3']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# Интеграция S3 с ClickHouse

Вы можете загружать данные из S3 в ClickHouse, а также использовать S3 как целевое хранилище для экспорта данных, что позволяет работать с архитектурами типа «Data Lake». Кроме того, S3 может обеспечивать уровни «холодного» хранилища и помогать в разделении хранения и вычислений. В следующих разделах мы используем набор данных о такси Нью-Йорка, чтобы продемонстрировать процесс перемещения данных между S3 и ClickHouse, а также выделить ключевые параметры конфигурации и дать рекомендации по оптимизации производительности.



## Табличные функции S3 {#s3-table-functions}

Табличная функция `s3` позволяет читать и записывать файлы из S3-совместимого хранилища и в него. Синтаксис функции:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

где:

- path — URL бакета с путём к файлу. В режиме только для чтения поддерживаются следующие подстановочные символы: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки. Подробнее см. документацию по [использованию подстановочных символов в пути](/engines/table-engines/integrations/s3/#wildcards-in-path).
- format — [Формат](/interfaces/formats#formats-overview) файла.
- structure — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- compression — Необязательный параметр. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла.

Использование подстановочных символов в пути позволяет обращаться к нескольким файлам одновременно и обеспечивает возможность параллельной обработки.

### Подготовка {#preparation}

Перед созданием таблицы в ClickHouse рекомендуется сначала изучить данные в бакете S3. Это можно сделать непосредственно из ClickHouse с помощью оператора `DESCRIBE`:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Вывод оператора `DESCRIBE TABLE` покажет, как ClickHouse автоматически определит структуру данных из бакета S3. Обратите внимание, что ClickHouse также автоматически распознаёт и распаковывает формат сжатия gzip:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

```


┌─name──────────────────┬─type───────────────┐
│ trip&#95;id               │ Nullable(Int64)    │
│ vendor&#95;id             │ Nullable(Int64)    │
│ pickup&#95;date           │ Nullable(Date)     │
│ pickup&#95;datetime       │ Nullable(DateTime) │
│ dropoff&#95;date          │ Nullable(Date)     │
│ dropoff&#95;datetime      │ Nullable(DateTime) │
│ store&#95;and&#95;fwd&#95;flag    │ Nullable(Int64)    │
│ rate&#95;code&#95;id          │ Nullable(Int64)    │
│ pickup&#95;longitude      │ Nullable(Float64)  │
│ pickup&#95;latitude       │ Nullable(Float64)  │
│ dropoff&#95;longitude     │ Nullable(Float64)  │
│ dropoff&#95;latitude      │ Nullable(Float64)  │
│ passenger&#95;count       │ Nullable(Int64)    │
│ trip&#95;distance         │ Nullable(String)   │
│ fare&#95;amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta&#95;tax               │ Nullable(String)   │
│ tip&#95;amount            │ Nullable(String)   │
│ tolls&#95;amount          │ Nullable(Float64)  │
│ ehail&#95;fee             │ Nullable(Int64)    │
│ improvement&#95;surcharge │ Nullable(String)   │
│ total&#95;amount          │ Nullable(String)   │
│ payment&#95;type          │ Nullable(String)   │
│ trip&#95;type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab&#95;type              │ Nullable(String)   │
│ pickup&#95;nyct2010&#95;gid   │ Nullable(Int64)    │
│ pickup&#95;ctlabel        │ Nullable(Float64)  │
│ pickup&#95;borocode       │ Nullable(Int64)    │
│ pickup&#95;ct2010         │ Nullable(String)   │
│ pickup&#95;boroct2010     │ Nullable(String)   │
│ pickup&#95;cdeligibil     │ Nullable(String)   │
│ pickup&#95;ntacode        │ Nullable(String)   │
│ pickup&#95;ntaname        │ Nullable(String)   │
│ pickup&#95;puma           │ Nullable(Int64)    │
│ dropoff&#95;nyct2010&#95;gid  │ Nullable(Int64)    │
│ dropoff&#95;ctlabel       │ Nullable(Float64)  │
│ dropoff&#95;borocode      │ Nullable(Int64)    │
│ dropoff&#95;ct2010        │ Nullable(String)   │
│ dropoff&#95;boroct2010    │ Nullable(String)   │
│ dropoff&#95;cdeligibil    │ Nullable(String)   │
│ dropoff&#95;ntacode       │ Nullable(String)   │
│ dropoff&#95;ntaname       │ Nullable(String)   │
│ dropoff&#95;puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘

```

Для работы с нашим набором данных на основе S3 мы подготавливаем стандартную таблицу `MergeTree` в качестве целевой. Приведённая ниже инструкция создаёт таблицу с именем `trips` в базе данных по умолчанию. Обратите внимание, что мы решили изменить некоторые из типов данных, определённых выше, в частности, отказаться от использования модификатора типа данных [`Nullable()`](/sql-reference/data-types/nullable), который может привести к ненужному увеличению объёма хранимых данных и снижению производительности:
```


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

Обратите внимание на использование [партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) по полю `pickup_date`. Обычно ключ партиционирования используется для управления данными, но в дальнейшем мы будем использовать этот ключ для параллелизации записи в S3.

Каждая запись в нашем наборе данных о такси содержит информацию о поездке. Эти анонимизированные данные состоят из 20 миллионов записей, сжатых в бакете S3 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ в папке **nyc-taxi**. Данные представлены в формате TSV, примерно по 1 миллиону строк на файл.

### Чтение данных из S3 {#reading-data-from-s3}

Мы можем запрашивать данные из S3 в качестве источника без необходимости их сохранения в ClickHouse. В следующем запросе мы выбираем 10 строк. Обратите внимание на отсутствие учетных данных, так как бакет является общедоступным:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

Обратите внимание, что нам не требуется перечислять столбцы, поскольку формат `TabSeparatedWithNames` кодирует имена столбцов в первой строке. Другие форматы, такие как `CSV` или `TSV`, вернут для этого запроса автоматически сгенерированные столбцы, например `c1`, `c2`, `c3` и т. д.

Запросы также поддерживают [виртуальные столбцы](../sql-reference/table-functions/s3#virtual-columns), такие как `_path` и `_file`, которые предоставляют информацию о пути в бакете и имени файла соответственно. Например:

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

Проверим количество строк в этом образце данных. Обратите внимание на использование подстановочных символов для раскрытия файлов — таким образом учитываются все двадцать файлов. Выполнение этого запроса займет около 10 секунд в зависимости от количества ядер в экземпляре ClickHouse:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

Хотя чтение данных напрямую из S3 полезно для выборки данных и выполнения разовых исследовательских запросов, это не то, что следует делать регулярно. Когда дело доходит до серьезной работы, импортируйте данные в таблицу `MergeTree` в ClickHouse.

### Использование clickhouse-local {#using-clickhouse-local}

Программа `clickhouse-local` позволяет выполнять быструю обработку локальных файлов без развертывания и настройки сервера ClickHouse. С помощью этой утилиты можно выполнять любые запросы, использующие табличную функцию `s3`. Например:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### Вставка данных из S3 {#inserting-data-from-s3}

Чтобы использовать все возможности ClickHouse, далее мы прочитаем и вставим данные в наш экземпляр.
Для этого мы объединяем функцию `s3` с простым оператором `INSERT`. Обратите внимание, что нам не требуется перечислять столбцы, поскольку целевая таблица предоставляет необходимую структуру. При этом столбцы должны следовать в порядке, указанном в DDL-операторе таблицы: столбцы сопоставляются в соответствии с их позицией в предложении `SELECT`. Вставка всех 10 миллионов строк может занять несколько минут в зависимости от экземпляра ClickHouse. Ниже мы вставляем 1 миллион строк для обеспечения быстрого ответа. При необходимости настройте предложение `LIMIT` или выбор столбцов для импорта подмножеств данных:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### Удаленная вставка с использованием ClickHouse Local {#remote-insert-using-clickhouse-local}

Если политики сетевой безопасности запрещают вашему кластеру ClickHouse устанавливать исходящие соединения, вы можете вставить данные из S3 с помощью `clickhouse-local`. В примере ниже мы читаем данные из корзины S3 и вставляем их в ClickHouse с использованием функции `remote`:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
Для выполнения этой операции через защищенное SSL-соединение используйте функцию `remoteSecure`.
:::

### Экспорт данных {#exporting-data}

Вы можете записывать файлы в S3 с помощью табличной функции `s3`. Для этого потребуются соответствующие разрешения. Мы передаем необходимые учетные данные в запросе, но для получения дополнительных вариантов обратитесь к странице [Управление учетными данными](#managing-credentials).

В простом примере ниже мы используем табличную функцию в качестве назначения, а не источника. Здесь мы передаем 10 000 строк из таблицы `trips` в корзину, указывая сжатие `lz4` и тип вывода `CSV`:

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


Обратите внимание, что формат файла определяется по его расширению. Также нам не нужно указывать столбцы в функции `s3` — они выводятся из `SELECT`.

### Разделение больших файлов {#splitting-large-files}

Вряд ли вы захотите экспортировать данные в один файл. Большинство инструментов, включая ClickHouse, достигают более высокой пропускной способности при чтении и записи нескольких файлов благодаря возможности параллелизма. Мы могли бы выполнить команду `INSERT` несколько раз, обрабатывая подмножество данных каждый раз. ClickHouse предоставляет способ автоматического разделения файлов с использованием ключа `PARTITION`.

В примере ниже мы создаём десять файлов, используя остаток от деления результата функции `rand()`. Обратите внимание, как полученный идентификатор партиции используется в имени файла. В результате получается десять файлов с числовым суффиксом, например `trips_0.csv.lz4`, `trips_1.csv.lz4` и т.д.:

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

Альтернативно, мы можем использовать поле из данных. Для этого набора данных `payment_type` представляет собой естественный ключ партиционирования с кардинальностью 5.

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

Все вышеперечисленные функции ограничены выполнением на одном узле. Скорость чтения масштабируется линейно с количеством ядер CPU до тех пор, пока не будут исчерпаны другие ресурсы (обычно сеть), что позволяет пользователям выполнять вертикальное масштабирование. Однако у этого подхода есть ограничения. Хотя пользователи могут снизить нагрузку на ресурсы, вставляя данные в распределённую таблицу при выполнении запроса `INSERT INTO SELECT`, это всё равно оставляет один узел для чтения, парсинга и обработки данных. Для решения этой задачи и обеспечения горизонтального масштабирования чтения существует функция [s3Cluster](/sql-reference/table-functions/s3Cluster.md).

Узел, который получает запрос, известный как инициатор, создаёт соединение с каждым узлом в кластере. Шаблон glob, определяющий, какие файлы нужно прочитать, разрешается в набор файлов. Инициатор распределяет файлы между узлами кластера, которые выступают в роли рабочих узлов. Эти рабочие узлы, в свою очередь, запрашивают файлы для обработки по мере завершения чтения. Этот процесс обеспечивает горизонтальное масштабирование чтения.

Функция `s3Cluster` имеет тот же формат, что и варианты для одного узла, за исключением того, что требуется указать целевой кластер для обозначения рабочих узлов:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

- `cluster_name` — имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.
- `source` — URL файла или группы файлов. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `?`, `{'abc','def'}` и `{N..M}`, где N, M — числа, abc, def — строки. Для получения дополнительной информации см. [Подстановочные символы в пути](/engines/table-engines/integrations/s3.md/#wildcards-in-path).
- `access_key_id` и `secret_access_key` — ключи, которые указывают учётные данные для использования с данной конечной точкой. Необязательно.
- `format` — [формат](/interfaces/formats#formats-overview) файла.
- `structure` — структура таблицы. Формат 'column1_name column1_type, column2_name column2_type, ...'.

Как и для любых функций `s3`, учётные данные необязательны, если бакет незащищён или вы определяете безопасность через окружение, например, роли IAM. Однако, в отличие от функции s3, начиная с версии 22.3.1 структура должна быть указана в запросе, т.е. схема не выводится автоматически.

В большинстве случаев эта функция будет использоваться как часть `INSERT INTO SELECT`. В этом случае вы часто будете вставлять данные в распределённую таблицу. Ниже мы приводим простой пример, где trips_all является распределённой таблицей. Хотя эта таблица использует кластер events, согласованность узлов, используемых для чтения и записи, не является обязательным требованием:


```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

Вставки будут выполняться на инициирующем узле. Это означает, что хотя чтение будет происходить на каждом узле, полученные строки будут перенаправляться на инициатор для дальнейшего распределения. В сценариях с высокой нагрузкой это может стать узким местом. Чтобы избежать этого, установите параметр [parallel&#95;distributed&#95;insert&#95;select](/operations/settings/settings/#parallel_distributed_insert_select) для функции `s3cluster`.


## Табличные движки S3 {#s3-table-engines}

Хотя функции `s3` позволяют выполнять разовые запросы к данным, хранящимся в S3, их синтаксис довольно громоздкий. Табличный движок `S3` избавляет от необходимости каждый раз указывать URL бакета и учетные данные. Для этого ClickHouse предоставляет табличный движок S3.

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

- `path` — URL бакета с путем к файлу. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где N, M — числа, 'abc', 'def' — строки. Подробнее см. [здесь](/engines/table-engines/integrations/s3#wildcards-in-path).
- `format` — [Формат](/interfaces/formats#formats-overview) файла.
- `aws_access_key_id`, `aws_secret_access_key` — долгосрочные учетные данные пользователя аккаунта AWS. Используются для аутентификации запросов. Параметр необязательный. Если учетные данные не указаны, используются значения из конфигурационного файла. Подробнее см. [Управление учетными данными](#managing-credentials).
- `compression` — тип сжатия. Поддерживаемые значения: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. Параметр необязательный. По умолчанию тип сжатия определяется автоматически по расширению файла.

### Чтение данных {#reading-data}

В следующем примере создается таблица `trips_raw`, использующая первые десять TSV-файлов из бакета `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`. Каждый файл содержит 1 млн строк:


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

Обратите внимание на использование шаблона `{0..9}` для ограничения первыми десятью файлами. После создания эту таблицу можно запрашивать так же, как и любую другую:

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

Движок таблиц `S3` поддерживает параллельное чтение. Запись поддерживается только в том случае, если определение таблицы не содержит glob-шаблонов. Таким образом, приведённая выше таблица блокирует операции записи.

Для демонстрации записи создайте таблицу, указывающую на S3-бакет с правами на запись:

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

Обратите внимание, что строки можно вставлять только в новые файлы. Циклы слияния и операции разбиения файлов отсутствуют. После того как файл записан, последующие вставки будут завершаться с ошибкой. У пользователей есть два варианта:

* Установить настройку `s3_create_new_file_on_insert=1`. Это приведёт к созданию новых файлов при каждой вставке. К имени каждого файла будет добавляться числовой суффикс, который будет монотонно увеличиваться при каждой операции вставки. В приведённом выше примере последующая вставка приведёт к созданию файла trips&#95;1.bin.
* Установить настройку `s3_truncate_on_insert=1`. Это приведёт к усечению файла, т. е. по завершении операции он будет содержать только вновь вставленные строки.

Обе эти настройки по умолчанию равны 0 — поэтому пользователю необходимо явно указать одну из них. Если заданы обе, приоритет будет у `s3_truncate_on_insert`.

Несколько замечаний о движке таблиц `S3`:

* В отличие от таблицы семейства `MergeTree`, удаление таблицы `S3` не приведёт к удалению исходных данных.
* Полный список настроек для этого типа таблиц можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).
* Обратите внимание на следующие ограничения при использовании этого движка:
  * `ALTER`-запросы не поддерживаются
  * Операции `SAMPLE` не поддерживаются
  * Понятие индексов (таких как первичный или пропускающий) отсутствует.


## Управление учетными данными {#managing-credentials}

В предыдущих примерах мы передавали учетные данные в функции `s3` или определении таблицы `S3`. Хотя это может быть приемлемо для эпизодического использования, в продуктивной среде пользователям требуются менее явные механизмы аутентификации. Для решения этой задачи ClickHouse предоставляет несколько вариантов:

- Укажите параметры подключения в файле **config.xml** или эквивалентном конфигурационном файле в каталоге **conf.d**. Содержимое примера файла показано ниже, при условии установки с использованием пакета debian.

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

  Эти учетные данные будут использоваться для любых запросов, где указанная выше конечная точка точно совпадает с префиксом запрашиваемого URL. Также обратите внимание на возможность в этом примере объявить заголовок авторизации в качестве альтернативы ключам доступа и секретным ключам. Полный список поддерживаемых настроек можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).

- Приведенный выше пример демонстрирует доступность параметра конфигурации `use_environment_credentials`. Этот параметр конфигурации также может быть установлен глобально на уровне `s3`:

  ```xml
  <clickhouse>
      <s3>
      <use_environment_credentials>true</use_environment_credentials>
      </s3>
  </clickhouse>
  ```

  Эта настройка включает попытку получения учетных данных S3 из окружения, тем самым обеспечивая доступ через роли IAM. В частности, выполняется следующий порядок получения:
  - Поиск переменных окружения `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`
  - Проверка в **$HOME/.aws**
  - Временные учетные данные, полученные через AWS Security Token Service — то есть через API [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
  - Проверка учетных данных в переменных окружения ECS `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` или `AWS_CONTAINER_CREDENTIALS_FULL_URI` и `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
  - Получение учетных данных через [метаданные экземпляра Amazon EC2](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html) при условии, что [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) не установлен в true.
  - Эти же настройки также могут быть установлены для конкретной конечной точки с использованием того же правила сопоставления префиксов.


## Оптимизация производительности {#s3-optimizing-performance}

Информацию об оптимизации чтения и вставки данных с использованием функции S3 см. в [специальном руководстве по производительности](./performance.md).

### Настройка хранилища S3 {#s3-storage-tuning}

Внутри движок MergeTree в ClickHouse использует два основных формата хранения: [`Wide` и `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). Хотя текущая реализация использует стандартное поведение ClickHouse (управляемое параметрами `min_bytes_for_wide_part` и `min_rows_for_wide_part`), мы ожидаем, что в будущих релизах поведение для S3 будет отличаться — например, большее значение по умолчанию для `min_bytes_for_wide_part` будет способствовать использованию более компактного формата `Compact` и, соответственно, меньшему количеству файлов. При использовании исключительно хранилища S3 пользователи могут настроить эти параметры по своему усмотрению.


## MergeTree с хранением в S3 {#s3-backed-mergetree}

Функции `s3` и соответствующий движок таблиц позволяют запрашивать данные в S3, используя привычный синтаксис ClickHouse. Однако они имеют ограничения в части функций управления данными и производительности. Отсутствует поддержка первичных индексов и кэширования, а вставка файлов должна управляться пользователем вручную.

ClickHouse признаёт, что S3 является привлекательным решением для хранения данных, особенно когда производительность запросов к «холодным» данным менее критична, а пользователи стремятся разделить хранение и вычисления. Для достижения этой цели предоставляется поддержка использования S3 в качестве хранилища для движка MergeTree. Это позволяет пользователям воспользоваться преимуществами масштабируемости и экономической эффективности S3, а также высокой производительностью вставки и выполнения запросов движка MergeTree.

### Уровни хранения {#storage-tiers}

Тома хранения ClickHouse позволяют абстрагировать физические диски от движка таблиц MergeTree. Любой отдельный том может состоять из упорядоченного набора дисков. Хотя эта абстракция в первую очередь позволяет использовать несколько блочных устройств для хранения данных, она также поддерживает другие типы хранилищ, включая S3. Части данных ClickHouse могут перемещаться между томами в соответствии с политиками хранения и степенью заполнения, создавая таким образом концепцию уровней хранения.

Уровни хранения открывают возможность для горячих-холодных архитектур, где самые свежие данные, которые обычно запрашиваются чаще всего, требуют лишь небольшого объёма пространства на высокопроизводительном хранилище, например NVMe SSD. По мере старения данных увеличиваются SLA для времени выполнения запросов, а частота запросов снижается. Этот длинный хвост данных может храниться на более медленном, менее производительном хранилище, таком как HDD или объектное хранилище S3.

### Создание диска {#creating-a-disk}

Чтобы использовать корзину S3 в качестве диска, необходимо сначала объявить её в конфигурационном файле ClickHouse. Можно расширить config.xml или, что предпочтительнее, создать новый файл в каталоге conf.d. Пример объявления диска S3 показан ниже:

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

Полный список настроек, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Обратите внимание, что учётными данными можно управлять, используя те же подходы, описанные в разделе [Управление учётными данными](#managing-credentials), то есть параметр use_environment_credentials может быть установлен в true в приведённом выше блоке настроек для использования ролей IAM.

### Создание политики хранения {#creating-a-storage-policy}

После настройки этот «диск» может использоваться томом хранения, объявленным в политике. В приведённом ниже примере мы предполагаем, что s3 является нашим единственным хранилищем. Это не учитывает более сложные горячие-холодные архитектуры, где данные могут перемещаться на основе TTL и степени заполнения.

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

Предполагая, что вы настроили диск для использования корзины с правами на запись, вы сможете создать таблицу, как в примере ниже. Для краткости мы используем подмножество столбцов NYC taxi и передаём данные напрямую в таблицу с хранением в S3:


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

В зависимости от оборудования вставка 1 млн строк может занять несколько минут. Вы можете отслеживать прогресс через таблицу system.processes. При желании можно увеличить количество строк до 10 млн и выполнить несколько тестовых запросов.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Изменение таблицы {#modifying-a-table}

Иногда пользователям может потребоваться изменить политику хранения конкретной таблицы. Хотя это возможно, существуют ограничения. Новая политика должна содержать все диски и тома предыдущей политики, то есть данные не будут автоматически перемещены при изменении политики. При проверке этих ограничений тома и диски идентифицируются по имени, а попытки их нарушения приведут к ошибке. Однако, если использовать предыдущие примеры, следующие изменения являются допустимыми.

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

Здесь мы повторно используем том main в новой политике s3_tiered и добавляем новый том hot. Он использует диск default, который состоит из одного диска, настроенного через параметр `<path>`. Обратите внимание, что имена томов и дисков не меняются. Новые вставки в таблицу будут размещаться на диске default до тех пор, пока не будет достигнуто значение move_factor \* disk_size — после чего данные будут перемещены в S3.

### Обработка репликации {#handling-replication}

Репликация с дисками S3 может быть реализована с использованием движка таблиц `ReplicatedMergeTree`. Подробности см. в руководстве по [репликации одного шарда между двумя регионами AWS с использованием S3 Object Storage](#s3-multi-region).

### Чтение и запись {#read--writes}

Следующие примечания описывают реализацию взаимодействия S3 с ClickHouse. Хотя они носят в основном информационный характер, они могут помочь читателям при [оптимизации производительности](#s3-optimizing-performance):


* По умолчанию максимальное количество потоков обработки запроса, которые могут использоваться на любом этапе конвейера обработки запросов, равно количеству ядер. Некоторые этапы лучше поддаются параллелизации, чем другие, поэтому это значение задаёт верхнюю границу. Поскольку данные считываются с диска в потоковом режиме, несколько этапов запроса могут выполняться одновременно. Таким образом, фактическое количество потоков, используемых для запроса, может превышать это значение. Параметр настраивается с помощью [max_threads](/operations/settings/settings#max_threads).
* Чтение из S3 по умолчанию выполняется асинхронно. Это поведение определяется настройкой `remote_filesystem_read_method`, которая по умолчанию имеет значение `threadpool`. При обработке запроса ClickHouse читает гранулы «полосами» (stripes). Каждая такая полоса потенциально содержит множество столбцов. Поток читает столбцы для своих гранул по одному. Вместо того чтобы делать это синхронно, выполняется предвыборка (prefetch) всех столбцов перед ожиданием данных. Это обеспечивает существенный прирост производительности по сравнению с синхронным ожиданием для каждого столбца. В большинстве случаев пользователям не потребуется изменять эту настройку — см. раздел [Optimizing for Performance](#s3-optimizing-performance).
* Запись выполняется параллельно, с максимум 100 одновременными потоками записи файлов. Параметр `max_insert_delayed_streams_for_parallel_write`, который по умолчанию имеет значение 1000, управляет количеством объектов S3, записываемых параллельно. Поскольку для каждого записываемого файла требуется буфер (~1 МБ), это фактически ограничивает потребление памяти операцией INSERT. В сценариях с небольшим объёмом памяти сервера может быть целесообразно уменьшить это значение.



## Использование объектного хранилища S3 в качестве диска ClickHouse {#configuring-s3-for-clickhouse-use}

Если вам нужны пошаговые инструкции по созданию бакетов и IAM-роли, разверните раздел **Создание бакетов S3 и IAM-роли** и следуйте им:

<BucketDetails />

### Настройка ClickHouse для использования бакета S3 в качестве диска {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

Следующий пример основан на установке Linux Deb-пакета в качестве службы с директориями ClickHouse по умолчанию.

1.  Создайте новый файл в директории `config.d` ClickHouse для хранения конфигурации хранилища.

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

2. Добавьте следующую конфигурацию хранилища, подставив путь к бакету, ключ доступа и секретный ключ из предыдущих шагов

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
Теги `s3_disk` и `s3_cache` внутри тега `<disks>` являются произвольными метками. Их можно изменить, но та же метка должна использоваться в теге `<disk>` внутри тега `<policies>` для ссылки на диск.
Тег `<S3_main>` также является произвольным и представляет собой имя политики, которая будет использоваться в качестве идентификатора целевого хранилища при создании ресурсов в ClickHouse.

Приведенная выше конфигурация предназначена для ClickHouse версии 22.8 или выше. Если вы используете более старую версию, обратитесь к документации [хранение данных](/operations/storing-data.md/#using-local-cache).

Для получения дополнительной информации об использовании S3:
Руководство по интеграции: [S3 Backed MergeTree](#s3-backed-mergetree)
:::

3. Измените владельца файла на пользователя и группу `clickhouse`

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

4. Перезапустите экземпляр ClickHouse, чтобы изменения вступили в силу.

```bash
service clickhouse-server restart
```

### Тестирование {#testing}

1. Войдите в систему с помощью клиента ClickHouse, используя команду следующего вида

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

```


2 строки в наборе. Время выполнения: 0.284 сек.

```
6.  В консоли AWS перейдите к разделу бакетов, выберите созданный бакет и папку.
Вы должны увидеть примерно следующее:

<Image img={S3J} size="lg" border alt="Представление бакета S3 в консоли AWS с файлами данных ClickHouse, хранящимися в S3" />
```


## Репликация одного шарда между двумя регионами AWS с использованием S3 Object Storage {#s3-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, поэтому вам не нужно следовать этой процедуре, если вы используете ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Данное руководство описывает развертывание двух узлов ClickHouse Server и трех узлов ClickHouse Keeper в AWS EC2. В качестве хранилища данных для серверов ClickHouse используется S3. Для обеспечения аварийного восстановления используются два региона AWS, в каждом из которых размещается сервер ClickHouse и корзина S3.

Таблицы ClickHouse реплицируются между двумя серверами и, соответственно, между двумя регионами.

### Установка программного обеспечения {#install-software}

#### Узлы сервера ClickHouse {#clickhouse-server-nodes}

При выполнении шагов развертывания на узлах сервера ClickHouse обратитесь к [инструкциям по установке](/getting-started/install/install.mdx).

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах. В примерах конфигураций они называются `chnode1` и `chnode2`.

Разместите `chnode1` в одном регионе AWS, а `chnode2` — во втором.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах. В примерах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`. Узел `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` — вместе с `chnode2`, а `keepernode3` — в любом из регионов, но в зоне доступности, отличной от зоны узла ClickHouse в этом регионе.

При выполнении шагов развертывания на узлах ClickHouse Keeper обратитесь к [инструкциям по установке](/getting-started/install/install.mdx).

### Создание корзин S3 {#create-s3-buckets}

Создайте две корзины S3 — по одной в каждом из регионов, где размещены `chnode1` и `chnode2`.

Если вам нужны пошаговые инструкции по созданию корзин и роли IAM, разверните раздел **Создание корзин S3 и роли IAM** и следуйте указаниям:

<BucketDetails />

Файлы конфигурации размещаются в `/etc/clickhouse-server/config.d/`. Ниже приведен пример файла конфигурации для одной корзины. Конфигурация для второй корзины аналогична, отличаются только три выделенные строки:

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
Во многих шагах данного руководства вам потребуется разместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это стандартное расположение файлов переопределения конфигурации в системах Linux. Когда вы помещаете файлы в этот каталог, ClickHouse использует их содержимое для переопределения конфигурации по умолчанию. Размещая файлы в каталоге переопределения, вы предотвратите потерю конфигурации при обновлении.
:::

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

При запуске ClickHouse Keeper в автономном режиме (отдельно от сервера ClickHouse) конфигурация представляет собой один XML-файл. В данном руководстве это файл `/etc/clickhouse-keeper/keeper_config.xml`. Все три сервера Keeper используют одинаковую конфигурацию с одним отличающимся параметром — `<server_id>`.


`server_id` указывает идентификатор, который будет присвоен хосту, использующему данный конфигурационный файл. В примере ниже `server_id` равен `3`, и если посмотреть ниже по файлу в секцию `<raft_configuration>`, можно увидеть, что сервер 3 имеет имя хоста `keepernode3`. Таким образом процесс ClickHouse Keeper определяет, к каким серверам подключаться при выборе лидера и выполнении других операций.

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

Скопируйте конфигурационный файл ClickHouse Keeper в нужное место (не забудьте установить `<server_id>`):

```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### Настройка сервера ClickHouse {#configure-clickhouse-server}

#### Определение кластера {#define-a-cluster}

Кластеры ClickHouse определяются в секции `<remote_servers>` конфигурации. В данном примере определен один кластер `cluster_1S_2R`, состоящий из одного шарда с двумя репликами. Реплики расположены на хостах `chnode1` и `chnode2`.

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

При работе с кластерами удобно определить макросы, которые автоматически подставляют в DDL-запросы параметры кластера, шарда и реплики. Данный пример позволяет указать использование реплицируемого движка таблиц без явного указания параметров `shard` и `replica`. При создании таблицы можно увидеть, как используются макросы `shard` и `replica`, выполнив запрос к `system.tables`.

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
Приведенные выше макросы предназначены для `chnode1`, на `chnode2` установите `replica` в значение `replica_2`.
:::

#### Отключение репликации с нулевым копированием {#disable-zero-copy-replication}


В версиях ClickHouse 22.7 и ниже параметр `allow_remote_fs_zero_copy_replication` по умолчанию имеет значение `true` для дисков S3 и HDFS. Для сценария аварийного восстановления этот параметр следует установить в `false`, а в версии 22.8 и выше он по умолчанию имеет значение `false`.

Этот параметр должен иметь значение false по двум причинам: 1) данная функция не готова к использованию в production-среде; 2) в сценарии аварийного восстановления и данные, и метаданные должны храниться в нескольких регионах. Установите для `allow_remote_fs_zero_copy_replication` значение `false`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper отвечает за координацию репликации данных между узлами ClickHouse. Чтобы указать ClickHouse узлы ClickHouse Keeper, добавьте конфигурационный файл на каждый узел ClickHouse.

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

При настройке параметров безопасности в AWS обратитесь к списку [сетевых портов](../../../guides/sre/network-ports.md), чтобы серверы могли взаимодействовать друг с другом, а вы — с ними.

Все три сервера должны прослушивать сетевые подключения для взаимодействия между собой и с S3. По умолчанию ClickHouse прослушивает только loopback-адрес, поэтому это необходимо изменить. Настройка выполняется в `/etc/clickhouse-server/config.d/`. Ниже приведен пример конфигурации ClickHouse и ClickHouse Keeper для прослушивания на всех интерфейсах IPv4. Дополнительную информацию см. в документации или в файле конфигурации по умолчанию `/etc/clickhouse/config.xml`.

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

#### Проверка состояния ClickHouse Keeper {#check-clickhouse-keeper-status}

Отправляйте команды в ClickHouse Keeper с помощью `netcat`. Например, команда `mntr` возвращает состояние кластера ClickHouse Keeper. Если выполнить команду на каждом из узлов Keeper, вы увидите, что один является лидером, а два других — ведомыми:


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

На каждом сервере ClickHouse выполните команду

```bash
sudo service clickhouse-server start
```

#### Проверка сервера ClickHouse {#verify-clickhouse-server}

При добавлении [конфигурации кластера](#define-a-cluster) был определён один шард, реплицируемый на два узла ClickHouse. На этом этапе проверки вы убедитесь, что кластер был создан при запуске ClickHouse, и создадите реплицируемую таблицу с использованием этого кластера.

- Убедитесь, что кластер существует:

  ```sql
  show clusters
  ```

  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- Создайте таблицу в кластере, используя движок таблиц `ReplicatedMergeTree`:
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
- Использование макросов, определённых ранее

  Макросы `shard` и `replica` были [определены ранее](#define-a-cluster), и в выделенной строке ниже вы можете увидеть, где значения подставляются на каждом узле ClickHouse. Кроме того, используется значение `uuid`; `uuid` не определяется в макросах, так как генерируется системой.

  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```

  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0
  ```


Row 1:
──────
create&#95;table&#95;query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8(&#39;UNK&#39; = 0, &#39;CSH&#39; = 1, &#39;CRE&#39; = 2, &#39;NOC&#39; = 3, &#39;DIS&#39; = 4))

# highlight-next-line

ENGINE = ReplicatedMergeTree(&#39;/clickhouse/tables/{uuid}/{shard}&#39;, &#39;{replica}&#39;)
PARTITION BY toYYYYMM(pickup&#95;date) ORDER BY pickup&#95;datetime SETTINGS storage&#95;policy = &#39;s3&#95;main&#39;

1 строка в наборе. Прошло: 0.012 сек.

````
:::note
Вы можете настроить путь zookeeper `'clickhouse/tables/{uuid}/{shard}`, показанный выше, задав параметры `default_replica_path` и `default_replica_name`. Документация доступна [здесь](/operations/server-configuration-parameters/settings.md/#default_replica_path).
:::

### Тестирование {#testing-1}

Эти тесты проверят, что данные реплицируются между двумя серверами и хранятся в корзинах S3, а не на локальном диске.

- Добавьте данные из набора данных о такси Нью-Йорка:
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
````

* Убедитесь, что данные хранятся в S3.

  Этот запрос показывает размер данных на диске и политику, которая определяет, какой диск используется.

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

  Проверьте размер данных на локальном диске. Из вывода выше видно, что размер на диске для миллионов сохранённых строк составляет 36.42 MiB. Эти данные должны находиться в S3, а не на локальном диске. Приведённый выше запрос также показывает, где на локальном диске хранятся данные и метаданные. Проверьте локальные данные:

  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  Проверьте данные в S3 в каждом бакете S3 (итоговые значения не показаны, но в обоих бакетах после вставок хранится примерно 36 MiB):

<Image img={Bucket1} size="lg" border alt="Размер данных в первом бакете S3, метрики использования хранилища" />

<Image img={Bucket2} size="lg" border alt="Размер данных во втором бакете S3, метрики использования хранилища" />


## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) — это новый высокопроизводительный класс хранения Amazon S3 в пределах одной зоны доступности.

Вы можете ознакомиться с этой [статьей](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/), чтобы узнать о нашем опыте тестирования S3Express с ClickHouse.

:::note
S3Express хранит данные в пределах одной зоны доступности. Это означает, что данные будут недоступны в случае сбоя зоны доступности.
:::

### Диск S3 {#s3-disk}

Создание таблицы с хранилищем на основе бакета S3Express включает следующие шаги:

1. Создайте бакет типа `Directory`
2. Настройте соответствующую политику бакета для предоставления всех необходимых разрешений вашему пользователю S3 (например, `"Action": "s3express:*"` для предоставления неограниченного доступа)
3. При настройке политики хранения укажите параметр `region`

Конфигурация хранилища такая же, как для обычного S3, и может выглядеть следующим образом:

```sql
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

Затем создайте таблицу на новом хранилище:

```sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```

### Хранилище S3 {#s3-storage}

Хранилище S3 также поддерживается, но только для путей `Object URL`. Пример:

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

Также требуется указать регион бакета в конфигурации:

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### Резервные копии {#backups}

Можно сохранить резервную копию на диске, который мы создали выше:

```sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
