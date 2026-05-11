---
description: '기여자 주도로 운영되는 글로벌 센서 네트워크 Sensor.Community에서 생성한 오픈 환경 데이터로, 200억 개가 넘는 레코드로 구성됩니다.'
sidebar_label: '환경 센서 데이터'
slug: /getting-started/example-datasets/environmental-sensors
title: '환경 센서 데이터'
doc_type: 'guide'
keywords: ['환경 센서', 'Sensor.Community', '대기질 데이터', '환경 데이터', '시작하기']
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/)는 기여자가 주도하는 글로벌 센서 네트워크로, 공개 환경 데이터(Open Environmental Data)를 생성합니다. 데이터는 전 세계의 센서에서 수집됩니다. 누구나 센서를 구매해 원하는 곳에 설치할 수 있습니다. 데이터를 다운로드하기 위한 API는 [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs)에 있으며, 데이터는 [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/) 하에서 자유롭게 이용할 수 있습니다.

:::important
이 데이터셋에는 200억 개가 넘는 레코드가 있으므로, 사용 중인 리소스로 해당 수준의 데이터 양을 처리할 수 있는지 확인하지 않았다면 아래 명령을 그대로 복사·붙여넣기 하지 않도록 주의해야 합니다. 아래 명령은 [ClickHouse Cloud](https://clickhouse.cloud)의 **프로덕션** 인스턴스에서 실행되었습니다.
:::

1. 데이터는 S3에 있으므로, `s3` 테이블 함수(table function)를 사용해 파일로부터 테이블을 생성할 수 있습니다. 또한 데이터를 원위치에서 직접 쿼리할 수도 있습니다. ClickHouse에 데이터를 삽입하기 전에 몇 개의 행을 먼저 살펴보겠습니다:

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

데이터는 CSV 파일에 저장되어 있지만 구분 기호로 세미콜론을 사용합니다. 각 행은 다음과 같습니다:


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

2. ClickHouse에 데이터를 저장하기 위해 다음과 같은 `MergeTree` 테이블을 사용합니다.


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

3. ClickHouse Cloud 서비스에는 `default`라는 클러스터가 있습니다. 클러스터의 각 노드에서 병렬로 S3 파일을 읽는 `s3Cluster` 테이블 함수(table function)를 사용합니다. (클러스터가 없다면 `s3` 함수만 사용하고 클러스터 이름은 제거하십시오.)

이 쿼리는 실행에 다소 시간이 소요됩니다. 압축을 해제하면 약 1.67T의 데이터입니다.

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

다음은 응답으로, 처리된 행 수와 처리 속도를 보여 줍니다. 초당 600만 행 이상이 입력됩니다!

```response
0 rows in set. Elapsed: 3419.330 sec. Processed 20.69 billion rows, 1.67 TB (6.05 million rows/s., 488.52 MB/s.)
```

4. `sensors` 테이블에 얼마나 많은 디스크 용량이 필요한지 확인해 보겠습니다:

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

1.67T 데이터는 310 GiB로 압축되었으며, 총 206억 개의 행이 있습니다:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. 이제 데이터가 ClickHouse에 들어갔으므로 데이터를 분석해 보겠습니다. 더 많은 센서가 배포될수록 데이터 양이 시간이 지남에 따라 증가하는 것을 확인하십시오:

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

SQL Console에서 차트를 생성해 결과를 시각화할 수 있습니다:

<Image img={no_events_per_day} size="md" alt="Number of events per day" />

6. 이 쿼리는 지나치게 덥고 습한 날의 수를 집계합니다:

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

다음은 결과를 시각화한 것입니다.


<Image img={sensors_02} size="md" alt="무덥고 습한 날씨"/>