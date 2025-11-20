---
'sidebar_label': 'Airbyte'
'sidebar_position': 11
'keywords':
- 'clickhouse'
- 'Airbyte'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'slug': '/integrations/airbyte'
'description': 'Airbyte 데이터 파이프라인을 사용하여 ClickHouse로 데이터를 스트리밍합니다.'
'title': 'Airbyte를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'community'
- 'category': 'data_ingestion'
- 'website': 'https://airbyte.com/'
---

import Image from '@theme/IdealImage';
import airbyte01 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_01.png';
import airbyte02 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_02.png';
import airbyte03 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_03.png';
import airbyte04 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_04.png';
import airbyte05 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_05.png';
import airbyte06 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_06.png';
import airbyte07 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_07.png';
import airbyte08 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_08.png';
import airbyte09 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_09.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Airbyte를 ClickHouse에 연결하기

<PartnerBadge/>

:::note
Airbyte의 ClickHouse 소스 및 대상은 현재 Alpha 상태이며 대용량 데이터 세트(> 1,000만 행)를 이동하는 데 적합하지 않습니다.
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a>는 오픈 소스 데이터 통합 플랫폼입니다. ELT 데이터 파이프라인의 생성을 허용하며, 140개 이상의 기본 제공 커넥터가 함께 제공됩니다. 이 단계별 튜토리얼에서는 Airbyte를 ClickHouse에 대상으로 연결하고 샘플 데이터 세트를 로드하는 방법을 보여줍니다.

<VerticalStepper headerLevel="h2">

## Airbyte 다운로드 및 실행 {#1-download-and-run-airbyte}

1. Airbyte는 Docker에서 실행되며 `docker-compose`를 사용합니다. Docker의 최신 버전을 다운로드하고 설치해야 합니다.

2. 공식 Github 저장소를 클론하고 좋아하는 터미널에서 `docker-compose up`을 실행하여 Airbyte를 배포합니다:

```bash
git clone https://github.com/airbytehq/airbyte.git --depth=1
cd airbyte
./run-ab-platform.sh
```

4. 터미널에서 Airbyte 배너를 확인하면 <a href="http://localhost:8000" target="_blank">localhost:8000</a>에 연결할 수 있습니다.

    <Image img={airbyte01} size="lg" border alt="Airbyte banner" />

        :::note
        또는 가입하여 <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>를 사용할 수 있습니다.
        :::

## ClickHouse를 대상으로 추가하기 {#2-add-clickhouse-as-a-destination}

이번 섹션에서는 ClickHouse 인스턴스를 대상으로 추가하는 방법을 설명합니다.

1. ClickHouse 서버를 시작합니다 (Airbyte는 ClickHouse 버전 `21.8.10.19` 이상과 호환됨) 또는 ClickHouse 클라우드 계정에 로그인합니다:

```bash
clickhouse-server start
```

2. Airbyte 내에서 "대상" 페이지를 선택하고 새 대상을 추가합니다:

    <Image img={airbyte02} size="lg" border alt="Add a destination in Airbyte" />

3. "대상 유형" 드롭다운 목록에서 ClickHouse를 선택하고, ClickHouse 호스트 이름 및 포트, 데이터베이스 이름, 사용자 이름 및 비밀번호를 제공하여 "대상 설정" 양식을 작성합니다. SSL 연결인지 여부를 선택합니다( 이는 `clickhouse-client`의 `--secure` 플래그와 동일함):

    <Image img={airbyte03} size="lg" border alt="ClickHouse destination creation in Airbyte" />

4. 축하합니다! 이제 ClickHouse를 Airbyte의 대상으로 추가했습니다.

:::note
ClickHouse를 대상으로 사용하려면 사용할 사용자에게 데이터베이스, 테이블 생성 및 행 삽입 권한이 있어야 합니다. Airbyte 전용 사용자(예: `my_airbyte_user`)를 만드는 것이 좋습니다. 다음과 같은 권한을 부여합니다:

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::

## 데이터세트를 소스로 추가하기 {#3-add-a-dataset-as-a-source}

우리가 사용할 예제 데이터 세트는 <a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">뉴욕시 택시 데이터</a>입니다 ( <a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a>에 있음). 이 튜토리얼에서는 2022년 1월에 해당하는 이 데이터 세트의 하위 집합을 사용할 것입니다.

1. Airbyte 내에서 "소스" 페이지를 선택하고 파일 유형의 새 소스를 추가합니다.

    <Image img={airbyte04} size="lg" border alt="Add a source in Airbyte" />

2. 소스 이름을 지정하고 NYC Taxi 2022년 1월 파일의 URL을 제공하여 "소스 설정" 양식을 작성합니다(아래 참조). 파일 형식으로 `parquet`를 선택하고, 저장소 제공자로 `HTTPS Public Web`을 선택하며 데이터 세트 이름으로 `nyc_taxi_2022`를 선택합니다.

```text
https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
```

    <Image img={airbyte05} size="lg" border alt="ClickHouse source creation in Airbyte" />

3. 축하합니다! 이제 Airbyte에 소스 파일을 추가했습니다.

## 연결 생성 및 데이터 세트를 ClickHouse에 로드하기 {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. Airbyte 내에서 "연결" 페이지를 선택하고 새 연결을 추가합니다.

<Image img={airbyte06} size="lg" border alt="Add a connection in Airbyte" />

2. "기존 소스 사용"을 선택하고 뉴욕시 택시 데이터를 선택한 후, "기존 대상 사용"을 선택하고 ClickHouse 인스턴스를 선택합니다.

3. "연결 설정" 양식에 복제 빈도를 선택합니다(이 튜토리얼에서는 `수동`을 선택할 것입니다) 그리고 동기화할 스트림으로 `nyc_taxi_2022`를 선택합니다. 정규화로 `Normalized Tabular Data`를 선택합니다.

<Image img={airbyte07} size="lg" border alt="Connection creation in Airbyte" />

4. 연결이 생성되면 "지금 동기화"를 클릭하여 데이터 로딩을 트리거합니다 (복제 빈도로 `Manual`을 선택했기 때문입니다).

<Image img={airbyte08} size="lg" border alt="Sync now in Airbyte" />

5. 데이터 로딩이 시작되며, Airbyte 로그와 진행 상황을 확인하기 위해 뷰를 확장할 수 있습니다. 작업이 완료되면 로그에서 `완료되었습니다` 메시지를 확인할 수 있습니다:

<Image img={airbyte09} size="lg" border alt="Completed successfully" />

6. 선호하는 SQL 클라이언트를 사용하여 ClickHouse 인스턴스에 연결하고 결과 테이블을 확인합니다:

```sql
SELECT *
FROM nyc_taxi_2022
LIMIT 10
```

        응답은 다음과 같아야 합니다:
```response
Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
│     0 │     0.5 │        2 │          1 │          0 │           0 │        11.5 │           68 │          170 │            2 │            0 │         14.8 │           2.2 │               1 │ N                  │                  2.5 │ 2022-01-25T13:19:26  │                   0.3 │ 2022-01-25T13:36:19   │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │    2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
│   2.5 │     0.5 │        1 │          1 │       0.88 │           0 │         5.5 │           79 │          137 │            1 │            0 │         9.68 │           1.1 │               1 │ N                  │                  2.5 │ 2022-01-22T15:45:09  │                   0.3 │ 2022-01-22T15:50:16   │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │    2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
│  1.75 │     0.5 │        1 │          1 │        7.5 │        1.25 │        27.5 │           17 │          138 │            1 │            0 │        37.55 │             9 │               1 │ N                  │                    0 │ 2022-01-30T21:58:19  │                   0.3 │ 2022-01-30T22:19:30   │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │    2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │          13 │           79 │          140 │            2 │            0 │         16.8 │          3.19 │               1 │ N                  │                  2.5 │ 2022-01-26T20:43:14  │                   0.3 │ 2022-01-26T20:58:08   │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │    2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
```

```sql
SELECT count(*)
FROM nyc_taxi_2022
```

        응답 내용은:
```response
Query id: a9172d39-50f7-421e-8330-296de0baa67e

┌─count()─┐
│ 2392428 │
└─────────┘
```

7. Airbyte가 데이터 유형을 자동으로 유추하고 대상으로 하는 테이블에 4개의 컬럼을 추가했음을 확인하세요. 이 컬럼은 Airbyte가 복제 논리를 관리하고 작업을 기록하는 데 사용됩니다. 자세한 내용은 <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyte 공식 문서</a>를 참조하세요.

```sql
`_airbyte_ab_id` String,
`_airbyte_emitted_at` DateTime64(3, 'GMT'),
`_airbyte_normalized_at` DateTime,
`_airbyte_nyc_taxi_072021_hashid` String
```

        이제 데이터 세트가 ClickHouse 인스턴스에 로드되었으므로 새 테이블을 만들고 더 적합한 ClickHouse 데이터 유형을 사용할 수 있습니다 (<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">자세한 내용</a>).

8. 축하합니다 - Airbyte를 사용하여 NYC 택시 데이터를 ClickHouse에 성공적으로 로드했습니다!

</VerticalStepper>
