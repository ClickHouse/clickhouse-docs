---
sidebar_label: 'Airbyte'
sidebar_position: 11
keywords: ['clickhouse', 'Airbyte', '연결', '통합', 'etl', '데이터 통합']
slug: /integrations/airbyte
description: 'Airbyte 데이터 파이프라인을 사용해 데이터를 ClickHouse로 스트리밍합니다'
title: 'Airbyte를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://airbyte.com/'
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

# Airbyte를 ClickHouse에 연결하기 \{#connect-airbyte-to-clickhouse\}

<PartnerBadge />

:::note
현재 ClickHouse용 Airbyte 소스와 대상은 알파(Alpha) 단계이며, 1,000만 행(&gt; 10 million rows) 이상의 대규모 데이터셋을 이동하는 데에는 적합하지 않습니다.
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a>는 오픈 소스 데이터 통합 플랫폼입니다. <a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a> 데이터 파이프라인을 생성할 수 있으며, 140개가 넘는 기본 제공 커넥터와 함께 제공됩니다. 이 단계별 튜토리얼에서는 Airbyte를 ClickHouse의 대상(destination)으로 연결하고 샘플 데이터셋을 적재하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">
  ## Airbyte 다운로드 및 실행 \{#1-download-and-run-airbyte\}

  1. Airbyte는 Docker에서 실행되며 `docker-compose`를 사용합니다. 최신 버전의 Docker가 다운로드되어 설치되어 있는지 확인하십시오.

  2. 공식 GitHub 리포지토리를 클론한 다음, 선호하는 터미널에서 `docker-compose up` 명령을 실행하여 Airbyte를 배포합니다.

     ```bash
     git clone https://github.com/airbytehq/airbyte.git --depth=1
     cd airbyte
     ./run-ab-platform.sh
     ```

  3. 터미널에 Airbyte 배너가 보이면 <a href="http://localhost:8000" target="_blank">localhost:8000</a>에 접속할 수 있습니다.

     <Image img={airbyte01} size="lg" border alt="Airbyte 배너 이미지" />

     :::note
     또는 가입한 후 <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>를 사용할 수도 있습니다.
     :::

  ## ClickHouse를 대상으로 추가 \{#2-add-clickhouse-as-a-destination\}

  이 섹션에서는 ClickHouse 인스턴스를 대상으로 추가하는 방법을 설명합니다.

  1. ClickHouse 서버를 시작하거나 (Airbyte는 ClickHouse 버전 `21.8.10.19` 이상과 호환됩니다) ClickHouse Cloud 계정에 로그인하십시오.

     ```bash
     clickhouse-server start
     ```

  2. Airbyte에서 「Destinations」 페이지로 이동하여 새 대상(Destination)을 추가합니다:

     <Image img={airbyte02} size="lg" border alt="Airbyte에서 대상 추가" />

  3. &quot;Destination type&quot; 드롭다운 목록에서 ClickHouse를 선택한 후 ClickHouse 호스트 이름과 포트, 데이터베이스 이름, 사용자 이름과 비밀번호를 입력하고 SSL 연결 여부를 선택하여 &quot;Set up the destination&quot; 양식을 작성합니다(이는 `clickhouse-client`에서 `--secure` 플래그를 사용하는 것과 같습니다):

     <Image img={airbyte03} size="lg" border alt="Airbyte에서 ClickHouse 대상을 생성하는 화면" />

  4. 축하합니다! 이제 Airbyte에 ClickHouse를 대상으로 추가했습니다.

  :::note
  ClickHouse를 대상(destination)으로 사용하려면, 사용하는 사용자에게 데이터베이스 및 테이블 생성, 행 삽입 권한이 필요합니다. Airbyte 전용 사용자(예: `my_airbyte_user`)를 생성하고 다음 권한을 부여하는 것을 권장합니다:

  ```sql
  CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

  GRANT CREATE ON * TO my_airbyte_user;
  ```

  :::

  ## 데이터셋을 소스로 추가 \{#3-add-a-dataset-as-a-source\}

  사용할 예제 데이터셋은 <a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">New York City Taxi Data</a>(<a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a>)입니다. 본 튜토리얼에서는 2022년 1월 데이터에 해당하는 부분 집합을 사용합니다.

  1. Airbyte에서 &quot;Sources&quot; 페이지로 이동한 다음 파일 유형의 새 소스를 추가합니다.

     <Image img={airbyte04} size="lg" border alt="Airbyte에서 소스 추가하기" />

  2. 소스 이름을 지정하고 NYC Taxi Jan 2022 파일의 URL을 입력하여 「Set up the source」 양식을 작성합니다(아래 참조). 파일 형식은 `parquet`으로, Storage Provider는 `HTTPS Public Web`으로, Dataset Name은 `nyc_taxi_2022`로 설정합니다.

     ```text
     https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
     ```

     <Image img={airbyte05} size="lg" border alt="Airbyte에서 ClickHouse 소스를 생성하는 화면" />

  3. 축하합니다! 이제 Airbyte에 소스 파일이 추가되었습니다.

  ## 연결을 생성하고 데이터셋을 ClickHouse에 로드하세요 \{#4-create-a-connection-and-load-the-dataset-into-clickhouse\}

  1. Airbyte에서 &quot;Connections&quot; 페이지로 이동하여 새 연결을 추가합니다

  <Image img={airbyte06} size="lg" border alt="Airbyte에서 연결 추가하기" />

  2. &quot;Use existing source&quot;를 선택한 다음 New York City Taxi Data를 선택하고, 이어서 &quot;Use existing destination&quot;을 선택한 후 ClickHouse 인스턴스를 선택합니다.

  3. 「Set up the connection」 양식에서 복제 빈도(Replication Frequency)를 선택합니다(이 튜토리얼에서는 `manual`을 사용합니다). 그런 다음 동기화할 스트림으로 `nyc_taxi_2022`를 선택합니다. Normalization 항목에서는 반드시 `Normalized Tabular Data`를 선택합니다.

  <Image img={airbyte07} size="lg" border alt="Airbyte에서 커넥션 생성하기" />

  4. 이제 연결을 생성했으므로 데이터 로딩을 시작하기 위해 「Sync now」를 클릭합니다 (`Manual`을 복제 빈도(Replication Frequency)로 선택했기 때문입니다).

  <Image img={airbyte08} size="lg" border alt="Airbyte에서 지금 동기화 실행" />

  5. 데이터 로딩이 시작되면 뷰를 확장하여 Airbyte 로그와 진행 상태를 확인할 수 있습니다. 작업이 완료되면 로그에 `Completed successfully` 메시지가 표시됩니다:

  <Image img={airbyte09} size="lg" border alt="성공적으로 완료되었습니다." />

  6. 선호하는 SQL 클라이언트로 ClickHouse 인스턴스에 연결한 후, 생성된 테이블을 확인합니다.

     ```sql
     SELECT *
     FROM nyc_taxi_2022
     LIMIT 10
     ```

     응답은 다음과 같이 표시됩니다:

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

     응답은 다음과 같습니다:

     ```response
     Query id: a9172d39-50f7-421e-8330-296de0baa67e

     ┌─count()─┐
     │ 2392428 │
     └─────────┘
     ```

  7. Airbyte가 데이터 타입을 자동으로 추론하고 대상 테이블에 4개의 컬럼을 추가한 것을 확인할 수 있습니다. 이 컬럼들은 Airbyte가 복제 로직을 관리하고 연산을 로그로 기록하는 데 사용됩니다. 자세한 내용은 <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyte 공식 문서</a>에서 확인할 수 있습니다.

     ```sql
         `_airbyte_ab_id` String,
         `_airbyte_emitted_at` DateTime64(3, 'GMT'),
         `_airbyte_normalized_at` DateTime,
         `_airbyte_nyc_taxi_072021_hashid` String
     ```

     이제 데이터 세트가 ClickHouse 인스턴스에 로드되었으므로 새 테이블을 만들고 더 알맞은 ClickHouse 데이터 타입을 사용할 수 있습니다(<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">자세한 내용</a>).

  8. 축하합니다. Airbyte를 사용하여 NYC 택시 데이터를 ClickHouse에 성공적으로 적재했습니다!
</VerticalStepper>