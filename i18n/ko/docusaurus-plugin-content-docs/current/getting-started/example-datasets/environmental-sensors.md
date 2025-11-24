---
'description': 'Sensor.Community에서 제공하는 200억 개 이상의 데이터 기록으로, 기여자들이 주도하는 글로벌 센서 네트워크가
  생성한 공개 환경 데이터입니다.'
'sidebar_label': '환경 센서 데이터'
'slug': '/getting-started/example-datasets/environmental-sensors'
'title': '환경 센서 데이터'
'doc_type': 'guide'
'keywords':
- 'environmental sensors'
- 'Sensor.Community'
- 'air quality data'
- 'environmental data'
- 'getting started'
---

import Image from '@theme/IdealImage';
import no_events_per_day from '@site/static/images/getting-started/example-datasets/sensors_01.png';
import sensors_02 from '@site/static/images/getting-started/example-datasets/sensors_02.png';

[Sensor.Community](https://sensor.community/en/)는 오픈 환경 데이터를 생성하는 기여자 중심의 글로벌 센서 네트워크입니다. 데이터는 전 세계의 센서로부터 수집됩니다. 누구나 센서를 구매하여 원하는 위치에 설치할 수 있습니다. 데이터를 다운로드할 수 있는 API는 [GitHub](https://github.com/opendata-stuttgart/meta/wiki/APIs)에 있으며, 데이터는 [Database Contents License (DbCL)](https://opendatacommons.org/licenses/dbcl/1-0/)에 따라 무료로 제공됩니다.

:::important
데이터셋에는 200억 개 이상의 레코드가 있으므로, 자원의 용량이 그 정도의 볼륨을 처리할 수 없다면 아래 명령어를 간단히 복사하고 붙여넣는 것을 주의하세요. 아래 명령어는 [ClickHouse Cloud](https://clickhouse.cloud)의 **Production** 인스턴스에서 실행되었습니다.
:::

1. 데이터는 S3에 있으므로, `s3` 테이블 기능을 사용하여 파일로부터 테이블을 생성할 수 있습니다. 또한 데이터를 제자리에서 쿼리할 수 있습니다. ClickHouse에 삽입하기 전에 몇 개의 행을 살펴보겠습니다:

```sql
SELECT *
FROM s3(
    'https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst',
    'CSVWithNames'
   )
LIMIT 10
SETTINGS format_csv_delimiter = ';';
```

데이터는 CSV 파일에 있지만 구분자로 세미콜론을 사용합니다. 행은 다음과 같습니다:

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

2. ClickHouse에 데이터를 저장하기 위해 다음의 `MergeTree` 테이블을 사용할 것입니다:

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

3. ClickHouse Cloud 서비스는 `default`라는 클러스터를 가지고 있습니다. 우리는 클러스터의 노드에서 S3 파일을 병렬로 읽는 `s3Cluster` 테이블 기능을 사용할 것입니다. (클러스터가 없다면, `s3` 기능만 사용하고 클러스터 이름을 제거하면 됩니다.)

이 쿼리는 조금 시간이 걸릴 것입니다 - 압축되지 않은 데이터가 약 1.67T입니다:

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

여기 응답이 있습니다 - 행 수와 처리 속도를 보여줍니다. 초당 600만 개 이상의 행의 속도로 입력되고 있습니다!

```response
0 rows in set. Elapsed: 3419.330 sec. Processed 20.69 billion rows, 1.67 TB (6.05 million rows/s., 488.52 MB/s.)
```

4. `sensors` 테이블에 필요한 스토리지 디스크 용량을 확인해 보겠습니다:

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

1.67T가 310 GiB로 압축되었으며, 206.9억 개의 행이 있습니다:

```response
┌─disk_name─┬─compressed─┬─uncompressed─┬─compr_rate─┬────────rows─┬─part_count─┐
│ s3disk    │ 310.21 GiB │ 1.30 TiB     │       4.29 │ 20693971809 │        472 │
└───────────┴────────────┴──────────────┴────────────┴─────────────┴────────────┘
```

5. ClickHouse에 데이터가 들어갔으므로 이제 데이터를 분석해 보겠습니다. 더 많은 센서가 배치됨에 따라 데이터 양이 시간이 지남에 따라 증가하는 것을 확인하세요:

```sql
SELECT
    date,
    count()
FROM sensors
GROUP BY date
ORDER BY date ASC;
```

SQL 콘솔에 차트를 만들어 결과를 시각화할 수 있습니다:

<Image img={no_events_per_day} size="md" alt="하루 이벤트 수"/>

6. 이 쿼리는 매우 더운 습기 있는 날의 수를 계산합니다:

```sql
WITH
    toYYYYMMDD(timestamp) AS day
SELECT day, count() FROM sensors
WHERE temperature >= 40 AND temperature <= 50 AND humidity >= 90
GROUP BY day
ORDER BY day ASC;
```

결과를 시각화한 것입니다:

<Image img={sensors_02} size="md" alt="더운 습기 있는 날들"/>
