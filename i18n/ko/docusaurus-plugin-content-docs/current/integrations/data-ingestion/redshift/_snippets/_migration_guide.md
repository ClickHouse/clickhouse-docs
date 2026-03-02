import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## 소개 \{#introduction\}

[Amazon Redshift](https://aws.amazon.com/redshift/)는 Amazon Web Services 제품군에 속한 널리 사용되는 클라우드 데이터 웨어하우징 솔루션입니다. 이 가이드는 Redshift 인스턴스에서 ClickHouse로 데이터를 마이그레이션하는 다양한 접근 방식을 제시합니다. 여기에서는 세 가지 옵션을 다룹니다:

<Image img={redshiftToClickhouse} size="md" alt="Redshift에서 ClickHouse로 마이그레이션 옵션"/>

ClickHouse 인스턴스 관점에서 보면 다음과 같은 방식으로 수행할 수 있습니다:

1. 서드파티 ETL/ELT 도구 또는 서비스를 사용하여 ClickHouse로 데이터를 **[PUSH](#push-data-from-redshift-to-clickhouse)** 하는 방식

2. ClickHouse JDBC Bridge를 활용하여 Redshift에서 데이터를 **[PULL](#pull-data-from-redshift-to-clickhouse)** 해 오는 방식

3. S3 객체 스토리지를 활용해 "언로드 후 로드(Unload then load)" 로직을 사용하는 **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** 방식

:::note
이 튜토리얼에서는 데이터 소스로 Redshift를 사용했습니다. 그러나 여기에서 제시하는 마이그레이션 방식은 Redshift에만 국한되지 않으며, 호환되는 다른 데이터 소스에도 유사한 단계를 적용할 수 있습니다.
:::

## Redshift에서 ClickHouse로 데이터 Push \{#push-data-from-redshift-to-clickhouse\}

PUSH 시나리오에서는 타사 도구나 서비스(사용자 정의 코드 또는 [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT))를 활용하여 데이터를 ClickHouse 인스턴스로 전송합니다. 예를 들어 [Airbyte](https://www.airbyte.com/)와 같은 소프트웨어를 사용하여 Redshift 인스턴스(소스)에서 ClickHouse 인스턴스(대상)로 데이터를 전송할 수 있습니다([Airbyte 연동 가이드를 참조하십시오](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)).

<Image img={push} size="md" alt="Redshift에서 ClickHouse로 PUSH"/>

### Pros \{#pros\}

* 기존 ETL/ELT 소프트웨어의 커넥터 카탈로그를 그대로 활용할 수 있습니다.
* 데이터 동기화를 위한 기능(append/overwrite/increment 로직)이 내장되어 있습니다.
* 데이터 변환 시나리오를 구현할 수 있습니다(예: [dbt 연동 가이드](/integrations/data-ingestion/etl-tools/dbt/index.md) 참조).

### 단점 \{#cons\}

* ETL/ELT 인프라를 구축하고 유지 관리해야 합니다.
* 아키텍처에 서드파티 구성 요소가 도입되어 확장성 측면에서 잠재적인 병목 요인이 될 수 있습니다.

## Redshift에서 ClickHouse로 데이터 끌어오기 \{#pull-data-from-redshift-to-clickhouse\}

이 끌어오기 시나리오에서는 ClickHouse 인스턴스에서 Redshift 클러스터에 직접 연결하기 위해 ClickHouse JDBC Bridge를 활용하고, `INSERT INTO ... SELECT` 쿼리를 수행합니다.

<Image img={pull} size="md" alt="Redshift에서 ClickHouse로 데이터 끌어오기(PULL)"/>

### 장점 \{#pros-1\}

* 모든 JDBC 호환 도구에서 범용적으로 사용할 수 있습니다.
* ClickHouse 내에서 여러 외부 데이터 소스를 쿼리할 수 있게 해 주는 세련된 솔루션입니다.

### 단점 \{#cons-1\}

* 확장성 측면에서 병목 지점이 될 수 있는 ClickHouse JDBC Bridge 인스턴스가 필요합니다.

:::note
Redshift는 PostgreSQL을 기반으로 하지만, ClickHouse에서는 PostgreSQL 테이블 함수나 테이블 엔진을 사용할 수 없습니다. ClickHouse는 PostgreSQL 9 이상을 요구하는 반면, Redshift API는 더 낮은 버전(8.x)을 기반으로 하기 때문입니다.
:::

### 튜토리얼 \{#tutorial\}

이 옵션을 사용하려면 ClickHouse JDBC Bridge를 설정해야 합니다. ClickHouse JDBC Bridge는 JDBC 연결을 처리하고 ClickHouse 인스턴스와 데이터 소스 사이에서 프록시 역할을 하는 독립 실행형 Java 애플리케이션입니다. 이 튜토리얼에서는 [샘플 데이터베이스](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)에 데이터가 미리 채워진 Redshift 인스턴스를 사용합니다.

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridge 배포 \{#deploy-clickhouse-jdbc-bridge\}

ClickHouse JDBC Bridge를 배포합니다. 자세한 내용은 [JDBC for External Data sources](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md) 사용자 가이드를 참고하십시오.

:::note
ClickHouse Cloud를 사용하는 경우 별도의 환경에서 ClickHouse JDBC Bridge를 실행한 후 [remoteSecure](/sql-reference/table-functions/remote/) 함수를 사용하여 ClickHouse Cloud에 연결해야 합니다.
:::

#### Redshift 데이터 소스 구성 \{#configure-your-redshift-datasource\}

ClickHouse JDBC Bridge용 Redshift 데이터 소스를 구성합니다. 예를 들어 `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json` 파일을 사용할 수 있습니다.

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

#### ClickHouse에서 Redshift 인스턴스 쿼리하기 \{#query-your-redshift-instance-from-clickhouse\}

ClickHouse JDBC Bridge가 배포되어 실행 중이면 ClickHouse에서 Redshift 인스턴스를 대상으로 쿼리를 실행할 수 있습니다.

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

#### Redshift에서 ClickHouse로 데이터 가져오기 \{#import-data-from-redshift-to-clickhouse\}

다음 예시에서는 `INSERT INTO ... SELECT` 문을 사용하여 데이터를 가져오는 방법을 보여줍니다.

```sql
# 3개의 컬럼으로 테이블 생성
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

## S3를 사용하여 Redshift 데이터를 ClickHouse로 피벗하기 \{#pivot-data-from-redshift-to-clickhouse-using-s3\}

이 시나리오에서는 중간 피벗 형식으로 데이터를 S3로 내보낸 뒤, 다음 단계에서 S3의 데이터를 ClickHouse로 로드합니다.

<Image img={pivot} size="md" alt="S3를 사용하여 Redshift에서 PIVOT"/>

### 장점 \{#pros-2\}

* Redshift와 ClickHouse 모두 강력한 S3 통합 기능을 제공합니다.
* Redshift의 `UNLOAD` 명령과 ClickHouse의 S3 테이블 함수 / 테이블 엔진 등 기존 기능을 활용합니다.
* ClickHouse에서 S3로부터의 / S3로의 병렬 읽기와 높은 처리량 덕분에 매끄럽게 확장할 수 있습니다.
* Apache Parquet과 같은 고급 압축 포맷을 활용할 수 있습니다.

### 단점 \{#cons-2\}

* 프로세스가 두 단계로 이루어져 있습니다(Redshift에서 데이터를 언로드한 뒤 ClickHouse로 로드해야 합니다).

### 튜토리얼 \{#tutorial-1\}

<VerticalStepper headerLevel="h4">

#### UNLOAD를 사용하여 데이터를 S3 버킷으로 내보내기 \{#export-data-into-an-s3-bucket-using-unload\}

Redshift의 [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 기능을 사용하여 기존 비공개 S3 버킷으로 데이터를 내보냅니다:

<Image img={s3_1} size="md" alt="Redshift에서 S3로 UNLOAD" background="white"/>

이 작업은 S3에 원시 데이터가 들어 있는 파트 파일들을 생성합니다.

<Image img={s3_2} size="md" alt="S3의 데이터" background="white"/>

#### ClickHouse에 테이블 생성 \{#create-the-table-in-clickhouse\}

ClickHouse에 테이블을 생성합니다:

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

또는, ClickHouse에서 `CREATE TABLE ... EMPTY AS SELECT`를 사용해 테이블 구조를 자동으로 추론하도록 할 수도 있습니다:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

이는 Parquet처럼 데이터 타입 정보가 포함된 형식의 데이터를 사용할 때 특히 효과적입니다.

#### S3 파일을 ClickHouse로 적재 \{#load-s3-files-into-clickhouse\}

`INSERT INTO ... SELECT` 구문을 사용하여 S3 파일을 ClickHouse로 적재합니다:

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
이 예제에서는 피벗 포맷(pivot format)으로 CSV를 사용했습니다. 그러나 운영 환경에서의 대규모 마이그레이션 워크로드에는 Apache Parquet을 가장 좋은 옵션으로 권장하며, 압축을 지원하여 스토리지 비용을 절감하고 전송 시간을 줄일 수 있습니다. (기본적으로 각 row group은 SNAPPY로 압축됩니다.) 또한 ClickHouse는 Parquet의 컬럼 지향 특성을 활용하여 데이터 수집 속도를 높입니다.
:::

</VerticalStepper>