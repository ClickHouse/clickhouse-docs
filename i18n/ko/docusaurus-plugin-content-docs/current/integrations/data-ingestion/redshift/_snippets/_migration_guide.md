import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## 소개 {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/)는 Amazon Web Services의 일부로 제공되는 인기 있는 클라우드 데이터 웨어하우징 솔루션입니다. 이 가이드는 Redshift 인스턴스에서 ClickHouse로 데이터를 마이그레이션하는 다양한 접근 방식을 제시합니다. 우리는 세 가지 옵션을 다룰 것입니다:

<Image img={redshiftToClickhouse} size="md" alt="Redshift to ClickHouse Migration Options" background="white"/>

ClickHouse 인스턴스 관점에서, 다음 방법 중 하나를 사용할 수 있습니다:

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** 타사 ETL/ELT 도구 또는 서비스를 사용하여 ClickHouse로 데이터를 푸시합니다.

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBC Bridge를 활용하여 Redshift에서 데이터를 풀어옵니다.

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** "Unloading then loading" 논리를 사용하여 S3 객체 저장소를 활용합니다.

:::note
이번 튜토리얼에서는 Redshift를 데이터 소스로 사용했습니다. 그러나 이곳에서 제시된 마이그레이션 접근 방식은 Redshift에 국한되지 않으며, 호환되는 모든 데이터 소스에 대해 유사한 단계를 도출할 수 있습니다.
:::

## Redshift에서 ClickHouse로 데이터 푸시하기 {#push-data-from-redshift-to-clickhouse}

푸시 시나리오에서는 데이터가 ClickHouse 인스턴스로 전송될 수 있도록 타사 도구나 서비스(사용자 정의 코드거나 [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT))를 활용하는 것이 목표입니다. 예를 들어, [Airbyte](https://www.airbyte.com/)와 같은 소프트웨어를 사용하여 Redshift 인스턴스(소스)와 ClickHouse(목적지) 간의 데이터를 이동할 수 있습니다 ([Airbyte에 대한 통합 가이드를 참조하세요](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)).

<Image img={push} size="md" alt="PUSH Redshift to ClickHouse" background="white"/>

### 장점 {#pros}

* ETL/ELT 소프트웨어의 기존 커넥터 카탈로그를 활용할 수 있습니다.
* 데이터 동기화를 유지하기 위한 내장 기능(추가/덮어쓰기/증가 로직).
* 데이터 변환 시나리오를 가능하게 합니다(예: [dbt에 대한 통합 가이드를 참조하세요](/integrations/data-ingestion/etl-tools/dbt/index.md)).

### 단점 {#cons}

* 사용자가 ETL/ELT 인프라를 설정하고 유지 관리해야 합니다.
* 아키텍처에 타사 요소가 도입되어 확장성 병목 현상이 발생할 수 있습니다.

## Redshift에서 ClickHouse로 데이터 풀어오기 {#pull-data-from-redshift-to-clickhouse}

풀 시나리오에서는 ClickHouse 인스턴스에서 Redshift 클러스터에 직접 연결하기 위해 ClickHouse JDBC Bridge를 활용하고 `INSERT INTO ... SELECT` 쿼리를 수행하는 것이 목표입니다:

<Image img={pull} size="md" alt="PULL from Redshift to ClickHouse" background="white"/>

### 장점 {#pros-1}

* 모든 JDBC 호환 도구에 일반적입니다.
* ClickHouse 내에서 여러 외부 데이터 소스를 쿼리할 수 있는 우아한 솔루션입니다.

### 단점 {#cons-1}

* ClickHouse JDBC Bridge 인스턴스가 필요하며, 이는 잠재적인 확장성 병목 현상으로 이어질 수 있습니다.

:::note
Redshift가 PostgreSQL을 기반으로 하고 있지만, ClickHouse는 PostgreSQL 버전 9 이상을 요구하고 Redshift API가 이전 버전(8.x)을 기반으로 하므로 ClickHouse PostgreSQL 테이블 함수 또는 테이블 엔진을 사용하는 것은 불가능합니다.
:::

### 튜토리얼 {#tutorial}

이 옵션을 사용하려면 ClickHouse JDBC Bridge를 설정해야 합니다. ClickHouse JDBC Bridge는 JDBC 연결을 처리하고 ClickHouse 인스턴스와 데이터 소스 간의 프록시 역할을 하는 독립 실행형 Java 애플리케이션입니다. 이번 튜토리얼에서는 [샘플 데이터베이스](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)가 포함된 미리 채워진 Redshift 인스턴스를 사용했습니다.

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridge 배포하기 {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC Bridge를 배포합니다. 자세한 내용은 [외부 데이터 소스를 위한 JDBC 사용자 가이드](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)를 참조하세요.

:::note
ClickHouse Cloud를 사용 중이라면 ClickHouse JDBC Bridge를 별도의 환경에서 실행하고 [remoteSecure](/sql-reference/table-functions/remote/) 기능을 사용하여 ClickHouse Cloud에 연결해야 합니다.
:::

#### Redshift 데이터 소스 구성하기 {#configure-your-redshift-datasource}

ClickHouse JDBC Bridge 혼을 위한 Redshift 데이터 소스를 구성합니다. 예를 들어, `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

```json
{
 "redshift-server": {
   "aliases": [
     "redshift"
   ],
   "driverUrls": [
   "https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/2.1.0.4/redshift-jdbc42-2.1.0.4.jar"
   ],
   "driverClassName": "com.amazon.redshift.jdbc.Driver",
   "jdbcUrl": "jdbc:redshift://redshift-cluster-1.ckubnplpz1uv.us-east-1.redshift.amazonaws.com:5439/dev",
   "username": "awsuser",
   "password": "<password>",
   "maximumPoolSize": 5
 }
}
```

#### ClickHouse에서 Redshift 인스턴스 쿼리하기 {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC Bridge가 배포되면 ClickHouse에서 Redshift 인스턴스를 쿼리하기 시작할 수 있습니다.

```sql
SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
```

```response
Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

┌─username─┬─firstname─┬─lastname─┐
│ PGL08LJI │ Vladimir  │ Humphrey │
│ XDZ38RDD │ Barry     │ Roy      │
│ AEB55QTM │ Reagan    │ Hodge    │
│ OWY35QYB │ Tamekah   │ Juarez   │
│ MSD36KVR │ Mufutau   │ Watkins  │
└──────────┴───────────┴──────────┘

5 rows in set. Elapsed: 0.438 sec.
```

```sql
SELECT *
FROM jdbc('redshift', 'select count(*) from sales')
```

```response
Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

┌──count─┐
│ 172456 │
└────────┘

1 rows in set. Elapsed: 0.304 sec.
```

#### Redshift에서 ClickHouse로 데이터 가져오기 {#import-data-from-redshift-to-clickhouse}

다음에서 `INSERT INTO ... SELECT` 문을 사용하여 데이터를 가져오는 방법을 보여줍니다.

```sql

# TABLE CREATION with 3 columns
CREATE TABLE users_imported
(
   `username` String,
   `firstname` String,
   `lastname` String
)
ENGINE = MergeTree
ORDER BY firstname
```

```response
Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

Ok.

0 rows in set. Elapsed: 0.233 sec.
```

```sql
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')
```

```response
Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```

</VerticalStepper>

## S3를 사용하여 Redshift에서 ClickHouse로 데이터 피벗하기 {#pivot-data-from-redshift-to-clickhouse-using-s3}

이 시나리오에서는 데이터를 간접 피벗 형식으로 S3에 내보내고, 두 번째 단계에서 S3의 데이터를 ClickHouse로 로드합니다.

<Image img={pivot} size="md" alt="PIVOT from Redshift using S3" background="white"/>

### 장점 {#pros-2}

* Redshift와 ClickHouse는 모두 강력한 S3 통합 기능을 가지고 있습니다.
* Redshift의 `UNLOAD` 명령 및 ClickHouse S3 테이블 함수/테이블 엔진과 같은 기존 기능을 활용합니다.
* ClickHouse에서 S3로의 병렬 읽기 및 높은 처리량 덕분에 원활하게 확장할 수 있습니다.
* Apache Parquet와 같은 정교하고 압축된 형식을 활용할 수 있습니다.

### 단점 {#cons-2}

* 과정에 두 단계가 필요합니다(Redshift에서 언로드 후 ClickHouse로 로드).

### 튜토리얼 {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### UNLOAD를 사용하여 S3 버킷으로 데이터 내보내기 {#export-data-into-an-s3-bucket-using-unload}

Redshift의 [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 기능을 사용하여 기존의 개인 S3 버킷으로 데이터를 내보냅니다:

<Image img={s3_1} size="md" alt="UNLOAD from Redshift to S3" background="white"/>

기존의 S3에 원시 데이터가 포함된 파트 파일이 생성됩니다.

<Image img={s3_2} size="md" alt="Data in S3" background="white"/>

#### ClickHouse에서 테이블 생성하기 {#create-the-table-in-clickhouse}

ClickHouse에서 테이블을 생성합니다:

```sql
CREATE TABLE users
(
  username String,
  firstname String,
  lastname String
)
ENGINE = MergeTree
ORDER BY username
```

대안으로 ClickHouse는 `CREATE TABLE ... EMPTY AS SELECT`를 사용하여 테이블 구조를 추론하려고 시도할 수 있습니다:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

이는 데이터가 클 수형에 대한 정보를 포함하고 있는 경우 특히 잘 작동합니다, 예를 들어 Parquet처럼요.

#### S3 파일을 ClickHouse로 로드하기 {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT` 문을 사용하여 S3 파일을 ClickHouse로 로드합니다:

```sql
INSERT INTO users SELECT *
FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

```response
Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

Ok.

0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
```

:::note
이 예에서는 CSV를 피벗 형식으로 사용했습니다. 그러나 프로덕션 작업을 위해서는 대규모 마이그레이션에 적합한 옵션으로 Apache Parquet을 추천합니다. 압축이 가능하고 저장 비용을 절감하면서 전송 시간을 단축할 수 있습니다. (기본적으로 각 행 그룹은 SNAPPY를 사용하여 압축됩니다). ClickHouse는 또한 Parquet의 컬럼 방향을 활용하여 데이터 수집 속도를 높입니다.
:::

</VerticalStepper>
