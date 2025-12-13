---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'Интеграция S3 с ClickHouse'
title: 'Интеграция S3 с ClickHouse'
description: 'Страница, посвящённая интеграции S3 с ClickHouse'
keywords: ['Amazon S3', 'объектное хранилище', 'облачное хранилище', 'озеро данных', 'интеграция с S3']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';

# Интеграция S3 с ClickHouse {#integrating-s3-with-clickhouse}

Вы можете загружать данные из S3 в ClickHouse, а также использовать S3 как пункт назначения для экспорта, что позволяет взаимодействовать с архитектурами «озера данных» (Data Lake). Кроме того, S3 может обеспечивать уровни «холодного» хранилища и помогать в разделении хранения и вычислительных ресурсов. В следующих разделах мы используем набор данных о такси Нью‑Йорка, чтобы продемонстрировать процесс переноса данных между S3 и ClickHouse, а также определить ключевые параметры конфигурации и дать рекомендации по оптимизации производительности.

## Табличные функции S3 {#s3-table-functions}

Табличная функция `s3` позволяет читать и записывать файлы в хранилище, совместимое с S3, и из него. Общий вид синтаксиса следующий:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

где:

* path — URL бакета с путем к файлу. Поддерживаются следующие подстановочные символы в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки. Для получения дополнительной информации см. документацию по [использованию подстановочных шаблонов в path](/engines/table-engines/integrations/s3/#wildcards-in-path).
* format — [Формат](/interfaces/formats#formats-overview) файла.
* structure — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
* compression — Параметр необязателен. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла.

Использование подстановочных шаблонов в выражении пути позволяет ссылаться на несколько файлов и открывает возможности для параллельной обработки.

### Подготовка {#preparation}

Перед созданием таблицы в ClickHouse вы можете сначала более подробно изучить данные в бакете S3. Это можно сделать непосредственно из ClickHouse, используя оператор `DESCRIBE`:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Результат выполнения оператора `DESCRIBE TABLE` должен показать, как ClickHouse автоматически определит эту структуру данных при просмотре их в бакете S3. Обратите внимание, что он также автоматически распознаёт и распаковывает данные в формате gzip:

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
Для работы с набором данных на основе S3 подготовим стандартную таблицу `MergeTree` в качестве целевой. Приведённая ниже инструкция создаёт таблицу с именем `trips` в базе данных по умолчанию. Обратите внимание, что мы изменили некоторые типы данных, определённые выше, в частности, отказались от использования модификатора типа данных [`Nullable()`](/sql-reference/data-types/nullable), который может привести к ненужному увеличению объёма хранимых данных и снижению производительности:

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

Обратите внимание на использование [секционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) по полю `pickup_date`. Обычно ключ секционирования используется для управления данными, но позже мы воспользуемся этим ключом для параллельной записи в S3.

Каждая запись в нашем наборе данных о такси соответствует одной поездке. Эти анонимизированные данные включают 20 млн записей, хранящихся в сжатом виде в бакете S3 [https://datasets-documentation.s3.eu-west-3.amazonaws.com/](https://datasets-documentation.s3.eu-west-3.amazonaws.com/) в папке **nyc-taxi**. Данные представлены в формате TSV, примерно по 1 млн строк в каждом файле.

### Чтение данных из S3 {#reading-data-from-s3}

Мы можем выполнять запросы к данным в S3 как к источнику, без необходимости предварительно сохранять их в ClickHouse. В следующем запросе мы выбираем 10 строк. Обратите внимание на отсутствие учётных данных, поскольку бакет общедоступен:

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

Обратите внимание, что нам не нужно перечислять столбцы, так как формат `TabSeparatedWithNames` содержит имена столбцов в первой строке. Другие форматы, такие как `CSV` или `TSV`, вернут автоматически сгенерированные столбцы для этого запроса, например `c1`, `c2`, `c3` и т. д.

Запросы также поддерживают [виртуальные столбцы](../sql-reference/table-functions/s3#virtual-columns), такие как `_path` и `_file`, которые соответственно предоставляют информацию о пути в бакете и имени файла. Например:

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

Проверьте количество строк в этом примерном наборе данных. Обратите внимание, что для указания файлов используются подстановочные символы, поэтому будут учитываться все двадцать файлов. Выполнение этого запроса займет около 10 секунд, в зависимости от числа ядер экземпляра ClickHouse:

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

Хотя чтение данных напрямую из S3 полезно для выборочного анализа данных и выполнения разовых исследовательских запросов, делать это на постоянной основе не рекомендуется. Когда приходит время перейти к полноценной работе, импортируйте данные в таблицу `MergeTree` в ClickHouse.

### Использование clickhouse-local {#using-clickhouse-local}

Программа `clickhouse-local` позволяет выполнять быструю обработку локальных файлов без развертывания и настройки сервера ClickHouse. Любые запросы с использованием табличной функции `s3` можно выполнять с помощью этой утилиты. Например:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### Вставка данных из S3 {#inserting-data-from-s3}

Чтобы использовать все возможности ClickHouse, далее мы читаем данные и вставляем их в наш экземпляр.
Мы используем функцию `s3` вместе с простым оператором `INSERT` для этого. Обратите внимание, что нам не требуется перечислять столбцы, поскольку целевая таблица задаёт необходимую структуру. Для этого необходимо, чтобы столбцы шли в порядке, указанном в DDL-операторе создания таблицы: столбцы сопоставляются в соответствии с их позицией в предложении `SELECT`. Вставка всех 10 млн строк может занять несколько минут в зависимости от экземпляра ClickHouse. Ниже мы вставляем 1 млн строк, чтобы получить результат быстрее. При необходимости отрегулируйте выражение `LIMIT` или выбор столбцов для импорта нужных подмножеств данных:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### Удалённая вставка с использованием ClickHouse Local {#remote-insert-using-clickhouse-local}

Если политики сетевой безопасности не позволяют вашему кластеру ClickHouse устанавливать исходящие соединения, вы можете выполнять вставку данных из S3 с помощью `clickhouse-local`. В примере ниже мы читаем из бакета S3 и вставляем данные в ClickHouse, используя функцию `remote`:

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

:::note
Чтобы выполнить это по защищённому SSL‑соединению, используйте функцию `remoteSecure`.
:::

### Экспорт данных {#exporting-data}

Вы можете записывать данные в файлы в S3‑хранилище, используя табличную функцию `s3`. Для этого потребуются соответствующие права доступа. Мы передаём необходимые учётные данные в запросе, но для других вариантов см. страницу [Managing Credentials](#managing-credentials).

В простом примере ниже мы используем табличную функцию в качестве пункта назначения, а не источника. Здесь мы передаём поток из 10 000 строк из таблицы `trips` в бакет, указывая сжатие `lz4` и формат вывода `CSV`:

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

Обратите внимание, что формат файла определяется по его расширению. Нам также не нужно указывать столбцы в функции `s3` — они могут быть получены из запроса `SELECT`.

### Разбиение больших файлов {#splitting-large-files}

Мало вероятно, что вы захотите экспортировать данные в один файл. Большинство инструментов, включая ClickHouse, обеспечивают более высокую пропускную способность при чтении и записи в несколько файлов за счёт параллельной обработки. Мы могли бы выполнить команду `INSERT` несколько раз, выбирая подмножество данных. ClickHouse предлагает механизм автоматического разбиения файлов на основе ключа `PARTITION`.

В примере ниже мы создаём десять файлов, используя значение функции `rand()` по модулю. Обратите внимание, что полученный идентификатор партиции используется в имени файла. В результате мы получаем десять файлов с числовым суффиксом, например `trips_0.csv.lz4`, `trips_1.csv.lz4` и т.д.:

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

В качестве альтернативы можно обратиться к полю в самих данных. Для этого набора данных поле `payment_type` представляет собой естественный ключ партиционирования с кардинальностью 5.

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

### Использование кластеров {#utilizing-clusters}

Вышеописанные функции ограничены выполнением на одном узле. Скорость чтения масштабируется линейно с количеством ядер CPU до тех пор, пока не будут исчерпаны другие ресурсы (как правило, сеть), что позволяет пользователям вертикально масштабировать систему. Однако у этого подхода есть ограничения. Хотя пользователи могут частично снизить нагрузку на ресурсы, выполняя вставку в распределённую таблицу при выполнении запроса `INSERT INTO SELECT`, при этом по‑прежнему один узел отвечает за чтение, разбор и обработку данных. Чтобы решить эту проблему и обеспечить горизонтальное масштабирование чтения, используется функция [s3Cluster](/sql-reference/table-functions/s3Cluster.md).

Узел, который получает запрос (инициатор), устанавливает соединение с каждым узлом в кластере. Шаблон с использованием glob‑маски, определяющий, какие файлы необходимо прочитать, разворачивается в набор файлов. Инициатор распределяет файлы между узлами кластера, которые выступают в роли рабочих. В свою очередь, эти рабочие запрашивают файлы для обработки по мере завершения чтения. Такой процесс обеспечивает возможность горизонтального масштабирования чтения.

Функция `s3Cluster` использует тот же формат, что и варианты для одного узла, за исключением того, что необходимо указать целевой кластер, обозначающий рабочие узлы:

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

* `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.
* `source` — URL файла или набора файлов. Поддерживает следующие шаблоны (wildcards) в режиме только для чтения: `*`, `?`, `{'abc','def'}` и `{N..M}`, где N, M — числа, abc, def — строки. Для получения дополнительной информации см. [Wildcards In Path](/engines/table-engines/integrations/s3.md/#wildcards-in-path).
* `access_key_id` и `secret_access_key` — Ключи, задающие учётные данные для использования с указанной конечной точкой. Необязательны.
* `format` — [Формат](/interfaces/formats#formats-overview) файла.
* `structure` — Структура таблицы. Формат &#39;column1&#95;name column1&#95;type, column2&#95;name column2&#95;type, ...&#39;.

Как и для любых функций `s3`, учётные данные необязательны, если бакет не защищён или вы задаёте безопасность через окружение, например, через роли IAM. Однако в отличие от функции s3, структура должна быть указана в запросе начиная с версии 22.3.1, то есть схема не выводится автоматически.

Эта функция в большинстве случаев будет использоваться как часть `INSERT INTO SELECT`. В таком случае вы часто будете записывать в распределённую таблицу. Ниже приведён простой пример, где trips&#95;all — это распределённая таблица. Хотя эта таблица использует кластер events, согласованность узлов, используемых для чтения и записи, не является обязательной:

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

Операции вставки будут выполняться на узле-инициаторе. Это означает, что хотя чтения будут выполняться на каждом узле, полученные строки будут перенаправляться на узел-инициатор для распределения. В сценариях с высокой нагрузкой это может стать узким местом. Чтобы избежать этого, установите параметр [parallel&#95;distributed&#95;insert&#95;select](/operations/settings/settings/#parallel_distributed_insert_select) для функции `s3cluster`.

## Движки таблиц S3 {#s3-table-engines}

Хотя функции `s3` позволяют выполнять одноразовые запросы к данным, хранящимся в S3, они синтаксически громоздки. Движок таблиц `S3` позволяет не указывать URL бакета и учетные данные каждый раз. Для решения этой задачи ClickHouse предоставляет движок таблиц S3.

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

* `path` — URL бакета с путём к файлу. Поддерживает следующие подстановочные шаблоны в режиме только для чтения: `*`, `?`, `{abc,def}` и `{N..M}`, где N, M — числа, «abc», «def» — строки. Для получения дополнительной информации см. [здесь](/engines/table-engines/integrations/s3#wildcards-in-path).
* `format` — [формат](/interfaces/formats#formats-overview) файла.
* `aws_access_key_id`, `aws_secret_access_key` — долгосрочные учетные данные пользователя учетной записи AWS. Вы можете использовать их для аутентификации запросов. Параметр является необязательным. Если учетные данные не указаны, используются значения из конфигурационного файла. Для получения дополнительной информации см. раздел [Managing credentials](#managing-credentials).
* `compression` — тип сжатия. Поддерживаемые значения: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. Параметр является необязательным. По умолчанию тип сжатия автоматически определяется по расширению файла.

### Чтение данных {#reading-data}

В следующем примере мы создаём таблицу `trips_raw`, используя первые десять TSV‑файлов, расположенных в бакете `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`. Каждый файл содержит по 1 млн строк:

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

Обратите внимание на использование шаблона `{0..9}`, чтобы ограничиться первыми десятью файлами. После создания мы можем выполнять запросы к этой таблице, как и к любой другой:

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

### Вставка данных {#inserting-data}

Движок таблицы `S3` поддерживает параллельное чтение. Запись поддерживается только в том случае, если определение таблицы не содержит glob-шаблонов. Поэтому приведённая выше таблица будет блокировать операции записи.

Чтобы продемонстрировать запись, создайте таблицу, указывающую на S3‑бакет с возможностью записи:

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

Обратите внимание, что строки можно вставлять только в новые файлы. Циклы слияния и операции разбиения файлов отсутствуют. Как только файл записан, последующие вставки будут завершаться ошибкой. У пользователей есть два варианта:

* Указать настройку `s3_create_new_file_on_insert=1`. Это приведёт к созданию новых файлов при каждой вставке. К концу каждого файла будет добавляться числовой суффикс, который будет монотонно возрастать для каждой операции вставки. Для приведённого выше примера последующая вставка приведёт к созданию файла trips&#95;1.bin.
* Указать настройку `s3_truncate_on_insert=1`. Это приведёт к усечению файла, то есть после завершения операции он будет содержать только вновь вставленные строки.

Обе эти настройки по умолчанию имеют значение 0 — тем самым требуя от пользователя задать одну из них. `s3_truncate_on_insert` будет иметь приоритет, если заданы обе.

Несколько замечаний о движке таблиц `S3`:

* В отличие от таблицы семейства `MergeTree`, удаление таблицы `S3` не приведёт к удалению лежащих в её основе данных.
* Полный список настроек для этого типа таблиц можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).
* Учитывайте следующие ограничения при использовании этого движка:
  * запросы ALTER не поддерживаются
  * операции SAMPLE не поддерживаются
  * отсутствует понятие индексов, т.е. первичных или пропускающих.

## Управление учетными данными {#managing-credentials}

В предыдущих примерах мы передавали учетные данные в функции `s3` или в определении таблицы `S3`. Хотя это может быть приемлемо для эпизодического использования, в продуктивной среде пользователям требуются менее явные механизмы аутентификации. Для этого в ClickHouse предусмотрено несколько вариантов:

* Указать параметры подключения в файле **config.xml** или равнозначном конфигурационном файле в каталоге **conf.d**. Содержимое примера такого файла показано ниже, предполагается установка с помощью debian-пакета.

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    Эти учетные данные будут использоваться для любых запросов, где указанный выше endpoint является точным префиксным совпадением запрашиваемого URL. Также обратите внимание на возможность в этом примере задать заголовок авторизации как альтернативу access- и secret-ключам. Полный список поддерживаемых настроек можно найти [здесь](/engines/table-engines/integrations/s3.md/#settings).

* Приведенный выше пример показывает наличие параметра конфигурации `use_environment_credentials`. Этот параметр конфигурации также может быть задан глобально на уровне `s3`:

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

    Эта настройка включает попытку получить учетные данные S3 из окружения, тем самым позволяя доступ через IAM-роли. В частности, выполняется следующий порядок получения:

  * Поиск значений переменных окружения `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` и `AWS_SESSION_TOKEN`.
  * Проверка в каталоге **$HOME/.aws**.
  * Получение временных учетных данных через AWS Security Token Service, то есть через API [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html).
  * Проверка учетных данных в переменных окружения ECS `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` или `AWS_CONTAINER_CREDENTIALS_FULL_URI` и `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`.
  * Получение учетных данных через [метаданные экземпляра Amazon EC2](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html) при условии, что переменная окружения [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) не установлена в значение true.
  * Эти же настройки также могут быть заданы для конкретного endpoint с использованием того же правила префиксного совпадения.

## Оптимизация производительности {#s3-optimizing-performance}

Информацию об оптимизации чтения и вставки данных с использованием функции S3 см. в [специальном руководстве по производительности](./performance.md).

### Настройка хранилища S3 {#s3-storage-tuning}

Внутри ClickHouse семейство MergeTree использует два основных формата хранения: [`Wide` и `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). Хотя текущая реализация использует поведение ClickHouse по умолчанию (задаваемое настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part`), мы ожидаем, что в будущих релизах поведение для S3 будет отличаться, например за счёт большего значения по умолчанию для `min_bytes_for_wide_part`, стимулирующего использование более компактного формата `Compact` и, как следствие, меньшего количества файлов. Пользователям уже сейчас может потребоваться тонкая настройка этих параметров при использовании исключительно хранилища S3.

## MergeTree на базе S3 {#s3-backed-mergetree}

Функции `s3` и связанный с ними движок таблицы позволяют выполнять запросы к данным в S3, используя привычный синтаксис ClickHouse. Однако с точки зрения возможностей управления данными и производительности они ограничены. Не поддерживаются первичные индексы, отсутствует кеширование, а вставки файлов (file inserts) необходимо организовывать пользователю самостоятельно.

ClickHouse рассматривает S3 как привлекательное решение для хранения данных, особенно когда производительность запросов к «более холодным» данным менее критична, а пользователи стремятся разделить хранение и вычисления. Чтобы упростить это, предусмотрена поддержка использования S3 как хранилища для движка MergeTree. Это позволяет пользователям сочетать масштабируемость и экономичность S3 с производительностью вставки и выполнения запросов движка MergeTree.

### Уровни хранения {#storage-tiers}

Тома хранения ClickHouse позволяют абстрагировать физические диски от движка таблицы MergeTree. Любой отдельный том может состоять из упорядоченного набора дисков. Хотя в первую очередь это даёт возможность использовать несколько блочных устройств для хранения данных, такая абстракция также позволяет применять и другие типы хранилищ, включая S3. Части данных ClickHouse могут перемещаться между томами и распределяться по ним в соответствии с политиками хранения, формируя тем самым концепцию уровней хранения.

Уровни хранения позволяют реализовывать архитектуры «горячее–холодное» хранилище, когда наиболее свежие данные, которые обычно и запрашиваются чаще всего, занимают лишь небольшой объём на высокопроизводительном хранилище, например NVMe SSD. По мере устаревания данных SLA по времени выполнения запросов увеличиваются, как и их суммарная частота. Этот «длинный хвост» данных может храниться на более медленном, менее производительном хранилище, таком как HDD, или объектном хранилище, таком как S3.

### Создание диска {#creating-a-disk}

Чтобы использовать бакет S3 как диск, сначала необходимо объявить его в конфигурационном файле ClickHouse. Можно либо расширить config.xml, либо, что предпочтительнее, добавить новый файл в каталог conf.d. Пример объявления диска S3 показан ниже:

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

Полный список настроек, относящихся к этому описанию диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). Обратите внимание, что учетными данными можно управлять здесь же, используя те же подходы, которые описаны в разделе [Managing credentials](#managing-credentials), то есть параметр `use_environment_credentials` можно установить в `true` в приведённом выше блоке настроек, чтобы использовать роли IAM.

### Создание политики хранения {#creating-a-storage-policy}

После настройки этот «диск» может использоваться томом хранения, объявленным в политике. В примере ниже предполагается, что S3 — наш единственный тип хранилища. Здесь не рассматриваются более сложные архитектуры «горячего» и «холодного» хранения, где данные могут перемещаться на основе TTL и степени заполнения.

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

### Создание таблицы {#creating-a-table}

Если диск настроен на использование бакета с правом записи, вы сможете создать таблицу, как показано в примере ниже. В целях краткости мы используем подмножество столбцов набора данных NYC taxi и передаём данные напрямую в таблицу, использующую S3 в качестве хранилища:

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```

В зависимости от аппаратного обеспечения выполнение этой второй операции вставки 1 млн строк может занять несколько минут. Вы можете отслеживать прогресс по таблице system.processes. При необходимости увеличьте количество строк до предела в 10 млн и выполните несколько пробных запросов.

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

### Изменение таблицы {#modifying-a-table}

Иногда пользователям может потребоваться изменить политику хранения для конкретной таблицы. Однако это возможно лишь с определёнными ограничениями. Новая политика должна содержать все диски и тома предыдущей политики, то есть данные не будут переноситься (мигрировать) для приведения к новой политике. При проверке этих ограничений тома и диски определяются по их именам, и любые попытки нарушить эти ограничения приведут к ошибке. Однако, если исходить из предыдущих примеров, следующие изменения являются допустимыми.

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

Здесь мы повторно используем основной том в нашей новой политике s3&#95;tiered и добавляем новый горячий том. Для этого используется диск по умолчанию, который состоит только из одного диска, настроенного через параметр `<path>`. Обратите внимание, что имена наших томов и дисков не меняются. Новые вставки в нашу таблицу будут находиться на диске по умолчанию до тех пор, пока его размер не достигнет значения move&#95;factor * disk&#95;size, после чего данные будут перенесены в S3.

### Работа с репликацией {#handling-replication}

Репликация с дисками S3 может быть реализована с использованием движка таблицы `ReplicatedMergeTree`. Подробности см. в руководстве [репликация одного шарда между двумя регионами AWS с использованием S3 Object Storage](#s3-multi-region).

### Чтение и запись {#read--writes}

Следующие примечания описывают реализацию взаимодействия с S3 в ClickHouse. Хотя они в основном носят справочный характер, они могут помочь читателям при [оптимизации производительности](#s3-optimizing-performance):

* По умолчанию максимальное число потоков обработки запроса, используемых на любой стадии конвейера обработки запросов, равно количеству ядер. Некоторые стадии лучше распараллеливаются, чем другие, поэтому это значение задаёт верхнюю границу. Поскольку данные потоково читаются с диска, несколько стадий запроса могут выполняться одновременно. Фактическое количество потоков, используемых при обработке запроса, может превышать это значение. Изменяется через настройку [max_threads](/operations/settings/settings#max_threads).
* Чтение из S3 по умолчанию выполняется асинхронно. Это поведение определяется настройкой `remote_filesystem_read_method`, которая по умолчанию имеет значение `threadpool`. При обработке запроса ClickHouse читает гранулы полосами (stripes). Каждая такая полоса потенциально содержит множество столбцов. Поток будет поочерёдно читать столбцы для своих гранул. Вместо того чтобы выполнять это синхронно, предварительно инициируется чтение (prefetch) всех столбцов до ожидания данных. Это даёт значительный прирост производительности по сравнению с синхронным ожиданием для каждого столбца. В большинстве случаев пользователям не потребуется изменять эту настройку — см. раздел [Optimizing for Performance](#s3-optimizing-performance).
* Запись выполняется параллельно, с максимум 100 одновременных потоков записи файлов. Параметр `max_insert_delayed_streams_for_parallel_write`, который по умолчанию имеет значение 1000, управляет количеством S3 blob-объектов, записываемых параллельно. Поскольку для каждого записываемого файла требуется буфер (~1 МБ), это фактически ограничивает объём памяти, потребляемой операцией INSERT. В сценариях с ограниченным объёмом памяти сервера может иметь смысл уменьшить это значение.

## Использование объектного хранилища S3 как диска ClickHouse {#configuring-s3-for-clickhouse-use}

Если вам нужны пошаговые инструкции по созданию бакетов и роли IAM, разверните раздел **Create S3 buckets and an IAM role** и следуйте инструкциям:

<BucketDetails />

### Настройка ClickHouse для использования бакета S3 в качестве диска {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

Следующий пример основан на Deb-пакете для Linux, установленном как служба с каталогами ClickHouse по умолчанию.

1. Создайте новый файл в каталоге `config.d` ClickHouse для хранения конфигурации хранилища.

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

2. Для настройки хранилища добавьте следующее, подставив путь к бакету, ключ доступа и секретный ключ, полученные на предыдущих шагах

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

:::note
Идентификаторы `s3_disk` и `s3_cache` внутри тега `<disks>` являются произвольными. Их можно задать по‑другому, но тот же идентификатор должен использоваться в теге `<disk>` в разделе `<policies>`, чтобы ссылаться на диск.
Тег `<S3_main>` также является произвольным и представляет собой имя политики, которая будет использоваться как идентификатор целевого хранилища при создании ресурсов в ClickHouse.

Показанная выше конфигурация предназначена для ClickHouse версии 22.8 и выше. Если вы используете более старую версию, обратитесь к разделу документации [storing data](/operations/storing-data.md/#using-local-cache).

Дополнительная информация об использовании S3:
Руководство по интеграциям: [S3 Backed MergeTree](#s3-backed-mergetree)
:::

3. Измените владельца файла на пользователя и группу `clickhouse`.

```bash
service clickhouse-server restart
```

4. Перезапустите экземпляр ClickHouse, чтобы изменения вступили в силу.

```bash
clickhouse-client --user default --password ClickHouse123!
```

### Тестирование {#testing}

1. Войдите в систему с помощью клиента ClickHouse, например:

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

2. Создайте таблицу, указав новую политику хранения в S3

```sql
SHOW CREATE TABLE s3_table1;
```

3. Проверьте, что таблица создана с корректной политикой

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

```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```

4. Добавьте тестовые строки в таблицу

```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```

```sql
SELECT * FROM s3_table1;
```

5. Просмотрите строки

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

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

2 строки в выборке. Время: 0.284 сек.

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

## Репликация одного шарда между двумя регионами AWS с использованием объектного хранилища S3 {#s3-multi-region}

:::tip
Объектное хранилище по умолчанию используется в ClickHouse Cloud, вам не нужно выполнять эту процедуру, если вы используете ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Это руководство основано на развертывании двух узлов ClickHouse Server и трех узлов ClickHouse Keeper в AWS EC2. Хранилищем данных для серверов ClickHouse является S3. Для обеспечения аварийного восстановления используются два региона AWS, в каждом регионе размещены ClickHouse Server и бакет S3.

Таблицы ClickHouse реплицируются между двумя серверами, а следовательно, и между двумя регионами.

### Установка программного обеспечения {#install-software}

#### Узлы ClickHouse Server {#clickhouse-server-nodes}

Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах ClickHouse Server.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в примерах конфигураций они называются `chnode1` и `chnode2`.

Разместите `chnode1` в одном регионе AWS, а `chnode2` — во втором.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в примерах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` может быть развернут в том же регионе, что и `chnode1`, `keepernode2` — вместе с `chnode2`, а `keepernode3` — в любом из регионов, но в другой зоне доступности по сравнению с узлом ClickHouse в этом регионе.

Обратитесь к [инструкциям по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах ClickHouse Keeper.

### Создание бакетов S3 {#create-s3-buckets}

Создайте два бакета S3, по одному в каждом из регионов, в которых вы разместили `chnode1` и `chnode2`.

Если вам нужны пошаговые инструкции по созданию бакетов и роли IAM, раскройте раздел **Create S3 buckets and an IAM role** и выполните указанные шаги:

<BucketDetails />

Файлы конфигурации затем будут размещены в `/etc/clickhouse-server/config.d/`. Ниже приведен пример файла конфигурации для одного бакета, второй будет аналогичным, но с тремя отличающимися (выделенными) строками:

```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

:::note
Во многих шагах этого руководства вам будет предложено поместить конфигурационный файл в `/etc/clickhouse-server/config.d/`. Это стандартный каталог в системах Linux для файлов переопределения конфигурации. Когда вы помещаете эти файлы в этот каталог, ClickHouse использует их содержимое для переопределения конфигурации по умолчанию. Размещая эти файлы в каталоге переопределения, вы избегаете потери своей конфигурации при обновлении.
:::

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

При запуске ClickHouse Keeper в автономном режиме (отдельно от сервера ClickHouse) конфигурация задаётся одним XML-файлом. В этом руководстве это файл `/etc/clickhouse-keeper/keeper_config.xml`. Все три сервера Keeper используют одну и ту же конфигурацию, отличаясь только одним параметром: `<server_id>`.

`server_id` указывает идентификатор, который будет присвоен хосту, на котором используется конфигурационный файл. В приведённом ниже примере значение `server_id` равно `3`, и если вы посмотрите далее в файле, в секции `<raft_configuration>`, вы увидите, что сервер с идентификатором 3 имеет имя хоста `keepernode3`. Таким образом, процесс ClickHouse Keeper определяет, к каким другим серверам нужно подключаться при выборе лидера и выполнении всех остальных операций.

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

Скопируйте файл конфигурации ClickHouse Keeper в нужный каталог (не забудьте задать `<server_id>`):

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

### Настройка сервера ClickHouse {#configure-clickhouse-server}

#### Определение кластера {#define-a-cluster}

Кластеры ClickHouse задаются в разделе конфигурации `<remote_servers>`. В этом примере определён один кластер `cluster_1S_2R`, который состоит из одного шарда с двумя репликами. Реплики расположены на хостах `chnode1` и `chnode2`.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

При работе с кластерами удобно задавать макросы, которые подставляют в DDL‑запросы настройки кластера, шарда и реплики. Этот пример позволяет использовать движок реплицируемой таблицы без необходимости явно указывать параметры `shard` и `replica`. После создания таблицы вы можете увидеть, как используются макросы `shard` и `replica`, сделав запрос к `system.tables`.

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

:::note
Выше приведены макросы для `chnode1`, на `chnode2` установите для `replica` значение `replica_2`.
:::

#### Отключение репликации без копирования {#disable-zero-copy-replication}

В версиях ClickHouse 22.7 и более ранних параметр `allow_remote_fs_zero_copy_replication` по умолчанию имеет значение `true` для дисков S3 и HDFS. Для данного сценария аварийного восстановления этот параметр должен иметь значение `false`, и в версиях 22.8 и выше он по умолчанию уже установлен в `false`.

Этот параметр должен быть равен `false` по двум причинам: 1) эта функция ещё не готова к использованию в продакшене; 2) в сценарии аварийного восстановления и данные, и метаданные должны храниться в нескольких регионах. Установите `allow_remote_fs_zero_copy_replication` в значение `false`.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

ClickHouse Keeper отвечает за координацию репликации данных между узлами ClickHouse. Чтобы указать ClickHouse, какие узлы являются ClickHouse Keeper, добавьте конфигурационный файл на каждом узле ClickHouse.

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

### Настройте сеть {#configure-networking}

См. список [сетевых портов](../../../guides/sre/network-ports.md) при настройке параметров безопасности в AWS, чтобы ваши серверы могли взаимодействовать друг с другом, а вы — подключаться к ним.

Все три сервера должны принимать входящие сетевые подключения, чтобы они могли взаимодействовать между собой и с S3. По умолчанию ClickHouse прослушивает только локальный (loopback) адрес, поэтому это необходимо изменить. Это настраивается в `/etc/clickhouse-server/config.d/`. Ниже приведён пример, который настраивает ClickHouse и ClickHouse Keeper на прослушивание всех интерфейсов IPv4. См. документацию или файл конфигурации по умолчанию `/etc/clickhouse/config.xml` для получения дополнительной информации.

```bash
echo mntr | nc localhost 9181
```

### Запустите серверы {#start-the-servers}

#### Запустите ClickHouse Keeper {#run-clickhouse-keeper}

На каждом сервере Keeper выполните команды для вашей операционной системы, например:

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

#### Проверка состояния ClickHouse Keeper {#check-clickhouse-keeper-status}

Отправьте команды ClickHouse Keeper с помощью утилиты `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните команду на каждом из узлов Keeper, вы увидите, что один — лидер, а два других — фолловеры:

```bash
sudo service clickhouse-server start
```

```sql
  show clusters
  ```

#### Запустите сервер ClickHouse {#run-clickhouse-server}

На каждом сервере ClickHouse выполните

```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

#### Проверка сервера ClickHouse {#verify-clickhouse-server}

Когда вы добавили [конфигурацию кластера](#define-a-cluster), был определён один шард, реплицированный на двух узлах ClickHouse. На этом этапе проверки вы убедитесь, что кластер был создан при запуске ClickHouse, и создадите реплицируемую таблицу, используя этот кластер.

* Убедитесь, что кластер существует:
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

* Создайте таблицу в кластере, используя движок таблицы `ReplicatedMergeTree`:
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

* Разберитесь с использованием ранее определённых макросов

  Макросы `shard` и `replica` были [определены ранее](#define-a-cluster), и на выделенной строке ниже вы можете увидеть, где значения подставляются на каждом узле ClickHouse. Дополнительно используется значение `uuid`; `uuid` не определён в макросах, так как он генерируется системой.

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
:::note
Вы можете настроить путь ZooKeeper `'clickhouse/tables/{uuid}/{shard}`, показанный выше, задав параметры `default_replica_path` и `default_replica_name`. Документация находится [здесь](/operations/server-configuration-parameters/settings.md/#default_replica_path).
:::

### Тестирование {#testing-1}

Эти тесты проверят, что данные реплицируются между двумя серверами и сохраняются в бакетах S3, а не на локальном диске.

- Добавьте данные из набора данных о такси Нью-Йорка:
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
  ````

* Убедитесь, что данные хранятся в S3.

  Этот запрос показывает размер данных на диске и политику хранения, которая определяет, какой диск используется.

  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  ```

And then create a table on the new storage:

```

  Проверьте размер данных на локальном диске. Из приведённых выше данных видно, что размер на диске для миллионов сохранённых строк составляет 36.42 MiB. Это должно храниться в S3, а не на локальном диске. Запрос выше также показывает, где на локальном диске хранятся данные и метаданные. Проверьте локальные данные:

  ```

### S3 storage {#s3-storage}

S3 storage is also supported but only for `Object URL` paths. Example:

```

  Проверьте данные S3 в каждом бакете S3 (сводные итоги не показаны, но в обоих бакетах после вставок хранится примерно 36 MiB):

<Image img={Bucket1} size="lg" border alt="Размер данных в первом бакете S3 с отображением метрик использования хранилища" />

<Image img={Bucket2} size="lg" border alt="Размер данных во втором бакете S3 с отображением метрик использования хранилища" />

## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) — это новый высокопроизводительный класс хранения данных в Amazon S3 в пределах одной зоны доступности (single Availability Zone).

Вы можете ознакомиться с нашим опытом тестирования S3Express с ClickHouse в этой [статье в блоге](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/).

:::note
S3Express хранит данные в пределах одной AZ. Это означает, что данные будут недоступны в случае отказа этой AZ.
:::

### Диск S3 {#s3-storage}

Создание таблицы с хранилищем на базе бакета S3Express включает следующие шаги:

1. Создайте бакет типа `Directory`
2. Установите соответствующую политику бакета, чтобы предоставить все необходимые права вашему S3‑пользователю (например, `"Action": "s3express:*"` для предоставления неограниченного доступа)
3. При настройке политики хранения укажите параметр `region`

Конфигурация хранилища такая же, как для обычного S3, и, например, может выглядеть следующим образом:

```

it also requires specifying bucket region in the config:

```

Затем создайте таблицу в новом хранилище:

```

### Backups {#backups}

It is possible to store a backup on the disk we created above:

```

### Хранилище S3 {#backups}

Хранилище S3 также поддерживается, но только для путей вида `Object URL`. Пример:

```

```

необходимо также указать регион бакета в конфигурации:

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### Резервные копии {#backups}

Можно сохранить резервную копию на диске, который мы создали ранее:

```sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status────────┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ ВОССТАНОВЛЕНА │
└──────────────────────────────────────┴───────────────┘
```
