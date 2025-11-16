---
'description': '지난 120년 동안의 기후 데이터 25억 행'
'sidebar_label': 'NOAA Global Historical Climatology Network '
'slug': '/getting-started/example-datasets/noaa'
'title': 'NOAA Global Historical Climatology Network'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'noaa'
- 'weather data'
- 'sample data'
- 'climate'
---

이 데이터 세트는 지난 120년 동안의 기상 측정을 포함하고 있습니다. 각 행은 특정 시간과 관측소에서의 측정을 나타냅니다.

좀 더 정확하게는 이 데이터의 [출처](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)에 따르면:

> GHCN-Daily는 전 세계 육상 지역에 대한 일일 관측치를 포함하는 데이터 세트입니다. 이 데이터는 전 세계의 육상 관측소에서 수집된 측정값으로, 두 번째로 많은 수의 관측이 강수량 측정에 해당합니다(Menne et al., 2012). GHCN-Daily는 여러 출처의 기후 기록을 통합하여 일반적인 품질 보증 검토를 거친 복합체입니다(Durre et al., 2010). 아카이브에는 다음과 같은 기상 요소가 포함되어 있습니다:

    - 일일 최대 기온
    - 일일 최소 기온
    - 관측 시 기온
    - 강수량(즉, 비, 녹은 눈)
    - 적설량
    - 눈 깊이
    - 사용 가능한 다른 요소

아래 섹션에서는 이 데이터 세트를 ClickHouse로 가져오는 데 사용된 단계에 대한 간략한 개요를 제공합니다. 각 단계에 대해 더 자세히 읽고 싶다면, 제목이 ["거대한 실제 데이터 세트 탐색: ClickHouse에서 100년 이상의 기상 기록"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)인 블로그 포스트를 확인해 보시기 바랍니다.

## 데이터 다운로드 {#downloading-the-data}

- ClickHouse용으로 정리, 재구성 및 보강된 데이터의 [사전 준비된 버전](#pre-prepared-data). 이 데이터는 1900년부터 2022년까지의 데이터를 포함합니다.
- [원본 데이터 다운로드](#original-data) 및 ClickHouse에서 요구하는 형식으로 변환합니다. 자신의 컬럼을 추가하고자 하는 사용자는 이 접근 방식을 탐색할 수 있습니다.

### 사전 준비된 데이터 {#pre-prepared-data}

좀 더 구체적으로, Noaa의 품질 보증 검사를 통과하지 않은 행은 제거되었습니다. 데이터는 각 행이 아닌 관측소 ID와 날짜별로 재구성되었습니다. 즉,

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

이 방법은 쿼리를 더 간단하게 만들고 결과 테이블이 덜 스파스하게 되도록 보장합니다. 마지막으로, 데이터는 위도 및 경도로 보강되었습니다.

이 데이터는 다음 S3 위치에서 사용할 수 있습니다. 로컬 파일 시스템에 데이터를 다운로드한 후 ClickHouse 클라이언트를 사용하여 삽입하거나 ClickHouse에 직접 삽입할 수 있습니다(자세한 내용은 [S3에서 삽입하기](#inserting-from-s3) 참조).

다운로드하려면:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### 원본 데이터 {#original-data}

다음은 ClickHouse에 로드하기 위한 원본 데이터를 다운로드하고 변환하는 단계에 대한 세부정보입니다.

#### 다운로드 {#download}

원본 데이터를 다운로드하려면:

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### 데이터 샘플링 {#sampling-the-data}

```bash
$ clickhouse-local --query "SELECT * FROM '2021.csv.gz' LIMIT 10" --format PrettyCompact
┌─c1──────────┬───────c2─┬─c3───┬──c4─┬─c5───┬─c6───┬─c7─┬───c8─┐
│ AE000041196 │ 20210101 │ TMAX │ 278 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ PRCP │   0 │ D    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ TAVG │ 214 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMAX │ 266 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMIN │ 178 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ PRCP │   0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TAVG │ 217 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMAX │ 262 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMIN │ 155 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TAVG │ 202 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
└─────────────┴──────────┴──────┴─────┴──────┴──────┴────┴──────┘
```

[형식 문서](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)를 요약하면:

형식 문서와 열을 요약하면 다음과 같습니다:

- 11자리의 관측소 식별 코드. 이 코드는 일부 유용한 정보를 인코딩합니다.
- YEAR/MONTH/DAY = YYYYMMDD 형식의 8자리 날짜(예: 19860529 = 1986년 5월 29일)
- ELEMENT = 요소 유형의 4자리 표시기. 사실상 측정 유형을 의미합니다. 사용 가능한 측정값이 많지만, 우리는 다음을 선택합니다:
  - PRCP - 강수량(0.1mm 단위)
  - SNOW - 적설량(mm)
  - SNWD - 눈 깊이(mm)
  - TMAX - 최대 기온(0.1도 C 단위)
  - TAVG - 평균 기온(0.1도 C 단위)
  - TMIN - 최소 기온(0.1도 C 단위)
  - PSUN - 가능한 일일 햇빛 비율(퍼센트)
  - AWND - 평균 일일 풍속(0.1m/s 단위)
  - WSFG - 최대 돌풍 풍속(0.1m/s 단위)
  - WT** = 날씨 유형, 여기서 **는 날씨 유형을 정의합니다. 날씨 유형의 전체 목록은 여기에서 확인하십시오.
  - DATA VALUE = ELEMENT에 대한 데이터 값으로,つまり 측정값을 나타냅니다.
  - M-FLAG = 1자리 측정 플래그. 이 플래그에는 10가지 가능한 값이 있습니다. 이 중 일부 값은 데이터 정확성에 의문을 제기합니다. 우리는 이 값이 "P"로 설정된 데이터(예: 누락된 것으로 가정된 제로에 대한)만 수용합니다. 이는 PRCP, SNOW 및 SNWD 측정에만 관련이 있습니다.
- Q-FLAG는 측정 품질 플래그로 14가지 가능한 값이 있습니다. 우리는 빈 값(즉, 품질 보증 검사를 통과하지 못한 데이터)에만 관심이 있습니다.
- S-FLAG는 관측의 출처 플래그입니다. 이는 우리의 분석에는 유용하지 않으며 무시됩니다.
- OBS-TIME = 시간-분 형식의 관측 시간(즉, 0700 = 오전 7:00). 일반적으로 이전 데이터에는 존재하지 않습니다. 이는 우리의 용도로 무시합니다.

행당 측정값을 제공하면 ClickHouse에서 스파스한 테이블 구조가 형성됩니다. 우리는 이를 각 시간과 관측소의 행으로 변환해야 하며, 측정은 컬럼으로 설정됩니다. 먼저 문제 없는 행, 즉 `qFlag`가 빈 문자열인 행만 데이터 세트로 제한합니다.

#### 데이터 정리 {#clean-the-data}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)을 사용하여, 우리가 관심 있는 측정을 나타내는 행을 필터링하고 품질 요구 사항을 통과할 수 있습니다:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26억 행이 넘는 이 쿼리는 모든 파일을 파싱하는 것이므로 빠르지 않습니다. 8코어 기계에서 이 작업은 약 160초가 소요됩니다.

### 피벗 데이터 {#pivot-data}

행당 측정값 구조는 ClickHouse에서 사용할 수 있지만, 향후 쿼리를 불필요하게 복잡하게 만들 것입니다. 이상적으로는 각 관측소 ID와 날짜에 대해 한 행이 필요하며, 각 측정 유형과 관련된 값이 컬럼으로 설정되어야 합니다. 즉,

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse local과 간단한 `GROUP BY`를 사용하여 데이터를 이 구조로 재피벗할 수 있습니다. 메모리 오버헤드를 제한하기 위해, 우리는 이 작업을 파일 단위로 수행합니다.

```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(date) as date,
       anyIf(value, measurement = 'TAVG') as tempAvg,
       anyIf(value, measurement = 'TMAX') as tempMax,
       anyIf(value, measurement = 'TMIN') as tempMin,
       anyIf(value, measurement = 'PRCP') as precipitation,
       anyIf(value, measurement = 'SNOW') as snowfall,
       anyIf(value, measurement = 'SNWD') as snowDepth,
       anyIf(value, measurement = 'PSUN') as percentDailySun,
       anyIf(value, measurement = 'AWND') as averageWindSpeed,
       anyIf(value, measurement = 'WSFG') as maxWindSpeed,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as weatherType
FROM file('$i.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, date
ORDER BY station_id, date FORMAT CSV" >> "noaa.csv";
done
```

이 쿼리는 50GB 크기의 단일 파일 `noaa.csv`를 생성합니다.

### 데이터 보강 {#enriching-the-data}

데이터는 관측소 ID 외에는 위치를 나타내는 정보가 없습니다. 관측소 ID에는 접두사 국가 코드가 포함되어 있습니다. 이상적으로 각 관측소는 위도 및 경도를 가지고 있어야 합니다. 이를 달성하기 위해, NOAA는 별도의 [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)에서 각 관측소의 세부 정보를 제공합니다. 이 파일은 [여러 컬럼](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)을 포함하며, 우리의 미래 분석에 유용한 다섯 가지는 다음과 같습니다: id, 위도, 경도, 고도 및 이름.

```bash
wget http://noaa-ghcn-pds.s3.amazonaws.com/ghcnd-stations.txt
```

```bash
clickhouse local --query "WITH stations AS (SELECT id, lat, lon, elevation, splitByString(' GSN ',name)[1] as name FROM file('ghcnd-stations.txt', Regexp, 'id String, lat Float64, lon Float64, elevation Float32, name String'))
SELECT station_id,
       date,
       tempAvg,
       tempMax,
       tempMin,
       precipitation,
       snowfall,
       snowDepth,
       percentDailySun,
       averageWindSpeed,
       maxWindSpeed,
       weatherType,
       tuple(lon, lat) as location,
       elevation,
       name
FROM file('noaa.csv', CSV,
          'station_id String, date Date32, tempAvg Int32, tempMax Int32, tempMin Int32, precipitation Int32, snowfall Int32, snowDepth Int32, percentDailySun Int8, averageWindSpeed Int32, maxWindSpeed Int32, weatherType UInt8') as noaa LEFT OUTER
         JOIN stations ON noaa.station_id = stations.id INTO OUTFILE 'noaa_enriched.parquet' FORMAT Parquet SETTINGS format_regexp='^(.{11})\s+(\-?\d{1,2}\.\d{4})\s+(\-?\d{1,3}\.\d{1,4})\s+(\-?\d*\.\d*)\s+(.*)\s+(?:[\d]*)'" 
```
이 쿼리는 몇 분 정도 소요되며, 6.4GB 크기의 파일 `noaa_enriched.parquet`를 생성합니다.

## 테이블 생성 {#create-table}

ClickHouse에서 MergeTree 테이블을 생성합니다(ClickHouse 클라이언트에서).

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Average temperature (tenths of a degrees C)',
   `tempMax` Int32 COMMENT 'Maximum temperature (tenths of degrees C)',
   `tempMin` Int32 COMMENT 'Minimum temperature (tenths of degrees C)',
   `precipitation` UInt32 COMMENT 'Precipitation (tenths of mm)',
   `snowfall` UInt32 COMMENT 'Snowfall (mm)',
   `snowDepth` UInt32 COMMENT 'Snow depth (mm)',
   `percentDailySun` UInt8 COMMENT 'Daily percent of possible sunshine (percent)',
   `averageWindSpeed` UInt32 COMMENT 'Average daily wind speed (tenths of meters per second)',
   `maxWindSpeed` UInt32 COMMENT 'Peak gust wind speed (tenths of meters per second)',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```

## ClickHouse에 삽입하기 {#inserting-into-clickhouse}

### 로컬 파일에서 삽입 {#inserting-from-local-file}

데이터는 다음과 같이 로컬 파일에서 삽입할 수 있습니다(ClickHouse 클라이언트에서):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

여기서 `<path>`는 디스크에서 로컬 파일의 전체 경로를 나타냅니다.

어떻게 이 로드를 빠르게 할 수 있는지에 대해서는 [여기](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)를 참조하십시오.

### S3에서 삽입하기 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```
이를 빠르게 하는 방법에 대한 내용은 [대용량 데이터 로드 조정](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)에 대한 블로그 포스트를 참조하십시오.

## 샘플 쿼리 {#sample-queries}

### 역대 최고 기온 {#highest-temperature-ever}

```sql
SELECT
    tempMax / 10 AS maxTemp,
    location,
    name,
    date
FROM blogs.noaa
WHERE tempMax > 500
ORDER BY
    tempMax DESC,
    date ASC
LIMIT 5

┌─maxTemp─┬─location──────────┬─name───────────────────────────────────────────┬───────date─┐
│    56.7 │ (-116.8667,36.45) │ CA GREENLAND RCH                               │ 1913-07-10 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-08-20 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-09-18 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-07-17 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-09-04 │
└─────────┴───────────────────┴────────────────────────────────────────────────┴────────────┘

5 rows in set. Elapsed: 0.514 sec. Processed 1.06 billion rows, 4.27 GB (2.06 billion rows/s., 8.29 GB/s.)
```

[문서화된 기록](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)과 [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)에서 2023년 기준으로 일치함을 안심할 수 있습니다.

### 최고의 스키 리조트 {#best-ski-resorts}

[스키 리조트 목록](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)을 미국 내 해당 위치와 함께 사용하여, 지난 5년 중 가장 많은 데이터를 수집한 상위 1000개 기상 관측소와 이들을 조인합니다. 이 조인을 [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)로 정렬하고 거리가 20km 이하인 결과로 제한하며, 각 리조트당 최상 결과를 선택하고 총 눈으로 정렬합니다. 또한 좋은 스키 조건의 폭넓은 지표로서 1800m 이상의 리조트로 제한합니다.

```sql
SELECT
   resort_name,
   total_snow / 1000 AS total_snow_m,
   resort_location,
   month_year
FROM
(
   WITH resorts AS
       (
           SELECT
               resort_name,
               state,
               (lon, lat) AS resort_location,
               'US' AS code
           FROM url('https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv', CSVWithNames)
       )
   SELECT
       resort_name,
       highest_snow.station_id,
       geoDistance(resort_location.1, resort_location.2, station_location.1, station_location.2) / 1000 AS distance_km,
       highest_snow.total_snow,
       resort_location,
       station_location,
       month_year
   FROM
   (
       SELECT
           sum(snowfall) AS total_snow,
           station_id,
           any(location) AS station_location,
           month_year,
           substring(station_id, 1, 2) AS code
       FROM noaa
       WHERE (date > '2017-01-01') AND (code = 'US') AND (elevation > 1800)
       GROUP BY
           station_id,
           toYYYYMM(date) AS month_year
       ORDER BY total_snow DESC
       LIMIT 1000
   ) AS highest_snow
   INNER JOIN resorts ON highest_snow.code = resorts.code
   WHERE distance_km < 20
   ORDER BY
       resort_name ASC,
       total_snow DESC
   LIMIT 1 BY
       resort_name,
       station_id
)
ORDER BY total_snow DESC
LIMIT 5

┌─resort_name──────────┬─total_snow_m─┬─resort_location─┬─month_year─┐
│ Sugar Bowl, CA       │        7.799 │ (-120.3,39.27)  │     201902 │
│ Donner Ski Ranch, CA │        7.799 │ (-120.34,39.31) │     201902 │
│ Boreal, CA           │        7.799 │ (-120.35,39.33) │     201902 │
│ Homewood, CA         │        4.926 │ (-120.17,39.08) │     201902 │
│ Alpine Meadows, CA   │        4.926 │ (-120.22,39.17) │     201902 │
└──────────────────────┴──────────────┴─────────────────┴────────────┘

5 rows in set. Elapsed: 0.750 sec. Processed 689.10 million rows, 3.20 GB (918.20 million rows/s., 4.26 GB/s.)
Peak memory usage: 67.66 MiB.
```

## 크레딧 {#credits}

우리는 이 데이터를 준비하고 정리하며 배포한 Global Historical Climatology Network의 노력을 인정하고자 합니다. 여러분의 수고에 감사드립니다.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, 그리고 T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [소수 다음에 사용한 하위 집합을 명시하십시오. 예: Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
