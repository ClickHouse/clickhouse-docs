---
description: 'Более 20 миллиардов записей данных от проекта Sensor.Community — глобальной сети датчиков, поддерживаемой сообществом участников и создающей открытые данные об окружающей среде.'
sidebar_label: 'Данные датчиков окружающей среды'
slug: /getting-started/example-datasets/environmental-sensors
title: 'Данные датчиков окружающей среды'
doc_type: 'guide'
keywords: ['датчики окружающей среды', 'Sensor.Community', 'данные о качестве воздуха', 'данные об окружающей среде', 'начало работы']
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/) — это созданная сообществом глобальная сеть датчиков, формирующая открытые данные об окружающей среде (Open Environmental Data). Данные собираются с датчиков по всему миру. Любой желающий может приобрести датчик и разместить его в любом удобном месте. API для загрузки данных опубликованы на [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs), а сами данные свободно доступны по лицензии [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/).

:::important
В датасете более 20 миллиардов записей, поэтому не стоит просто копировать и запускать команды ниже, если ваши ресурсы не готовы к такому объему. Команды ниже выполнялись на **продакшн-инстансе** [ClickHouse Cloud](https://clickhouse.cloud).
:::

1. Данные находятся в S3, поэтому мы можем использовать табличную функцию `s3`, чтобы создать таблицу из файлов. Мы также можем выполнять запросы к данным непосредственно по месту их хранения. Давайте посмотрим на несколько строк, прежде чем загружать их в ClickHouse:

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

Данные хранятся в CSV-файлах, но в качестве разделителя используется точка с запятой. Строки имеют следующий вид:


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

2. Мы будем использовать следующую таблицу `MergeTree` для хранения данных в ClickHouse:


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

3. Сервисы ClickHouse Cloud содержат кластер с именем `default`. Мы будем использовать табличную функцию `s3Cluster`, которая параллельно читает файлы из S3 с узлов вашего кластера. (Если у вас нет кластера, просто используйте функцию `s3` и уберите имя кластера.)

Этот запрос займет некоторое время — это примерно 1,67 ТБ несжатых данных:

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

Вот результат — он показывает число строк и скорость обработки. Данные поступают со скоростью более 6 млн строк в секунду!

```response
0 строк в наборе. Прошло: 3419,330 сек. Обработано 20,69 млрд строк, 1,67 ТБ (6,05 млн строк/сек., 488,52 МБ/сек.)
```

4. Давайте посмотрим, сколько места на диске требуется для таблицы `sensors`:

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

1,67 ТиБ сжаты до 310 ГиБ, и в таблице 20,69 млрд строк:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. Давайте проанализируем данные теперь, когда они уже в ClickHouse. Обратите внимание, что объём данных со временем увеличивается по мере развёртывания всё большего числа датчиков:

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

Мы можем создать график в SQL Console, чтобы наглядно увидеть результаты:

<Image img={no_events_per_day} size="md" alt="Number of events per day" />

6. Этот запрос подсчитывает число слишком жарких и влажных дней:

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

Вот как выглядит результат:


<Image img={sensors_02} size="md" alt="Жаркие и душные дни"/>