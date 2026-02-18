---
description: '지난 120년간의 25억 행 기후 데이터'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['예제 데이터셋', 'noaa', '날씨 데이터', '샘플 데이터', '기후']
---

이 데이터셋에는 지난 120년 동안의 기상 관측값이 포함되어 있습니다. 각 행은 특정 시점과 관측소에 대한 하나의 측정값입니다.

보다 정확히 말하면, [이 데이터의 출처](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)에 따르면 다음과 같습니다.

> GHCN-Daily는 전 세계 육상 지역에 대한 일일 관측값을 포함하는 데이터셋입니다. 이 데이터셋에는 전 세계 육상 관측소 기반의 측정값이 포함되어 있으며, 그중 약 3분의 2는 강수량(precipitation) 측정값만을 위한 것입니다 (Menne et al., 2012). GHCN-Daily는 여러 출처에서 수집된 기후 기록을 통합하고, 공통의 일련의 품질 보증 검토를 거쳐 생성된 합성 데이터셋입니다 (Durre et al., 2010). 이 아카이브에는 다음과 같은 기상 요소가 포함됩니다.

- 일별 최고 기온
    - 일별 최저 기온
    - 관측 시점의 기온
    - 강수량(예: 비, 녹은 눈)
    - 강설량
    - 적설심
    - 가능한 경우 기타 요소

아래 섹션에서는 이 데이터셋을 ClickHouse로 가져오는 데 사용된 단계들을 간략히 설명합니다. 각 단계를 더 자세히 살펴보고 싶다면, ["Exploring massive, real-world data sets: 100+ Years of Weather Records in ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)라는 제목의 블로그 게시물을 참고하시기 바랍니다.

## 데이터 다운로드 \{#downloading-the-data\}

- 정제·재구조화·보강이 완료된 ClickHouse용 [사전 준비 데이터](#pre-prepared-data)입니다. 이 데이터는 1900년부터 2022년까지를 포함합니다.
- [원본 데이터](#original-data)를 다운로드하여 ClickHouse에서 요구하는 형식으로 변환합니다. 자체적으로 컬럼을 추가하려는 사용자는 이 방식을 고려할 수 있습니다.

### 사전 준비된 데이터 \{#pre-prepared-data\}

좀 더 정확히 말하면, NOAA의 품질 보증 검사에서 어떤 항목도 실패하지 않은 행은 제거되었습니다. 또한 데이터는 한 줄당 하나의 측정값을 갖는 구조에서, 각 관측소 ID와 날짜 조합당 하나의 행을 갖는 구조로 재구성되었습니다. 즉, 다음과 같은 형태입니다.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

이는 쿼리를 더 간단하게 만들고 결과 테이블이 덜 희소해지도록 합니다. 마지막으로, 데이터에는 위도와 경도가 추가로 포함되어 있습니다.

이 데이터는 다음 S3 위치에서 사용할 수 있습니다. 데이터를 로컬 파일 시스템으로 다운로드한 다음 ClickHouse 클라이언트를 사용하여 삽입하거나, ClickHouse에 직접 삽입하십시오([S3에서 삽입](#inserting-from-s3)을 참조).

다운로드하려면 다음을 수행하십시오:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```


### 원본 데이터 \{#original-data\}

다음은 ClickHouse에 로드하기 위한 원본 데이터의 다운로드 및 변환 절차를 설명합니다.

#### 다운로드 \{#download\}

원본 데이터를 다운로드하려면 다음을 수행하십시오.

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```


#### 데이터 샘플링 \{#sampling-the-data\}

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

[형식 문서](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn)를 요약하면 다음과 같습니다:

형식 문서와 컬럼을 순서대로 정리하면 다음과 같습니다:


- 11자 길이의 관측소 식별 코드입니다. 이 자체에 몇 가지 유용한 정보가 인코딩되어 있습니다.
- YEAR/MONTH/DAY = YYYYMMDD 형식의 8자리 날짜입니다(예: 19860529 = 1986년 5월 29일).
- ELEMENT = 요소 유형을 나타내는 4자 지표입니다. 사실상 측정 유형입니다. 측정값은 매우 많지만, 여기서는 다음만 선택합니다:
  - PRCP - 강수량(0.1mm 단위)
  - SNOW - 신적설(mm)
  - SNWD - 적설 깊이(mm)
  - TMAX - 최고 기온(0.1도 C 단위)
  - TAVG - 평균 기온(0.1도 C 단위)
  - TMIN - 최저 기온(0.1도 C 단위)
  - PSUN - 가능한 일조량 대비 일일 일조 비율(퍼센트)
  - AWND - 일일 평균 풍속(초당 미터의 0.1 단위)
  - WSFG - 최대 돌풍 풍속(초당 미터의 0.1 단위)
  - WT** = Weather Type이며, **가 기상 유형을 정의합니다. 전체 기상 유형 목록은 여기에서 확인할 수 있습니다.
  - DATA VALUE = ELEMENT에 대한 5자 길이 데이터 값, 즉 측정값 자체입니다.
  - M-FLAG = 1자 길이의 Measurement Flag입니다. 가능한 값이 10개 있습니다. 이 중 일부 값은 데이터 정확도가 의심스러움을 나타냅니다. 이 가운데 「누락되었으나 0으로 추정됨」을 의미하는 "P"로 설정된 경우는 PRCP, SNOW, SNWD 측정에만 관련되므로 허용합니다.
- Q-FLAG는 측정 품질 플래그이며, 가능한 값이 14개 있습니다. 값이 비어 있는 데이터, 즉 어떤 품질 보증 검사에서도 실패하지 않은 데이터에만 관심이 있습니다.
- S-FLAG는 관측에 대한 소스 플래그입니다. 분석에 유용하지 않으므로 무시합니다.
- OBS-TIME = 시-분 형식의 관측 시각을 나타내는 4자 값입니다(예: 0700 = 오전 7:00). 이전 데이터에는 일반적으로 존재하지 않습니다. 본 문서의 목적상 이 값은 무시합니다.

한 줄당 하나의 측정값을 저장하면 ClickHouse에서 희소한 테이블 구조가 됩니다. 시간과 관측소 조합당 1행이 되도록 변환하고, 각 측정값을 컬럼으로 두는 것이 좋습니다. 먼저, `qFlag`가 빈 문자열인, 즉 문제가 없는 행만 남도록 데이터셋을 제한합니다.

#### 데이터 정제 \{#clean-the-data\}

[ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)을 사용하여 관심 있는 측정값에 해당하는 행만 필터링하고, 품질 요구 사항을 통과한 데이터만 남길 수 있습니다:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

26억 개가 넘는 행을 대상으로 하므로 모든 파일을 파싱해야 해서 빠른 쿼리가 아닙니다. 8코어 머신에서는 이 작업에 약 160초가 소요됩니다.


### 피벗 데이터 \{#pivot-data\}

측정값을 행당 하나씩 저장하는 구조도 ClickHouse에서 사용할 수는 있지만, 향후 쿼리를 불필요하게 복잡하게 만듭니다. 이상적으로는 각 측정 유형과 해당 값이 각각 하나의 컬럼이 되도록, 측정소 ID와 날짜의 조합마다 하나의 행을 가지는 구조가 필요합니다. 즉, 다음과 같습니다.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

ClickHouse local과 간단한 `GROUP BY`를 사용하면 데이터를 이 구조로 다시 피벗할 수 있습니다. 메모리 사용량을 줄이기 위해 한 번에 파일 하나씩 처리합니다.

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

이 쿼리는 크기가 50GB인 단일 파일 `noaa.csv`를 생성합니다.


### 데이터 보강하기 \{#enriching-the-data\}

데이터에는 국가 코드를 접두사로 포함한 관측소 ID 외에는 위치 정보가 없습니다. 이상적으로는 각 관측소마다 위도와 경도가 연결되어 있어야 합니다. 이를 위해 NOAA에서 각 관측소의 세부 정보를 별도의 [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file) 파일로 제공하고 있습니다. 이 파일에는 [여러 개의 컬럼](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file)이 있으며, 이 중 이후 분석에 유용한 컬럼은 5개입니다. id, latitude, longitude, elevation, name입니다.

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

이 쿼리는 실행하는 데 몇 분이 걸리며 6.4 GB `noaa_enriched.parquet` 파일을 생성합니다.


## 테이블 생성 \{#create-table\}

ClickHouse 클라이언트에서 MergeTree 테이블을 생성합니다.

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


## ClickHouse에 데이터 삽입 \{#inserting-into-clickhouse\}

### 로컬 파일에서 삽입하기 \{#inserting-from-local-file\}

로컬 파일의 데이터는 ClickHouse 클라이언트에서 다음과 같이 삽입할 수 있습니다.

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

여기서 `<path>`는 디스크에 있는 로컬 파일의 전체 경로를 나타냅니다.

데이터 적재를 더 빠르게 수행하는 방법은 [여기](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data)를 참고하십시오.


### S3에서 데이터 삽입 \{#inserting-from-s3\}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

이를 더 빠르게 수행하는 방법은 [대용량 데이터 적재 튜닝](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)에 대한 블로그 게시글을 참조하십시오.


## 예시 쿼리 \{#sample-queries\}

### 역대 최고 기온 \{#highest-temperature-ever\}

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

2023년 기준 [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667)의 [공식 기록](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded)과도 신뢰할 만할 정도로 잘 일치합니다.


### 최고의 스키 리조트 \{#best-ski-resorts\}

미국 내 [스키 리조트 목록](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv)과 각 리조트의 위치 정보를 사용하여, 지난 5년 동안 어느 달이든 관측값이 가장 많이 기록된 상위 1000개의 기상 관측소와 조인합니다. 이 조인 결과를 [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance)로 정렬하고 거리 20km 미만인 결과로 제한한 뒤, 리조트별로 가장 가까운 결과 1개를 선택하고 이를 총 적설량 기준으로 정렬합니다. 또한, 전반적인 양호한 스키 조건의 지표로서 해발 1800m 이상에 위치한 리조트로만 범위를 제한합니다.

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


## 감사의 글 \{#credits\}

이 데이터를 준비·정제·배포한 Global Historical Climatology Network의 노고에 깊이 감사드립니다.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [사용한 서브셋을 소수점 이하에 표시하십시오. 예: Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [2020-08-17]