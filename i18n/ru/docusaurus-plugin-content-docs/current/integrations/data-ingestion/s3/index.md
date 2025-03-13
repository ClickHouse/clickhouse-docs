---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: Интеграция S3 с ClickHouse

---
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';

# Интеграция S3 с ClickHouse

Вы можете вставлять данные из S3 в ClickHouse, а также использовать S3 в качестве пункта экспорта, что позволяет взаимодействовать с архитектурами "Data Lake". Кроме того, S3 может предоставлять уровни "холодного" хранения и помогать в разделении хранения и вычислений. В следующих разделах мы используем набор данных такси Нью-Йорка, чтобы продемонстрировать процесс перемещения данных между S3 и ClickHouse, а также выявить ключевые параметры конфигурации и предоставить подсказки по оптимизации производительности.
## Функции таблицы S3 {#s3-table-functions}

Функция таблицы `s3` позволяет вам читать и записывать файлы из и в совместимое хранилище S3. Синтаксис этой функции выглядит так:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

где:

* path — URL ведра с путем к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки. Для получения дополнительной информации смотрите документацию о [использовании подстановочных знаков в пути](/engines/table-engines/integrations/s3/#wildcards-in-path).
* format — [формат](/interfaces/formats#formats-overview) файла.
* structure — структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
* compression — параметр необязателен. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию будет автоматически определен формат сжатия по расширению файла.

Использование подстановочных знаков в выражении пути позволяет ссылаться на несколько файлов и открывает возможности для параллелизма.
### Подготовка {#preparation}

Перед созданием таблицы в ClickHouse вы можете сначала внимательно изучить данные в ведре S3. Вы можете сделать это напрямую из ClickHouse, используя оператор `DESCRIBE`:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Вывод оператора `DESCRIBE TABLE` должен показать, как ClickHouse будет автоматически интерпретировать эти данные, как это видно в ведре S3. Обратите внимание, что он также автоматически распознает и распаковывает формат сжатия gzip:

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

Чтобы взаимодействовать с нашим набором данных на основе S3, мы подготавливаем стандартную таблицу `MergeTree` в качестве нашего пункта назначения. Оператор ниже создает таблицу с названием `trips` в базе данных по умолчанию. Обратите внимание, что мы выбрали изменить некоторые из этих типов данных, как это было указано выше, в частности, чтобы не использовать модификатор типа данных [`Nullable()`](/sql-reference/data-types/nullable), который может привести к избыточным хранением данных и некоторым дополнительным накладным расходам по производительности:

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
SETTINGS index_granularity = 8192
```

Обратите внимание на использование [партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) по полю `pickup_date`. Обычно ключ партиционирования предназначен для управления данными, но позже мы будем использовать этот ключ, чтобы параллелизовать записи в S3.

Каждая запись в нашем наборе данных такси содержит поездку на такси. Эти анонимизированные данные состоят из 20 миллионов записей, сжатых в ведре S3 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ под папкой **nyc-taxi**. Данные находятся в формате TSV, с примерно 1 миллионом строк на файл.
### Чтение данных из S3 {#reading-data-from-s3}

Мы можем выполнять запросы к данным S3 как источнику, не требуя их сохранения в ClickHouse. В следующем запросе мы выбираем 10 строк. Обратите внимание на отсутствие учетных данных, так как ведро доступно публично:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

Обратите внимание, что нам не нужно указывать колонки, так как формат `TabSeparatedWithNames` кодирует имена колонок в первой строке. Другие форматы, такие как `CSV` или `TSV`, вернут авто-генерируемые колонки для этого запроса, например, `c1`, `c2`, `c3` и т.д.

Запросы также поддерживают [виртуальные колонки](../sql-reference/table-functions/s3#virtual-columns), такие как `_path` и `_file`, которые предоставляют информацию о пути ведра и имени файла соответственно. Например:

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

Подтвердите количество строк в этом наборе данных. Обратите внимание на использование подстановочных знаков для расширения файлов, чтобы мы могли рассмотреть все двадцать файлов. Этот запрос займет около 10 секунд, в зависимости от числа ядер на экземпляре ClickHouse:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

Хотя это полезно для выборки данных и выполнения запросов на лету, чтение данных напрямую из S3 не является тем, что вы хотите делать регулярно. Когда пришло время действовать серьезно, импортируйте данные в таблицу `MergeTree` в ClickHouse.
### Использование clickhouse-local {#using-clickhouse-local}

Программа `clickhouse-local` позволяет вам выполнять быструю обработку локальных файлов без развертывания и настройки сервера ClickHouse. Любые запросы, использующие функцию таблицы `s3`, могут быть выполнены с помощью этого инструмента. Например:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### Вставка данных из S3 {#inserting-data-from-s3}

Чтобы использовать все возможности ClickHouse, мы далее читаем и вставляем данные в наш экземпляр. Мы комбинируем нашу функцию `s3` с простым оператором `INSERT`, чтобы добиться этого. Обратите внимание, что нам не нужно указывать колонки, так как наша целевая таблица предоставляет необходимую структуру. Это требует, чтобы колонки появились в порядке, указанном в операторе DDL таблицы: колонки сопоставляются в соответствии с их положением в операторе `SELECT`. Вставка всех 10 миллионов строк может занять несколько минут в зависимости от экземпляра ClickHouse. Ниже мы вставляем 1 миллион строк, чтобы гарантировать быструю реакцию. Настройте оператор `LIMIT` или выбор колонок для импорта подсетов по мере необходимости:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### Удаленная вставка с использованием ClickHouse Local {#remote-insert-using-clickhouse-local}

Если сетевые политики безопасности препятствуют вашему кластеру ClickHouse осуществлять исходящие соединения, вы можете потенциально вставить данные из S3, используя `clickhouse-local`. В следующем примере мы читаем из ведра S3 и вставляем в ClickHouse с использованием функции `remote`:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
Чтобы выполнить это через защищенное SSL-соединение, используйте функцию `remoteSecure`.
:::
### Экспорт данных {#exporting-data}

Вы можете записывать файлы в S3, используя функцию таблицы `s3`. Это потребует соответствующих разрешений. Мы передаем учетные данные, необходимые для запроса, но смотрите страницу [Управление учетными данными](#managing-credentials) для получения дополнительных опций.

В простом примере ниже мы используем функцию таблицы в качестве пункта назначения, а не источника. Здесь мы передаем 10,000 строк из таблицы `trips` в ведро, указывая сжатие `lz4` и тип вывода `CSV`:

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

Обратите внимание, как формат файла определяется по расширению. Мы также не обязаны указывать колонки в функции `s3` — это может быть определено из запроса `SELECT`.
### Разделение больших файлов {#splitting-large-files}

Маловероятно, что вы захотите экспортировать свои данные в один файл. Большинство инструментов, включая ClickHouse, достигнут более высокой производительности при чтении и записи в несколько файлов благодаря возможности параллелизма. Мы могли бы выполнять наш оператор `INSERT` несколько раз, нацеливаясь на подсет данных. ClickHouse предлагает средство автоматического разбиения файлов с использованием ключа `PARTITION`.

В следующем примере мы создаем десять файлов, используя модуль функции `rand()`. Обратите внимание, как результирующий ID партиции ссылается на имя файла. Это приведет к созданию десяти файлов с числовым суффиксом, например `trips_0.csv.lz4`, `trips_1.csv.lz4` и т.д.:

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

Все вышеуказанные функции ограничены выполнением на одном узле. Скорость чтения будет линейно увеличиваться с количеством ядер ЦПУ, пока не будут исчерпаны другие ресурсы (обычно сеть), что позволит пользователям вертикально масштабироваться. Тем не менее, этот подход имеет свои ограничения. Хотя пользователи могут уменьшить нагрузку на некоторые ресурсы, вставляя в распределенную таблицу при выполнении запроса `INSERT INTO SELECT`, это все равно оставляет один узел, читающий, разбирающий и обрабатывающий данные. Чтобы решить эту задачу и позволить нам масштабировать чтение горизонтально, у нас есть функция [s3Cluster](/sql-reference/table-functions/s3Cluster.md).

Узел, который получает запрос, известен как инициатор, создает соединение с каждым узлом в кластере. Шаблон glob, определяющий, какие файлы необходимо прочитать, разрешается в набор файлов. Инициатор распределяет файлы среди узлов кластера, которые выступают в качестве рабочих. Эти рабочие узлы, в свою очередь, запрашивают файлы для обработки по мере завершения чтений. Этот процесс обеспечивает возможность горизонтального масштабирования чтений.

Функция `s3Cluster` принимает тот же формат, что и для одноузловых вариантов, за исключением того, что требуется указать целевой кластер, чтобы обозначить рабочие узлы:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — Название кластера, который используется для построения набора адресов и параметров подключения к удаленным и локальным серверам.
* `source` — URL к файлу или куче файлов. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{'abc','def'}` и `{N..M}`, где N, M — числа, abc, def — строки. Для получения дополнительной информации смотрите [Подстановочные знаки в пути](/engines/table-engines/integrations/s3.md/#wildcards-in-path).
* `access_key_id` и `secret_access_key` — Ключи, указывающие учетные данные для использования с данной конечной точкой. Необязательный.
* `format` — [Формат](/interfaces/formats#formats-overview) файла.
* `structure` — Структура таблицы. Формат 'column1_name column1_type, column2_name column2_type, ...'.

Как и любые функции `s3`, учетные данные являются необязательными, если ведро небезопасно или вы определяете безопасность через окружение, например, роли IAM. Однако в отличие от функции s3 структура должна быть указана в запросе с версии 22.3.1, т.е. схема не определяется автоматически.

Эта функция будет использоваться в большинстве случаев как часть `INSERT INTO SELECT`. В этом случае вы часто будете вставлять распределенную таблицу. Мы иллюстрируем простой пример ниже, где trips_all является распределенной таблицей. Хотя эта таблица использует кластер событий, консистентность узлов, используемых для чтения и записи, не является обязательным требованием:

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

Вставки будут происходить против инициирующего узла. Это означает, что в то время как чтения будут происходить на каждом узле, результирующие строки будут перенаправлены на инициатор для распределения. В сценариях с высокой нагрузкой это может оказаться узким местом. Чтобы ответить на это, установите параметр [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select) для функции `s3cluster`.
## Движки таблиц S3 {#s3-table-engines}

В то время как функции `s3` позволяют выполнять разовые запросы на данные, хранящиеся в S3, они синтаксически громоздки. Движок таблицы `S3` позволяет вам не указывать URL ведра и учетные данные снова и снова. Для этого ClickHouse предоставляет движок таблицы S3.

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — URL ведра с путем к файлу. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где N, M — числа, 'abc', 'def' — строки. Для получения дополнительной информации смотрите [здесь](/engines/table-engines/integrations/s3#wildcards-in-path).
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `aws_access_key_id`, `aws_secret_access_key` - Долгосрочные учетные данные для пользователя учетной записи AWS. Вы можете использовать их для аутентификации ваших запросов. Параметр необязателен. Если учетные данные не указаны, используются значения из конфигурационного файла. Для получения дополнительной информации смотрите [Управление учетными данными](#managing-credentials).
* `compression` — Тип сжатия. Поддерживаемые значения: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. Параметр необязателен. По умолчанию он будет автоматически определен по расширению файла.
### Чтение данных {#reading-data}

В следующем примере мы создаем таблицу с именем `trips_raw`, используя первые десять TSV файлов, расположенных в ведре `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`. Каждый из этих файлов содержит 1 миллион строк:

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

Обратите внимание на использование шаблона `{0..9}`, чтобы ограничить первые десять файлов. После создания мы можем делать запросы к этой таблице, как к любой другой таблице:

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

Движок таблицы `S3` поддерживает параллельные чтения. Запись поддерживается только в том случае, если определение таблицы не содержит глобальных шаблонов. Таким образом, приведенная выше таблица будет блокировать записи.

Чтобы продемонстрировать записи, создайте таблицу, указывающую на записываемое ведро S3:

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

Обратите внимание, что строки могут быть вставлены только в новые файлы. Не существует циклов объединения или операций разделения файлов. После того, как файл записан, последующие вставки потерпят неудачу. У пользователей есть два варианта:

* Установить параметр `s3_create_new_file_on_insert=1`. Это приведет к созданию новых файлов при каждой вставке. Числовой суффикс будет добавлен к концу каждого файла, который будет монотонно увеличиваться для каждой операции вставки. Для приведенного выше примера последующая вставка приведет к созданию файла trips_1.bin.
* Установить параметр `s3_truncate_on_insert=1`. Это приведет к обрезке файла, т.е. он будет содержать только вновь вставленные строки после завершения операции.

Оба этих параметра по умолчанию равны 0 — таким образом, заставляя пользователя установить один из них. Параметр `s3_truncate_on_insert` будет иметь приоритет, если оба они установлены.

Некоторые примечания относительно движка таблицы `S3`:

- В отличие от традиционной таблицы семейства `MergeTree`, удаление таблицы `S3` не приведет к удалению исходных данных.
- Полные настройки для этого типа таблицы можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).
- Обратите внимание на следующие ограничения при использовании этого движка:
    * Запросы ALTER не поддерживаются
    * Операции SAMPLE не поддерживаются
    * Нет понятия индексов, т.е. ни первичных, ни пропускающих.
## Управление учетными данными {#managing-credentials}

В предыдущих примерах мы передавали учетные данные в функции `s3` или определении таблицы `S3`. Хотя это может быть приемлемо для разовых случаев, пользователи требуют менее явных механизмов аутентификации в производственной среде. Чтобы решить эту проблему, ClickHouse предоставляет несколько опций:

* Укажите параметры подключения в **config.xml** или эквивалентном конфигурационном файле в **conf.d**. Содержимое примерного файла показано ниже, предполагая установку с использованием deb-пакета.

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

    Эти учетные данные будут использоваться для любых запросов, где указанная конечная точка является точным префиксным совпадением для запрашиваемого URL. Также обратите внимание на возможность в этом примере объявить заголовок авторизации как альтернативу ключам доступа и секретным ключам. Полный список поддерживаемых настроек можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).

* Пример выше подчеркивает доступность параметра конфигурации `use_environment_credentials`. Этот параметр конфигурации также может быть установлен глобально на уровне `s3`:

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    Эта настройка включает попытку извлечь учетные данные S3 из окружения, что позволяет доступ через роли IAM. В частности, выполняется следующий порядок извлечения:

   * Поиск переменных окружения `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`
   * Проверка в **$HOME/.aws**
   * Временные учетные данные, полученные через Службу безопасности AWS Token Service — т.е. через API [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
   * Проверки учетных данных в переменных окружения ECS `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` или `AWS_CONTAINER_CREDENTIALS_FULL_URI` и `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
   * Получение учетных данных через метаданные экземпляра Amazon EC2, если переменная [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) не установлена в true.
   * Эти же настройки также могут быть установлены для конкретной конечной точки, используя те же правила префиксного совпадения.
## Оптимизация производительности {#s3-optimizing-performance}

Для того чтобы оптимизировать чтение и вставку, используя функцию S3, смотрите [посвященное руководство по производительности](./performance.md).
### Настройка хранилища S3 {#s3-storage-tuning}

Внутри ClickHouse движок объединения использует два основных формата хранения: [`Широкий` и `Компактный`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). Хотя текущая реализация использует поведение по умолчанию ClickHouse (контролируемое через параметры `min_bytes_for_wide_part` и `min_rows_for_wide_part`), мы ожидаем, что поведение будет отличаться для S3 в будущих релизах, например, большее значение по умолчанию для `min_bytes_for_wide_part`, способствующее более `Компактному` формату и, следовательно, меньшему количеству файлов. Пользователи теперь могут захотеть настроить эти параметры при использовании исключительно хранилища S3.
## MergeTree на основе S3 {#s3-backed-mergetree}

Функции `s3` и связанный движок таблицы позволяют нам выполнять запросы к данным в S3, используя привычный синтаксис ClickHouse. Однако, что касается возможностей управления данными и производительности, они имеют ограничения. Нет поддержки первичных индексов, поддержки кеширования, и вставки файлов необходимо управлять пользователем.

ClickHouse признает, что S3 представляет собой привлекательное решение для хранения, особенно когда производительность запросов к "более холодным" данным менее критична, и пользователи стремятся отделить хранение от вычислений. Чтобы помочь добиться этого, обеспечена поддержка использования S3 в качестве хранилища для движка MergeTree. Это позволит пользователям использовать преимущества масштабируемости и экономии затрат S3, а также производительности вставки и запроса движка MergeTree.
### Уровни Хранения {#storage-tiers}

Объемы хранения ClickHouse позволяют абстрагировать физические диски от механизма таблиц MergeTree. Любой отдельный объем может состоять из упорядоченного набора дисков. Хотя это позволяет использовать несколько блочных устройств для хранения данных, эта абстракция также позволяет использовать и другие типы хранения, включая S3. Часть данных ClickHouse могут перемещаться между объемами и уровнями заполнения в соответствии с политиками хранения, создавая таким образом концепцию уровней хранения.

Уровни хранения разблокируют архитектуры "горячо-холодные", где самые свежие данные, которые обычно также являются самыми запрашиваемыми, требуют лишь небольшого объема на высокопроизводительном хранилище, например, NVMe SSD. По мере старения данных, SLA для времени запросов возрастают, как и частота запросов. Этот "толстый хвост" данных может храниться на более медленном, менее производительном хранилище, таком как HDD или объектное хранилище, такое как S3.

### Создание Диска {#creating-a-disk}

Чтобы использовать ведро S3 в качестве диска, сначала нужно объявить его в файле конфигурации ClickHouse. Либо расширьте config.xml, либо предпочтительно предоставьте новый файл в директории conf.d. Пример объявления диска S3 представлен ниже:

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

Полный список настроек, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Обратите внимание, что учетные данные можно управлять здесь, используя те же подходы, описанные в [Управление учетными данными](#managing-credentials), т.е. `use_environment_credentials` можно установить в значение true в вышеуказанном блоке настроек для использования ролей IAM.

### Создание Политики Хранения {#creating-a-storage-policy}

После настройки этот "диск" может быть использован объемом хранения, объявленным в политике. Для приведенного ниже примера мы предполагаем, что s3 является нашим единственным хранилищем. Это игнорирует более сложные горячо-холодные архитектуры, где данные могут перемещаться на основе TTL и уровней заполнения.

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

Предполагая, что вы настроили свой диск для использования ведра с правами на запись, вы должны быть в состоянии создать таблицу, как в приведенном ниже примере. Для краткости мы используем подмножество колонок такси NYC и передаем данные напрямую в таблицу, основанную на s3:

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
SETTINGS index_granularity = 8192, storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

В зависимости от оборудования, последняя вставка 1 миллиона строк может занять несколько минут для выполнения. Вы можете подтвердить прогресс через таблицу system.processes. Не стесняйтесь увеличивать количество строк до предела 10 миллионов и исследовать некоторые примеры запросов.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Модификация Таблицы {#modifying-a-table}

Иногда пользователям может потребоваться изменить политику хранения конкретной таблицы. Хотя это возможно, это имеет свои ограничения. Новая целевая политика должна содержать все диски и объемы предыдущей политики, т.е. данные не будут мигрированы для удовлетворения изменения политики. При проверке этих ограничений объемы и диски будут идентифицированы по их имени, и попытки нарушить это приведут к ошибке. Однако, предполагая, что вы используете предыдущие примеры, следующие изменения допустимы.

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

Здесь мы повторно используем основной объем в нашей новой политике s3_tiered и вводим новый горячий объем. Это использует диск по умолчанию, который состоит только из одного диска, настроенного через параметр `<path>`. Обратите внимание, что наши названия объемов и дисков не меняются. Новые вставки в нашу таблицу будут находиться на диске по умолчанию до тех пор, пока он не достигнет move_factor * disk_size - после чего данные будут перемещены в S3.

### Обработка Репликации {#handling-replication}

Репликация с дисками S3 может быть выполнена с использованием механизма таблицы `ReplicatedMergeTree`. См. [репликацию одного шард по двум регионам AWS с использованием S3 Object Storage](#s3-multi-region) для получения дополнительной информации.

### Чтения и Записи {#read--writes}

Следующие заметки касаются реализации взаимодействия S3 с ClickHouse. Хотя это в основном информативно, это может помочь читателям при [Оптимизации Производительности](#s3-optimizing-performance):

* По умолчанию максимальное количество потоков обработки запросов, используемых на любом этапе конвейера обработки запросов, равно количеству ядер. Некоторые этапы более восприимчивы к параллелизму, чем другие, поэтому это значение предоставляет верхнюю границу. Несколько этапов запроса могут выполняться одновременно, так как данные передаются с диска. Точное количество потоков, используемых для запроса, может превышать это количество. Измените это значение с помощью настройки [max_threads](/operations/settings/settings#max_threads).
* Чтения из S3 по умолчанию асинхронны. Это поведение определяется настройкой `remote_filesystem_read_method`, которая по умолчанию установлена в значение `threadpool`. При обслуживании запроса ClickHouse читает гранулы по полосам. Каждая из этих полос потенциально содержит много колонок. Поток будет читать колонки для своих гранул по одной. Вместо того чтобы делать это синхронно, выполняется предзагрузка для всех колонок, прежде чем ждать данные. Это обеспечивает значительное улучшение производительности по сравнению с синхронными ожиданиями для каждой колонки. В большинстве случаев пользователи не будут менять эту настройку - см. [Оптимизацию Производительности](#s3-optimizing-performance).
* Записи выполняются параллельно, с максимальным количеством 100 потоков записи файлов одновременно. `max_insert_delayed_streams_for_parallel_write`, который по умолчанию имеет значение 1000, управляет количеством S3 blob'ов, записываемых параллельно. Поскольку буфер необходим для каждого файла, который записывается (~1 МБ), это эффективно ограничивает потребление памяти для INSERT. В сценариях с низкой памятью сервера может быть целесообразно уменьшить это значение.

## Использование S3 Object Storage в качестве диска ClickHouse {#configuring-s3-for-clickhouse-use}

Если вам нужны пошаговые инструкции по созданию ведер и роли IAM, разверните **Создание ведер S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

### Настройка ClickHouse для использования ведра S3 в качестве диска {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

Следующий пример основан на установленном в качестве сервиса пакете Deb на Linux с директориями ClickHouse по умолчанию.

1. Создайте новый файл в директории `config.d` ClickHouse для хранения конфигурации хранения.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. Добавьте следующее для конфигурации хранения; заменяя путь ведра, ключ доступа и секретные ключи с предыдущих шагов.
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
Теги `s3_disk` и `s3_cache` внутри тега `<disks>` являются произвольными метками. Их можно задать другими именами, но та же метка должна быть использована в теге `<disk>` под тегом `<policies>`, чтобы ссылаться на диск.
Тег `<S3_main>` также произволен и является именем политики, которая будет использоваться в качестве идентификатора целевого хранилища при создании ресурсов в ClickHouse.

Показанная выше конфигурация предназначена для версии ClickHouse 22.8 или выше, если вы используете более старую версию, пожалуйста, обратитесь к документации по [хранению данных](/operations/storing-data.md/#using-local-cache).

Дополнительную информацию о использовании S3 смотрите в Руководстве по интеграциям: [S3 Backed MergeTree](#s3-backed-mergetree).
:::

3. Обновите владельца файла на пользователя и группу `clickhouse`.
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. Перезагрузите экземпляр ClickHouse, чтобы изменения вступили в силу.
```bash
service clickhouse-server restart
```

### Тестирование {#testing}

1. Войдите с помощью клиента ClickHouse, например, следующим образом:
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

3. Проверьте, что таблица была создана с правильной политикой.
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

6. В консоли AWS перейдите к ведрам и выберите новое ведро и папку.
Вы должны увидеть что-то похожее на следующее:

<img src={S3J} alt="Обзор ведра S3 в консоли AWS" />
## Репликация одного шард по двум регионам AWS с использованием S3 Object Storage {#s3-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::
### Планирование развертывания {#plan-the-deployment}

Этот учебник основан на развертывании двух узлов сервера ClickHouse и трех узлов ClickHouse Keeper в AWS EC2. Хранилище данных для серверов ClickHouse - это S3. Используются два региона AWS с сервером ClickHouse и ведром S3 в каждом регионе для поддержки восстановления после катастроф.

Таблицы ClickHouse реплицируются между двумя серверами, а значит, между двумя регионами.
### Установка программного обеспечения {#install-software}
#### Узлы сервера ClickHouse {#clickhouse-server-nodes}

Смотрите [инструкции по установке](/getting-started/install.md/#available-installation-options), когда выполняете шаги развертывания на узлах сервера ClickHouse.
#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в образцах конфигурации они называются `chnode1`, `chnode2`.

Поместите `chnode1` в один регион AWS, и `chnode2` во второй.
#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в образцах конфигурации они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, а `keepernode3` в любом из регионов, но в другой зоне доступности от узла ClickHouse в этом регионе.

Смотрите [инструкции по установке](/getting-started/install.md/#install-standalone-clickhouse-keeper), когда выполняете шаги развертывания на узлах ClickHouse Keeper.
### Создание Ведер S3 {#create-s3-buckets}

Создайте два ведра S3, по одному в каждом из регионов, где вы разместили `chnode1` и `chnode2`.

Если вам нужны пошаговые инструкции по созданию ведер и роли IAM, разверните **Создание ведер S3 и роли IAM** и следуйте инструкциям:

<BucketDetails />

Конфигурационные файлы затем будут размещены в `/etc/clickhouse-server/config.d/`. Вот пример конфигурационного файла для одного ведра, другое будет аналогичным, с тремя различиями, выделенными:

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
Многие шаги в этом руководстве будут просить вас поместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это местоположение по умолчанию для файлов переопределения конфигурации на системах Linux. Когда вы помещаете эти файлы в эту директорию, ClickHouse будет использовать их содержание, чтобы переопределить конфигурацию по умолчанию. Помещая эти файлы в директорию переопределения, вы избежите потери конфигурации во время обновления.
:::
### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Когда ClickHouse Keeper работает отдельно (отдельно от сервера ClickHouse), конфигурация представляет собой один XML файл. В этом учебнике файл - `/etc/clickhouse-keeper/keeper_config.xml`. Все три сервера Keeper используют одну и ту же конфигурацию, только одно значение отличает; `<server_id>`.

`server_id` указывает ID, который будет присвоен хосту, на котором используется файл конфигурации. В приведенном ниже примере `server_id` равен `3`, и если вы посмотрите далее в файле в секции `<raft_configuration>`, вы увидите, что сервер 3 имеет имя хоста `keepernode3`. Таким образом, ClickHouse Keeper знает, к каким другим серверам подключаться при выборе лидера и во всех других действиях.

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

Скопируйте файл конфигурации ClickHouse Keeper на место (не забудьте установить `<server_id>`):
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### Настройка Сервера ClickHouse {#configure-clickhouse-server}
#### Определение кластера {#define-a-cluster}

Кластеры ClickHouse определяются в секции `<remote_servers>` конфигурации. В этом примере определен один кластер `cluster_1S_2R`, состоящий из одного шарда с двумя репликами. Реплики находятся на хостах `chnode1` и `chnode2`.

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

При работе с кластерами удобно определить макросы, которые заполняют DDL-запросы данными о кластере, шарде и репликах. Этот образец позволяет указать использование механизма таблицы репликации, не предоставляя деталей о `shard` и `replica`. Когда вы создаете таблицу, вы можете увидеть, как используются макросы `shard` и `replica`, запрашивая `system.tables`.

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
Вышеуказанные макросы предназначены для `chnode1`, для `chnode2` установите `replica` в значение `replica_2`.
:::

#### Отключение репликации без копирования {#disable-zero-copy-replication}

В версиях ClickHouse 22.7 и ниже настройка `allow_remote_fs_zero_copy_replication` по умолчанию установлена в значение `true` для дисков S3 и HDFS. Эта настройка должна быть установлена в значение `false` для данного сценария восстановления после катастрофы, а в версиях 22.8 и выше по умолчанию установлена в значение `false`.

Эта настройка должна быть ложной по двум причинам: 1) эта функция не готова к производству; 2) в сценарии восстановления после катастрофы как данные, так и метаданные должны храниться в нескольких регионах. Установите `allow_remote_fs_zero_copy_replication` в значение `false`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper отвечает за координацию репликации данных между узлами ClickHouse. Чтобы сообщить ClickHouse о узлах ClickHouse Keeper, добавьте файл конфигурации на каждый из узлов ClickHouse.

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

Смотрите список [сетевых портов](../../../guides/sre/network-ports.md), когда настраиваете параметры безопасности в AWS, чтобы ваши серверы могли связываться друг с другом, и вы могли общаться с ними.

Все три сервера должны принимать сетевые соединения, чтобы они могли общаться между серверами и с S3. По умолчанию ClickHouse слушает только на адресе обратной связи, поэтому это нужно изменить. Это настраивается в `/etc/clickhouse-server/config.d/`. Вот пример, который настраивает ClickHouse и ClickHouse Keeper на прослушивание всех интерфейсов IP v4. Смотрите документацию или файл конфигурации по умолчанию `/etc/clickhouse/config.xml` для получения дополнительной информации.

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

Отправьте команды ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните команду на каждом из узлов Keeper, вы увидите, что один является лидером, а остальные два - последователями:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version	v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency	0
zk_max_latency	11
zk_min_latency	0
zk_packets_received	1783
zk_packets_sent	1783

# highlight-start
zk_num_alive_connections	2
zk_outstanding_requests	0
zk_server_state	leader

# highlight-end
zk_znode_count	135
zk_watch_count	8
zk_ephemerals_count	3
zk_approximate_data_size	42533
zk_key_arena_size	28672
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	182
zk_max_file_descriptor_count	18446744073709551615

# highlight-start
zk_followers	2
zk_synced_followers	2

# highlight-end
```

#### Запуск сервера ClickHouse {#run-clickhouse-server}

На каждом сервере ClickHouse выполните команду

```bash
sudo service clickhouse-server start
```

#### Проверка сервера ClickHouse {#verify-clickhouse-server}

Когда вы добавили [конфигурацию кластера](#define-a-cluster), был определен один шарда, реплицируемая между двумя узлами ClickHouse. На этом этапе проверки вы будете проверять, что кластер был создан при запуске ClickHouse, и создадите реплицированную таблицу, используя этот кластер.

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

- Создайте таблицу в кластере, используя механизм таблицы `ReplicatedMergeTree`:
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
  SETTINGS index_granularity = 8192, storage_policy='s3_main'
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```

- Поймите использование макросов, определенных ранее

  Макросы `shard` и `replica` были [определены ранее](#define-a-cluster), и в выделенной строке ниже вы можете увидеть, где значения подставляются на каждом узле ClickHouse. Кроме того, используется значение `uuid`; `uuid` не определяется в макросах, так как оно генерируется системой.
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
  PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS index_granularity = 8192, storage_policy = 's3_main'

  1 row in set. Elapsed: 0.012 sec.
  ```

  :::note
  Вы можете настроить путь Zookeeper `'clickhouse/tables/{uuid}/{shard}`' указанным выше, установив `default_replica_path` и `default_replica_name`. Документация находится [здесь](/operations/server-configuration-parameters/settings.md/#default_replica_path).
  :::

### Тестирование {#testing-1}

Эти тесты проверят, что данные реплицируются между двумя серверами и что они хранятся в ведрах S3, а не на локальном диске.

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

  Этот запрос показывает размер данных на диске и политику, используемую для определения того, какой диск использовать.
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

  Проверьте размер данных на локальном диске. Из вышеуказанного, размер на диске для миллионов строк, хранящихся на ведре, составляет 36.42 MiB. Это должно быть на S3, а не на локальном диске. Запрос выше также говорит нам, где на локальном диске хранятся данные и метаданные. Проверьте локальные данные:
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K	/var/lib/clickhouse/disks/s3_disk/store/551
  ```

  Проверьте данные S3 в каждом ведре S3 (итоги не показаны, но в каждом ведре примерно 36 MiB хранятся после вставок):

<img src={Bucket1} alt="Размер данных в первом ведре S3" />

<img src={Bucket2} alt="Размер данных во втором ведре S3" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) - это новый класс хранения с высоким уровнем производительности в Amazon S3 в одной зоне доступности.

Вы можете обратиться к этому [блогу](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) для прочтения о нашем опыте тестирования S3Express с ClickHouse.

:::note
  S3Express хранит данные в пределах одной AZ. Это означает, что данные будут недоступны в случае выхода из строя AZ.
:::
```yaml
title: 'S3 диск'
sidebar_label: 'S3 диск'
keywords: ['S3', 'диск', 'объектное хранилище', 'ClickHouse']
description: 'Создание таблицы с хранилищем, поддерживаемым ведром S3Express.'
```

### S3 диск {#s3-disk}

Создание таблицы с хранилищем, поддерживаемым ведром S3Express, включает следующие шаги:

1. Создайте ведро типа `Directory`
2. Установите соответствующую политику ведра, чтобы предоставить все необходимые разрешения вашему пользователю S3 (например, `"Action": "s3express:*"` для простого предоставления неограниченного доступа)
3. При настройке политики хранения пожалуйста, укажите параметр `region`

Конфигурация хранения такая же, как для обычного S3 и, например, может выглядеть следующим образом:

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

Также требуется указать регион ведра в конфигурации:

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
