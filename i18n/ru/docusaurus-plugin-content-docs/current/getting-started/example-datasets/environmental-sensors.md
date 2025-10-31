---
slug: '/getting-started/example-datasets/environmental-sensors'
sidebar_label: 'Данные экосенсоров'
description: 'Более 20 миллиардов записей данных от Sensor.Community, глобальной'
title: 'Данные экосенсоров'
doc_type: reference
---
import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/) — это глобальная сеть датчиков, управляемая участниками, которая создает открытые экологические данные. Данные собираются с помощью датчиков по всему миру. Любой желающий может приобрести датчик и установить его в любом месте. API для загрузки данных находятся на [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs), а данные доступны бесплатно в соответствии с [Лицензией на Содержимое Базы Данных (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/).

:::important
Набор данных содержит более 20 миллиардов записей, поэтому будьте осторожны с копированием и вставкой команд ниже, если ваши ресурсы не способны справиться с таким объемом. Команды ниже были выполнены на **Production** экземпляре [ClickHouse Cloud](https://clickhouse.cloud).
:::

1. Данные находятся в S3, поэтому мы можем использовать табличную функцию `s3`, чтобы создать таблицу из файлов. Мы также можем выполнять запросы к данным на месте. Давайте посмотрим на несколько строк перед тем, как пытаться вставить их в ClickHouse:

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

Данные находятся в CSV файлах, но в качестве разделителя используется точка с запятой. Строки выглядят следующим образом:

```response
┌─sensor_id─┬─sensor_type─┬─location─┬────lat─┬────lon─┬─timestamp───────────┬──pressure─┬─altitude─┬─pressure_sealevel─┬─temperature─┐
│      9119 │ BMP180      │     4594 │ 50.994 │  7.126 │ 2019-06-01T00:00:00 │    101471 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        19.9 │
│     21210 │ BMP180      │    10762 │ 42.206 │ 25.326 │ 2019-06-01T00:00:00 │     99525 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        19.3 │
│     19660 │ BMP180      │     9978 │ 52.434 │ 17.056 │ 2019-06-01T00:00:04 │    101570 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        15.3 │
│     12126 │ BMP180      │     6126 │ 57.908 │  16.49 │ 2019-06-01T00:00:05 │ 101802.56 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        8.07 │
│     15845 │ BMP180      │     8022 │ 52.498 │ 13.466 │ 2019-06-01T00:00:05 │    101878 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │          23 │
│     16415 │ BMP180      │     8316 │ 49.312 │  6.744 │ 2019-06-01T00:00:06 │    100176 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        14.7 │
│      7389 │ BMP180      │     3735 │ 50.136 │ 11.062 │ 2019-06-01T00:00:06 │     98905 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        12.1 │
│     13199 │ BMP180      │     6664 │ 52.514 │  13.44 │ 2019-06-01T00:00:07 │ 101855.54 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │       19.74 │
│     12753 │ BMP180      │     6440 │ 44.616 │  2.032 │ 2019-06-01T00:00:07 │     99475 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │          17 │
│     16956 │ BMP180      │     8594 │ 52.052 │  8.354 │ 2019-06-01T00:00:08 │    101322 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ              │        17.2 │
└───────────┴─────────────┴──────────┴────────┴────────┴─────────────────────┴───────────┴──────────┴───────────────────┴─────────────┘
```

2. Мы будем использовать следующую таблицу `MergeTree`, чтобы хранить данные в ClickHouse:

```sql
CREATE TABLE sensors
(
    sensor_id UInt16,
    sensor_type Enum('BME280', 'BMP180', 'BMP280', 'DHT22', 'DS18B20', 'HPM', 'HTU21D', 'PMS1003', 'PMS3003', 'PMS5003', 'PMS6003', 'PMS7003', 'PPD42NS', 'SDS011'),
    location UInt32,
    lat Float32,
    lon Float32,
    timestamp DateTime,
    P1 Float32,
    P2 Float32,
    P0 Float32,
    durP1 Float32,
    ratioP1 Float32,
    durP2 Float32,
    ratioP2 Float32,
    pressure Float32,
    altitude Float32,
    pressure_sealevel Float32,
    temperature Float32,
    humidity Float32,
    date Date MATERIALIZED toDate(timestamp)
)
ENGINE = MergeTree
ORDER BY (timestamp, sensor_id);
```

3. У ClickHouse Cloud есть кластер с именем `default`. Мы будем использовать табличную функцию `s3Cluster`, которая считывает файлы S3 параллельно с узлов вашей кластера. (Если у вас нет кластера, просто используйте функцию `s3` и уберите имя кластера.)

Этот запрос займет некоторое время — это примерно 1.67 ТБ данных в не сжатом виде:

```sql
INSERT INTO sensors
    SELECT *
    FROM s3Cluster(
        'default',
        'https://clickhouse-public-datasets.s3.amazonaws.com/sensors/monthly/*.csv.zst',
        'CSVWithNames',
        $$ sensor_id UInt16,
        sensor_type String,
        location UInt32,
        lat Float32,
        lon Float32,
        timestamp DateTime,
        P1 Float32,
        P2 Float32,
        P0 Float32,
        durP1 Float32,
        ratioP1 Float32,
        durP2 Float32,
        ratioP2 Float32,
        pressure Float32,
        altitude Float32,
        pressure_sealevel Float32,
        temperature Float32,
        humidity Float32 $$
    )
SETTINGS
    format_csv_delimiter = ';',
    input_format_allow_errors_ratio = '0.5',
    input_format_allow_errors_num = 10000,
    input_format_parallel_parsing = 0,
    date_time_input_format = 'best_effort',
    max_insert_threads = 32,
    parallel_distributed_insert_select = 1;
```

Вот ответ — показывающий количество строк и скорость обработки. Данных вводится более 6 миллионов строк в секунду!

```response
0 rows in set. Elapsed: 3419.330 sec. Processed 20.69 billion rows, 1.67 TB (6.05 million rows/s., 488.52 MB/s.)
```

4. Давайте посмотрим, сколько место на диске потребуется для таблицы `sensors`:

```sql
SELECT
    disk_name,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate,
    sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1) AND (table = 'sensors')
GROUP BY
    disk_name
ORDER BY size DESC;
```

1.67 ТБ сжимаются до 310 GiB, и там 20.69 миллиардов строк:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. Давайте проанализируем данные сейчас, когда они находятся в ClickHouse. Обратите внимание, что количество данных увеличивается со временем по мере развертывания новых датчиков:

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

Мы можем создать график в SQL Консоли, чтобы визуализировать результаты:

<Image img={no_events_per_day} size="md" alt="Количество событий в день"/>

6. Этот запрос считает количество слишком горячих и влажных дней:

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

Вот визуализация результата:

<Image img={sensors_02} size="md" alt="Горячие и влажные дни"/>