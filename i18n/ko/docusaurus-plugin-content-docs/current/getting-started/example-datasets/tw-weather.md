---
'description': '지난 128년 동안의 기상 관측 데이터 1억 3천 1백만 행'
'sidebar_label': '타이완 역사적 날씨 데이터셋'
'slug': '/getting-started/example-datasets/tw-weather'
'title': '타이완 역사적 날씨 데이터셋'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'weather'
- 'taiwan'
- 'sample data'
- 'climate data'
---

이 데이터셋은 지난 128년 동안의 역사적인 기상 관측 측정치를 포함하고 있습니다. 각 행은 특정 날짜와 시간, 기상 관측소에 대한 측정치를 나타냅니다.

이 데이터셋의 출처는 [여기](https://github.com/Raingel/historical_weather)에서 확인할 수 있으며, 기상 관측소 번호 목록은 [여기](https://github.com/Raingel/weather_station_list)에서 볼 수 있습니다.

> 기상 데이터셋의 출처에는 중앙기상청(관측소 코드는 C0, C1, 4로 시작)에서 설립한 기상 관측소 및 농업위원회 소속의 농업 기상 관측소(위에서 언급한 코드가 아닌 관측소 코드)가 포함됩니다:

    - StationId
    - MeasuredDate, 관측 시간
    - StnPres, 관측소 공기 압력
    - SeaPres, 해수면 압력
    - Td, 이슬점 온도
    - RH, 상대 습도
    - 기타 측정 가능한 요소

## 데이터 다운로드 {#downloading-the-data}

- ClickHouse에 대한 [전처리된 버전](#pre-processed-data)으로, 이는 정리되고, 재구성되고, 보강된 데이터입니다. 이 데이터셋은 1896년부터 2023년까지의 데이터를 포함합니다.
- [원본 원시 데이터 다운로드](#original-raw-data) 및 ClickHouse에서 요구하는 형식으로 변환합니다. 자신의 컬럼을 추가하고 싶은 사용자는 자신의 접근 방식을 탐색하거나 완료하는 것이 좋습니다.

### 전처리된 데이터 {#pre-processed-data}

데이터셋은 측정치가 각 행에 기록된 형태에서 기상 관측소 ID 및 측정 날짜마다 한 행으로 재구성되었습니다. 즉,

```csv
StationId,MeasuredDate,StnPres,Tx,RH,WS,WD,WSGust,WDGust,Precp,GloblRad,TxSoil0cm,TxSoil5cm,TxSoil20cm,TxSoil50cm,TxSoil100cm,SeaPres,Td,PrecpHour,SunShine,TxSoil10cm,EvapA,Visb,UVI,Cloud Amount,TxSoil30cm,TxSoil200cm,TxSoil300cm,TxSoil500cm,VaporPressure
C0X100,2016-01-01 01:00:00,1022.1,16.1,72,1.1,8.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 02:00:00,1021.6,16.0,73,1.2,358.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 03:00:00,1021.3,15.8,74,1.5,353.0,,,,,,,,,,,,,,,,,,,,,,,
C0X100,2016-01-01 04:00:00,1021.2,15.8,74,1.7,8.0,,,,,,,,,,,,,,,,,,,,,,,
```

쿼리하는 것이 쉽고 결과 테이블이 덜 스파스하며 일부 요소는 이 기상 관측소에서 측정할 수 없기 때문에 null로 표시됩니다.

이 데이터셋은 다음 Google CloudStorage 위치에서 사용 가능합니다. 데이터셋을 로컬 파일 시스템으로 다운로드하거나 ClickHouse에 직접 삽입할 수 있습니다(자세한 사항은 [URL에서 삽입하기](#inserting-from-url) 참조).

다운로드하려면:

```bash
wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/preprocessed_weather_daily_1896_2023.tar.gz


# Option: Validate the checksum
md5sum preprocessed_weather_daily_1896_2023.tar.gz

# Checksum should be equal to: 11b484f5bd9ddafec5cfb131eb2dd008

tar -xzvf preprocessed_weather_daily_1896_2023.tar.gz
daily_weather_preprocessed_1896_2023.csv


# Option: Validate the checksum
md5sum daily_weather_preprocessed_1896_2023.csv

# Checksum should be equal to: 1132248c78195c43d93f843753881754
```

### 원본 원시 데이터 {#original-raw-data}

다음은 원본 원시 데이터를 다운로드하여 변환 및 변형하는 단계에 대한 세부정보입니다.

#### 다운로드 {#download}

원본 원시 데이터를 다운로드하려면:

```bash
mkdir tw_raw_weather_data && cd tw_raw_weather_data

wget https://storage.googleapis.com/taiwan-weather-observaiton-datasets/raw_data_weather_daily_1896_2023.tar.gz


# Option: Validate the checksum
md5sum raw_data_weather_daily_1896_2023.tar.gz

# Checksum should be equal to: b66b9f137217454d655e3004d7d1b51a

tar -xzvf raw_data_weather_daily_1896_2023.tar.gz
466920_1928.csv
466920_1929.csv
466920_1930.csv
466920_1931.csv
...


# Option: Validate the checksum
cat *.csv | md5sum

# Checksum should be equal to: b26db404bf84d4063fac42e576464ce1
```

#### 대만 기상 관측소 검색 {#retrieve-the-taiwan-weather-stations}

```bash
wget -O weather_sta_list.csv https://github.com/Raingel/weather_station_list/raw/main/data/weather_sta_list.csv


# Option: Convert the UTF-8-BOM to UTF-8 encoding
sed -i '1s/^\xEF\xBB\xBF//' weather_sta_list.csv
```

## 테이블 스키마 생성 {#create-table-schema}

ClickHouse에서 MergeTree 테이블을 생성합니다(ClickHouse 클라이언트에서).

```bash
CREATE TABLE tw_weather_data (
    StationId String null,
    MeasuredDate DateTime64,
    StnPres Float64 null,
    SeaPres Float64 null,
    Tx Float64 null,
    Td Float64 null,
    RH Float64 null,
    WS Float64 null,
    WD Float64 null,
    WSGust Float64 null,
    WDGust Float64 null,
    Precp Float64 null,
    PrecpHour Float64 null,
    SunShine Float64 null,
    GloblRad Float64 null,
    TxSoil0cm Float64 null,
    TxSoil5cm Float64 null,
    TxSoil10cm Float64 null,
    TxSoil20cm Float64 null,
    TxSoil50cm Float64 null,
    TxSoil100cm Float64 null,
    TxSoil30cm Float64 null,
    TxSoil200cm Float64 null,
    TxSoil300cm Float64 null,
    TxSoil500cm Float64 null,
    VaporPressure Float64 null,
    UVI Float64 null,
    "Cloud Amount" Float64 null,
    EvapA Float64 null,
    Visb Float64 null
)
ENGINE = MergeTree
ORDER BY (MeasuredDate);
```

## ClickHouse로 데이터 삽입 {#inserting-into-clickhouse}

### 로컬 파일에서 삽입 {#inserting-from-local-file}

데이터는 다음과 같이 로컬 파일에서 삽입할 수 있습니다(ClickHouse 클라이언트에서):

```sql
INSERT INTO tw_weather_data FROM INFILE '/path/to/daily_weather_preprocessed_1896_2023.csv'
```

여기서 `/path/to`는 디스크의 로컬 파일에 대한 특정 사용자 경로를 나타냅니다.

그리고 ClickHouse에 데이터를 삽입한 후의 샘플 응답 출력은 다음과 같습니다:

```response
Query id: 90e4b524-6e14-4855-817c-7e6f98fbeabb

Ok.
131985329 rows in set. Elapsed: 71.770 sec. Processed 131.99 million rows, 10.06 GB (1.84 million rows/s., 140.14 MB/s.)
Peak memory usage: 583.23 MiB.
```

### URL에서 삽입 {#inserting-from-url}

```sql
INSERT INTO tw_weather_data SELECT *
FROM url('https://storage.googleapis.com/taiwan-weather-observaiton-datasets/daily_weather_preprocessed_1896_2023.csv', 'CSVWithNames')

```
이를 가속화하는 방법에 대한 내용은 [대량 데이터 로드 조정](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2) 블로그 포스트를 참조하십시오.

## 데이터 행 및 크기 확인 {#check-data-rows-and-sizes}

1. 삽입된 행 수를 봅시다:

```sql
SELECT formatReadableQuantity(count())
FROM tw_weather_data;
```

```response
┌─formatReadableQuantity(count())─┐
│ 131.99 million                  │
└─────────────────────────────────┘
```

2. 이 테이블에 사용된 디스크 공간을 확인해 봅시다:

```sql
SELECT
    formatReadableSize(sum(bytes)) AS disk_size,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size
FROM system.parts
WHERE (`table` = 'tw_weather_data') AND active
```

```response
┌─disk_size─┬─uncompressed_size─┐
│ 2.13 GiB  │ 32.94 GiB         │
└───────────┴───────────────────┘
```

## 샘플 쿼리 {#sample-queries}

### Q1: 특정 연도마다 각 기상 관측소의 가장 높은 이슬점 온도 검색 {#q1-retrieve-the-highest-dew-point-temperature-for-each-weather-station-in-the-specific-year}

```sql
SELECT
    StationId,
    max(Td) AS max_td
FROM tw_weather_data
WHERE (year(MeasuredDate) = 2023) AND (Td IS NOT NULL)
GROUP BY StationId

┌─StationId─┬─max_td─┐
│ 466940    │      1 │
│ 467300    │      1 │
│ 467540    │      1 │
│ 467490    │      1 │
│ 467080    │      1 │
│ 466910    │      1 │
│ 467660    │      1 │
│ 467270    │      1 │
│ 467350    │      1 │
│ 467571    │      1 │
│ 466920    │      1 │
│ 467650    │      1 │
│ 467550    │      1 │
│ 467480    │      1 │
│ 467610    │      1 │
│ 467050    │      1 │
│ 467590    │      1 │
│ 466990    │      1 │
│ 467060    │      1 │
│ 466950    │      1 │
│ 467620    │      1 │
│ 467990    │      1 │
│ 466930    │      1 │
│ 467110    │      1 │
│ 466881    │      1 │
│ 467410    │      1 │
│ 467441    │      1 │
│ 467420    │      1 │
│ 467530    │      1 │
│ 466900    │      1 │
└───────────┴────────┘

30 rows in set. Elapsed: 0.045 sec. Processed 6.41 million rows, 187.33 MB (143.92 million rows/s., 4.21 GB/s.)
```

### Q2: 특정 시간 범위, 필드 및 기상 관측소로 원시 데이터 가져오기 {#q2-raw-data-fetching-with-the-specific-duration-time-range-fields-and-weather-station}

```sql
SELECT
    StnPres,
    SeaPres,
    Tx,
    Td,
    RH,
    WS,
    WD,
    WSGust,
    WDGust,
    Precp,
    PrecpHour
FROM tw_weather_data
WHERE (StationId = 'C0UB10') AND (MeasuredDate >= '2023-12-23') AND (MeasuredDate < '2023-12-24')
ORDER BY MeasuredDate ASC
LIMIT 10
```

```response
┌─StnPres─┬─SeaPres─┬───Tx─┬───Td─┬─RH─┬──WS─┬──WD─┬─WSGust─┬─WDGust─┬─Precp─┬─PrecpHour─┐
│  1029.5 │    ᴺᵁᴸᴸ │ 11.8 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 271 │    5.5 │    275 │ -99.8 │     -99.8 │
│  1029.8 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 78 │ 2.7 │ 289 │    5.5 │    308 │ -99.8 │     -99.8 │
│  1028.6 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 79 │ 2.3 │ 251 │    6.1 │    289 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │   13 │ ᴺᵁᴸᴸ │ 75 │ 4.3 │ 312 │    7.5 │    316 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.1 │ ᴺᵁᴸᴸ │ 89 │ 7.1 │ 310 │   11.6 │    322 │ -99.8 │     -99.8 │
│  1027.8 │    ᴺᵁᴸᴸ │ 11.6 │ ᴺᵁᴸᴸ │ 90 │ 3.1 │ 269 │   10.7 │    295 │ -99.8 │     -99.8 │
│  1027.9 │    ᴺᵁᴸᴸ │ 12.3 │ ᴺᵁᴸᴸ │ 89 │ 4.7 │ 296 │    8.1 │    310 │ -99.8 │     -99.8 │
│  1028.2 │    ᴺᵁᴸᴸ │ 12.2 │ ᴺᵁᴸᴸ │ 94 │ 2.5 │ 246 │    7.1 │    283 │ -99.8 │     -99.8 │
│  1028.4 │    ᴺᵁᴸᴸ │ 12.5 │ ᴺᵁᴸᴸ │ 94 │ 3.1 │ 265 │    4.8 │    297 │ -99.8 │     -99.8 │
│  1028.3 │    ᴺᵁᴸᴸ │ 13.6 │ ᴺᵁᴸᴸ │ 91 │ 1.2 │ 273 │    4.4 │    256 │ -99.8 │     -99.8 │
└─────────┴─────────┴──────┴──────┴────┴─────┴─────┴────────┴────────┴───────┴───────────┘

10 rows in set. Elapsed: 0.009 sec. Processed 91.70 thousand rows, 2.33 MB (9.67 million rows/s., 245.31 MB/s.)
```

## 감사의 말씀 {#credits}

우리는 이 데이터셋을 준비하고 정리하며 배포해 주신 중앙기상청과 농업위원회의 농업 기상 관측 네트워크(관측소) 노력에 감사를 표합니다. 여러분의 노고에 감사드립니다.

Ou, J.-H., Kuo, C.-H., Wu, Y.-F., Lin, G.-C., Lee, M.-H., Chen, R.-K., Chou, H.-P., Wu, H.-Y., Chu, S.-C., Lai, Q.-J., Tsai, Y.-C., Lin, C.-C., Kuo, C.-C., Liao, C.-T., Chen, Y.-N., Chu, Y.-W., Chen, C.-Y., 2023. 대만의 벼 병해 조기 경고를 위한 응용 지향 딥러닝 모델. Ecological Informatics 73, 101950. https://doi.org/10.1016/j.ecoinf.2022.101950 [2022년 12월 13일]
