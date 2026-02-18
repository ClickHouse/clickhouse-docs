---
description: '2009년 이후 뉴욕시(New York City)에서 출발한 수십억 건의 택시 및 차량 호출 서비스(Uber, Lyft 등) 이동 데이터'
sidebar_label: '뉴욕 택시 데이터'
slug: /getting-started/example-datasets/nyc-taxi
title: '뉴욕 택시 데이터'
doc_type: 'guide'
keywords: ['예제 데이터 세트', 'nyc taxi', '튜토리얼', '샘플 데이터', '시작하기']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

뉴욕 택시 데이터 샘플은 2009년 이후 뉴욕시에서 출발한 30억 건 이상의 택시 및 차량 호출(Uber, Lyft 등) 이동 기록으로 구성됩니다. 이 시작 가이드에서는 300만 행 샘플을 사용합니다.

전체 데이터셋은 다음과 같은 몇 가지 방법으로 얻을 수 있습니다.

* S3 또는 GCS에서 ClickHouse Cloud로 데이터를 직접 삽입합니다.
* 미리 준비된 파티션을 다운로드합니다.
* 또는 데모 환경인 [sql.clickhouse.com](https://sql.clickhouse.com/?query=U0VMRUNUIGNvdW50KCkgRlJPTSBueWNfdGF4aS50cmlwcw\&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ0aXRsZSI6IlRlbXBlcmF0dXJlIGJ5IGNvdW50cnkgYW5kIHllYXIiLCJ4YXhpcyI6InllYXIiLCJ5YXhpcyI6ImNvdW50KCkiLCJzZXJpZXMiOiJDQVNUKHBhc3Nlbmdlcl9jb3VudCwgJ1N0cmluZycpIn19)에서 전체 데이터셋을 쿼리할 수 있습니다.

:::note
아래 예제 쿼리는 ClickHouse Cloud의 **Production** 인스턴스에서 실행되었습니다. 자세한 내용은
[「Playground specifications」](/getting-started/playground#specifications)을(를) 참조하십시오.
:::


## trips 테이블 생성 \{#create-the-table-trips\}

먼저 택시 운행(trips) 데이터를 저장할 테이블을 생성합니다.

```sql

CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```


## 객체 스토리지에서 직접 데이터 로드하기 \{#load-the-data-directly-from-object-storage\}

사용자는 데이터에 익숙해지기 위해 데이터의 작은 부분집합(300만 행)을 가져와 살펴볼 수 있습니다. 데이터는 객체 스토리지의 TSV 파일로 되어 있으며, 이를 `s3` 테이블 함수를 사용해 ClickHouse Cloud에 손쉽게 스트리밍할 수 있습니다. 

동일한 데이터가 S3와 GCS 모두에 저장되어 있으므로, 둘 중 하나의 탭을 선택하여 사용하면 됩니다.

<Tabs groupId="storageVendor">
<TabItem value="s3" label="S3">

다음 명령은 S3 버킷에서 세 개의 파일을 `trips_small` 테이블로 스트리밍합니다(`{0..2}` 구문은 0, 1, 2 값에 대한 와일드카드입니다):

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```
</TabItem>
<TabItem value="gcs" label="GCS" default>

다음 명령은 GCS 버킷에서 세 개의 파일을 `trips` 테이블로 스트리밍합니다(`{0..2}` 구문은 0, 1, 2 값에 대한 와일드카드입니다):

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```
</TabItem>
</Tabs>

## 샘플 쿼리 \{#sample-queries\}

다음 쿼리는 위에서 설명한 샘플 데이터에 대해 실행된 예입니다. 전체 데이터셋에 대해 아래 샘플 쿼리를 실행하려면 [sql.clickhouse.com](https://sql.clickhouse.com/?query=U0VMRUNUIGNvdW50KCkgRlJPTSBueWNfdGF4aS50cmlwcw\&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ0aXRsZSI6IlRlbXBlcmF0dXJlIGJ5IGNvdW50cnkgYW5kIHllYXIiLCJ4YXhpcyI6InllYXIiLCJ5YXhpcyI6ImNvdW50KCkiLCJzZXJpZXMiOiJDQVNUKHBhc3Nlbmdlcl9jb3VudCwgJ1N0cmluZycpIn19)에서 실행하되, 아래 쿼리에서 사용하는 테이블 이름을 `nyc_taxi.trips`로 변경하여 사용하면 됩니다.

삽입된 행 수를 확인해 보겠습니다:

```sql runnable
SELECT count()
FROM nyc_taxi.trips_small;
```

각 TSV 파일에는 행이 약 100만 개씩 있으며, 세 파일의 총 행 수는 3,000,317개입니다. 몇 개의 행을 살펴보겠습니다:

```sql runnable
SELECT *
FROM nyc_taxi.trips_small
LIMIT 10;
```

픽업 및 드롭오프 날짜, 지리 좌표, 요금 세부 정보, 뉴욕 내 지역 등과 관련된 컬럼이 있음을 확인할 수 있습니다.

몇 가지 쿼리를 실행해 보겠습니다. 다음 쿼리는 픽업이 가장 자주 발생한 상위 10개 지역을 보여줍니다.

```sql runnable
SELECT
   pickup_ntaname,
   count(*) AS count
FROM nyc_taxi.trips_small WHERE pickup_ntaname != ''
GROUP BY pickup_ntaname
ORDER BY count DESC
LIMIT 10;
```

이 쿼리는 승객 수별 평균 요금을 보여줍니다:

```sql runnable view='chart' chart_config='eyJ0eXBlIjoiYmFyIiwiY29uZmlnIjp7InhheGlzIjoicGFzc2VuZ2VyX2NvdW50IiwieWF4aXMiOiJhdmcodG90YWxfYW1vdW50KSIsInRpdGxlIjoiQXZlcmFnZSBmYXJlIGJ5IHBhc3NlbmdlciBjb3VudCJ9fQ'
SELECT
   passenger_count,
   avg(total_amount)
FROM nyc_taxi.trips_small
WHERE passenger_count < 10
GROUP BY passenger_count;
```

다음은 승객 수와 이동 거리 사이의 상관관계입니다.

```sql runnable chart_config='eyJ0eXBlIjoiaG9yaXpvbnRhbCBiYXIiLCJjb25maWciOnsieGF4aXMiOiJwYXNzZW5nZXJfY291bnQiLCJ5YXhpcyI6ImRpc3RhbmNlIiwic2VyaWVzIjoiY291bnRyeSIsInRpdGxlIjoiQXZnIGZhcmUgYnkgcGFzc2VuZ2VyIGNvdW50In19'
SELECT
    passenger_count,
    avg(trip_distance) AS distance,
    count() AS c
FROM nyc_taxi.trips_small
GROUP BY passenger_count
ORDER BY passenger_count ASC
```


## 준비된 파티션 다운로드 \{#download-of-prepared-partitions\}

:::note
다음 단계에서는 원본 데이터셋에 대한 정보와, 준비된 파티션을 자가 관리형 ClickHouse 서버 환경에 로드하는 방법을 설명합니다.
:::

데이터셋 설명과 다운로드 방법은 https://github.com/toddwschneider/nyc-taxi-data 및 http://tech.marksblogg.com/billion-nyc-taxi-rides-redshift.html을 참고하십시오.

다운로드가 완료되면 CSV 파일 형태의 압축되지 않은 데이터 약 227GB가 생성됩니다. 1 Gbit 연결에서 다운로드에는 약 1시간이 소요되며, s3.amazonaws.com에서 병렬 다운로드를 사용할 경우 1 Gbit 채널 대역폭의 최소 절반 정도를 활용할 수 있습니다.
일부 파일은 완전히 다운로드되지 않을 수 있습니다. 파일 크기를 확인하여 의심스러운 파일은 다시 다운로드하십시오.

```bash
$ curl -O https://datasets.clickhouse.com/trips_mergetree/partitions/trips_mergetree.tar
# Validate the checksum
$ md5sum trips_mergetree.tar
# Checksum should be equal to: f3b8d469b41d9a82da064ded7245d12c
$ tar xvf trips_mergetree.tar -C /var/lib/clickhouse # path to ClickHouse data directory
$ # check permissions of unpacked data, fix if required
$ sudo service clickhouse-server restart
$ clickhouse-client --query "select count(*) from datasets.trips_mergetree"
```

:::info
아래에서 설명하는 쿼리를 실행하려면 전체 테이블 이름인 `datasets.trips_mergetree`를 사용해야 합니다.
:::


## 단일 서버 결과 \{#results-on-single-server\}

Q1:

```sql
SELECT cab_type, count(*) FROM trips_mergetree GROUP BY cab_type;
```

0.490초.

Q2:

```sql
SELECT passenger_count, avg(total_amount) FROM trips_mergetree GROUP BY passenger_count;
```

1.224초.

Q3:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, count(*) FROM trips_mergetree GROUP BY passenger_count, year;
```

2.104초.

Q4:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, round(trip_distance) AS distance, count(*)
FROM trips_mergetree
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;
```

3.593초.

다음 서버를 사용했습니다:

Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz 2개, 총 16개의 물리 코어, 128 GiB RAM, 8x6 TB HD(하드웨어 RAID-5)

실행 시간은 3회 실행 중 가장 짧은 시간입니다. 단, 두 번째 실행부터는 쿼리가 파일 시스템 캐시에서 데이터를 읽습니다. 이후에는 추가적인 캐싱은 발생하지 않으며, 각 실행마다 데이터를 새로 읽어 처리합니다.

3대의 서버에 테이블 생성:

각 서버에서:


```sql
CREATE TABLE default.trips_mergetree_third ( trip_id UInt32,  vendor_id Enum8('1' = 1, '2' = 2, 'CMT' = 3, 'VTS' = 4, 'DDS' = 5, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14),  pickup_date Date,  pickup_datetime DateTime,  dropoff_date Date,  dropoff_datetime DateTime,  store_and_fwd_flag UInt8,  rate_code_id UInt8,  pickup_longitude Float64,  pickup_latitude Float64,  dropoff_longitude Float64,  dropoff_latitude Float64,  passenger_count UInt8,  trip_distance Float64,  fare_amount Float32,  extra Float32,  mta_tax Float32,  tip_amount Float32,  tolls_amount Float32,  ehail_fee Float32,  improvement_surcharge Float32,  total_amount Float32,  payment_type_ Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),  trip_type UInt8,  pickup FixedString(25),  dropoff FixedString(25),  cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),  pickup_nyct2010_gid UInt8,  pickup_ctlabel Float32,  pickup_borocode UInt8,  pickup_boroname Enum8('' = 0, 'Manhattan' = 1, 'Bronx' = 2, 'Brooklyn' = 3, 'Queens' = 4, 'Staten Island' = 5),  pickup_ct2010 FixedString(6),  pickup_boroct2010 FixedString(7),  pickup_cdeligibil Enum8(' ' = 0, 'E' = 1, 'I' = 2),  pickup_ntacode FixedString(4),  pickup_ntaname Enum16('' = 0, 'Airport' = 1, 'Allerton-Pelham Gardens' = 2, 'Annadale-Huguenot-Prince\'s Bay-Eltingville' = 3, 'Arden Heights' = 4, 'Astoria' = 5, 'Auburndale' = 6, 'Baisley Park' = 7, 'Bath Beach' = 8, 'Battery Park City-Lower Manhattan' = 9, 'Bay Ridge' = 10, 'Bayside-Bayside Hills' = 11, 'Bedford' = 12, 'Bedford Park-Fordham North' = 13, 'Bellerose' = 14, 'Belmont' = 15, 'Bensonhurst East' = 16, 'Bensonhurst West' = 17, 'Borough Park' = 18, 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel' = 19, 'Briarwood-Jamaica Hills' = 20, 'Brighton Beach' = 21, 'Bronxdale' = 22, 'Brooklyn Heights-Cobble Hill' = 23, 'Brownsville' = 24, 'Bushwick North' = 25, 'Bushwick South' = 26, 'Cambria Heights' = 27, 'Canarsie' = 28, 'Carroll Gardens-Columbia Street-Red Hook' = 29, 'Central Harlem North-Polo Grounds' = 30, 'Central Harlem South' = 31, 'Charleston-Richmond Valley-Tottenville' = 32, 'Chinatown' = 33, 'Claremont-Bathgate' = 34, 'Clinton' = 35, 'Clinton Hill' = 36, 'Co-op City' = 37, 'College Point' = 38, 'Corona' = 39, 'Crotona Park East' = 40, 'Crown Heights North' = 41, 'Crown Heights South' = 42, 'Cypress Hills-City Line' = 43, 'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill' = 44, 'Douglas Manor-Douglaston-Little Neck' = 45, 'Dyker Heights' = 46, 'East Concourse-Concourse Village' = 47, 'East Elmhurst' = 48, 'East Flatbush-Farragut' = 49, 'East Flushing' = 50, 'East Harlem North' = 51, 'East Harlem South' = 52, 'East New York' = 53, 'East New York (Pennsylvania Ave)' = 54, 'East Tremont' = 55, 'East Village' = 56, 'East Williamsburg' = 57, 'Eastchester-Edenwald-Baychester' = 58, 'Elmhurst' = 59, 'Elmhurst-Maspeth' = 60, 'Erasmus' = 61, 'Far Rockaway-Bayswater' = 62, 'Flatbush' = 63, 'Flatlands' = 64, 'Flushing' = 65, 'Fordham South' = 66, 'Forest Hills' = 67, 'Fort Greene' = 68, 'Fresh Meadows-Utopia' = 69, 'Ft. Totten-Bay Terrace-Clearview' = 70, 'Georgetown-Marine Park-Bergen Beach-Mill Basin' = 71, 'Glen Oaks-Floral Park-New Hyde Park' = 72, 'Glendale' = 73, 'Gramercy' = 74, 'Grasmere-Arrochar-Ft. Wadsworth' = 75, 'Gravesend' = 76, 'Great Kills' = 77, 'Greenpoint' = 78, 'Grymes Hill-Clifton-Fox Hills' = 79, 'Hamilton Heights' = 80, 'Hammels-Arverne-Edgemere' = 81, 'Highbridge' = 82, 'Hollis' = 83, 'Homecrest' = 84, 'Hudson Yards-Chelsea-Flatiron-Union Square' = 85, 'Hunters Point-Sunnyside-West Maspeth' = 86, 'Hunts Point' = 87, 'Jackson Heights' = 88, 'Jamaica' = 89, 'Jamaica Estates-Holliswood' = 90, 'Kensington-Ocean Parkway' = 91, 'Kew Gardens' = 92, 'Kew Gardens Hills' = 93, 'Kingsbridge Heights' = 94, 'Laurelton' = 95, 'Lenox Hill-Roosevelt Island' = 96, 'Lincoln Square' = 97, 'Lindenwood-Howard Beach' = 98, 'Longwood' = 99, 'Lower East Side' = 100, 'Madison' = 101, 'Manhattanville' = 102, 'Marble Hill-Inwood' = 103, 'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville' = 104, 'Maspeth' = 105, 'Melrose South-Mott Haven North' = 106, 'Middle Village' = 107, 'Midtown-Midtown South' = 108, 'Midwood' = 109, 'Morningside Heights' = 110, 'Morrisania-Melrose' = 111, 'Mott Haven-Port Morris' = 112, 'Mount Hope' = 113, 'Murray Hill' = 114, 'Murray Hill-Kips Bay' = 115, 'New Brighton-Silver Lake' = 116, 'New Dorp-Midland Beach' = 117, 'New Springville-Bloomfield-Travis' = 118, 'North Corona' = 119, 'North Riverdale-Fieldston-Riverdale' = 120, 'North Side-South Side' = 121, 'Norwood' = 122, 'Oakland Gardens' = 123, 'Oakwood-Oakwood Beach' = 124, 'Ocean Hill' = 125, 'Ocean Parkway South' = 126, 'Old Astoria' = 127, 'Old Town-Dongan Hills-South Beach' = 128, 'Ozone Park' = 129, 'Park Slope-Gowanus' = 130, 'Parkchester' = 131, 'Pelham Bay-Country Club-City Island' = 132, 'Pelham Parkway' = 133, 'Pomonok-Flushing Heights-Hillcrest' = 134, 'Port Richmond' = 135, 'Prospect Heights' = 136, 'Prospect Lefferts Gardens-Wingate' = 137, 'Queens Village' = 138, 'Queensboro Hill' = 139, 'Queensbridge-Ravenswood-Long Island City' = 140, 'Rego Park' = 141, 'Richmond Hill' = 142, 'Ridgewood' = 143, 'Rikers Island' = 144, 'Rosedale' = 145, 'Rossville-Woodrow' = 146, 'Rugby-Remsen Village' = 147, 'Schuylerville-Throgs Neck-Edgewater Park' = 148, 'Seagate-Coney Island' = 149, 'Sheepshead Bay-Gerritsen Beach-Manhattan Beach' = 150, 'SoHo-TriBeCa-Civic Center-Little Italy' = 151, 'Soundview-Bruckner' = 152, 'Soundview-Castle Hill-Clason Point-Harding Park' = 153, 'South Jamaica' = 154, 'South Ozone Park' = 155, 'Springfield Gardens North' = 156, 'Springfield Gardens South-Brookville' = 157, 'Spuyten Duyvil-Kingsbridge' = 158, 'St. Albans' = 159, 'Stapleton-Rosebank' = 160, 'Starrett City' = 161, 'Steinway' = 162, 'Stuyvesant Heights' = 163, 'Stuyvesant Town-Cooper Village' = 164, 'Sunset Park East' = 165, 'Sunset Park West' = 166, 'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill' = 167, 'Turtle Bay-East Midtown' = 168, 'University Heights-Morris Heights' = 169, 'Upper East Side-Carnegie Hill' = 170, 'Upper West Side' = 171, 'Van Cortlandt Village' = 172, 'Van Nest-Morris Park-Westchester Square' = 173, 'Washington Heights North' = 174, 'Washington Heights South' = 175, 'West Brighton' = 176, 'West Concourse' = 177, 'West Farms-Bronx River' = 178, 'West New Brighton-New Brighton-St. George' = 179, 'West Village' = 180, 'Westchester-Unionport' = 181, 'Westerleigh' = 182, 'Whitestone' = 183, 'Williamsbridge-Olinville' = 184, 'Williamsburg' = 185, 'Windsor Terrace' = 186, 'Woodhaven' = 187, 'Woodlawn-Wakefield' = 188, 'Woodside' = 189, 'Yorkville' = 190, 'park-cemetery-etc-Bronx' = 191, 'park-cemetery-etc-Brooklyn' = 192, 'park-cemetery-etc-Manhattan' = 193, 'park-cemetery-etc-Queens' = 194, 'park-cemetery-etc-Staten Island' = 195),  pickup_puma UInt16,  dropoff_nyct2010_gid UInt8,  dropoff_ctlabel Float32,  dropoff_borocode UInt8,  dropoff_boroname Enum8('' = 0, 'Manhattan' = 1, 'Bronx' = 2, 'Brooklyn' = 3, 'Queens' = 4, 'Staten Island' = 5),  dropoff_ct2010 FixedString(6),  dropoff_boroct2010 FixedString(7),  dropoff_cdeligibil Enum8(' ' = 0, 'E' = 1, 'I' = 2),  dropoff_ntacode FixedString(4),  dropoff_ntaname Enum16('' = 0, 'Airport' = 1, 'Allerton-Pelham Gardens' = 2, 'Annadale-Huguenot-Prince\'s Bay-Eltingville' = 3, 'Arden Heights' = 4, 'Astoria' = 5, 'Auburndale' = 6, 'Baisley Park' = 7, 'Bath Beach' = 8, 'Battery Park City-Lower Manhattan' = 9, 'Bay Ridge' = 10, 'Bayside-Bayside Hills' = 11, 'Bedford' = 12, 'Bedford Park-Fordham North' = 13, 'Bellerose' = 14, 'Belmont' = 15, 'Bensonhurst East' = 16, 'Bensonhurst West' = 17, 'Borough Park' = 18, 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel' = 19, 'Briarwood-Jamaica Hills' = 20, 'Brighton Beach' = 21, 'Bronxdale' = 22, 'Brooklyn Heights-Cobble Hill' = 23, 'Brownsville' = 24, 'Bushwick North' = 25, 'Bushwick South' = 26, 'Cambria Heights' = 27, 'Canarsie' = 28, 'Carroll Gardens-Columbia Street-Red Hook' = 29, 'Central Harlem North-Polo Grounds' = 30, 'Central Harlem South' = 31, 'Charleston-Richmond Valley-Tottenville' = 32, 'Chinatown' = 33, 'Claremont-Bathgate' = 34, 'Clinton' = 35, 'Clinton Hill' = 36, 'Co-op City' = 37, 'College Point' = 38, 'Corona' = 39, 'Crotona Park East' = 40, 'Crown Heights North' = 41, 'Crown Heights South' = 42, 'Cypress Hills-City Line' = 43, 'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill' = 44, 'Douglas Manor-Douglaston-Little Neck' = 45, 'Dyker Heights' = 46, 'East Concourse-Concourse Village' = 47, 'East Elmhurst' = 48, 'East Flatbush-Farragut' = 49, 'East Flushing' = 50, 'East Harlem North' = 51, 'East Harlem South' = 52, 'East New York' = 53, 'East New York (Pennsylvania Ave)' = 54, 'East Tremont' = 55, 'East Village' = 56, 'East Williamsburg' = 57, 'Eastchester-Edenwald-Baychester' = 58, 'Elmhurst' = 59, 'Elmhurst-Maspeth' = 60, 'Erasmus' = 61, 'Far Rockaway-Bayswater' = 62, 'Flatbush' = 63, 'Flatlands' = 64, 'Flushing' = 65, 'Fordham South' = 66, 'Forest Hills' = 67, 'Fort Greene' = 68, 'Fresh Meadows-Utopia' = 69, 'Ft. Totten-Bay Terrace-Clearview' = 70, 'Georgetown-Marine Park-Bergen Beach-Mill Basin' = 71, 'Glen Oaks-Floral Park-New Hyde Park' = 72, 'Glendale' = 73, 'Gramercy' = 74, 'Grasmere-Arrochar-Ft. Wadsworth' = 75, 'Gravesend' = 76, 'Great Kills' = 77, 'Greenpoint' = 78, 'Grymes Hill-Clifton-Fox Hills' = 79, 'Hamilton Heights' = 80, 'Hammels-Arverne-Edgemere' = 81, 'Highbridge' = 82, 'Hollis' = 83, 'Homecrest' = 84, 'Hudson Yards-Chelsea-Flatiron-Union Square' = 85, 'Hunters Point-Sunnyside-West Maspeth' = 86, 'Hunts Point' = 87, 'Jackson Heights' = 88, 'Jamaica' = 89, 'Jamaica Estates-Holliswood' = 90, 'Kensington-Ocean Parkway' = 91, 'Kew Gardens' = 92, 'Kew Gardens Hills' = 93, 'Kingsbridge Heights' = 94, 'Laurelton' = 95, 'Lenox Hill-Roosevelt Island' = 96, 'Lincoln Square' = 97, 'Lindenwood-Howard Beach' = 98, 'Longwood' = 99, 'Lower East Side' = 100, 'Madison' = 101, 'Manhattanville' = 102, 'Marble Hill-Inwood' = 103, 'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville' = 104, 'Maspeth' = 105, 'Melrose South-Mott Haven North' = 106, 'Middle Village' = 107, 'Midtown-Midtown South' = 108, 'Midwood' = 109, 'Morningside Heights' = 110, 'Morrisania-Melrose' = 111, 'Mott Haven-Port Morris' = 112, 'Mount Hope' = 113, 'Murray Hill' = 114, 'Murray Hill-Kips Bay' = 115, 'New Brighton-Silver Lake' = 116, 'New Dorp-Midland Beach' = 117, 'New Springville-Bloomfield-Travis' = 118, 'North Corona' = 119, 'North Riverdale-Fieldston-Riverdale' = 120, 'North Side-South Side' = 121, 'Norwood' = 122, 'Oakland Gardens' = 123, 'Oakwood-Oakwood Beach' = 124, 'Ocean Hill' = 125, 'Ocean Parkway South' = 126, 'Old Astoria' = 127, 'Old Town-Dongan Hills-South Beach' = 128, 'Ozone Park' = 129, 'Park Slope-Gowanus' = 130, 'Parkchester' = 131, 'Pelham Bay-Country Club-City Island' = 132, 'Pelham Parkway' = 133, 'Pomonok-Flushing Heights-Hillcrest' = 134, 'Port Richmond' = 135, 'Prospect Heights' = 136, 'Prospect Lefferts Gardens-Wingate' = 137, 'Queens Village' = 138, 'Queensboro Hill' = 139, 'Queensbridge-Ravenswood-Long Island City' = 140, 'Rego Park' = 141, 'Richmond Hill' = 142, 'Ridgewood' = 143, 'Rikers Island' = 144, 'Rosedale' = 145, 'Rossville-Woodrow' = 146, 'Rugby-Remsen Village' = 147, 'Schuylerville-Throgs Neck-Edgewater Park' = 148, 'Seagate-Coney Island' = 149, 'Sheepshead Bay-Gerritsen Beach-Manhattan Beach' = 150, 'SoHo-TriBeCa-Civic Center-Little Italy' = 151, 'Soundview-Bruckner' = 152, 'Soundview-Castle Hill-Clason Point-Harding Park' = 153, 'South Jamaica' = 154, 'South Ozone Park' = 155, 'Springfield Gardens North' = 156, 'Springfield Gardens South-Brookville' = 157, 'Spuyten Duyvil-Kingsbridge' = 158, 'St. Albans' = 159, 'Stapleton-Rosebank' = 160, 'Starrett City' = 161, 'Steinway' = 162, 'Stuyvesant Heights' = 163, 'Stuyvesant Town-Cooper Village' = 164, 'Sunset Park East' = 165, 'Sunset Park West' = 166, 'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill' = 167, 'Turtle Bay-East Midtown' = 168, 'University Heights-Morris Heights' = 169, 'Upper East Side-Carnegie Hill' = 170, 'Upper West Side' = 171, 'Van Cortlandt Village' = 172, 'Van Nest-Morris Park-Westchester Square' = 173, 'Washington Heights North' = 174, 'Washington Heights South' = 175, 'West Brighton' = 176, 'West Concourse' = 177, 'West Farms-Bronx River' = 178, 'West New Brighton-New Brighton-St. George' = 179, 'West Village' = 180, 'Westchester-Unionport' = 181, 'Westerleigh' = 182, 'Whitestone' = 183, 'Williamsbridge-Olinville' = 184, 'Williamsburg' = 185, 'Windsor Terrace' = 186, 'Woodhaven' = 187, 'Woodlawn-Wakefield' = 188, 'Woodside' = 189, 'Yorkville' = 190, 'park-cemetery-etc-Bronx' = 191, 'park-cemetery-etc-Brooklyn' = 192, 'park-cemetery-etc-Manhattan' = 193, 'park-cemetery-etc-Queens' = 194, 'park-cemetery-etc-Staten Island' = 195),  dropoff_puma UInt16) ENGINE = MergeTree(pickup_date, pickup_datetime, 8192);
```

소스 서버에서:

```sql
CREATE TABLE trips_mergetree_x3 AS trips_mergetree_third ENGINE = Distributed(perftest, default, trips_mergetree_third, rand());
```

다음 쿼리는 데이터를 재분배합니다:

```sql
INSERT INTO trips_mergetree_x3 SELECT * FROM trips_mergetree;
```

이 작업에는 2454초가 소요됩니다.

서버 3대에서:

Q1: 0.212초.
Q2: 0.438초.
Q3: 0.733초.
Q4: 1.241초.

쿼리가 선형적으로 확장되기 때문에 놀랄 만한 부분은 없습니다.

서버 140대로 구성된 클러스터에서 얻은 결과도 있습니다:

Q1: 0.028초.
Q2: 0.043초.
Q3: 0.051초.
Q4: 0.072초.

이 경우 쿼리 처리 시간은 주로 네트워크 지연에 의해 결정됩니다.
클러스터가 위치한 데이터 센터와는 다른 데이터 센터에 위치한 클라이언트에서 쿼리를 실행하여, 약 20ms의 추가 지연이 발생했습니다.


## 요약 \{#summary\}

| 서버 수 | Q1    | Q2    | Q3    | Q4    |
|---------|-------|-------|-------|-------|
| 1, E5-2650v2          | 0.490 | 1.224 | 2.104 | 3.593 |
| 3, E5-2650v2          | 0.212 | 0.438 | 0.733 | 1.241 |
| 1, AWS c5n.4xlarge    | 0.249 | 1.279 | 1.738 | 3.527 |
| 1, AWS c5n.9xlarge    | 0.130 | 0.584 | 0.777 | 1.811 |
| 3, AWS c5n.9xlarge    | 0.057 | 0.231 | 0.285 | 0.641 |
| 140, E5-2650v2        | 0.028 | 0.043 | 0.051 | 0.072 |