---
description: 'Более 20 миллиардов записей данных от Sensor.Community — управляемой сообществом глобальной сети датчиков, создающей открытые данные об окружающей среде.'
sidebar_label: 'Данные с датчиков окружающей среды'
slug: /getting-started/example-datasets/environmental-sensors
title: 'Данные с датчиков окружающей среды'
doc_type: 'guide'
keywords: ['датчики окружающей среды', 'Sensor.Community', 'данные о качестве воздуха', 'данные об окружающей среде', 'знакомство']
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/) — это глобальная сеть датчиков, развиваемая участниками сообщества и создающая открытые данные об окружающей среде (Open Environmental Data). Данные собираются с датчиков по всему миру. Любой желающий может приобрести датчик и разместить его где угодно. API для загрузки данных доступны на [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs), а сами данные свободно распространяются по лицензии [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/).

:::important
Набор данных содержит более 20 миллиардов записей, поэтому будьте осторожны с простым копированием и вставкой приведённых ниже команд, если ваши ресурсы не рассчитаны на такой объём. Команды ниже выполнялись на production-инстансе [ClickHouse Cloud](https://clickhouse.cloud).
:::

1. Данные находятся в S3, поэтому мы можем использовать табличную функцию `s3`, чтобы создать таблицу из файлов. Мы также можем выполнять запросы к данным напрямую, не перемещая их. Давайте посмотрим на несколько строк, прежде чем пытаться вставить их в ClickHouse:

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

Данные хранятся в файлах CSV, но в качестве разделителя используется точка с запятой. Строки имеют следующий вид:


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

2. Мы будем использовать следующую таблицу типа `MergeTree` для хранения данных в ClickHouse:


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

3. В сервисах ClickHouse Cloud имеется кластер с именем `default`. Мы будем использовать табличную функцию `s3Cluster`, которая читает файлы S3 параллельно с узлов вашего кластера. (Если у вас нет кластера, просто используйте функцию `s3` и уберите имя кластера.)

Выполнение этого запроса займет некоторое время — в несжатом виде это около 1,67 ТБ данных:

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

Вот результат — он показывает количество строк и скорость обработки. Данные поступают со скоростью более 6 млн строк в секунду!

```response
0 строк в наборе. Прошло: 3419.330 сек. Обработано 20,69 млрд строк, 1,67 ТБ (6,05 млн строк/с., 488,52 МБ/с.)
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

1,67 ТиБ данных сжаты до 310 ГиБ, всего 20,69 миллиарда строк:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. Давайте проанализируем данные теперь, когда они уже в ClickHouse. Обратите внимание, что объем данных со временем увеличивается по мере развертывания все большего количества датчиков:

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

Мы можем построить диаграмму в SQL Console, чтобы наглядно представить результаты:

<Image img={no_events_per_day} size="md" alt="Количество событий по дням" />

6. Этот запрос подсчитывает количество слишком жарких и влажных дней:

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

Вот наглядное представление результата:


<Image img={sensors_02} size="md" alt="Жаркие и влажные дни"/>