---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': 'S3와 ClickHouse 통합하기'
'title': 'S3와 ClickHouse 통합하기'
'description': 'S3와 ClickHouse를 통합하는 방법을 설명하는 페이지'
'keywords':
- 'Amazon S3'
- 'object storage'
- 'cloud storage'
- 'data lake'
- 'S3 integration'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
---

import BucketDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# Integrating S3 with ClickHouse

S3에서 ClickHouse로 데이터를 삽입할 수 있으며, S3를 내보내기 목적지로 사용할 수도 있어 "데이터 레이크" 아키텍처와의 상호작용을 가능하게 합니다. 또한 S3는 "콜드" 스토리지 계층을 제공하고 저장소와 컴퓨팅 분리를 지원합니다. 아래 섹션에서는 뉴욕시 택시 데이터 세트를 사용하여 S3와 ClickHouse 간의 데이터 이동 프로세스를 시연하고, 주요 구성 매개변수를 식별하고 성능 최적화에 대한 힌트를 제공합니다.

## S3 table functions {#s3-table-functions}

`s3` 테이블 함수는 S3 호환 스토리지에서 파일을 읽고 쓸 수 있도록 합니다. 이 구문에 대한 개요는 다음과 같습니다:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

여기서:

* path — 파일의 경로가 포함된 버킷 URL. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `?`, `{abc,def}` 및 `{N..M}` 여기서 `N`, `M`은 숫자, `'abc'`, `'def'`는 문자열입니다. 더 많은 정보는 [사용할 수 있는 와일드카드](https://engines/table-engines/integrations/s3/#wildcards-in-path) 문서를 참조하십시오.
* format — 파일의 [형식](../../interfaces/formats#formats-overview).
* structure — 테이블의 구조. 형식 `'column1_name column1_type, column2_name column2_type, ...'`.
* compression — 매개변수는 선택 사항입니다. 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 파일 확장자를 통해 압축을 자동으로 감지합니다.

경로 표현에서 와일드카드를 사용하면 여러 파일을 참조할 수 있으며 병렬성을 열어줍니다.

### Preparation {#preparation}

ClickHouse에서 테이블을 만들기 전에 S3 버킷의 데이터에 더 가까이 다가가고 싶을 수 있습니다. ClickHouse에서 직접 `DESCRIBE` 문을 사용하여 이 작업을 수행할 수 있습니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` 문 출력은 ClickHouse가 S3 버킷에서 어떻게 이 데이터를 자동으로 추론할지를 보여줍니다. gzip 압축 형식도 자동으로 인식하고 압축 해제하는 것을 주목하십시오:

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

S3 기반 데이터 세트와 상호작용하기 위해 `MergeTree` 테이블을 표준으로 준비합니다. 아래 문은 기본 데이터베이스에 `trips`라는 테이블을 생성합니다. 위에서 추론된 데이터 유형 중 일부를 수정하기로 선택했습니다. 특히 불필요하게 추가 저장된 데이터와 일부 성능 오버헤드를 초래할 수 있는 [`Nullable()`](/sql-reference/data-types/nullable) 데이터 유형 수식어를 사용하지 않기로 했습니다:

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

`pickup_date` 필드에 대한 [파티셔닝](../../engines/table-engines/mergetree-family/custom-partitioning-key) 사용을 주목하십시오. 일반적으로 파티션 키는 데이터 관리를 위한 것이지만, 나중에 S3에 대한 쓰기를 병렬화하기 위해 이 키를 사용할 것입니다.

택시 데이터 세트의 각 항목은 택시 여행을 포함합니다. 이 익명화된 데이터는 S3 버킷 https://datasets-documentation.s3.eu-west-3.amazonaws.com/의 **nyc-taxi** 폴더에 압축된 2000만 개의 레코드로 구성됩니다. 데이터는 TSV 형식으로 약 1M 행이 포함된 파일마다 존재합니다.

### Reading Data from S3 {#reading-data-from-s3}

ClickHouse에 지속성을 요구하지 않고 S3 데이터를 소스로 쿼리할 수 있습니다. 다음 쿼리에서 우리는 10개 행을 샘플링합니다. 여기에서는 버킷이 공개적으로 접근 가능하므로 자격 증명이 필요하지 않음을 주목하십시오:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames` 형식은 첫 번째 행에 열 이름을 인코딩하므로 열 목록을 나열할 필요가 없습니다. `CSV` 또는 `TSV`와 같은 다른 형식은 이 쿼리에 대해 자동으로 생성된 열을 반환합니다. 예를 들어 `c1`, `c2`, `c3` 등이 될 수 있습니다.

쿼리는 또한 각각 버킷 경로와 파일 이름에 대한 정보를 제공하는 [가상 열](../sql-reference/table-functions/s3#virtual-columns)인 `_path` 및 `_file`을 지원합니다. 예를 들어:

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

이 샘플 데이터 세트의 행 수를 확인하십시오. 파일 확장을 위한 와일드카드의 사용을 주목하십시오. 이 쿼리는 ClickHouse 인스턴스의 코어 수에 따라 약 10초가 소요될 것입니다:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

데이터를 샘플링하고 즉석에서 탐색 쿼리를 실행하는 데는 유용하지만, S3에서 직접 데이터를 읽는 것은 정기적으로 하고 싶지 않습니다. 진지하게 진행할 때는 ClickHouse의 `MergeTree` 테이블로 데이터를 가져오십시오.

### Using clickhouse-local {#using-clickhouse-local}

`clickhouse-local` 프로그램을 사용하면 ClickHouse 서버를 배포하고 구성하지 않고도 로컬 파일에서 빠른 처리를 수행할 수 있습니다. `s3` 테이블 함수를 사용하는 쿼리는 이 유틸리티로 수행할 수 있습니다. 예를 들어:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### Inserting Data from S3 {#inserting-data-from-s3}

ClickHouse의 모든 기능을 활용하기 위해 다음으로 데이터를 읽고 인스턴스에 삽입합니다. 이를 달성하기 위해 우리 `s3` 함수와 간단한 `INSERT` 문을 결합합니다. 목표 테이블이 필요한 구조를 제공하므로 열 목록을 나열할 필요가 없음을 주목하십시오. 이는 테이블 DDL 문에 지정된 순서로 열이 나타나야 함을 필요로 합니다: 열은 `SELECT` 절의 위치에 따라 매핑됩니다. 모든 1000만 개 행을 삽입하는 데는 ClickHouse 인스턴스에 따라 몇 분이 걸릴 수 있습니다. 아래에서는 신속한 응답을 보장하기 위해 100만 개 행을 삽입합니다. 필요한 경우 하위 집합을 가져오기 위해 `LIMIT` 절이나 열 선택을 조정하십시오:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### Remote Insert using ClickHouse Local {#remote-insert-using-clickhouse-local}

네트워크 보안 정책이 ClickHouse 클러스터가 아웃바운드 연결을 수행하지 못하게 할 경우, `clickhouse-local`을 사용하여 S3 데이터를 삽입할 수 있습니다. 아래 예에서는 S3 버킷에서 데이터를 읽고 `remote` 함수를 사용하여 ClickHouse에 삽입합니다:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
안전한 SSL 연결에서 이를 실행하려면 `remoteSecure` 함수를 사용하십시오.
:::

### Exporting data {#exporting-data}

`s3` 테이블 함수를 사용하여 S3의 파일에 쓸 수 있습니다. 이는 적절한 권한이 필요합니다. 요청에서 필요한 자격 증명을 전달하지만 더 많은 옵션은 [Managing Credentials](#managing-credentials) 페이지를 참조하십시오.

아래의 간단한 예에서 우리는 원본 대신 목적지로 테이블 함수를 사용합니다. 여기서 `trips` 테이블에서 버킷으로 10,000 행을 스트리밍하며 `lz4` 압축 및 `CSV` 출력 유형을 지정합니다:

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

파일 형식이 확장자로부터 유추되는 방식을 주목하십시오. `s3` 함수에서 열을 지정할 필요가 없으며, 이는 `SELECT`에서 추론될 수 있습니다.

### Splitting large files {#splitting-large-files}

데이터를 단일 파일로 내보내고 싶어할 가능성은 낮습니다. ClickHouse를 포함한 대부분의 도구는 병렬성을 통해 여러 파일을 읽고 쓸 때 높은 처리량 성능을 달성합니다. 우리는 `INSERT` 명령을 여러 번 실행하여 데이터의 하위 집합을 목표로 설정할 수 있습니다. ClickHouse는 `PARTITION` 키를 사용하여 자동으로 파일을 분할할 수 있는 기능을 제공합니다.

아래 예에서는 `rand()` 함수의 모듈러스를 사용하여 10개의 파일을 생성합니다. 결과로 나타나는 파티션 ID가 파일 이름에 참조되는 방식을 주목하십시오. 이는 숫자 접미사가 있는 10개 파일을 생성합니다. 예를 들어 `trips_0.csv.lz4`, `trips_1.csv.lz4` 등입니다:

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

또한 데이터의 필드를 참조할 수 있습니다. 이 데이터 세트의 경우 `payment_type`은 5개의 기수로 자연스러운 파티셔닝 키를 제공합니다.

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

### Utilizing clusters {#utilizing-clusters}

위의 함수는 모두 단일 노드에서 실행으로 제한됩니다. 읽기 속도는 CPU 코어 수에 따라 선형적으로 확장되며, 다른 리소스(일반적으로 네트워크)가 포화될 때까지 사용자가 수직으로 확장할 수 있게 합니다. 그러나 이 접근 방법에는 한계가 있습니다. 사용자는 `INSERT INTO SELECT` 쿼리를 수행할 때 분산 테이블에 삽입하여 일부 리소스 압력을 줄일 수 있지만, 여전히 데이터를 읽고 구문 분석하고 처리하는 단일 노드가 남아 있습니다. 이러한 문제를 해결하고 수평적으로 읽기를 확장할 수 있도록 [s3Cluster](/sql-reference/table-functions/s3Cluster.md) 기능이 있습니다.

쿼리를 수신하는 노드, 즉 발신자는 클러스터의 모든 노드에 대한 연결을 생성합니다. 읽어야 하는 파일을 결정하는 glob 패턴은 파일 집합으로 해결됩니다. 발신자는 클러스터의 노드에 파일을 배포하며, 이들은 작업자로서 작용합니다. 이러한 작업자는 읽기가 완료되면 처리할 파일을 요청합니다. 이 프로세스는 수평적으로 읽기를 확장할 수 있도록 보장합니다.

`s3Cluster` 함수는 단일 노드 변형과 동일한 형식을 사용하지만, 작업자 노드를 나타내기 위해 대상을 지정해야 합니다:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — 원격 및 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.
* `source` — 파일 또는 여러 파일의 URL입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `?`, `{'abc','def'}` 및 `{N..M}` 어디서 N, M은 숫자, abc, def는 문자열입니다. 자세한 사항은 [Wildcards In Path](../../engines/table-engines/integrations/s3.md/#wildcards-in-path)에서 확인하십시오.
* `access_key_id` 및 `secret_access_key` — 주어진 엔드포인트와 함께 사용할 자격 증명을 지정하는 키입니다. 선택 사항입니다.
* `format` — 파일의 [형식](../../interfaces/formats#formats-overview).
* `structure` — 테이블의 구조. 형식 'column1_name column1_type, column2_name column2_type, ...'입니다.

모든 `s3` 함수와 마찬가지로 버킷이 안전하지 않거나 환경을 통해 보안을 정의하는 경우, 자격 증명은 선택 사항입니다. 그러나 s3 함수와 달리 22.3.1부터는 요청에 스키마를 명시해야 하므로 구조를 명시해야 합니다.

이 함수는 대부분의 경우 `INSERT INTO SELECT`의 일부로 사용됩니다. 이 경우 분산 테이블을 삽입하는 경우가 많습니다. 아래에서 trips_all이 분산 테이블인 간단한 예를 설명합니다. 이 테이블은 events 클러스터를 사용하지만, 읽기 및 쓰기에 사용되는 노드의 일관성은 필수가 아닙니다:

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

삽입은 발신자 노드를 기준으로 발생합니다. 즉, 읽기는 각 노드에서 발생하지만 결과적으로 생성된 행은 배포를 위해 발신자로 라우팅됩니다. 높은 처리량 시나리오에서는 병목 현상이 발생할 수 있습니다. 이를 해결하기 위해 `s3cluster` 함수에 대한 [parallel_distributed_insert_select](../../operations/settings/settings/#parallel_distributed_insert_select) 매개변수를 설정하십시오.

## S3 table engines {#s3-table-engines}

`s3` 함수는 S3에 저장된 데이터에 대해 즉석 쿼리를 수행할 수 있게 하지만, 문법적으로는 장황하다는 단점이 있습니다. `S3` 테이블 엔진은 버킷 URL과 자격 증명을 반복해서 지정할 필요가 없도록 합니다. 이를 위해 ClickHouse는 S3 테이블 엔진을 제공합니다.

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — 파일의 경로가 포함된 버킷 URL. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `?`, `{abc,def}` 및 `{N..M}` 여기서 N, M은 숫자, 'abc', 'def'는 문자열입니다. 자세한 정보는 [여기](../../engines/table-engines/integrations/s3#wildcards-in-path)에서 확인하십시오.
* `format` — 파일의 [형식](../../interfaces/formats#formats-overview).
* `aws_access_key_id`, `aws_secret_access_key` - AWS 계정 사용자에 대한 장기 자격 증명입니다. 이는 요청 인증에 사용될 수 있습니다. 매개변수는 선택 사항입니다. 자격 증명이 지정되지 않은 경우 구성 파일 값을 사용합니다. 자세한 사항은 [Managing credentials](#managing-credentials)에서 확인하십시오.
* `compression` — 압축 유형입니다. 지원되는 값: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst. 매개변수는 선택 사항입니다. 기본적으로 파일 확장자를 통해 압축을 자동으로 감지합니다.

### Reading data {#reading-data}

다음 예제에서, 우리는 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` 버킷에 위치한 첫 10개의 TSV 파일을 사용하여 `trips_raw`라는 테이블을 생성합니다. 각 파일은 100만 개의 행을 포함하고 있습니다:

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

 `{0..9}` 패턴을 사용하여 첫 10개의 파일로 제한하는 방식을 주목하십시오. 생성된 후, 이 테이블을 다른 테이블처럼 쿼리할 수 있습니다:

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

### Inserting data {#inserting-data}

`S3` 테이블 엔진은 병렬 읽기를 지원합니다. 테이블 정의에 glob 패턴이 포함되지 않은 경우에만 쓰기가 지원됩니다. 따라서 위 테이블은 쓰기를 차단합니다.

쓰기를 시자미 도음을 보여주기 위해 쓰기가 가능한 S3 버킷을 가리키는 테이블을 생성합니다:

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

행은 새 파일로만 삽입될 수 있습니다. 병합 주기나 파일 분할 작업이 없습니다. 파일이 작성된 후에는 이후 삽입이 실패합니다. 이 경우 사용자는 두 가지 선택이 있습니다:

* 설정 `s3_create_new_file_on_insert=1`을 지정합니다. 이렇게 하면 각 삽입 시 새 파일이 생성됩니다. 각 파일 끝에 숫자 접미사가 추가되어 각 삽입 작업에 대해 단조롭게 증가합니다. 위의 예에서, 이후 삽입은 trips_1.bin 파일을 생성할 것입니다.
* 설정 `s3_truncate_on_insert=1`을 지정합니다. 이렇게 하면 파일이 잘리며, 즉 파일은 완료될 때까지 새로 삽입된 행만 포함하게 됩니다.

이 두 설정은 기본적으로 0이며, 따라서 사용자에게 둘 중 하나를 설정하도록 강요합니다. `s3_truncate_on_insert`가 둘 다 설정된 경우 우선합니다.

`S3` 테이블 엔진에 대한 몇 가지 주의 사항:

- 전통적인 `MergeTree` 가족 테이블과 달리 `S3` 테이블을 삭제해도 기본 데이터는 삭제되지 않습니다.
- 이 테이블 유형의 전체 설정은 [여기](../../engines/table-engines/integrations/s3.md/#settings)에서 찾을 수 있습니다.
- 이 엔진을 사용할 때 다음과 같은 주의 사항을 유념하십시오:
  * ALTER 쿼리는 지원되지 않습니다.
  * SAMPLE 작업은 지원되지 않습니다.
  * 인덱스 개념이 없으며, 즉 기본 키나 스킵이 없습니다.

## Managing credentials {#managing-credentials}

이전 예제에서는 `s3` 함수나 `S3` 테이블 정의에서 자격 증명을 전달했습니다. 이는 가끔 사용에는 괜찮지만, 사용자는 프로덕션에서 덜 명시적인 인증 메커니즘이 필요합니다. 이를 해결하기 위해 ClickHouse는 여러 가지 옵션을 제공합니다:

* **config.xml** 또는 **conf.d** 아래의 동등한 구성 파일에 연결 세부정보를 지정합니다. 다음은 debian 패키지로 설치한 경우를 가정한 예제 파일의 내용입니다.

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

    이러한 자격 증명은 위의 엔드포인트가 요청된 URL과 정확히 접두사가 일치하는 요청에 대해 사용됩니다. 또한 이 예에서는 접근 및 비밀 키 대신 인증 헤더를 선언할 수 있는 기능을 주목하십시오. 지원되는 설정의 전체 목록은 [여기](../../engines/table-engines/integrations/s3.md/#settings)에서 확인할 수 있습니다.

* 위의 예제에서 `use_environment_credentials` 설정의 가용성을 강조하고 있습니다. 이 구성 매개변수는 또한 `s3` 수준에서 전역적으로 설정할 수 있습니다:

```xml
<clickhouse>
    <s3>
    <use_environment_credentials>true</use_environment_credentials>
    </s3>
</clickhouse>
```

    이 설정은 환경에서 S3 자격 증명을 검색하려고 시도하도록 하여 IAM 역할을 통한 접근을 허용합니다. 특히, 다음과 같은 검색 순서가 수행됩니다:

  * 환경 변수 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` 및 `AWS_SESSION_TOKEN` 조회
  * **$HOME/.aws**에서 확인
  * AWS 보안 토큰 서비스에서 임시 자격 증명 확보 - 즉 [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API를 통해
  * ECS 환경 변수 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` 또는 `AWS_CONTAINER_CREDENTIALS_FULL_URI` 및 `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`에서 자격 증명 확인
  * [AWS EC2 인스턴스 메타데이터](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)에서 자격 증명 확보 및 [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED)가 true로 설정되어 있지 않아야 함
  * 이러한 동일한 설정은 특정 엔드포인트에 대해 설정할 수도 있으며, 동일한 접두사 매칭 규칙을 사용할 수 있습니다.

## Optimizing for performance {#s3-optimizing-performance}

S3 함수를 사용한 읽기 및 삽입을 최적화하는 방법에 대한 [전용 성능 가이드](./performance.md)를 참조하십시오.

### S3 storage tuning {#s3-storage-tuning}

내부적으로 ClickHouse merge tree는 두 가지 주요 스토리지 형식을 사용합니다: [`Wide` and `Compact`](../../engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage). 현재 구현은 ClickHouse의 기본 동작을 사용하며(`min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정을 통해 제어됨), 향후 릴리스에서는 S3에 대한 동작이 다를 것으로 예상됩니다. 예를 들어, 더 큰 기본값의 `min_bytes_for_wide_part`는 더 `Compact` 형식을 유도하고 결과적으로 파일 수를 줄이게 됩니다. 사용자는 전적으로 S3 스토리지를 사용할 때 이러한 설정을 조정할 수 있습니다.

## S3 backed MergeTree {#s3-backed-mergetree}

`s3` 함수와 관련된 테이블 엔진을 통해 ClickHouse 구문을 사용하여 S3의 데이터를 쿼리할 수 있습니다. 그러나 데이터 관리 기능과 성능 측면에서는 제한이 없습니다. 기본 인덱스에 대한 지원이 없고, 캐시 지원이 없으며, 파일 삽입은 사용자가 관리해야 합니다.

ClickHouse는 S3가 매력적인 스토리지 솔루션을 제공함을 인식하고 있으며, 특히 "콜드" 데이터에 대해 쿼리 성능이 덜 중요할 때와 사용자들이 저장소와 컴퓨팅의 분리를 추구할 때입니다. 이를 달성하기 위해 MergeTree 엔진에 대한 저장소로 S3를 사용할 수 있도록 지원합니다. 이는 사용자가 S3의 확장성과 비용 혜택, MergeTree 엔진의 삽입 및 쿼리 성능을 활용할 수 있게 합니다.

### Storage Tiers {#storage-tiers}

ClickHouse 스토리지 볼륨은 MergeTree 테이블 엔진에서 물리적인 디스크를 추象화할 수 있게 합니다. 단일 볼륨은 정렬된 디스크 집합으로 구성될 수 있습니다. 원칙적으로 데이터 저장을 위해 여러 블록 장치를 사용할 수 있도록 허용하는 이 추상화는 S3와 같은 다른 스토리지 유형도 포함합니다. ClickHouse 데이터 파트를 볼륨 간에 이동시키고 저장 정책에 따라 충족률을 조정할 수 있으므로 저장소 계층의 개념을 생성합니다.

스토리지 계층은 가장 최근의 데이터, 즉 일반적으로 가장 많이 쿼리되는 데이터가 고성능 저장소, 예를 들어 NVMe SSD에서 소량의 공간만 필요하도록 하는 핫-콜드 아키텍처를 잠금 해제합니다. 데이터가 나이가 들어감에 따라 쿼리 시간의 SLA가 증가하고 쿼리 빈도도 증가합니다. 이 두꺼운 꼬리 데이터는 느리고 성능이 낮은 저장소, 예를 들어 HDD 또는 S3와 같은 객체 저장소에 저장될 수 있습니다.

### Creating a disk {#creating-a-disk}

S3 버킷을 디스크로 사용하려면 먼저 ClickHouse 구성 파일 내에서 선언해야 합니다. config.xml을 확장하거나 선호하는 경우 conf.d 아래에 새 파일을 제공하십시오. S3 디스크 선언의 예는 아래와 같습니다:

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

이 디스크 선언과 관련된 설정의 전체 목록은 [여기](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)에서 찾을 수 있습니다. 이곳에서는 [Managing credentials](#managing-credentials)에서 설명한 것과 동일한 접근 방식을 사용하여 자격 증명을 관리할 수 있으며, 위의 설정 블록에서 use_environment_credentials를 true로 설정하여 IAM 역할을 사용할 수 있습니다.

### Creating a storage policy {#creating-a-storage-policy}

구성이 완료되면 이 "디스크"는 정책 내에서 선언된 스토리지 볼륨에서 사용할 수 있습니다. 아래 예에서는 s3가 우리의 유일한 스토리지라고 가정합니다. 이는 TTL 및 충족률에 따라 데이터가 재배치될 수 있는 더 복잡한 핫-콜드 아키텍처를 무시합니다.

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

### Creating a table {#creating-a-table}

디스크가 쓰기 접근이 가능한 버킷을 사용하도록 구성되었다고 가정할 때, 아래의 예제와 같은 테이블을 생성할 수 있어야 합니다. 간결성을 위해 NYC 택시 컬럼의 하위 집합을 사용하고 데이터를 s3 백업 테이블에 직접 스트리밍합니다:

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

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

하드웨어에 따라 이 후자의 100만 행 삽입은 몇 분 정도 소요될 수 있습니다. system.processes 테이블을 통해 진행状況을 확인할 수 있습니다. 행 수를 1000만 개의 한도까지 조정해보시고 샘플 쿼리를 탐색해보세요.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### Modifying a table {#modifying-a-table}

때때로 사용자는 특정 테이블의 저장 정책을 수정해야 할 필요가 있을 수 있습니다. 이는 가능하지만 한계가 있는 사항입니다. 새로운 대상 정책은 이전 정책의 모든 디스크 및 볼륨을 포함해야 합니다. 즉, 정책 변경을 만족시키기 위해 데이터가 마이그레이션되지 않습니다. 이러한 제약 사항을 검증할 때 볼륨과 디스크는 이름으로 식별되며, 이를 위반하려는 시도는 오류를 초래합니다. 그러나 이전 예제를 사용한다고 가정할 경우 다음 변경 사항은 유효합니다.

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

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

여기서 우리는 새 s3_tiered 정책에서 기본 볼륨을 재사용하고 새 핫 볼륨을 도입합니다. 이는 `<path>` 매개변수를 통해 구성된 단일 디스크로만 구성되는 기본 디스크를 사용합니다. 우리의 볼륨 이름과 디스크는 변경되지 않음을 주목하십시오. 새 삽입은 move_factor * disk_size에 도달할 때까지 기본 디스크에 존재하며, 그 이후에 데이터는 S3로 재배치됩니다.

### Handling replication {#handling-replication}

S3 디스크로 복제를 수행하려면 `ReplicatedMergeTree` 테이블 엔진을 사용해야 합니다. 세부 사항은 [S3 객체 저장소를 사용하는 두 개의 AWS 지역에 걸친 단일 샤드 복제](#s3-multi-region) 가이드를 참조하십시오.

### Read & writes {#read--writes}

다음 주의 사항은 ClickHouse와의 S3 상호작용의 구현을 다룹니다. 일반적으로 정보 제공을 위한 것이지만, [Optimizing for Performance](#s3-optimizing-performance)에서 독자에게 도움이 될 수 있습니다:

* 기본적으로 쿼리 처리 파이프라인의 어떤 단계에서 사용되는 최대 쿼리 처리 스레드 수는 코어 수와 같습니다. 일부 단계는 다른 단계보다 더 병렬화 가능하므로 이 값은 상한선으로 제공됩니다. 디스크에서 데이터가 스트리밍되므로 여러 쿼리 단계가 동시에 실행될 수 있습니다. 따라서 쿼리의 정확한 스레드 수는 이를 초과할 수 있습니다. [max_threads](../../operations/settings/settings#max_threads) 설정을 통해 수정하십시오.
* S3의 읽기는 기본적으로 비동기입니다. 이 동작은 기본값이 `threadpool`로 설정되어 있는 `remote_filesystem_read_method` 설정에 의해 결정됩니다. 요청을 처리할 때 ClickHouse는 스트라이프에서 그라뉼을 읽습니다. 이러한 각 스트라이프는 잠재적으로 여러 컬럼을 포함할 수 있습니다. 스레드는 그라뉼의 열을 하나씩 읽습니다. 동기적으로 수행하기보다는 모든 열에 대해 데이터를 기다리기 전에 사전 가져오기를 수행합니다. 이는 각 열에 대한 동기 대기 시간을 초과하여 중요한 성능 향상을 제공합니다. 사용자는 대부분의 경우 이 설정을 변경할 필요가 없습니다. [Optimizing for Performance](#s3-optimizing-performance)를 참조하십시오.
* 쓰기는 병렬로 수행되며, 최대 100개의 동시 파일 쓰기 스레드가 있습니다. 이 노출지는 동시에 S3 blob를 쓰는 수를 제어하며 기본값은 1000입니다. 각 파일이 쓰기 위해 필요한 버퍼(~1MB)가 요구되므로, 이는 INSERT의 메모리 소비를 실질적으로 제한합니다. 서버 메모리가 부족한 시나리오에서는 이 값을 줄이는 것이 적절할 수 있습니다.

## Use S3 object storage as a ClickHouse disk {#configuring-s3-for-clickhouse-use}

버킷과 IAM 역할을 생성하는 단계별 지침이 필요하다면, **Create S3 buckets and an IAM role**을 확장하고 따라가십시오:

<BucketDetails />

### Configure ClickHouse to use the S3 bucket as a disk {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
다음 예제는 서비스로 설치된 Linux Deb 패키지를 기반으로 하며 기본 ClickHouse 디렉토리를 사용합니다.

1. ClickHouse `config.d` 디렉토리에 저장소 구성을 저장할 새 파일을 만듭니다.
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 저장소 구성에 대해 다음을 추가합니다. 이전 단계의 버킷 경로, 접근 키 및 비밀 키를 대체하십시오
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

:::note
`<disks>` 태그 내의 태그 `s3_disk` 및 `s3_cache`는 임의의 레이블입니다. 이는 다른 것으로 설정할 수 있지만, `<policies>` 탭의 `<disk>` 탭에서 디스크를 참조하기 위해 동일한 레이블을 사용해야 합니다.
`<S3_main>` 태그 또한 임의의 것이며 ClickHouse에서 리소스를 생성할 때 저장 대상인 식별자로 사용될 정책의 이름입니다.

상기 구성이 ClickHouse 버전 22.8 이상을 위한 것이며, 이전 버전을 사용중이라면 [storing data](../../operations/storing-data.md/#using-local-cache) 문서를 참조하십시오.

S3 사용에 대한 추가 정보는 다음과 같습니다:
통합 가이드: [S3 백업 MergeTree](#s3-backed-mergetree)
:::

3. 파일의 소유자를 `clickhouse` 사용자 및 그룹으로 업데이트합니다
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 변경 사항을 적용하려면 ClickHouse 인스턴스를 재시작합니다.
```bash
service clickhouse-server restart
```

### Testing {#testing}
1. ClickHouse 클라이언트로 로그인합니다. 다음과 같이 할 수 있습니다.
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 새로운 S3 저장소 정책을 지정하여 테이블을 생성합니다
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

3. 테이블이 올바른 정책으로 생성되었는지 확인합니다
```sql
SHOW CREATE TABLE s3_table1;
```
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

4. 테스트 행을 테이블에 삽입합니다
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```

5. 행을 조회합니다
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

6. AWS 콘솔에서 버킷으로 이동하여 새 버킷과 폴더를 선택합니다.
다음과 같은 것을 볼 수 있습니다:

<Image img={S3J} size="lg" border alt="S3 bucket view in AWS console showing ClickHouse data files stored in S3" />
## Replicating a single shard across two AWS regions using S3 Object Storage {#s3-multi-region}

:::tip
객체 저장소는 기본적으로 ClickHouse Cloud에서 사용되며, ClickHouse Cloud에서 실행하는 경우 이 절차를 따를 필요가 없습니다.
:::
### Plan the deployment {#plan-the-deployment}
이 튜토리얼은 AWS EC2에서 두 개의 ClickHouse Server 노드와 세 개의 ClickHouse Keeper 노드를 배포하는 것을 기반으로 합니다. ClickHouse 서버의 데이터 저장소는 S3입니다. 각 지역에 ClickHouse Server와 S3 버킷을 두는 두 개의 AWS 지역이 재해 복구를 지원하기 위해 사용됩니다.

ClickHouse 테이블은 두 서버를 통해 복제되며, 따라서 두 지역을 통해 복제됩니다.
### Install software {#install-software}
#### ClickHouse server nodes {#clickhouse-server-nodes}
ClickHouse 서버 노드에서 배포 단계를 수행할 때 [설치 지침](../../getting-started/install/install.mdx)을 참조하십시오.
#### Deploy ClickHouse {#deploy-clickhouse}

두 호스트에서 ClickHouse를 배포하며, 샘플 구성에서 이를 `chnode1`, `chnode2`라고 명명합니다.

`chnode1`을 한 AWS 지역에 두고, `chnode2`를 다른 지역에 배포합니다.
#### Deploy ClickHouse Keeper {#deploy-clickhouse-keeper}

세 호스트에서 ClickHouse Keeper를 배포하며, 샘플 구성에서는 이를 `keepernode1`, `keepernode2`, `keepernode3`라고 명명합니다. `keepernode1`은 `chnode1`과 같은 지역에 배포할 수 있으며, `keepernode2`는 `chnode2`와 함께 배포하고, `keepernode3`는 다른 지역에서 ClickHouse 노드와 다른 가용성 영역에 배포할 수 있습니다.

ClickHouse Keeper 노드에서 배포 단계를 수행할 때 [설치 지침](../../getting-started/install/install.mdx)을 참조하십시오.
### Create S3 buckets {#create-s3-buckets}

`chnode1`과 `chnode2`를 배치한 각 지역에서 두 개의 S3 버킷을 생성합니다.

버킷과 IAM 역할을 생성하는 데 단계별 지침이 필요하다면 **Create S3 buckets and an IAM role**을 확장하고 따라가십시오:

<BucketDetails />

그런 다음 구성 파일은 `/etc/clickhouse-server/config.d/`에 배치됩니다. 여기 하나의 버킷에 대한 샘플 구성 파일이 있습니다. 나머지 파일은 세 개의 강조된 줄이 다르며 유사합니다:

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
:::note
이 가이드의 많은 단계에서 `/etc/clickhouse-server/config.d/`에 구성 파일을 배치하라고 할 것입니다. 이는 Linux 시스템에서 구성 오버라이드 파일의 기본 위치입니다. 이 디렉토리에 이러한 파일을 넣으면 ClickHouse가 해당 내용을 사용하여 기본 구성 을 오버라이드합니다. 이러한 파일을 오버라이드 디렉토리에 배치하면 업그레이드 중 구성 손실을 피할 수 있습니다.
:::
### Configure ClickHouse Keeper {#configure-clickhouse-keeper}

ClickHouse Keeper를 독립 실행형으로 (ClickHouse 서버와 분리하여 실행할 때) 구성은 단일 XML 파일입니다. 이 튜토리얼에서는 파일 경로가 `/etc/clickhouse-keeper/keeper_config.xml`입니다. 세 개의 Keeper 서버 모두 하나의 설정이 다르며 동일한 구성을 사용합니다; `<server_id>`입니다.

`server_id`는 구성이 사용되는 호스트에 할당될 ID를 나타냅니다. 아래 예제에서 `server_id`는 `3`이며, 파일의 `<raft_configuration>` 섹션의 아래를 보면 `server 3`의 호스트 이름이 `keepernode3`인 것을 알 수 있습니다. ClickHouse Keeper 프로세스가 리더를 선택할 때 다른 서버에 연결할 서버를 아는 방법입니다.

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

ClickHouse Keeper의 구성 파일을 복사하고 `<server_id>`를 설정합니다:
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### Configure ClickHouse server {#configure-clickhouse-server}
#### Define a cluster {#define-a-cluster}

ClickHouse 클러스터는 구성의 `<remote_servers>` 섹션에서 정의됩니다. 이 샘플에서 `cluster_1S_2R`라는 하나의 클러스터가 정의되며, 이는 두 개의 복제본을 가진 단일 샤드로 구성됩니다. 복제본은 `chnode1`과 `chnode2`에 위치해 있습니다.

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

클러스터와 함께 작업할 때는 DDL 쿼리에 클러스터, 샤드 및 복제본 설정을 채우는 매크로를 정의하는 것이 유용합니다. 이 샘플은 복제 테이블 엔진을 사용하도록 지정을 제공하는데, `shard` 및 `replica` 세부 정보 없이 사용 가능합니다. 테이블을 생성할 때 `shard` 및 `replica` 매크로가 `system.tables`를 쿼리하여 사용하는 방식을 볼 수 있습니다.

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

:::note
위 매크로는 `chnode1`에 대한 것이며, `chnode2`에서는 `replica`를 `replica_2`로 설정합니다.
:::
#### Disable zero-copy replication {#disable-zero-copy-replication}

ClickHouse 버전 22.7 및 이전 버전에서 설정 `allow_remote_fs_zero_copy_replication`은 S3 및 HDFS 디스크에 대해 기본적으로 `true`로 설정되어 있습니다. 이 설정은 이 재해 복구 시나리오를 위해 `false`로 설정되어야 하며, 버전 22.8 이상에서는 기본적으로 `false`로 설정되어 있습니다.

이 설정은 두 가지 이유로 인해 `false`여야 합니다: 1) 이 기능은 생산 준비가 되지 않았습니다; 2) 재해 복구 시나리오에서 데이터와 메타데이터는 여러 지역에 저장되어야 합니다. `allow_remote_fs_zero_copy_replication`을 `false`로 설정하십시오.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper는 ClickHouse 노드 간 데이터 복제를 조율하는 책임이 있습니다. ClickHouse에 ClickHouse Keeper 노드에 대한 정보를 제공하려면 각 ClickHouse 노드에 구성 파일을 추가하십시오.

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
### Configure networking {#configure-networking}

AWS에서 보안 설정을 구성할 때, 서버 간 통신을 가능하게 하고 사용자가 서버와 통신할 수 있도록 [네트워크 포트](../../../guides/sre/network-ports.md) 목록을 참조하십시오.

세 대의 서버는 서로 및 S3와 통신할 수 있도록 네트워크 연결을 수신해야 합니다. 기본적으로 ClickHouse는 루프백 주소에서만 수신하므로 이를 변경해야 합니다. 이는 `/etc/clickhouse-server/config.d/`에서 구성됩니다. 다음은 ClickHouse와 ClickHouse Keeper가 모든 IP v4 인터페이스에서 수신하도록 구성하는 샘플입니다. 더 많은 정보는 문서 혹은 기본 구성 파일 `/etc/clickhouse/config.xml`을 참조하십시오.

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### Start the servers {#start-the-servers}
#### Run ClickHouse Keeper {#run-clickhouse-keeper}

각 Keeper 서버에서 운영 체제에 맞는 명령을 실행하십시오. 예:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### Check ClickHouse Keeper status {#check-clickhouse-keeper-status}

`netcat`으로 ClickHouse Keeper에 명령을 전송합니다. 예를 들어, `mntr`는 ClickHouse Keeper 클러스터의 상태를 반환합니다. Keeper 노드 각각에서 이 명령을 실행하면 하나는 리더이고 나머지 두 개는 팔로워인 것을 확인할 수 있습니다:

```bash
echo mntr | nc localhost 9181
```
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
#### Run ClickHouse server {#run-clickhouse-server}

각 ClickHouse 서버에서 다음을 실행하십시오.

```bash
sudo service clickhouse-server start
```
#### Verify ClickHouse server {#verify-clickhouse-server}

[클러스터 구성](#define-a-cluster)을 추가할 때 두 개의 ClickHouse 노드에서 복제된 단일 샤드가 정의되었습니다. 이 검증 단계에서 ClickHouse가 시작될 때 클러스터가 구축되었는지 확인하고 그 클러스터를 사용하여 복제된 테이블을 생성합니다.
- 클러스터가 존재하는지 확인하십시오:
```sql
show clusters
```
```response
┌─cluster───────┐
│ cluster_1S_2R │
└───────────────┘

1 row in set. Elapsed: 0.009 sec. `
```

- `ReplicatedMergeTree` 테이블 엔진을 사용하여 클러스터에 테이블을 생성하십시오:
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
- 이전에 정의된 매크로 사용 이해하기

  매크로 `shard`와 `replica`는 [이전에 정의되었습니다](#define-a-cluster), 강조된 줄 아래에서 각 ClickHouse 노드에서 값이 대체되는 위치를 확인할 수 있습니다. 추가로, `uuid` 값도 사용됩니다; `uuid`는 시스템에 의해 생성되기 때문에 매크로에 정의되어 있지 않습니다.
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
  :::note
  위에서 보여준 zookeeper 경로 `'clickhouse/tables/{uuid}/{shard}`는 `default_replica_path` 및 `default_replica_name`을 설정하여 사용자 지정할 수 있습니다. 문서는 [여기](/#default_replica_path) 있습니다.
  :::
### Testing {#testing-1}

이 테스트는 데이터가 두 서버 간에 복제되고 있으며 S3 버킷에 저장되고 로컬 디스크에는 저장되지 않고 있음을 확인합니다.

- 뉴욕시 택시 데이터세트에서 데이터 추가:
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
- 데이터가 S3에 저장되어 있는지 확인하십시오.

  이 쿼리는 디스크의 데이터 크기와 어떤 정책을 사용하여 어떤 디스크를 사용하는지를 보여줍니다.
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
```

  로컬 디스크의 데이터 크기를 확인하십시오. 위에서, 수백만 행이 저장된 디스크의 크기는 36.42 MiB입니다. 이것은 S3에 있어야 하며 로컬 디스크에는 없어야 합니다. 위의 쿼리는 로컬 디스크에서 데이터와 메타데이터가 저장되는 위치도 알려줍니다. 로컬 데이터를 확인하십시오:
```response
root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
536K  /var/lib/clickhouse/disks/s3_disk/store/551
```

  각 S3 버킷의 S3 데이터 확인 (총합은 표시되지 않지만 두 버킷 모두 삽입 후 약 36 MiB의 데이터가 저장되어 있습니다):

<Image img={Bucket1} size="lg" border alt="첫 번째 S3 버킷에 저장된 데이터의 크기를 보여주는 스토리지 사용 메트릭" />

<Image img={Bucket2} size="lg" border alt="두 번째 S3 버킷에 저장된 데이터의 크기를 보여주는 스토리지 사용 메트릭" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)는 Amazon S3에서 새로운 고성능 단일 가용 영역 스토리지 클래스입니다.

우리의 ClickHouse와 S3Express 테스트 경험에 대해 읽으려면 이 [블로그](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)를 참조할 수 있습니다.

:::note
  S3Express는 단일 AZ 내에 데이터를 저장합니다. 이는 AZ 중단 시 데이터가 사용할 수 없음을 의미합니다.
:::
### S3 disk {#s3-disk}

S3Express 버킷에 의해 백업된 스토리지로 테이블을 생성하는 과정은 다음과 같습니다:

1. `Directory` 유형의 버킷 생성
2. S3 사용자에게 필요한 모든 권한을 부여하는 적절한 버킷 정책 설치 (예: `"Action": "s3express:*"`로 제한 없는 액세스 허용)
3. 스토리지 정책 구성 시 `region` 매개변수 제공

일반 S3에 대한 스토리지 구성은 동일하며 다음과 같이 보일 수 있습니다:

```sql
<storage_configuration>
    <disks>
        <s3_express>
            <type>s3</type>
            <endpoint>https://my-test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/store/</endpoint>
            <region>eu-north-1</region>
            <access_key_id>...</access_key_id>
            <secret_access_key>...</secret_access_key>
        </s3_express>
    </disks>
    <policies>
        <s3_express>
            <volumes>
                <main>
                    <disk>s3_express</disk>
                </main>
            </volumes>
        </s3_express>
    </policies>
</storage_configuration>
```

그리고 새로운 스토리지에 테이블을 생성합니다:

```sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3 storage {#s3-storage}

S3 스토리지도 지원되지만 `Object URL` 경로에 대해서만 지원됩니다. 예:

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

구성에서 버킷 지역을 지정해야 합니다:

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### Backups {#backups}

위에서 생성한 디스크에 백업을 저장할 수 있습니다:

```sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
